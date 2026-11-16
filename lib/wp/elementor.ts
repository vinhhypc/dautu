import { type ChildNode, type Element, isTag } from "domhandler";
import { findAll, findOne, getOuterHTML, textContent } from "domutils";

import type { LinkItem, RichBlock, WpCardFace, WpColumn, WpImage, WpPanel, WpSection, WpTone, WpWidget, WpWidgetStyle } from "@/types/content";

import { DEFAULT_HEADING_STYLE, type ElementorStyles, textToneOf, toneOf } from "./elementor-styles";
import { imageSrc, lazySrc, nodesToBlocks, normalizeHref, parseHtml } from "./html";

/* Ảnh nền slide/section nằm trong file CSS Elementor (post-<id>.css), không có trong HTML: key là class elementor-repeater-item-* / elementor-element-*. */
export type ElementorBackgrounds = Map<string, string>;

type ExtractContext = { backgrounds: ElementorBackgrounds; styles: ElementorStyles; unsupported: UnsupportedWidgets };

type Extractor = (widget: Element, context: ExtractContext) => WpWidget[];

/* Elementor nhân đôi khối cho từng thiết bị và ẩn bằng class — giữ bản desktop, bỏ bản chỉ hiện trên mobile/tablet. */
const HIDDEN_ON_DESKTOP = "elementor-hidden-desktop";
const SKIPPED_WIDGETS = new Set(["spacer", "icon", "template", "global", "menu-anchor", "google_maps"]);
const HUBSPOT_SCRIPT = /hbspt\.forms\.create\(\s*\{([\s\S]*?)\}\s*\)/;

function classes(element: Element): string[] {
  return (element.attribs.class ?? "").split(/\s+/);
}

function hasClass(element: Element, name: string): boolean {
  return classes(element).includes(name);
}

function byClass(name: string) {
  return (node: Element) => hasClass(node, name);
}

function first(root: Element | undefined, name: string): Element | undefined {
  return root ? (findOne(byClass(name), root.children, true) ?? undefined) : undefined;
}

function all(root: Element, name: string): Element[] {
  return findAll(byClass(name), root.children);
}

function text(node: ChildNode | undefined): string {
  return node ? textContent(node).replace(/\s+/g, " ").trim() : "";
}

/* Như text() nhưng giữ <br> thành xuống dòng — tiêu đề Elementor hay ngắt dòng bằng <br> ("CẢNH BÁO<br>BIẾN ĐỘNG"). */
function lines(node: ChildNode | undefined): string {
  if (!node) return "";
  const parts: string[] = [];
  const walk = (current: ChildNode) => {
    if (isTag(current)) {
      if (current.name === "br") parts.push("\n");
      else current.children.forEach(walk);
    } else if ("data" in current && current.type === "text") parts.push(current.data);
  };
  walk(node);
  return parts
    .join("")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

function blocks(node: Element | undefined): RichBlock[] {
  return node ? nodesToBlocks(node.children) : [];
}

function image(root: Element | undefined): WpImage | undefined {
  const img = root && (root.name === "img" ? root : findOne((node) => node.name === "img", root.children, true));
  if (!img) return undefined;
  const src = imageSrc(lazySrc(img));
  if (!src || src.startsWith("data:")) return undefined;
  /* Ảnh carousel không có width/height nhưng tên file thumbnail WP mang kích thước (db01-768x498.png). */
  const suffix = src.match(/-(\d+)x(\d+)\.\w+$/);
  const width = Number(img.attribs.width) || Number(suffix?.[1]);
  const height = Number(img.attribs.height) || Number(suffix?.[2]);
  return {
    src,
    alt: (img.attribs.alt ?? "").trim(),
    width: width > 0 ? width : undefined,
    height: height > 0 ? height : undefined,
  };
}

function backgroundImage(root: Element | undefined, fromCss?: string): WpImage | undefined {
  const style = root?.attribs.style ?? "";
  const inline = style.match(/background-image:\s*url\(['"]?([^'")]+)/)?.[1];
  const src = imageSrc(inline ?? fromCss);
  return src ? { src, alt: (root?.attribs["aria-label"] ?? "").replace(/[-_]+/g, " ").trim() } : undefined;
}

function cssBackground(element: Element, backgrounds: ElementorBackgrounds): string | undefined {
  const key = classes(element).find((name) => name.startsWith("elementor-repeater-item-"));
  return key ? backgrounds.get(key) : undefined;
}

function link(root: Element | undefined, label?: string): LinkItem | undefined {
  const anchor = root && (root.name === "a" ? root : findOne((node) => node.name === "a" && Boolean(node.attribs.href), root.children, true));
  const href = normalizeHref(anchor?.attribs.href);
  if (!anchor || !href || href === "#" || href.startsWith("javascript")) return undefined;
  return { label: label ?? text(anchor), href };
}

function headingLevel(element: Element | undefined): 1 | 2 | 3 | 4 {
  const level = Number(element?.name.slice(1));
  return level === 1 || level === 2 || level === 3 ? level : 4;
}

function face(root: Element | undefined, titleClass: string, bodyClass: string): WpCardFace {
  return {
    title: lines(first(root, titleClass)) || undefined,
    body: blocks(first(root, bodyClass)),
    image: image(root),
  };
}

function panels(widget: Element, titleSelector: (node: Element) => boolean): WpPanel[] {
  return findAll(titleSelector, widget.children).flatMap((title) => {
    const contentId = title.attribs["aria-controls"];
    const content = contentId ? findOne((node) => node.attribs.id === contentId, widget.children, true) : undefined;
    const titleText = text(title);
    return titleText ? [{ title: titleText, body: blocks(content ?? undefined) }] : [];
  });
}

function hubspotForm(widget: Element): WpWidget[] {
  const script = findAll((node) => node.name === "script", widget.children).map((node) => textContent(node)).join("\n");
  const options = script.match(HUBSPOT_SCRIPT)?.[1];
  if (!options) return [];
  const value = (key: string) => options.match(new RegExp(`${key}\\s*:\\s*["']([^"']+)`))?.[1];
  const portalId = value("portalId");
  const formId = value("formId");
  return portalId && formId ? [{ type: "hubspotForm", portalId, formId, region: value("region") ?? "na1" }] : [];
}

const EXTRACTORS: Record<string, Extractor> = {
  heading: (widget, context) => {
    const title = findOne((node) => /^h[1-6]$/.test(node.name) || hasClass(node, "elementor-heading-title"), widget.children, true);
    const value = lines(title ?? widget);
    const fontSize = context.styles.get(elementId(widget) ?? "")?.fontSize ?? 0;
    const size = fontSize >= DISPLAY_FONT_PX ? "display" : fontSize > 0 && fontSize <= SMALL_FONT_PX ? "small" : undefined;
    return value ? [{ type: "heading", level: headingLevel(title ?? undefined), text: value, href: link(title ?? undefined)?.href, size }] : [];
  },
  "text-editor": (widget, context) => {
    const content = blocks(first(widget, "elementor-widget-container") ?? widget);
    const lead = (context.styles.get(elementId(widget) ?? "")?.fontSize ?? 0) >= LEAD_FONT_PX || undefined;
    return content.length ? [{ type: "richText", blocks: content, lead }] : [];
  },
  image: (widget) => {
    const img = image(widget);
    return img ? [{ type: "image", image: img, href: link(widget)?.href }] : [];
  },
  button: (widget) => {
    const anchor = first(widget, "elementor-button");
    const target = link(anchor, text(first(anchor, "elementor-button-text") ?? anchor));
    return target?.label ? [{ type: "button", link: target }] : [];
  },
  "icon-box": (widget) => {
    const card = face(widget, "elementor-icon-box-title", "elementor-icon-box-description");
    const align = hasClass(widget, "elementor-position-top") || !/elementor-position-(left|right)/.test(widget.attribs.class ?? "") ? "center" : undefined;
    return card.title || card.body.length ? [{ type: "card", align, card: { ...card, link: link(first(widget, "elementor-icon-box-title")) } }] : [];
  },
  "image-box": (widget) => {
    const card = face(widget, "elementor-image-box-title", "elementor-image-box-description");
    const align = /elementor-position-(left|right)/.test(widget.attribs.class ?? "") ? undefined : "center";
    return [{ type: "card", align, card: { ...card, link: link(first(widget, "elementor-image-box-title")) } }];
  },
  "call-to-action": (widget) => {
    const card = face(widget, "elementor-cta__title", "elementor-cta__description");
    const target = link(first(widget, "elementor-cta__button") ?? first(widget, "elementor-cta"), card.title);
    return [{ type: "card", card: { ...card, image: card.image ?? backgroundImage(first(widget, "elementor-cta__bg")), link: target } }];
  },
  "flip-box": (widget) => {
    const front = first(widget, "elementor-flip-box__front");
    const back = first(widget, "elementor-flip-box__back");
    const backFace = face(back, "elementor-flip-box__layer__title", "elementor-flip-box__layer__description");
    const backLink = back?.name === "a" ? link(back, backFace.title ?? text(back)) : link(first(back, "elementor-flip-box__button"));
    return [
      {
        type: "flipCard",
        front: face(front, "elementor-flip-box__layer__title", "elementor-flip-box__layer__description"),
        back: { ...backFace, link: backLink },
      },
    ];
  },
  "icon-list": (widget) => {
    const items = all(widget, "elementor-icon-list-item").flatMap((item) => {
      const value = text(first(item, "elementor-icon-list-text") ?? item);
      return value ? [{ text: value, href: link(item)?.href }] : [];
    });
    const iconClass = first(widget, "elementor-icon-list-icon")?.children.find(isTag)?.attribs.class ?? "";
    const marker = !iconClass || /check/.test(iconClass) ? "check" : "dot";
    return items.length ? [{ type: "iconList", items, marker }] : [];
  },
  divider: () => [{ type: "divider" }],
  accordion: (widget) => [{ type: "faq", items: panels(widget, byClass("elementor-tab-title")) }],
  toggle: (widget) => [{ type: "faq", items: panels(widget, byClass("elementor-tab-title")) }],
  tabs: (widget) => [{ type: "tabs", items: panels(widget, (node) => hasClass(node, "elementor-tab-desktop-title")) }],
  "nested-tabs": (widget) => [
    {
      type: "tabs",
      items: all(widget, "e-n-tab-title").map((title) => {
        const contentId = title.attribs["aria-controls"];
        const content = contentId ? findOne((node) => node.attribs.id === contentId, widget.children, true) : undefined;
        return { title: text(title), body: blocks(content ?? undefined) };
      }),
    },
  ],
  slides: (widget, { backgrounds }) => {
    const items = all(widget, "swiper-slide")
      .filter((slide) => !hasClass(slide, "swiper-slide-duplicate"))
      .map((slide) => {
        const image = backgroundImage(first(slide, "swiper-slide-bg"), cssBackground(slide, backgrounds));
        const button = first(slide, "elementor-slide-button");
        const buttonLabel = text(button);
        /* Nút slide là <div> nằm trong <a class="swiper-slide-inner"> bao cả slide; link trong phần mô tả thuộc về nội dung, không phải link của slide. */
        const anchor = [first(slide, "swiper-slide-inner"), button].find((node) => node?.name === "a");
        const body = blocks(first(slide, "elementor-slide-description"));
        return {
          title: lines(first(slide, "elementor-slide-heading")) || undefined,
          body: body.length ? body : undefined,
          image,
          link: link(anchor, buttonLabel || image?.alt || undefined),
        };
      })
      .filter((slide) => slide.title || slide.body || slide.image);
    return items.length ? [{ type: "slides", items }] : [];
  },
  "image-carousel": (widget) => {
    const images = all(widget, "swiper-slide")
      .filter((slide) => !hasClass(slide, "swiper-slide-duplicate"))
      .flatMap((slide) => {
        const img = image(slide);
        return img ? [{ ...img, caption: text(first(slide, "elementor-image-carousel-caption")) || undefined }] : [];
      });
    return images.length ? [{ type: "gallery", images }] : [];
  },
  "media-carousel": (widget, context) => EXTRACTORS["image-carousel"](widget, context),
  "testimonial-carousel": (widget) => {
    const items = all(widget, "elementor-testimonial").map((item) => ({
      name: text(first(item, "elementor-testimonial__name")),
      role: text(first(item, "elementor-testimonial__title")) || undefined,
      body: text(first(item, "elementor-testimonial__text")),
      image: image(first(item, "elementor-testimonial__image")),
    }));
    return items.length ? [{ type: "testimonials", items }] : [];
  },
  video: (widget) => {
    const settings = widget.attribs["data-settings"] ?? "";
    const url = settings.match(/"youtube_url":"([^"]+)"/)?.[1]?.replace(/\\\//g, "/");
    const id = url?.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)?.[1];
    return id ? [{ type: "video", src: `https://www.youtube.com/embed/${id}`, title: text(widget) }] : [];
  },
  html: (widget) => {
    const form = hubspotForm(widget);
    if (form.length) return form;
    const content = blocks(first(widget, "elementor-widget-container") ?? widget);
    return content.length ? [{ type: "richText", blocks: content }] : [];
  },
  shortcode: (widget, context) => EXTRACTORS.html(widget, context),
  posts: (widget) => {
    const items = findAll((node) => node.name === "article", widget.children).flatMap((article) => {
      const titleLink = link(first(article, "elementor-post__title"));
      return titleLink
        ? [
            {
              title: titleLink.label,
              href: titleLink.href,
              image: image(first(article, "elementor-post__thumbnail")),
              excerpt: text(first(article, "elementor-post__excerpt")) || undefined,
            },
          ]
        : [];
    });
    return items.length ? [{ type: "posts", items }] : [];
  },
};

function widgetType(element: Element): string | undefined {
  return element.attribs["data-widget_type"]?.split(".")[0];
}

function isVisibleOnDesktop(element: Element): boolean {
  return !hasClass(element, HIDDEN_ON_DESKTOP);
}

export type UnsupportedWidgets = Map<string, number>;

const LAYOUT_TYPES = new Set(["section", "column", "container"]);
const GRID_COLUMNS = 12;
const TALL_SECTION_PX = 350;
const DISPLAY_FONT_PX = 40;
const SMALL_FONT_PX = 18;
const LEAD_FONT_PX = 24;
const MAX_COLUMNS_PER_ROW = 4;
/* Elementor hay thu hẹp khối chữ bằng lề phải lớn (vd. margin-right 640px ở hero) thay vì chia cột. */
const NARROW_MARGIN_PX = 240;

/* Viền có màu → giữ khung (màu thương hiệu hoặc viền nhạt); viền trắng/không rõ màu bỏ qua. */
function outlineOf(color: string | undefined): WpTone | undefined {
  if (!color) return undefined;
  if (textToneOf(color) === "purple") return "purple";
  const tone = toneOf(color);
  if (tone === "brand" || tone === "accent") return tone;
  return tone === "muted" ? undefined : "muted";
}

function surfaceOf(color: string | undefined): WpTone | undefined {
  return textToneOf(color) === "purple" ? "purple" : toneOf(color);
}

function sectionSpacing(paddingTop: number | undefined): WpSection["spacing"] {
  if (paddingTop === undefined) return "default";
  if (paddingTop <= 16) return "tight";
  return paddingTop >= 60 ? "loose" : "default";
}

function objectPosition(value: string | undefined): WpSection["backgroundPosition"] {
  if (!value) return undefined;
  /* "center right" → right: ưu tiên phương ngang vì ảnh nền hero thường neo trái/phải. */
  const keyword = ["right", "left", "top", "bottom", "center"].find((item) => value.includes(item));
  return keyword as WpSection["backgroundPosition"];
}

function layoutType(element: Element): string | undefined {
  const type = element.attribs["data-element_type"];
  return type && LAYOUT_TYPES.has(type) ? type : undefined;
}

function parentLayout(element: Element): Element | undefined {
  for (let parent = element.parent; parent && isTag(parent); parent = parent.parent) {
    if (layoutType(parent)) return parent;
  }
  return undefined;
}

function elementId(element: Element): string | undefined {
  return element.attribs["data-id"];
}

function widgetStyle(element: Element, context: ExtractContext): WpWidgetStyle {
  const style = context.styles.get(elementId(element) ?? "");
  const alignClass = classes(element).find((name) => /^elementor-(?:align|widget__align)-(left|center|right)$/.test(name));
  const align = style?.align ?? (alignClass?.match(/(left|center|right)$/)?.[1] as WpWidgetStyle["align"]);
  const defaultColor = widgetType(element) === "heading" ? context.styles.get(DEFAULT_HEADING_STYLE)?.color : undefined;
  return {
    align,
    tone: textToneOf(style?.color ?? defaultColor),
    width: style?.imageWidth,
    surface: surfaceOf(style?.background),
    outline: outlineOf(style?.border),
    narrow: (style?.marginRight ?? 0) >= NARROW_MARGIN_PX || undefined,
  };
}

/* Style của chính widget (CSS) ghi đè giá trị mặc định của extractor; style kế thừa từ section/cột chỉ là giá trị dự phòng. */
function withStyle(widgets: WpWidget[], style: WpWidgetStyle, inherited = false): WpWidget[] {
  const entries = Object.fromEntries(Object.entries(style).filter(([, value]) => value !== undefined));
  if (Object.keys(entries).length === 0) return widgets;
  return widgets.map((widget) => (inherited ? { ...entries, ...widget } : { ...widget, ...entries }));
}

function columnWidth(column: Element, context: ExtractContext): number | undefined {
  const fromCss = context.styles.get(elementId(column) ?? "")?.columnWidth;
  if (fromCss) return fromCss;
  const fromClass = classes(column).find((name) => /^elementor-col-\d+$/.test(name));
  return fromClass ? Number(fromClass.slice("elementor-col-".length)) / 100 : undefined;
}

function toColumn(column: Element, widgets: WpWidget[], context: ExtractContext): WpColumn {
  const style = context.styles.get(elementId(column) ?? "");
  const background = context.backgrounds.get(`elementor-element-${elementId(column)}`);
  return {
    span: Math.min(GRID_COLUMNS, Math.max(1, Math.round((columnWidth(column, context) ?? 1) * GRID_COLUMNS))),
    widgets,
    align: style?.align,
    tone: surfaceOf(style?.background),
    outline: outlineOf(style?.border),
    elevated: style?.shadow,
    background: background ? { src: imageSrc(background) ?? background, alt: "" } : undefined,
  };
}

/* Section/container → các cột con trực tiếp; một cột thì trả thẳng widget, nhiều cột thì trả widget "columns" giữ tỉ lệ. */
function layoutWidgets(layout: Element, context: ExtractContext): WpWidget[] {
  const children = findAll((node) => Boolean(layoutType(node)) && parentLayout(node) === layout, layout.children).filter(
    (child) => (layoutType(layout) === "section" ? layoutType(child) === "column" : true) && isVisibleOnDesktop(child),
  );
  if (children.length === 0) return collectWidgets(layout.children, context);
  const all = children.map((child) => toColumn(child, collectWidgets(child.children, context), context));
  const filled = all.filter((column) => column.widgets.length > 0 || column.tone || column.background);
  if (filled.length === 0) return [];
  /* Cột rỗng (chừa chỗ cho ảnh nền) vẫn giữ để chữ không trải hết bề ngang như trang gốc. */
  const columns = filled.length === 1 && all.length > 1 && all.length <= MAX_COLUMNS_PER_ROW ? all : filled;
  if (columns.length > MAX_COLUMNS_PER_ROW) columns.forEach((column) => (column.span = GRID_COLUMNS / 3));
  const frameStyle = context.styles.get(elementId(layout) ?? "");
  /* Inner section có viền/nền/bóng (vd. khung tím quanh DBOARD) → giữ khung bao quanh nhóm cột. */
  const frame: WpWidgetStyle =
    isTopSection(layout) || !frameStyle
      ? {}
      : { surface: surfaceOf(frameStyle.background), outline: outlineOf(frameStyle.border), elevated: frameStyle.shadow };
  const hasFrame = Boolean(frame.surface || frame.outline || frame.elevated);
  const plain = columns.length === 1 && !columns[0].tone && !columns[0].outline && !columns[0].background && !columns[0].elevated;
  if (plain && !hasFrame) return withStyle(columns[0].widgets, { align: columns[0].align }, true);
  return [{ type: "columns", columns, ...frame }];
}

function collectWidgets(nodes: ChildNode[], context: ExtractContext): WpWidget[] {
  const result: WpWidget[] = [];
  for (const node of nodes) {
    if (!isTag(node) || !isVisibleOnDesktop(node) || isTopSection(node)) continue;
    const type = widgetType(node);
    if (!type) {
      if (layoutType(node) === "section" || layoutType(node) === "container") result.push(...layoutWidgets(node, context));
      else result.push(...collectWidgets(node.children, context));
      continue;
    }
    const extractor = EXTRACTORS[type];
    if (extractor) result.push(...withStyle(extractor(node, context), widgetStyle(node, context)));
    else if (type === "template" || type === "global") result.push(...collectWidgets(node.children, context));
    else if (!SKIPPED_WIDGETS.has(type)) context.unsupported.set(type, (context.unsupported.get(type) ?? 0) + 1);
  }
  return result;
}

/* Elementor đánh dấu sẵn section cấp cao nhất; không dựa vào cây DOM vì HTML trong text-editor hay thiếu thẻ đóng làm các section sau lồng vào section trước. */
function isTopSection(element: Element): boolean {
  return hasClass(element, "elementor-top-section") || (hasClass(element, "e-con") && hasClass(element, "e-parent"));
}

function topSections(nodes: ChildNode[]): Element[] {
  return findAll((node) => isTopSection(node) && isVisibleOnDesktop(node), nodes);
}

function sectionBackground(section: Element, backgrounds: ElementorBackgrounds): WpImage | undefined {
  const src = imageSrc(backgrounds.get(`elementor-element-${elementId(section)}`));
  return src ? { src, alt: "" } : undefined;
}

export type ElementorDocument = {
  sections: WpSection[];
  unsupported: UnsupportedWidgets;
};

export function elementorToSections(
  html: string,
  backgrounds: ElementorBackgrounds = new Map(),
  styles: ElementorStyles = new Map(),
): ElementorDocument {
  const nodes = parseHtml(html);
  const context: ExtractContext = { backgrounds, styles, unsupported: new Map() };
  const roots = topSections(nodes);
  const sections: WpSection[] = roots.length
    ? roots.map((section, index) => ({
        id: `s-${elementId(section) ?? index}`,
        widgets: withStyle(layoutWidgets(section, context), { align: styles.get(elementId(section) ?? "")?.align }, true),
        background: sectionBackground(section, backgrounds),
        tone: surfaceOf(styles.get(elementId(section) ?? "")?.background),
        outline: outlineOf(styles.get(elementId(section) ?? "")?.border),
        tall: (styles.get(elementId(section) ?? "")?.minHeight ?? 0) >= TALL_SECTION_PX,
        spacing: sectionSpacing(styles.get(elementId(section) ?? "")?.paddingTop),
        backgroundPosition: objectPosition(styles.get(elementId(section) ?? "")?.backgroundPosition),
        backgroundFit: styles.get(elementId(section) ?? "")?.backgroundSize === "contain" ? "contain" : undefined,
      }))
    : [{ id: "s-content", widgets: collectWidgets(nodes, context) }];
  return { sections: sections.filter((section) => section.widgets.length > 0 || Boolean(section.background)), unsupported: context.unsupported };
}

export function elementorDocumentIds(html: string): string[] {
  return [...new Set([...html.matchAll(/data-elementor-id="(\d+)"/g)].map((match) => match[1]))];
}

const REPEATER_BACKGROUND = /\.(elementor-repeater-item-[\w-]+)[^{}]*\{[^}]*background-image:\s*url\(["']?([^"')]+)/g;
/* Nền của chính section/cột: selector kết thúc ngay ở .elementor-element-<id> (bỏ qua :not(...)), không phải phần tử con bên trong. */
const ELEMENT_BACKGROUND = /\.(elementor-element-[a-f0-9]+)(?![\w-])(?::not\([^)]*\))?\s*(?:,[^{}]*)?\{[^}]*background-image:\s*url\(["']?([^"')]+)/g;

export function parseElementorBackgrounds(css: string): ElementorBackgrounds {
  const backgrounds: ElementorBackgrounds = new Map();
  for (const pattern of [REPEATER_BACKGROUND, ELEMENT_BACKGROUND]) {
    for (const match of css.matchAll(pattern)) {
      if (!backgrounds.has(match[1])) backgrounds.set(match[1], match[2]);
    }
  }
  return backgrounds;
}

export function isElementorHtml(html: string): boolean {
  return html.includes("data-elementor-type") || html.includes("data-widget_type");
}

/* Trang custom post type "service" (/san-pham/…) không có trong REST — cắt phần nội dung Elementor từ HTML trang. */
export function elementorDocumentHtml(pageHtml: string): string | undefined {
  const nodes = parseHtml(pageHtml);
  const main = findOne(
    (node) => ["wp-post", "wp-page", "single-post", "single-page", "single"].includes(node.attribs["data-elementor-type"] ?? ""),
    nodes,
    true,
  );
  return main ? getOuterHTML(main) : undefined;
}
