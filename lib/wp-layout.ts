import { richTextToPlain } from "@/lib/rich-text";
import type { RichBlock, WpCardFace, WpColumn, WpSection, WpWidget } from "@/types/content";

type Widget<T extends WpWidget["type"]> = Extract<WpWidget, { type: T }>;

export type WpRun =
  | { kind: "cards"; items: Widget<"card">[] }
  | { kind: "flipCards"; items: Widget<"flipCard">[] }
  | { kind: "images"; items: Widget<"image">[] }
  | { kind: "buttons"; items: Widget<"button">[] }
  | { kind: "single"; widget: WpWidget };

const GROUPED = { card: "cards", flipCard: "flipCards", image: "images", button: "buttons" } as const;

/* Thẻ/ảnh/nút đứng liền nhau trong cùng một cột → hiển thị thành lưới hoặc hàng nút ds-one. */
export function groupWidgets(widgets: WpWidget[]): WpRun[] {
  const runs: WpRun[] = [];
  for (const widget of widgets) {
    const kind = GROUPED[widget.type as keyof typeof GROUPED];
    const last = runs.at(-1);
    if (kind && last?.kind === kind) (last.items as WpWidget[]).push(widget);
    else if (kind) runs.push({ kind, items: [widget] } as WpRun);
    else runs.push({ kind: "single", widget });
  }
  return runs;
}

function mapWidgets(widgets: WpWidget[], map: (widget: WpWidget) => WpWidget): WpWidget[] {
  return widgets.map((widget) =>
    widget.type === "columns"
      ? { ...widget, columns: widget.columns.map((column) => ({ ...column, widgets: mapWidgets(column.widgets, map) })) }
      : map(widget),
  );
}

const MAX_LABEL_TILE_CHARS = 24;

/* Cột tô nền chỉ chứa vài chữ (vd. "ĐƯỜNG ĐỜI" trên /dgo/) là ô nhãn của cả hàng, không phải thẻ nội dung. */
export function isLabelTile(column: WpColumn): boolean {
  if (!column.tone || column.widgets.length === 0) return false;
  const texts = column.widgets.map((widget) =>
    widget.type === "heading" ? widget.text : widget.type === "richText" ? richTextToPlain(widget.blocks) : undefined,
  );
  if (texts.some((text) => text === undefined)) return false;
  return texts.join(" ").replace(/\s+/g, " ").trim().length <= MAX_LABEL_TILE_CHARS;
}

export type MasonryItem = Widget<"card"> | Widget<"flipCard">;

export function masonryCards(columns: WpColumn[]): MasonryItem[] | undefined {
  if (columns.length < 2 || columns.some((column) => column.tone || column.outline || column.background || column.elevated)) return undefined;
  const items = columns.flatMap((column) => column.widgets);
  const cards = items.filter(
    (widget): widget is MasonryItem => widget.type === "flipCard" || (widget.type === "card" && Boolean(widget.card.link)),
  );
  return cards.length === items.length && cards.length > columns.length ? cards : undefined;
}

const STEP_PREFIX = /^(bước|step)\s*(\d+)/i;

function stepText(widget: WpWidget): string | undefined {
  if (widget.type === "richText") return richTextToPlain(widget.blocks);
  if (widget.type === "card") return widget.card.title;
  if (widget.type === "flipCard") return widget.front.title ?? widget.back.title;
  return undefined;
}

export function isStepRow(columns: WpColumn[]): boolean {
  if (columns.length < 2) return false;
  return columns.every((column, index) => {
    const [widget] = column.widgets;
    if (column.widgets.length !== 1) return false;
    return Number(stepText(widget)?.trim().match(STEP_PREFIX)?.[2]) === index + 1;
  });
}

/* Mặt sau thẻ lật hay chép lại nội dung mặt trước (hoặc bản dài hơn của nó) → chỉ giữ bản đầy đủ. */
export function flipCardBodies(front: WpCardFace, back: WpCardFace): { front: RichBlock[]; back: RichBlock[] } {
  const frontText = richTextToPlain(front.body).toLocaleLowerCase("vi");
  const backText = richTextToPlain(back.body).toLocaleLowerCase("vi");
  if (!frontText || !backText) return { front: front.body, back: back.body };
  if (backText.includes(frontText)) return { front: [], back: back.body };
  if (frontText.includes(backText)) return { front: front.body, back: [] };
  return { front: front.body, back: back.body };
}

export function isTitleOnly(widgets: WpWidget[]): boolean {
  return widgets.some((widget) => widget.type === "heading") && widgets.every((widget) => widget.type === "heading" || widget.type === "divider");
}

export function flattenWidgets(widgets: WpWidget[]): WpWidget[] {
  return widgets.flatMap((widget) => (widget.type === "columns" ? widget.columns.flatMap((column) => flattenWidgets(column.widgets)) : [widget]));
}

/* Elementor cho đặt h1 tuỳ ý: giữ đúng một h1 (cái đầu tiên), các h1 khác hạ thành h2. */
export function normalizeHeadings(sections: WpSection[], allowH1 = true): { sections: WpSection[]; hasH1: boolean } {
  let hasH1 = !allowH1;
  const normalized = sections.map((section) => ({
    ...section,
    widgets: mapWidgets(section.widgets, (widget) => {
      if (widget.type !== "heading" || widget.level !== 1) return widget;
      if (hasH1) return { ...widget, level: 2 as const };
      hasH1 = true;
      return widget;
    }),
  }));
  return { sections: normalized, hasH1 };
}

export function sectionHeadingId(section: WpSection): string | undefined {
  return section.widgets.some((widget) => widget.type === "heading") ? `${section.id}-title` : undefined;
}

export function sectionContainsH1(section: WpSection): boolean {
  return flattenWidgets(section.widgets).some((widget) => widget.type === "heading" && widget.level === 1);
}

export function formSectionId(sections: WpSection[]): string | undefined {
  return sections.find((section) => flattenWidgets(section.widgets).some((widget) => widget.type === "hubspotForm"))?.id;
}

export function isBannerSlides(widget: Widget<"slides">): boolean {
  return widget.items.every((item) => item.image && !item.title && !item.body);
}
