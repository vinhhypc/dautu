import { cn } from "@/lib/cn";
import type { PaginationContent } from "@/types/content";

import { ButtonLink } from "./button";
import { RouteLink } from "./route-link";

/* ds-one Pagination là bản mô phỏng Figma (rộng cố định 1076px, nút + onPageChange) — trang danh sách cần link thật để SEO và chạy không JS. */
export function Pagination({ label, previous, next, pages }: PaginationContent) {
  if (pages.length <= 1) return null;
  return (
    <nav aria-label={label} className="flex flex-wrap items-center justify-between gap-12">
      <div className="min-w-96">
        {previous && (
          <ButtonLink href={previous.href} variant="neutral" size="sm">
            {previous.label}
          </ButtonLink>
        )}
      </div>
      <ul className="flex flex-wrap items-center gap-4">
        {pages.map((page) => (
          <li key={page.href}>
            <RouteLink
              href={page.href}
              aria-current={page.current ? "page" : undefined}
              className={cn(
                "flex size-40 items-center justify-center rounded-8 text-normal-md font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus motion-reduce:transition-none",
                page.current ? "bg-brand-primary text-text-inverse" : "text-text-secondary hover:bg-background-hover hover:text-text-primary",
              )}
            >
              {page.label}
            </RouteLink>
          </li>
        ))}
      </ul>
      <div className="flex min-w-96 justify-end">
        {next && (
          <ButtonLink href={next.href} variant="neutral" size="sm" trailingIcon="arrow-right">
            {next.label}
          </ButtonLink>
        )}
      </div>
    </nav>
  );
}
