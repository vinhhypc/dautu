import type { Metadata } from "next";

import { siteContent } from "@/content/site";
import type { PageSeo, SiteContent } from "@/types/content";

export function absoluteUrl(path: string): string {
  return new URL(path, siteContent.url).toString();
}

export function buildMetadata(
  { title, description, path, keywords, image, noIndex }: PageSeo,
  site: SiteContent = siteContent,
): Metadata {
  const ogImage = image ?? site.defaultOgImage;
  const isHome = path === "/";

  return {
    title: isHome ? { absolute: title } : title,
    description,
    keywords: keywords ?? site.keywords,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: site.locale,
      url: path,
      title,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
