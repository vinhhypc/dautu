import type { WpSection, WpWidget } from "@/types/content";

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

export function isBannerSlides(widget: Widget<"slides">): boolean {
  return widget.items.every((item) => item.image && !item.title && !item.body);
}
