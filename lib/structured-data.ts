import { siteContent } from "@/content/site";
import { wpSearchPath } from "@/content/wp";
import type { FaqItem, LinkItem, WpSection } from "@/types/content";

import { richTextToPlain } from "./rich-text";
import { absoluteUrl } from "./seo";
import { flattenWidgets } from "./wp-layout";

export type JsonLdObject = Record<string, unknown>;

const organizationId = `${siteContent.url}/#organization`;

export function organizationSchema(): JsonLdObject {
  const { organization } = siteContent;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: siteContent.name,
    legalName: organization.legalName,
    url: siteContent.url,
    logo: absoluteUrl(organization.logoPath),
    email: organization.email,
    sameAs: organization.sameAs,
  };
}

export function websiteSchema(language: string = siteContent.language): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteContent.name,
    url: siteContent.url,
    inLanguage: language,
    publisher: { "@id": organizationId },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl(wpSearchPath)}?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: LinkItem[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href),
    })),
  };
}

type ArticleSchemaInput = {
  title: string;
  path: string;
  description?: string;
  image?: string;
  published: string;
  modified?: string;
};

/* WordPress trả giờ địa phương không kèm múi giờ — site chỉ phục vụ giờ Việt Nam. */
export function wordpressDateIso(date: string): string {
  return /(Z|[+-]\d{2}:\d{2})$/.test(date) ? date : `${date}+07:00`;
}

export function articleSchema({ title, path, description, image, published, modified }: ArticleSchemaInput): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: image ? [image] : undefined,
    datePublished: wordpressDateIso(published),
    dateModified: wordpressDateIso(modified ?? published),
    mainEntityOfPage: absoluteUrl(path),
    author: { "@id": organizationId },
    publisher: { "@id": organizationId },
  };
}

export function faqSchema(items: FaqItem[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

/* Accordion/toggle Elementor hiển thị thành câu hỏi – trả lời trên trang → khai báo FAQPage. */
export function wpFaqSchema(sections: WpSection[]): JsonLdObject[] {
  const items = sections
    .flatMap((section) => flattenWidgets(section.widgets))
    .flatMap((widget) => (widget.type === "faq" ? widget.items : []))
    .map((item) => ({ question: item.title, answer: richTextToPlain(item.body) }))
    .filter((item) => item.question && item.answer);
  return items.length > 0 ? [faqSchema(items)] : [];
}
