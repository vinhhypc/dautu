/* Số tổng đài 1900/1800 viết trơn trong nội dung WordPress ("Hotline 1900545409") → tách ra để gắn link tel:. */
const HOTLINE = /(?<!\d)1[89]00(?:[\s.]?\d){4,6}(?!\d)/g;

export type TextPart = { text: string; tel?: string };

export function splitHotlines(value: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (const match of value.matchAll(HOTLINE)) {
    const start = match.index ?? 0;
    if (start > last) parts.push({ text: value.slice(last, start) });
    parts.push({ text: match[0], tel: `tel:${match[0].replace(/\D/g, "")}` });
    last = start + match[0].length;
  }
  if (last < value.length) parts.push({ text: value.slice(last) });
  return parts;
}
