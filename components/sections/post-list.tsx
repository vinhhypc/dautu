import { cn } from "@/lib/cn";
import type { PaginationContent, PostSummary } from "@/types/content";

import { RevealChildren } from "../motion/reveal-children";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Pagination } from "../ui/pagination";
import { RouteLink } from "../ui/route-link";
import { WpImage } from "../ui/wp-image";

export type PostCardItem = Omit<PostSummary, "date"> & { date: string; dateTime: string };

type PostGridProps = {
  items: PostCardItem[];
  titleTag: "h2" | "h3";
  columns?: 2 | 3;
  showExcerpt?: boolean;
};

const gridColumns = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3" };

export function PostGrid({ items, titleTag: TitleTag, columns = 2, showExcerpt = true }: PostGridProps) {
  return (
    <RevealChildren as="ul" className={cn("grid gap-24", gridColumns[columns])}>
      {items.map((post) => (
        <li key={post.href} className="flex">
          <Card padding="compact" className="hover-rise group relative w-full">
            {post.image && (
              <div className="overflow-hidden rounded-8">
                <WpImage
                  image={post.image}
                  sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                  className="aspect-16/9 w-full object-cover transition-transform duration-500 ease-standard group-hover:scale-105 motion-reduce:transition-none"
                />
              </div>
            )}
            {post.category && (
              <div className="self-start">
                <Badge>{post.category.label}</Badge>
              </div>
            )}
            <TitleTag className="text-normal-xl font-semibold text-text-primary">
              <RouteLink
                href={post.href}
                className="rounded-4 transition-colors duration-200 group-hover:text-brand-primary after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus motion-reduce:transition-none"
              >
                {post.title}
              </RouteLink>
            </TitleTag>
            {showExcerpt && post.excerpt && <p className="line-clamp-3 text-normal-lg text-text-secondary">{post.excerpt}</p>}
            <time dateTime={post.dateTime} className="mt-auto text-normal-l text-text-tertiary">
              {post.date}
            </time>
          </Card>
        </li>
      ))}
    </RevealChildren>
  );
}

type PostListProps = {
  items: PostCardItem[];
  empty: string;
  pagination: PaginationContent;
};

export function PostList({ items, empty, pagination }: PostListProps) {
  return (
    <div className="flex flex-col gap-32">
      {items.length === 0 ? (
        <p className="rounded-12 bg-background-surface p-24 text-normal-lg text-text-secondary">{empty}</p>
      ) : (
        <PostGrid items={items} titleTag="h2" />
      )}
      <Pagination {...pagination} />
    </div>
  );
}
