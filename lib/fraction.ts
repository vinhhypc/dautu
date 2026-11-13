/* Tỉ lệ độ rộng (0–1) từ WordPress/Elementor → bậc phân số Tailwind gần nhất (không dùng giá trị tuỳ ý). */
const FRACTIONS: [number, string][] = [
  [0.1, "w-1/10"],
  [0.125, "w-1/8"],
  [1 / 6, "w-1/6"],
  [0.2, "w-1/5"],
  [0.25, "w-1/4"],
  [1 / 3, "w-1/3"],
  [0.4, "w-2/5"],
  [0.5, "w-1/2"],
  [0.6, "w-3/5"],
  [2 / 3, "w-2/3"],
  [0.75, "w-3/4"],
  [0.8, "w-4/5"],
  [1, "w-full"],
];

export function widthFractionClass(width?: number): string {
  if (!width) return "w-auto";
  return FRACTIONS.reduce((best, item) => (Math.abs(item[0] - width) < Math.abs(best[0] - width) ? item : best))[1];
}

/* Ảnh có width/height: w-full + max-w theo bậc ≤ kích thước gốc để giữ chỗ trước khi ảnh tải (w-auto cho ảnh 0×0 đến khi tải xong). */
const NATURAL_WIDTHS: [number, string][] = [
  [1088, "w-full"],
  [960, "w-full max-w-960"],
  [768, "w-full max-w-768"],
  [640, "w-full max-w-640"],
  [480, "w-full max-w-480"],
  [320, "w-full max-w-320"],
  [240, "w-full max-w-240"],
  [160, "w-full max-w-160"],
];

export function naturalWidthClass(width?: number): string {
  if (!width) return "w-auto";
  return NATURAL_WIDTHS.find(([min]) => width >= min)?.[1] ?? "w-auto";
}
