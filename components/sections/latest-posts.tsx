import type { SearchFormContent } from "@/types/content";

import { Container } from "../ui/container";
import { SectionHeading } from "../ui/section-heading";
import { type PostCardItem, PostGrid } from "./post-list";
import { SearchForm } from "./search-form";

type LatestPostsProps = {
  title: string;
  items: PostCardItem[];
  search: SearchFormContent;
};

export function LatestPosts({ title, items, search }: LatestPostsProps) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="latest-posts" className="bg-background-canvas py-48 md:py-64">
      <Container className="flex flex-col gap-24 md:gap-32">
        <div className="flex flex-col gap-16 md:flex-row md:items-end md:justify-between">
          <SectionHeading id="latest-posts" title={title} />
          <div className="w-full md:max-w-400">
            <SearchForm {...search} />
          </div>
        </div>
        <PostGrid items={items} titleTag="h3" columns={3} />
      </Container>
    </section>
  );
}
