import type { RichBlock, WpCardFace, WpImage, WpSection, WpSlide, WpTestimonial, WpWidget } from "@/types/content";

import { flattenWidgets, isBannerSlides } from "../wp-layout";

type Widget<T extends WpWidget["type"]> = Extract<WpWidget, { type: T }>;

export type HomeContent = {
  banners: WpSlide[];
  challenges?: { title?: string; slides: WpSlide[] };
  products?: { title?: string; cards: { front: WpCardFace; back: WpCardFace }[]; background?: WpImage };
  why?: { title?: string; main: WpWidget[]; aside: WpWidget[] };
  testimonials?: { title?: string; items: WpTestimonial[]; background?: WpImage };
  support?: { title?: string; body: RichBlock[] };
  rest: WpSection[];
};

type Block = { title?: string; widgets: WpWidget[]; background?: WpImage };

/* Cắt nội dung theo tiêu đề: mỗi tiêu đề mở một khối, giữ ảnh nền section chứa khối đó. */
function sectionImage(section: WpSection): WpImage | undefined {
  if (section.background) return section.background;
  for (const widget of section.widgets) {
    const column = widget.type === "columns" ? widget.columns.find((item) => item.background) : undefined;
    if (column?.background) return column.background;
  }
  return undefined;
}

function blocksOf(sections: WpSection[]): Block[] {
  const blocks: Block[] = [];
  for (const raw of sections) {
    const section = { ...raw, background: sectionImage(raw) };
    for (const widget of flattenWidgets(section.widgets)) {
      const last = blocks.at(-1);
      if (widget.type === "heading") blocks.push({ title: widget.text, widgets: [], background: section.background });
      else if (last) {
        last.widgets.push(widget);
        last.background ??= section.background;
      } else blocks.push({ widgets: [widget], background: section.background });
    }
  }
  return blocks;
}

const find = <T extends WpWidget["type"]>(block: Block, type: T) => block.widgets.find((widget): widget is Widget<T> => widget.type === type);

/* Trang chủ WP dựng theo thứ tự cố định: banner → thử thách (slider) → danh mục (flip box) → tại sao chọn → cảm nhận + hỗ trợ.
   Khối không nhận ra được trả về trong `rest` để vẫn hiển thị bằng template chung. */
export function homeContentFromWp(sections: WpSection[]): HomeContent {
  const content: HomeContent = { banners: [], rest: [] };
  const leftovers: Block[] = [];

  for (const block of blocksOf(sections)) {
    const slides = find(block, "slides");
    const testimonials = find(block, "testimonials");
    const flipCards = block.widgets.filter((widget): widget is Widget<"flipCard"> => widget.type === "flipCard");

    if (slides && isBannerSlides(slides) && !content.banners.length) {
      content.banners = slides.items;
      const others = block.widgets.filter((widget) => widget !== slides);
      if (block.title || others.length) leftovers.push({ ...block, widgets: others });
    } else if (slides && !content.challenges) content.challenges = { title: block.title, slides: slides.items };
    else if (flipCards.length && !content.products) {
      content.products = { title: block.title, cards: flipCards.map(({ front, back }) => ({ front, back })), background: block.background };
    } else if (testimonials && !content.testimonials) {
      content.testimonials = { title: block.title, items: testimonials.items, background: block.background };
    } else if (!content.testimonials && !content.why && block.widgets.some((widget) => widget.type === "richText")) {
      const split = block.widgets.findIndex((widget) => widget.type === "button");
      const cut = split >= 0 ? split + 1 : 1;
      content.why = { title: block.title, main: block.widgets.slice(0, cut), aside: block.widgets.slice(cut) };
    } else if (content.testimonials && !content.support && block.widgets.every((widget) => widget.type === "richText")) {
      content.support = { title: block.title, body: block.widgets.flatMap((widget) => (widget.type === "richText" ? widget.blocks : [])) };
    } else leftovers.push(block);
  }

  content.rest = leftovers.map((block, index) => ({
    id: `home-rest-${index}`,
    widgets: [...(block.title ? [{ type: "heading" as const, level: 2 as const, text: block.title }] : []), ...block.widgets],
  }));
  return content;
}
