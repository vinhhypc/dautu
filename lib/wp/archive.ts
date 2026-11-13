import "server-only";

import { cache } from "react";

import type { LinkItem, PostSummary, RichBlock, RichInline, WpImage, WpSection } from "@/types/content";

import { normalizePath } from "../path";
import { WP_SITE_ORIGIN, WpNotFoundError, WpRejectedError, WpUnavailableError, wpHtml, wpJson, wpJsonPage } from "./client";
import { htmlToText, imageSrc } from "./html";
import { isExcludedPath, toSections } from "./pages";
import { type WpSeo, type YoastHead, seoFromYoast } from "./seo";

export const ARCHIVE_PAGE_SIZE = 10;
const RELATED_POSTS = 3;
const INDEX_PAGE_SIZE = 100;
const SUMMARY_FIELDS = "id,date,link,title,excerpt,categories,_links,_embedded";

export type ArchiveTaxonomy = "categories" | "tags";

type WpTermResponse = {
  id: number;
  name: string;
  count: number;
  link: string;
  yoast_head_json?: YoastHead;
};

type WpMediaResponse = {
  source_url?: string;
  alt_text?: string;
  media_details?: { width?: number; height?: number };
};

type WpPostResponse = {
  id: number;
  date: string;
  modified?: string;
  link: string;
  title: { rendered: string };
  excerpt?: { rendered: string };
  content?: { rendered: string };
  categories?: number[];
  yoast_head_json?: YoastHead;
  _embedded?: { "wp:featuredmedia"?: WpMediaResponse[] };
};

export type WpTerm = {
  id: number;
  taxonomy: ArchiveTaxonomy;
  name: string;
  path: string;
  count: number;
  seo: WpSeo;
};

export type WpPost = {
  path: string;
  title: string;
  date: string;
  modified?: string;
  seo: WpSeo;
  image?: WpImage;
  categories: LinkItem[];
  sections: WpSection[];
  toc: LinkItem[];
  related: PostSummary[];
};

function pathOf(link: string): string {
  return normalizePath(new URL(link, WP_SITE_ORIGIN).pathname);
}

function toTerm(term: WpTermResponse, taxonomy: ArchiveTaxonomy): WpTerm {
  const name = htmlToText(term.name);
  const path = pathOf(term.link);
  return { id: term.id, taxonomy, name, path, count: term.count, seo: seoFromYoast(term.yoast_head_json, name, path) };
}

export const listCategories = cache(async (): Promise<WpTerm[]> => {
  const categories = await wpJson<WpTermResponse[]>(
    `/wp-json/wp/v2/categories?per_page=${INDEX_PAGE_SIZE}&_fields=id,name,count,link,yoast_head_json`,
  );
  return categories.map((category) => toTerm(category, "categories"));
});

export async function getCategoryByPath(path: string): Promise<WpTerm | undefined> {
  const target = normalizePath(path);
  return (await listCategories()).find((category) => category.path === target);
}

export async function getTagByPath(path: string): Promise<WpTerm | undefined> {
  const target = normalizePath(path);
  const slug = target.split("/").filter(Boolean).pop() ?? "";
  const tags = await wpJson<WpTermResponse[]>(
    `/wp-json/wp/v2/tags?slug=${encodeURIComponent(slug)}&_fields=id,name,count,link,yoast_head_json`,
  );
  return tags.map((tag) => toTerm(tag, "tags")).find((tag) => tag.path === target);
}

function featuredImage(post: WpPostResponse, alt: string): WpImage | undefined {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  const src = imageSrc(media?.source_url);
  if (!media || !src) return undefined;
  return { src, alt: media.alt_text?.trim() || alt, width: media.media_details?.width, height: media.media_details?.height };
}

async function toSummary(post: WpPostResponse): Promise<PostSummary> {
  const title = htmlToText(post.title.rendered);
  const categories = await listCategories();
  const category = categories.find((item) => item.id === post.categories?.[0]);
  return {
    title,
    href: pathOf(post.link),
    date: post.date,
    image: featuredImage(post, title),
    excerpt: post.excerpt ? htmlToText(post.excerpt.rendered).replace(/\s*\[…\]$/, "…") : undefined,
    category: category ? { label: category.name, href: category.path } : undefined,
  };
}

export async function listPosts(term: Pick<WpTerm, "id" | "taxonomy">, page: number, pageSize = ARCHIVE_PAGE_SIZE): Promise<PostSummary[]> {
  const params = new URLSearchParams({
    [term.taxonomy]: String(term.id),
    per_page: String(pageSize),
    page: String(page),
    _embed: "wp:featuredmedia",
    _fields: SUMMARY_FIELDS,
  });
  const posts = await wpJson<WpPostResponse[]>(`/wp-json/wp/v2/posts?${params}`);
  return Promise.all(posts.map(toSummary));
}

export type PostSearchResult = { items: PostSummary[]; total: number; totalPages: number };

export async function searchPosts(query: string, page: number): Promise<PostSearchResult> {
  const params = new URLSearchParams({
    search: query,
    per_page: String(ARCHIVE_PAGE_SIZE),
    page: String(page),
    _embed: "wp:featuredmedia",
    _fields: SUMMARY_FIELDS,
  });
  try {
    const { items, total, totalPages } = await wpJsonPage<WpPostResponse>(`/wp-json/wp/v2/posts?${params}`);
    return { items: await Promise.all(items.map(toSummary)), total, totalPages };
  } catch (error) {
    /* Từ khoá do người dùng nhập: tường lửa chặn (403, "Request Rejected") hoặc số trang vượt quá (400) đều coi như không có kết quả. */
    if (error instanceof WpUnavailableError) return { items: [], total: 0, totalPages: 0 };
    throw error;
  }
}

async function relatedPosts(post: WpPostResponse, path: string): Promise<PostSummary[]> {
  const categoryId = post.categories?.[0];
  if (!categoryId) return [];
  const posts = await listPosts({ id: categoryId, taxonomy: "categories" }, 1, RELATED_POSTS + 1);
  return posts.filter((item) => item.href !== path).slice(0, RELATED_POSTS);
}

/* Bài WordPress thường bắt đầu từ h3 (h1 là tên bài) — đẩy cấp heading lên để không nhảy từ h1 xuống h3. */
function promoteHeadings(sections: WpSection[]): WpSection[] {
  const blocks = sections.flatMap((section) => section.widgets.flatMap((widget) => (widget.type === "richText" ? widget.blocks : [])));
  const levels = blocks.flatMap((block) => (block.type === "heading" ? [block.level] : []));
  const shift = levels.length > 0 ? Math.min(...levels) - 2 : 0;
  if (shift <= 0) return sections;
  const promote = (block: RichBlock): RichBlock => (block.type === "heading" ? { ...block, level: Math.max(2, block.level - shift) as 2 | 3 | 4 } : block);
  return sections.map((section) => ({
    ...section,
    widgets: section.widgets.map((widget) => (widget.type === "richText" ? { ...widget, blocks: widget.blocks.map(promote) } : widget)),
  }));
}

function headingText(inlines: RichInline[]): string {
  return inlines.map((inline) => (inline.type === "text" ? inline.value : inline.type === "break" ? " " : headingText(inline.children))).join("");
}

/* Gắn id cho heading cấp 2 của bài để làm mục lục. */
function withTableOfContents(sections: WpSection[]): { sections: WpSection[]; toc: LinkItem[] } {
  const toc: LinkItem[] = [];
  const mark = (block: RichBlock): RichBlock => {
    if (block.type !== "heading" || block.level !== 2) return block;
    const label = headingText(block.children).replace(/\s+/g, " ").trim();
    if (!label) return block;
    const id = block.id ?? `muc-${toc.length + 1}`;
    toc.push({ label, href: `#${id}` });
    return { ...block, id };
  };
  const marked = sections.map((section) => ({
    ...section,
    widgets: section.widgets.map((widget) => (widget.type === "richText" ? { ...widget, blocks: widget.blocks.map(mark) } : widget)),
  }));
  return { sections: marked, toc };
}

const POST_FIELDS = "id,date,modified,link,title,content,categories,yoast_head_json,_links,_embedded";

/* Tường lửa từ chối ?slug= dài — khi đó lấy id bài từ link REST trong HTML của trang bài rồi gọi theo id. */
async function findPost(path: string, slug: string): Promise<WpPostResponse | undefined> {
  try {
    /* WordPress lưu slug có dấu ở dạng tổ hợp (NFD) trong khi path đã chuẩn hoá NFC — thử cả hai. */
    for (const candidate of new Set([slug, slug.normalize("NFD")])) {
      const posts = await wpJson<WpPostResponse[]>(
        `/wp-json/wp/v2/posts?slug=${encodeURIComponent(candidate)}&_embed=wp:featuredmedia&_fields=${POST_FIELDS}`,
      );
      const post = posts.find((item) => pathOf(item.link) === path);
      if (post) return post;
    }
    return undefined;
  } catch (error) {
    if (!(error instanceof WpRejectedError)) throw error;
  }
  let html: string;
  try {
    html = await wpHtml(path);
  } catch (error) {
    if (error instanceof WpNotFoundError) return undefined;
    throw error;
  }
  const id = html.match(/wp-json\/wp\/v2\/posts\/(\d+)/)?.[1];
  if (!id) return undefined;
  const post = await wpJson<WpPostResponse>(`/wp-json/wp/v2/posts/${id}?_embed=wp:featuredmedia&_fields=${POST_FIELDS}`);
  return pathOf(post.link) === path ? post : undefined;
}

/* Bài viết có path một cấp /<slug>/ — trùng dạng với trang, nên route thử trang trước rồi mới tới bài. */
export const getPost = cache(async (rawPath: string): Promise<WpPost | undefined> => {
  const path = normalizePath(rawPath);
  const segments = path.split("/").filter(Boolean);
  if (segments.length !== 1 || isExcludedPath(path)) return undefined;
  const post = await findPost(path, segments[0]);
  if (!post) return undefined;
  const title = htmlToText(post.title.rendered);
  const categories = (await listCategories()).filter((category) => post.categories?.includes(category.id));
  const [{ sections }, related] = await Promise.all([toSections(post.content?.rendered ?? ""), relatedPosts(post, path)]);
  const content = withTableOfContents(promoteHeadings(sections));
  return {
    path,
    title,
    date: post.date,
    modified: post.modified,
    seo: seoFromYoast(post.yoast_head_json, title, path),
    image: featuredImage(post, title),
    categories: categories.map((category) => ({ label: category.name, href: category.path })),
    sections: content.sections,
    toc: content.toc,
    related,
  };
});

export async function listIndexablePosts(): Promise<{ path: string; modified: string }[]> {
  const result: { path: string; modified: string }[] = [];
  for (let page = 1; ; page++) {
    const posts = await wpJson<{ link: string; modified: string; yoast_head_json?: Pick<YoastHead, "robots"> }[]>(
      `/wp-json/wp/v2/posts?per_page=${INDEX_PAGE_SIZE}&page=${page}&_fields=link,modified,yoast_head_json.robots`,
    );
    result.push(
      ...posts
        .filter((post) => post.yoast_head_json?.robots?.index !== "noindex")
        .map((post) => ({ path: pathOf(post.link), modified: post.modified })),
    );
    if (posts.length < INDEX_PAGE_SIZE) return result;
  }
}
