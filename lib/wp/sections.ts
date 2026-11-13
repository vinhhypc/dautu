import type { WpSection } from "@/types/content";

const isTitleOnly = (section: WpSection) => section.widgets.length > 0 && section.widgets.every((widget) => widget.type === "heading");

/* Elementor hay đặt tiêu đề trong một section riêng ngay trên khối nội dung — gộp vào section sau để tiêu đề đi cùng nội dung của nó. */
export function mergeTitleSections(sections: WpSection[]): WpSection[] {
  const result: WpSection[] = [];
  let pending: WpSection | undefined;
  for (const section of sections) {
    const merged = pending ? { ...section, widgets: [...pending.widgets, ...section.widgets] } : section;
    pending = isTitleOnly(merged) ? merged : undefined;
    if (!pending) result.push(merged);
  }
  if (pending) result.push(pending);
  return result;
}
