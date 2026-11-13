import type { HubspotFormConfig, LinkItem, PostArticleLabels, ShareLink, WpImage as WpImageData, WpSectionLabels, WpWidget } from "@/types/content";

import { RevealChildren } from "../motion/reveal-children";
import { HubspotForm } from "../ui/hubspot-form";
import { IconLink } from "../ui/icon-button";
import { RouteLink } from "../ui/route-link";
import { WpImage } from "../ui/wp-image";
import { type PostCardItem, PostGrid } from "./post-list";
import { WpWidgetList } from "./wp-sections";

type PostArticleProps = {
  date: string;
  dateTime: string;
  categories: LinkItem[];
  image?: WpImageData;
  widgets: WpWidget[];
  toc: LinkItem[];
  shareLinks: ShareLink[];
  related: PostCardItem[];
  subscribeForm: HubspotFormConfig;
  labels: PostArticleLabels;
  sectionLabels: WpSectionLabels;
};

export function PostArticle({
  date,
  dateTime,
  categories,
  image,
  widgets,
  toc,
  shareLinks,
  related,
  subscribeForm,
  labels,
  sectionLabels,
}: PostArticleProps) {
  return (
    <RevealChildren className="flex flex-col gap-32 md:gap-48">
      <div className="flex flex-col gap-24">
        <dl className="flex flex-wrap gap-x-24 gap-y-8 text-normal-l text-text-tertiary">
          <div className="flex gap-8">
            <dt>{labels.published}</dt>
            <dd className="text-text-secondary">
              <time dateTime={dateTime}>{date}</time>
            </dd>
          </div>
          {categories.length > 0 && (
            <div className="flex gap-8">
              <dt>{labels.categories}</dt>
              <dd>
                <ul className="flex flex-wrap gap-x-8">
                  {categories.map((category) => (
                    <li key={category.href} className="not-last:after:content-[',']">
                      <RouteLink href={category.href} className="link-text">
                        {category.label}
                      </RouteLink>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
        {image && <WpImage image={image} sizes="(min-width: 1152px) 760px, 100vw" priority className="w-full rounded-12" />}
        {toc.length > 1 && (
          <nav aria-labelledby="post-toc" className="flex flex-col gap-12 rounded-12 border border-border-subtle p-16 md:p-24">
            <p id="post-toc" className="text-normal-lg font-semibold text-text-primary">
              {labels.tocTitle}
            </p>
            <ol className="flex list-decimal flex-col gap-8 pl-24 text-normal-lg marker:text-text-tertiary">
              {toc.map((item) => (
                <li key={item.href}>
                  <RouteLink href={item.href} className="link-text">
                    {item.label}
                  </RouteLink>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="flex flex-col gap-16">
          <WpWidgetList widgets={widgets} labels={sectionLabels} />
        </div>
        {shareLinks.length > 0 && (
          <div className="flex items-center gap-12 border-t border-border-subtle pt-16">
            <p className="text-normal-lg font-medium text-text-primary">{labels.shareTitle}</p>
            <ul className="flex gap-8">
              {shareLinks.map((link) => (
                <li key={link.icon}>
                  <IconLink href={link.href} icon={link.icon} label={link.label} external />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <section aria-labelledby="post-subscribe" className="flex flex-col gap-16 rounded-16 bg-background-surface p-24 md:p-32">
        <h2 id="post-subscribe" className="text-large-sm font-semibold text-text-primary">
          {labels.subscribeTitle}
        </h2>
        <HubspotForm {...subscribeForm} labels={{ loading: sectionLabels.formLoading, error: sectionLabels.formError }} />
      </section>
      {related.length > 0 && (
        <section aria-labelledby="post-related" className="flex flex-col gap-24">
          <h2 id="post-related" className="text-large-sm font-semibold text-text-primary">
            {labels.relatedTitle}
          </h2>
          <PostGrid items={related} titleTag="h3" columns={3} showExcerpt={false} />
        </section>
      )}
    </RevealChildren>
  );
}
