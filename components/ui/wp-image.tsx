import Image from "next/image";

import { cn } from "@/lib/cn";
import { IMAGE_QUALITY } from "@/lib/image";
import type { WpImage as WpImageData } from "@/types/content";

type WpImageProps = {
  image: WpImageData;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/* Ảnh trong nội dung WordPress: biết kích thước thì tối ưu qua next/image, không biết thì giữ link gốc. */
export function WpImage({ image, sizes, priority = false, className }: WpImageProps) {
  if (image.width && image.height) {
    return (
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes={sizes}
        preload={priority}
        quality={IMAGE_QUALITY.standard}
        className={cn("h-auto max-w-full", className)}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- ảnh WordPress không có width/height, không dùng được next/image (ngoại lệ ảnh WP, AGENTS.md).
    <img src={image.src} alt={image.alt} loading={priority ? "eager" : "lazy"} decoding="async" className={cn("h-auto max-w-full", className)} />
  );
}
