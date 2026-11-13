/** Mức chất lượng ảnh cho next/image. Chỉ các giá trị ở đây được Next chấp nhận (next.config.ts → images.qualities). */
export const IMAGE_QUALITY = {
  standard: 85,
  high: 90,
} as const;

export const IMAGE_QUALITIES = Object.values(IMAGE_QUALITY);
