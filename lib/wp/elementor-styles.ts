/* Đọc file CSS Elementor (post-<id>.css) để giữ lại bố cục: độ rộng cột, căn lề, độ rộng ảnh, màu nền/màu chữ.
   Chỉ lấy rule áp dụng cho desktop (bỏ @media max-width); màu được map sang token ở bước hiển thị, không dùng mã hex. */

export type ElementorStyle = {
  align?: "left" | "center" | "right";
  columnWidth?: number;
  imageWidth?: number;
  color?: string;
  background?: string;
  border?: string;
  minHeight?: number;
  fontSize?: number;
  marginRight?: number;
  shadow?: boolean;
  paddingTop?: number;
  backgroundPosition?: string;
  backgroundSize?: string;
};

export type ElementorStyles = Map<string, ElementorStyle>;

type Rule = { selector: string; body: string };

function rules(css: string): Rule[] {
  const result: Rule[] = [];
  let index = 0;
  while (index < css.length) {
    const open = css.indexOf("{", index);
    if (open < 0) break;
    const head = css.slice(index, open).trim();
    if (head.startsWith("@media")) {
      let depth = 1;
      let cursor = open + 1;
      while (cursor < css.length && depth > 0) {
        if (css[cursor] === "{") depth++;
        else if (css[cursor] === "}") depth--;
        cursor++;
      }
      if (!head.includes("max-width")) result.push(...rules(css.slice(open + 1, cursor - 1)));
      index = cursor;
      continue;
    }
    const close = css.indexOf("}", open);
    if (close < 0) break;
    result.push({ selector: head, body: css.slice(open + 1, close) });
    index = close + 1;
  }
  return result;
}

const ELEMENT_ID = /elementor-element-([a-f0-9]+)/g;
const DECLARATION = (name: string) => new RegExp(`(?:^|;)\\s*${name}\\s*:\\s*([^;!]+)`);

function declaration(body: string, name: string): string | undefined {
  return body.match(DECLARATION(name))?.[1]?.trim();
}

function percent(value: string | undefined): number | undefined {
  const match = value?.match(/^([\d.]+)%$/);
  return match ? Number(match[1]) / 100 : undefined;
}

function update(styles: ElementorStyles, id: string, patch: ElementorStyle) {
  const current = styles.get(id) ?? {};
  for (const [key, value] of Object.entries(patch) as [keyof ElementorStyle, never][]) {
    if (value !== undefined && current[key] === undefined) current[key] = value;
  }
  styles.set(id, current);
}

/* Màu toàn cục của Elementor Kit (--e-global-color-*) — các widget hay dùng var(...) thay vì mã màu. */
export function parseElementorGlobals(css: string): Map<string, string> {
  return new Map([...css.matchAll(/(--e-global-color-[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})/g)].map((match) => [match[1], match[2]]));
}

function resolveVars(body: string, globals: Map<string, string>): string {
  return body.replace(/var\(\s*(--e-global-color-[\w-]+)\s*\)/g, (match, name: string) => globals.get(name) ?? match);
}

function pixels(value: string | undefined): number | undefined {
  const match = value?.match(/^(\d+)px$/);
  return match ? Number(match[1]) : undefined;
}

export function parseElementorStyles(css: string, globals: Map<string, string> = new Map()): ElementorStyles {
  const styles: ElementorStyles = new Map();
  for (const { selector, body: rawBody } of rules(css)) {
    const body = resolveVars(rawBody, globals);
    for (const part of selector.split(",")) {
      if (part.includes(":hover") || part.includes(":focus")) continue;
      const ids = [...part.matchAll(ELEMENT_ID)].map((match) => match[1]);
      const id = ids.at(-1);
      if (!id) continue;
      const tail = part.slice(part.lastIndexOf(`elementor-element-${id}`) + `elementor-element-${id}`.length).trim();
      const targetsElement = tail === "" || tail.startsWith(">") || tail.startsWith(".elementor-heading-title");
      const rawAlign = declaration(body, "text-align");
      const align = rawAlign === "start" ? "left" : rawAlign === "end" ? "right" : rawAlign;
      const width = percent(declaration(body, "--width") ?? declaration(body, "width"));
      const maxWidth = percent(declaration(body, "max-width"));
      const color = declaration(body, "color");
      const background = declaration(body, "background-color");
      const borderStyle = declaration(body, "border-style");
      const borderColor = declaration(body, "border-color");
      const borderWidth = declaration(body, "border-width");
      const isFullBorder = !borderWidth || !/(^|\s)0(px)?(\s|$)/.test(borderWidth);
      const isOverlay = tail.includes("background-overlay");

      update(styles, id, {
        align: (align === "left" || align === "center" || align === "right") && !/icon-list|tab|toggle|accordion/.test(tail) ? align : undefined,
        columnWidth: tail === "" && width ? width : undefined,
        imageWidth: /\bimg$/.test(tail) && (width || maxWidth) ? Math.min(width ?? 1, maxWidth ?? 1) : undefined,
        color: color?.startsWith("#") && (targetsElement || tail.includes("heading-title")) ? color : undefined,
        background: background?.startsWith("#") && !tail.includes("button") && !isOverlay ? background : undefined,
        border:
          borderStyle && borderStyle !== "none" && isFullBorder && borderColor?.startsWith("#") && !tail.includes("button") ? borderColor : undefined,
        minHeight: tail.startsWith(">") || tail === "" ? pixels(declaration(body, "min-height")) : undefined,
        fontSize: tail.includes("heading-title") ? pixels(declaration(body, "font-size")) : undefined,
        marginRight: tail.includes("widget-container") ? pixels(declaration(body, "margin")?.split(/\s+/)[1]) : undefined,
        shadow: (tail === "" || tail.startsWith(">")) && /box-shadow\s*:\s*(?!none)/.test(body) ? true : undefined,
        paddingTop: tail === "" || tail === "> .elementor-container" ? pixels(declaration(body, "padding")?.split(/\s+/)[0]) : undefined,
        backgroundPosition: body.includes("background-image") || declaration(body, "background-position") ? declaration(body, "background-position") : undefined,
        backgroundSize: declaration(body, "background-size"),
      });
    }
  }
  return styles;
}

export type ElementorTone = "brand" | "accent" | "muted" | "inverse";

function rgb(hex: string): [number, number, number] | undefined {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.replace(/./g, (char) => char + char) : value.slice(0, 6);
  if (!/^[0-9a-f]{6}$/i.test(full)) return undefined;
  return [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16)) as [number, number, number];
}

/* Màu chữ tiêu đề: cam/vàng → brand, tím (#47236C của DGO/VNDSTOCK) → purple; còn lại giữ màu chữ mặc định. */
export function textToneOf(hex: string | undefined): "brand" | "purple" | undefined {
  const color = hex && rgb(hex);
  if (!color) return undefined;
  const [red, green, blue] = color;
  if (red > 200 && green > 100 && blue < 90) return "brand";
  if (blue > green + 30 && red > green + 10 && red < 160) return "purple";
  return undefined;
}

/* Map màu Elementor về nhóm token ds-one: cam/vàng thương hiệu → brand, nền rất sáng → muted, tối → inverse. */
export function toneOf(hex: string | undefined): ElementorTone | undefined {
  const color = hex && rgb(hex);
  if (!color) return undefined;
  const [red, green, blue] = color;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2 / 255;
  if (lightness > 0.93) return max - min < 12 ? undefined : "muted";
  if (lightness > 0.85) return "muted";
  if (red > 200 && green > 160 && blue < 90) return "accent";
  if (red > 200 && green > 100 && blue < 90) return "brand";
  if (lightness < 0.35) return "inverse";
  return undefined;
}
