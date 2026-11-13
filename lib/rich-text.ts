import type { RichBlock, RichInline } from "@/types/content";

function inlineText(items: RichInline[]): string {
  return items
    .map((item) => {
      if (item.type === "text") return item.value;
      if (item.type === "break") return " ";
      return inlineText(item.children);
    })
    .join("");
}

export function richTextToPlain(blocks: RichBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "heading":
        case "paragraph":
          return inlineText(block.children);
        case "list":
          return block.items.map(richTextToPlain).join(" ");
        case "table":
          return block.rows.map((row) => row.map((cell) => richTextToPlain(cell.children)).join(" ")).join(" ");
        case "disclosure":
          return `${inlineText(block.title)} ${richTextToPlain(block.children)}`;
        case "image":
          return block.alt;
        default:
          return "";
      }
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
