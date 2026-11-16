/** Mức chất lượng ảnh cho next/image. Chỉ các giá trị ở đây được Next chấp nhận (next.config.ts → images.qualities). */
export const IMAGE_QUALITY = {
  standard: 85,
  high: 90,
} as const;

export const IMAGE_QUALITIES = Object.values(IMAGE_QUALITY);

/* Biểu đồ Google Sheets bản tương tác vẽ cố định (vd. 918×508), không co theo iframe → dùng bản ảnh Google xuất sẵn để co giãn theo khung. */
export function sheetChartImageSrc(src: string): string | undefined {
  try {
    const url = new URL(src);
    if (url.hostname !== "docs.google.com" || !url.pathname.endsWith("/pubchart")) return undefined;
    url.searchParams.set("format", "image");
    return url.toString();
  } catch {
    return undefined;
  }
}

/* Ảnh-link không có alt: dùng tên miền đích làm tên link thay vì để trình đọc màn hình đọc URL ảnh. */
export function linkHost(href: string): string | undefined {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}
