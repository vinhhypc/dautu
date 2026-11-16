import { isTitleOnly } from "@/lib/wp-layout";
import type { WpSection } from "@/types/content";

/* Elementor hay đặt tiêu đề trong một section riêng ngay trên khối nội dung — gộp vào section sau để tiêu đề đi cùng nội dung của nó. */
export function mergeTitleSections(sections: WpSection[]): WpSection[] {
  const result: WpSection[] = [];
  let pending: WpSection | undefined;
  for (const section of sections) {
    const merged = pending ? { ...section, widgets: [...pending.widgets, ...section.widgets] } : section;
    pending = isTitleOnly(merged.widgets) ? merged : undefined;
    if (!pending) result.push(merged);
  }
  if (pending) result.push(pending);
  return result;
}
