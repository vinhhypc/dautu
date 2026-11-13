import type { MetadataRoute } from "next";

import { wpSearchPath } from "@/content/wp";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (process.env.NEXT_PUBLIC_SITE_NOINDEX === "1") return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: [wpSearchPath] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
