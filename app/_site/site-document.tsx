import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { preload } from "react-dom";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SkipLink } from "@/components/layout/skip-link";
import { MotionProvider } from "@/components/motion/motion-provider";
import { RevealFallback } from "@/components/motion/reveal-fallback";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationSchema, websiteSchema } from "@/lib/structured-data";
import type { SiteContent } from "@/types/content";

import "../globals.css";

const MAIN_ID = "main-content";

const PRELOADED_FONTS = [
  "/fonts/ibm-plex-sans/ibm-plex-sans-latin-400.woff2",
  "/fonts/ibm-plex-sans/ibm-plex-sans-latin-500.woff2",
  "/fonts/ibm-plex-sans/ibm-plex-sans-latin-600.woff2",
  "/fonts/ibm-plex-sans/ibm-plex-sans-vietnamese-400.woff2",
  "/fonts/ibm-plex-sans/ibm-plex-sans-vietnamese-500.woff2",
  "/fonts/ibm-plex-sans/ibm-plex-sans-vietnamese-600.woff2",
];

export function siteMetadata(site: SiteContent): Metadata {
  return {
    metadataBase: new URL(site.url),
    title: {
      default: site.name,
      template: `%s | ${site.name}`,
    },
    description: site.description,
    applicationName: site.name,
    keywords: site.keywords,
    formatDetection: { telephone: false, email: false, address: false },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: site.locale,
      images: [site.defaultOgImage],
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

export const siteViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

type SiteDocumentProps = {
  site: SiteContent;
  children: ReactNode;
};

export function SiteDocument({ site, children }: SiteDocumentProps) {
  for (const href of PRELOADED_FONTS) preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });

  return (
    <html lang={site.language} data-brand="vnds" data-theme="light">
      <head>
        <RevealFallback />
      </head>
      <body className="relative flex min-h-dvh flex-col">
        <JsonLd data={[organizationSchema(), websiteSchema(site.language)]} />
        <MotionProvider>
          <SkipLink targetId={MAIN_ID} label={site.skipLinkLabel} />
          <Header {...site.header} />
          <main id={MAIN_ID} tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
          <Footer {...site.footer} />
        </MotionProvider>
      </body>
    </html>
  );
}
