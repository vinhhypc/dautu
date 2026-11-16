import "server-only";

import { cache } from "react";

import { elementorKitId, wpExcludedPaths } from "@/content/wp";
import type { WpSection } from "@/types/content";

import { WP_SITE_ORIGIN, WpNotFoundError, wpHtml, wpJson, wpOrFallback } from "./client";
import {
  elementorDocumentHtml,
  elementorDocumentIds,
  elementorToSections,
  isElementorHtml,
  parseElementorBackgrounds,
} from "./elementor";
import { parseElementorGlobals, parseElementorStyles } from "./elementor-styles";
import { htmlToBlocks, htmlToText } from "./html";
import { mergeTitleSections } from "./sections";
import { withSheetCharts } from "./sheets";
import { normalizePath } from "../path";
import { type WpSeo, type YoastHead, seoFromYoast } from "./seo";

type WpPageIndexItem = { id: number; link: string; modified: string; yoast_head_json?: Pick<YoastHead, "robots"> };

type PageIndexEntry = { id: number; modified: string; noIndex: boolean };

export type WpSitemapEntry = { path: string; modified?: string };

type WpPageResponse = {
  id: number;
  link: string;
  modified: string;
  title: { rendered: string };
  content: { rendered: string };
  yoast_head_json?: YoastHead;
};

export type WpDocument = {
  path: string;
  title: string;
  modified?: string;
  seo: WpSeo;
  sections: WpSection[];
  unsupported: Record<string, number>;
};

const EXCLUDED = new Set(wpExcludedPaths.map(normalizePath));
const SERVICE_PREFIX = "/san-pham/";
const INDEX_PAGE_SIZE = 100;

export function isExcludedPath(path: string): boolean {
  return EXCLUDED.has(normalizePath(path));
}

function pathOf(link: string): string {
  return normalizePath(new URL(link, WP_SITE_ORIGIN).pathname);
}

const pageIndex = cache(async (): Promise<Map<string, PageIndexEntry>> => {
  const index = new Map<string, PageIndexEntry>();
  for (let page = 1; ; page++) {
    const items = await wpJson<WpPageIndexItem[]>(
      `/wp-json/wp/v2/pages?per_page=${INDEX_PAGE_SIZE}&page=${page}&_fields=id,link,modified,yoast_head_json.robots`,
    );
    for (const item of items) {
      index.set(pathOf(item.link), { id: item.id, modified: item.modified, noIndex: item.yoast_head_json?.robots?.index === "noindex" });
    }
    if (items.length < INDEX_PAGE_SIZE) return index;
  }
});

export async function listIndexablePages(): Promise<WpSitemapEntry[]> {
  return [...(await pageIndex()).entries()]
    .filter(([path, entry]) => !entry.noIndex && !EXCLUDED.has(path))
    .map(([path, entry]) => ({ path, modified: entry.modified }));
}

/* /san-pham/* không có trong REST — danh sách lấy từ sitemap Yoast của post type "service" (đã loại trang noindex). */
export async function listIndexableServices(): Promise<WpSitemapEntry[]> {
  const xml = await wpHtml("/service-sitemap.xml");
  return [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?/g)]
    .map(([, loc, modified]) => ({ path: pathOf(loc), modified }))
    .filter((entry) => entry.path.startsWith(SERVICE_PREFIX) && !EXCLUDED.has(entry.path));
}

/* Trang in CSS nội tuyến (không có file post-<id>.css) trả 404 — bình thường, không cần log. */
const elementorCss = cache((id: string) =>
  wpOrFallback(
    wpHtml(`/wp-content/uploads/elementor/css/post-${id}.css`).catch((error) => (error instanceof WpNotFoundError ? "" : Promise.reject(error))),
    "",
    `CSS Elementor post-${id}`,
  ),
);

async function loadElementorCss(html: string): Promise<string> {
  const sheets = await Promise.all(elementorDocumentIds(html).map((id) => elementorCss(id)));
  return sheets.join("\n");
}

export async function toSections(html: string): Promise<Pick<WpDocument, "sections" | "unsupported">> {
  if (!isElementorHtml(html)) {
    const blocks = htmlToBlocks(html);
    return { sections: await withSheetCharts(blocks.length ? [{ id: "s-content", widgets: [{ type: "richText", blocks }] }] : []), unsupported: {} };
  }
  const [css, kit] = await Promise.all([loadElementorCss(html), elementorCss(elementorKitId)]);
  const { sections, unsupported } = elementorToSections(
    html,
    parseElementorBackgrounds(css),
    parseElementorStyles(css, parseElementorGlobals(kit)),
  );
  return { sections: await withSheetCharts(mergeTitleSections(sections)), unsupported: Object.fromEntries(unsupported) };
}

async function getPage(path: string): Promise<WpDocument | undefined> {
  const id = (await pageIndex()).get(path)?.id;
  if (!id) return undefined;
  const page = await wpJson<WpPageResponse>(`/wp-json/wp/v2/pages/${id}?_fields=id,link,modified,title,content,yoast_head_json`);
  const title = htmlToText(page.title.rendered);
  return { path, title, modified: page.modified, seo: seoFromYoast(page.yoast_head_json, title, path), ...(await toSections(page.content.rendered)) };
}

/* Custom post type "service" (/san-pham/…) không mở REST — đọc HTML trang, SEO lấy qua endpoint get_head của Yoast. */
async function getService(path: string): Promise<WpDocument | undefined> {
  let html: string;
  try {
    html = await wpHtml(path);
  } catch (error) {
    if (error instanceof WpNotFoundError) return undefined;
    throw error;
  }
  const document = elementorDocumentHtml(html);
  if (!document) return undefined;
  const head = await wpJson<{ json?: YoastHead }>(`/wp-json/yoast/v1/get_head?url=${encodeURIComponent(`${WP_SITE_ORIGIN}${path}`)}`);
  const title = head.json?.og_title ?? head.json?.title ?? path;
  return { path, title, seo: seoFromYoast(head.json, title, path), ...(await toSections(document)) };
}

export const getWpDocument = cache(async (rawPath: string): Promise<WpDocument | undefined> => {
  const path = normalizePath(rawPath);
  if (EXCLUDED.has(path)) return undefined;
  return path.startsWith(SERVICE_PREFIX) ? getService(path) : getPage(path);
});
