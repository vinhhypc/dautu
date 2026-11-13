import type { MetadataRoute } from "next";

import { publicPages } from "@/content/pages";
import { absoluteUrl } from "@/lib/seo";
import { wordpressDateIso } from "@/lib/structured-data";
import { listCategories, listIndexablePosts } from "@/lib/wp/archive";
import { wpOrFallback } from "@/lib/wp/client";
import { type WpSitemapEntry, getWpDocument, isExcludedPath, listIndexablePages, listIndexableServices } from "@/lib/wp/pages";

export const revalidate = 3600;

function modifiedDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(wordpressDateIso(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/* Một số /san-pham/ cũ không dựng bằng Elementor (hoặc đã chuyển hướng) nên site không hiển thị được — không đưa vào sitemap. */
async function renderableServices(): Promise<WpSitemapEntry[]> {
  const services = await listIndexableServices();
  const documents = await Promise.all(services.map((service) => wpOrFallback(getWpDocument(service.path), undefined, `sitemap: ${service.path}`)));
  return services.filter((_, index) => documents[index] && !documents[index]?.seo.noIndex);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, services, posts, categories] = await Promise.all([
    wpOrFallback(listIndexablePages(), [], "sitemap: danh sách trang"),
    wpOrFallback(renderableServices(), [], "sitemap: danh sách /san-pham/"),
    wpOrFallback(listIndexablePosts(), [], "sitemap: danh sách bài viết"),
    wpOrFallback(listCategories(), [], "sitemap: danh sách chuyên mục"),
  ]);
  const ownPaths = new Set(publicPages.map((page) => page.path));
  return [
    ...publicPages
      .filter((page) => !page.noIndex)
      .map((page) => ({
        url: absoluteUrl(page.path),
        lastModified: page.lastModified ? new Date(page.lastModified) : new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      })),
    ...[...pages, ...services]
      .filter((entry) => !ownPaths.has(entry.path))
      .map((entry) => ({ url: absoluteUrl(entry.path), lastModified: modifiedDate(entry.modified), changeFrequency: "weekly" as const })),
    ...categories
      .filter((category) => category.count > 0 && !category.seo.noIndex)
      .map((category) => ({ url: absoluteUrl(category.path), changeFrequency: "weekly" as const })),
    ...posts
      .filter((post) => !isExcludedPath(post.path))
      .map((post) => ({ url: absoluteUrl(post.path), lastModified: modifiedDate(post.modified), changeFrequency: "monthly" as const })),
  ];
}
