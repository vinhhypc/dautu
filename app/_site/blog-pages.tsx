import type { Metadata } from "next";

import { DocumentLayout } from "@/components/sections/document-layout";
import { LatestPosts } from "@/components/sections/latest-posts";
import { PostArticle } from "@/components/sections/post-article";
import { type PostCardItem, PostList } from "@/components/sections/post-list";
import { SearchForm } from "@/components/sections/search-form";
import { JsonLd } from "@/components/seo/json-ld";
import { siteContent } from "@/content/site";
import {
  wpArchiveLabels,
  wpArticleLabels,
  wpBlogHome,
  wpBlogLatest,
  wpBlogSubscribeForm,
  wpBreadcrumbHome,
  wpDocumentLabels,
  wpHiddenCategoryPaths,
  wpSearchLabels,
  wpSearchPath,
  wpSectionLabels,
  wpShareTargets,
} from "@/content/wp";
import { buildPagination, splitPageSegments } from "@/lib/archive-pagination";
import { fillTemplate, formatDate } from "@/lib/format";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { articleSchema, breadcrumbSchema, wordpressDateIso, wpFaqSchema } from "@/lib/structured-data";
import {
  ARCHIVE_PAGE_SIZE,
  type PostSearchResult,
  type WpPost,
  type WpTerm,
  getCategoryByPath,
  getTagByPath,
  listCategories,
  listLatestPosts,
  listPosts,
} from "@/lib/wp/archive";
import { wpOrFallback } from "@/lib/wp/client";
import { siteUploadPath } from "@/lib/wp/origin";
import type { PaginationContent, PostSummary, SearchFormContent, SideNavSection } from "@/types/content";

const ARCHIVE_PREFIXES = ["category", "tag"] as const;

export type WpArchive = {
  term: WpTerm;
  page: number;
  totalPages: number;
  posts: PostSummary[];
};

/* /category/<slug>/ và /tag/<slug>/, kèm /page/N/ như WordPress; trang vượt quá số trang → không có. */
export async function getWpArchive(slug: string[]): Promise<WpArchive | undefined> {
  const [prefix, ...rest] = slug;
  if (!ARCHIVE_PREFIXES.includes(prefix as (typeof ARCHIVE_PREFIXES)[number]) || rest.length === 0) return undefined;
  const split = splitPageSegments(rest);
  if (!split) return undefined;
  const basePath = `/${[prefix, ...split.termSegments].join("/")}/`;
  const term = prefix === "category" ? await getCategoryByPath(basePath) : await getTagByPath(basePath);
  if (!term) return undefined;
  const totalPages = Math.max(1, Math.ceil(term.count / ARCHIVE_PAGE_SIZE));
  if (split.page > totalPages) return undefined;
  const posts = term.count > 0 ? await listPosts(term, split.page) : [];
  return { term, page: split.page, totalPages, posts };
}

function searchForm(query?: string): SearchFormContent {
  return { action: wpSearchPath, label: wpSearchLabels.formLabel, placeholder: wpSearchLabels.placeholder, submitLabel: wpSearchLabels.submit, query };
}

function toCard(post: PostSummary): PostCardItem {
  const dateTime = post.date.slice(0, 10);
  return { ...post, dateTime, date: formatDate(dateTime, siteContent.language) };
}

async function categoryNav(currentPaths: string[]): Promise<SideNavSection> {
  const hidden = new Set(wpHiddenCategoryPaths);
  const categories = (await listCategories()).filter((category) => category.count > 0 && !hidden.has(category.path));
  return {
    title: wpArchiveLabels.categoriesTitle,
    groups: [{ links: categories.map((category) => ({ label: category.name, href: category.path, current: currentPaths.includes(category.path) })) }],
  };
}

export async function BlogLatestPosts() {
  const posts = await wpOrFallback(listLatestPosts(wpBlogLatest.count), [], "blog: bài mới nhất");
  return <LatestPosts title={wpBlogLatest.title} items={posts.map(toCard)} search={searchForm()} />;
}

export function archiveMetadata({ term, page, totalPages }: WpArchive): Metadata {
  if (page === 1) {
    const description = term.seo.description || fillTemplate(wpArchiveLabels.description, { name: term.name });
    const metadata = buildMetadata({ ...term.seo, description });
    return term.seo.fullTitle ? { ...metadata, title: { absolute: term.seo.fullTitle } } : metadata;
  }
  return buildMetadata({
    title: fillTemplate(wpArchiveLabels.pageTitle, { name: term.name, current: page, total: totalPages }),
    description: fillTemplate(wpArchiveLabels.description, { name: term.name }),
    path: `${term.path}page/${page}/`,
    noIndex: term.seo.noIndex,
  });
}

export async function ArchivePage({ term, page, totalPages, posts }: WpArchive) {
  const breadcrumb = [wpBreadcrumbHome, wpBlogHome, { label: term.name, href: term.path }];
  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumb)} />
      <DocumentLayout
        breadcrumb={breadcrumb}
        title={term.name}
        meta={page > 1 ? fillTemplate(wpArchiveLabels.pageMeta, { current: page, total: totalPages }) : undefined}
        sideNav={await categoryNav([term.path])}
        labels={wpDocumentLabels}
      >
        <div className="flex flex-col gap-24">
          <SearchForm {...searchForm()} />
          <PostList
            items={posts.map(toCard)}
            empty={wpArchiveLabels.empty}
            pagination={buildPagination(term.path, page, totalPages, {}, {
              label: wpArchiveLabels.pagination,
              previous: wpArchiveLabels.previousPage,
              next: wpArchiveLabels.nextPage,
            })}
          />
        </div>
      </DocumentLayout>
    </>
  );
}

export function postMetadata(post: WpPost): Metadata {
  const metadata = buildMetadata(post.seo);
  return {
    ...metadata,
    title: post.seo.fullTitle ? { absolute: post.seo.fullTitle } : metadata.title,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: wordpressDateIso(post.date),
      modifiedTime: wordpressDateIso(post.modified ?? post.date),
    },
  };
}

export async function PostPage({ post }: { post: WpPost }) {
  const breadcrumb = [wpBreadcrumbHome, wpBlogHome, ...post.categories.slice(0, 1), { label: post.title, href: post.path }];
  const dateTime = post.date.slice(0, 10);
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(breadcrumb),
          articleSchema({
            title: post.title,
            path: post.path,
            description: post.seo.description || undefined,
            image: post.image ? absoluteUrl(siteUploadPath(post.image.src)) : undefined,
            published: post.date,
            modified: post.modified,
          }),
          ...wpFaqSchema(post.sections),
        ]}
      />
      <DocumentLayout
        breadcrumb={breadcrumb}
        title={post.title}
        sideNav={await categoryNav(post.categories.map((category) => category.href))}
        labels={wpDocumentLabels}
      >
        <PostArticle
          date={formatDate(dateTime, siteContent.language)}
          dateTime={dateTime}
          categories={post.categories}
          image={post.image}
          widgets={post.sections.flatMap((section) => section.widgets)}
          toc={post.toc}
          shareLinks={wpShareTargets.map(({ icon, label, url }) => ({
            icon,
            label,
            href: fillTemplate(url, { url: encodeURIComponent(absoluteUrl(post.path)) }),
          }))}
          related={post.related.map(toCard)}
          subscribeForm={wpBlogSubscribeForm}
          labels={wpArticleLabels}
          sectionLabels={wpSectionLabels}
        />
      </DocumentLayout>
    </>
  );
}

const SEARCH_PAGE_WINDOW = 2;

function searchHref(query: string, page: number): string {
  const params = new URLSearchParams({ q: query });
  if (page > 1) params.set("page", String(page));
  return `${wpSearchPath}?${params}`;
}

function searchPagination(query: string, page: number, totalPages: number): PaginationContent {
  const numbers = new Set([1, totalPages]);
  for (let index = page - SEARCH_PAGE_WINDOW; index <= page + SEARCH_PAGE_WINDOW; index++) if (index >= 1 && index <= totalPages) numbers.add(index);
  return {
    label: wpArchiveLabels.pagination,
    previous: page > 1 ? { label: wpArchiveLabels.previousPage, href: searchHref(query, page - 1) } : undefined,
    next: page < totalPages ? { label: wpArchiveLabels.nextPage, href: searchHref(query, page + 1) } : undefined,
    pages: [...numbers]
      .filter((number) => number >= 1)
      .sort((a, b) => a - b)
      .map((number) => ({ label: String(number), href: searchHref(query, number), current: number === page })),
  };
}

export function searchMetadata(query: string | undefined): Metadata {
  return buildMetadata({
    title: query ? fillTemplate(wpSearchLabels.resultsTitle, { query }) : wpSearchLabels.title,
    description: wpSearchLabels.description,
    path: wpSearchPath,
    noIndex: true,
  });
}

type SearchPageProps = { query?: string; page: number; result?: PostSearchResult };

export async function SearchPage({ query, page, result }: SearchPageProps) {
  const breadcrumb = [wpBreadcrumbHome, wpBlogHome, { label: wpSearchLabels.title, href: wpSearchPath }];
  return (
    <DocumentLayout
      breadcrumb={breadcrumb}
      title={query ? fillTemplate(wpSearchLabels.resultsTitle, { query }) : wpSearchLabels.title}
      meta={result ? fillTemplate(wpSearchLabels.summary, { total: result.total }) : wpSearchLabels.prompt}
      sideNav={await categoryNav([])}
      labels={wpDocumentLabels}
    >
      <div className="flex flex-col gap-24">
        <SearchForm {...searchForm(query)} />
        {query && result && (
          <PostList items={result.items.map(toCard)} empty={wpSearchLabels.empty} pagination={searchPagination(query, page, result.totalPages)} />
        )}
      </div>
    </DocumentLayout>
  );
}
