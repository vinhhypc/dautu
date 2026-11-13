import type { PageSeo } from "@/types/content";

import { siteUploadPath } from "./origin";

export type YoastHead = {
  title?: string;
  description?: string;
  og_title?: string;
  og_description?: string;
  og_image?: { url: string; width?: number; height?: number }[];
  robots?: { index?: string; follow?: string };
};

export type WpSeo = PageSeo & { fullTitle?: string };

const SITE_SUFFIX = / [-|–] (Đầu tư tài chính cùng VNDIRECT|VNDIRECT|Sản phẩm đầu tư của VNDIRECT)$/;

/* Yoast đã ghép tên site vào title ("… - Đầu tư tài chính cùng VNDIRECT") — giữ nguyên làm title tuyệt đối để khớp trang cũ. */
export function seoFromYoast(head: YoastHead | undefined, fallbackTitle: string, path: string): WpSeo {
  const image = head?.og_image?.[0];
  const fullTitle = head?.title;
  return {
    title: fullTitle?.replace(SITE_SUFFIX, "") || fallbackTitle,
    fullTitle,
    description: head?.description ?? head?.og_description ?? "",
    path,
    image:
      image?.url && image.width && image.height
        ? { url: siteUploadPath(image.url), alt: head?.og_title ?? fallbackTitle, width: image.width, height: image.height }
        : undefined,
    noIndex: head?.robots?.index === "noindex",
  };
}
