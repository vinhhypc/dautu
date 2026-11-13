import type { MetadataRoute } from "next";

import { siteContent } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteContent.name,
    short_name: siteContent.name,
    description: siteContent.description,
    lang: siteContent.language,
    start_url: "/",
    display: "standalone",
    icons: [{ src: siteContent.iconPath, sizes: "any", type: "image/svg+xml" }],
  };
}
