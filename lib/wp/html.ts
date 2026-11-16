import { type ChildNode, type Element, isTag, isText } from "domhandler";
import { textContent } from "domutils";
import { parseDocument } from "htmlparser2";

import type { RichAlign, RichBlock, RichInline, RichTableCell } from "@/types/content";

import { WP_SITE_ORIGIN, isInternalOrigin } from "./origin";

const DROPPED_TAGS = new Set(["script", "style", "noscript", "form", "input", "button", "textarea", "select", "svg", "head", "meta", "link"]);
const INLINE_PASSTHROUGH = new Set(["span", "label", "font", "u", "small", "sup", "sub", "abbr", "mark", "time", "code"]);
const STRONG_TAGS = new Set(["strong", "b", "stong"]);
const BLOCK_TAGS = new Set(["div", "section", "article", "aside", "header", "footer", "main", "nav", "blockquote", "figure", "figcaption", "center", "dl", "dt", "dd"]);
const YOUTUBE_EMBED = /^https:\/\/www\.youtube(?:-nocookie)?\.com\/embed\/[\w-]+/;
/* Khối "tải PDF" cạnh Google Docs Viewer — thay bằng nút trong khối PDF. */
const DROPPED_CLASSES = new Set(["embed_download"]);
const WIDE_EMBED_PX = 720;

function pdfTitle(src: string): string {
  const file = decodeURIComponent(src.split("/").pop() ?? src);
  return file.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").trim();
}

/* PDF trong bài WP nhúng theo 2 kiểu: <a class="pdfemb-viewer"> (PDF Embedder) và <iframe> Google Docs Viewer ?url=. */
function pdfBlock(element: Element): RichBlock | undefined {
  if (element.name === "a" && hasClass(element, "pdfemb-viewer")) {
    const src = imageSrc(element.attribs.href);
    return src ? { type: "pdf", src, title: collapse(textContent(element)) || pdfTitle(src) } : undefined;
  }
  if (element.name === "iframe" && /docs\.google\.com\/viewer/.test(element.attribs.src ?? "")) {
    try {
      const url = new URL(element.attribs.src.replace(/^\/\//, "https://")).searchParams.get("url");
      const src = imageSrc(url ?? undefined);
      return src ? { type: "pdf", src, title: pdfTitle(src) } : undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

/* Elementor/WP Rocket lazy-load đặt ảnh thật vào data-*, src chỉ là ảnh giữ chỗ. */
export function lazySrc(element: Element): string | undefined {
  const { attribs } = element;
  return attribs["data-lazy-src"] ?? attribs["data-src"] ?? attribs.src;
}

/* account-v2 chuyển hướng 2 lần (myaccount → mydgo) trước khi tới form mở tài khoản — trỏ thẳng địa chỉ cuối (kiểm tra 16/11/2026). */
const ACCOUNT_FORM_LEGACY = "https://account-v2.vndirect.com.vn/";
const ACCOUNT_FORM = "https://mydgo.vndirect.com.vn/mo-tai-khoan/";

function finalEmbedSrc(src: string): string {
  const url = new URL(src);
  return url.origin + url.pathname === ACCOUNT_FORM_LEGACY ? ACCOUNT_FORM + url.search : src;
}

/* Chỉ nhúng iframe của chính VNDIRECT (vd. form mở tài khoản account-v2.vndirect.com.vn) và bảng/biểu đồ Google Sheets đã xuất bản (NAV, phân bổ tài sản của quỹ); iframe khác bỏ đi. */
function isTrustedEmbed(src: string): boolean {
  try {
    const { protocol, hostname, pathname } = new URL(src);
    if (protocol !== "https:") return false;
    if (hostname === "docs.google.com") return /^\/spreadsheets\/.*\/pub(html|chart)$/.test(pathname);
    return hostname === "vndirect.com.vn" || hostname.endsWith(".vndirect.com.vn");
  } catch {
    return false;
  }
}

export function parseHtml(html: string): ChildNode[] {
  return parseDocument(html, { decodeEntities: true }).children;
}

export function htmlToBlocks(html: string): RichBlock[] {
  return toBlocks(parseHtml(html));
}

export function nodesToBlocks(nodes: ChildNode[]): RichBlock[] {
  return toBlocks(nodes);
}

export function htmlToText(html: string): string {
  return collapse(textContent(parseHtml(html)));
}

export function nodeText(nodes: ChildNode | ChildNode[]): string {
  return collapse(textContent(nodes));
}

function collapse(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function classList(element: Element): string[] {
  return (element.attribs.class ?? "").split(/\s+/).filter(Boolean);
}

function hasClass(element: Element, name: string): boolean {
  return classList(element).includes(name);
}

function safeId(value: string | undefined): string | undefined {
  const id = value?.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return id || undefined;
}

/* Link nội bộ của WordPress là URL tuyệt đối (domain cũ hoặc domain CMS) — đổi về path để thành link nội bộ của site. */
export function normalizeHref(raw: string | undefined): string | undefined {
  const href = raw?.trim();
  if (!href) return undefined;
  if (/^(mailto:|tel:|#)/i.test(href)) return href;
  try {
    const url = new URL(href.startsWith("//") ? `https:${href}` : href, WP_SITE_ORIGIN);
    if (!/^https?:$/.test(url.protocol)) return undefined;
    if (isInternalOrigin(url.origin)) return `${url.pathname}${url.search}${url.hash}`;
    return url.toString();
  } catch {
    return undefined;
  }
}

export function imageSrc(raw: string | undefined): string | undefined {
  const href = normalizeHref(raw);
  if (!href || href.startsWith("#") || /^(mailto|tel):/i.test(href)) return undefined;
  return href.startsWith("/") ? `${WP_SITE_ORIGIN}${href}` : href;
}

/* Cloudflare Email Obfuscation thay email bằng data-cfemail (XOR với byte đầu) trong HTML trả về. */
function decodeCfEmail(encoded: string): string {
  const key = parseInt(encoded.slice(0, 2), 16);
  let email = "";
  for (let index = 2; index < encoded.length; index += 2) {
    email += String.fromCharCode(parseInt(encoded.slice(index, index + 2), 16) ^ key);
  }
  return email;
}

function cfEmail(element: Element): string | undefined {
  const encoded = element.attribs["data-cfemail"];
  return encoded && /^[0-9a-f]+$/i.test(encoded) ? decodeCfEmail(encoded) : undefined;
}

function toInlines(nodes: ChildNode[]): RichInline[] {
  const result: RichInline[] = [];
  for (const node of nodes) {
    if (isText(node)) {
      const value = node.data.replace(/\s+/g, " ");
      if (value) result.push({ type: "text", value });
      continue;
    }
    if (!isTag(node) || DROPPED_TAGS.has(node.name)) continue;
    const { name } = node;
    if (name === "br") result.push({ type: "break" });
    else if (STRONG_TAGS.has(name)) result.push({ type: "strong", children: toInlines(node.children) });
    else if (name === "em" || (name === "i" && classList(node).length === 0)) result.push({ type: "em", children: toInlines(node.children) });
    else if (name === "i") continue;
    else if (name === "a") result.push(...linkInline(node));
    else result.push(...toInlines(node.children));
  }
  return result;
}

function linkInline(element: Element): RichInline[] {
  const email = cfEmail(element) ?? (element.children.length === 1 && isTag(element.children[0]) ? cfEmail(element.children[0]) : undefined);
  if (email) return [{ type: "link", href: `mailto:${email}`, children: [{ type: "text", value: email }] }];
  const children = toInlines(element.children);
  const href = normalizeHref(element.attribs.href);
  if (!href || href.startsWith("javascript")) return children;
  return [{ type: "link", href, children }];
}

function trimInlines(inlines: RichInline[]): RichInline[] {
  const result = [...inlines];
  while (result[0]?.type === "break" || (result[0]?.type === "text" && !result[0].value.trim())) result.shift();
  while (result.at(-1)?.type === "break" || (result.at(-1)?.type === "text" && !(result.at(-1) as { value: string }).value.trim())) result.pop();
  const first = result[0];
  if (first?.type === "text") result[0] = { ...first, value: first.value.trimStart() };
  const last = result.at(-1);
  if (last?.type === "text") result[result.length - 1] = { ...last, value: last.value.trimEnd() };
  return result;
}

function hasContent(inlines: RichInline[]): boolean {
  return inlines.some((inline) => inline.type === "link" || inline.type === "strong" || inline.type === "em" || (inline.type === "text" && inline.value.trim() !== ""));
}

function isBlockElement(node: ChildNode): boolean {
  if (!isTag(node)) return false;
  return (
    BLOCK_TAGS.has(node.name) ||
    ["p", "ul", "ol", "table", "img", "iframe", "hr", "h1", "h2", "h3", "h4", "h5", "h6"].includes(node.name) ||
    (node.name === "a" && hasClass(node, "pdfemb-viewer")) ||
    (!INLINE_PASSTHROUGH.has(node.name) && node.children.some(isBlockElement))
  );
}

function toBlocks(nodes: ChildNode[]): RichBlock[] {
  const blocks: RichBlock[] = [];
  let pending: ChildNode[] = [];

  const flush = () => {
    if (pending.length === 0) return;
    const inlines = trimInlines(toInlines(pending));
    if (hasContent(inlines)) blocks.push({ type: "paragraph", children: inlines });
    pending = [];
  };

  const elements = nodes.filter((node) => isTag(node) || isText(node));
  for (let index = 0; index < elements.length; index++) {
    const node = elements[index];

    /* Nội dung FAQ lấy từ HTML (không qua wpautop) xuống dòng bằng ký tự "\n" thay cho <p>. */
    if (isText(node)) {
      const parts = node.data.split(/\n+/);
      parts.forEach((part, partIndex) => {
        if (partIndex > 0 && part.trim()) flush();
        if (part) pending.push({ ...node, data: part } as ChildNode);
      });
      continue;
    }
    if (!isTag(node) || DROPPED_TAGS.has(node.name) || classList(node).some((name) => DROPPED_CLASSES.has(name))) continue;

    const pdf = pdfBlock(node);
    if (pdf) {
      flush();
      blocks.push(pdf);
      continue;
    }

    if (hasClass(node, "q")) {
      const answer = elements.slice(index + 1).find((sibling) => isTag(sibling));
      if (answer && isTag(answer) && hasClass(answer, "a")) {
        flush();
        blocks.push({ type: "disclosure", id: safeId(node.attribs.id), title: trimInlines(toInlines(node.children)), children: toBlocks(answer.children) });
        index = elements.indexOf(answer);
        continue;
      }
    }

    if (!isBlockElement(node)) {
      pending.push(node);
      continue;
    }

    flush();
    blocks.push(...blockFor(node));
  }
  flush();
  return blocks;
}

function blockFor(element: Element): RichBlock[] {
  const { name } = element;
  if (/^h[1-6]$/.test(name)) {
    const children = trimInlines(toInlines(element.children));
    if (!hasContent(children)) return [];
    const level = name === "h1" || name === "h2" ? 2 : name === "h3" ? 3 : 4;
    return [{ type: "heading", level, id: safeId(element.attribs.id), align: blockAlign(element), children }];
  }
  if (name === "p") {
    if (element.children.some(isBlockElement)) {
      const align = blockAlign(element);
      return toBlocks(element.children).map((block) => (block.type === "image" && align ? { ...block, align } : block));
    }
    const children = trimInlines(toInlines(element.children));
    return hasContent(children) ? [{ type: "paragraph", align: blockAlign(element), children }] : [];
  }
  if (name === "ul" || name === "ol") {
    const items: RichBlock[][] = [];
    for (const child of element.children) {
      if (!isTag(child)) continue;
      if (child.name === "li") items.push(toBlocks(child.children));
      /* WordPress cũ có <ul> lồng thẳng trong <ul> (không qua <li>) — gắn vào mục đứng trước. */
      else if (child.name === "ul" || child.name === "ol") {
        if (items.length === 0) items.push([]);
        items[items.length - 1].push(...blockFor(child));
      }
    }
    const nonEmpty = items.filter((item) => item.length > 0);
    if (nonEmpty.length === 0) return [];
    const start = Number(element.attribs.start);
    return [{ type: "list", ordered: name === "ol", start: Number.isFinite(start) && start > 1 ? start : undefined, items: nonEmpty }];
  }
  if (name === "table") return tableBlock(element);
  if (name === "img") {
    const src = imageSrc(lazySrc(element));
    if (!src) return [];
    /* WordPress hay ghi width="10%" (icon trong đoạn văn) — giữ thành tỉ lệ thay vì bỏ qua. */
    const rawWidth = element.attribs.width ?? "";
    const scale = rawWidth.endsWith("%") ? Number(rawWidth.slice(0, -1)) / 100 : undefined;
    const width = Number(rawWidth);
    const height = Number(element.attribs.height);
    return [
      {
        type: "image",
        src,
        alt: collapse(element.attribs.alt ?? ""),
        width: width > 0 ? width : undefined,
        height: height > 0 ? height : undefined,
        scale: scale && scale > 0 && scale < 1 ? scale : undefined,
      },
    ];
  }
  if (name === "iframe") {
    const src = element.attribs.src?.replace(/^\/\//, "https://");
    const match = src?.match(YOUTUBE_EMBED);
    if (match) return [{ type: "video", src: match[0], title: collapse(element.attribs.title ?? "") }];
    if (!src || !isTrustedEmbed(src)) return [];
    const height = parseInt(element.attribs.height ?? "", 10);
    const width = parseInt(element.attribs.width ?? "", 10);
    return [
      {
        type: "embed",
        src: finalEmbedSrc(src),
        title: collapse(element.attribs.title ?? "") || new URL(src).hostname,
        height: height > 0 ? height : undefined,
        wide: width > WIDE_EMBED_PX || undefined,
      },
    ];
  }
  if (name === "hr") return [{ type: "rule" }];
  if (name === "a") {
    const href = normalizeHref(element.attribs.href);
    const linked = toBlocks(element.children);
    if (!href || href.startsWith("javascript")) return linked;
    return linked.map((block) => (block.type === "image" ? { ...block, href } : block));
  }
  /* Căn lề đặt trên khối bao (<div style="text-align:center">, <center>) áp cho các đoạn/ảnh bên trong chưa có căn lề riêng. */
  const inherited = name === "center" ? "center" : blockAlign(element);
  const children = toBlocks(element.children);
  if (!inherited) return children;
  return children.map((block) =>
    (block.type === "paragraph" || block.type === "heading" || block.type === "image") && !block.align ? { ...block, align: inherited } : block,
  );
}

/* Căn lề WordPress gắn thẳng vào thẻ (style="text-align" / align=""); căn đều coi như căn trái cho dễ đọc. */
function blockAlign(element: Element): RichAlign | undefined {
  const value = (element.attribs.style?.match(/text-align:\s*(\w+)/)?.[1] ?? element.attribs.align ?? "").toLowerCase();
  return value === "center" || value === "right" ? value : undefined;
}

function tableBlock(table: Element): RichBlock[] {
  const rows: RichTableCell[][] = [];
  const visit = (nodes: ChildNode[]) => {
    for (const node of nodes) {
      if (!isTag(node)) continue;
      if (node.name === "tr") {
        const cells = node.children
          .filter((cell): cell is Element => isTag(cell) && (cell.name === "td" || cell.name === "th"))
          .map((cell) => ({
            header: cell.name === "th",
            colSpan: Number(cell.attribs.colspan) > 1 ? Number(cell.attribs.colspan) : undefined,
            rowSpan: Number(cell.attribs.rowspan) > 1 ? Number(cell.attribs.rowspan) : undefined,
            children: toBlocks(cell.children),
          }));
        if (cells.length > 0) rows.push(cells);
      } else if (["thead", "tbody", "tfoot"].includes(node.name)) {
        visit(node.children);
      }
    }
  };
  visit(table.children);
  return rows.length > 0 ? [{ type: "table", rows }] : [];
}
