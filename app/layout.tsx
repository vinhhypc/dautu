import type { ReactNode } from "react";

import { siteContent } from "@/content/site";

import { SiteDocument, siteMetadata, siteViewport } from "./_site/site-document";

export const metadata = siteMetadata(siteContent);

export const viewport = siteViewport;

export default function RootLayout({ children }: { children: ReactNode }) {
  return <SiteDocument site={siteContent}>{children}</SiteDocument>;
}
