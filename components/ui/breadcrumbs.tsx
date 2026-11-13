"use client";

import { Breadcrumbs as DsBreadcrumbs } from "@/vendor/ds-one/components/Breadcrumbs";
import type { BreadcrumbItem } from "@/types/content";

import { RouteLink } from "./route-link";

type BreadcrumbsProps = {
  label: string;
  items: BreadcrumbItem[];
};

/* ds-one BreadcrumbsLink render <a> cứng — dùng RouteLink làm con của Item để giữ quy tắc link của dự án. */
export function Breadcrumbs({ label, items }: BreadcrumbsProps) {
  return (
    <DsBreadcrumbs aria-label={label} className="max-w-full overflow-x-auto">
      <DsBreadcrumbs.List>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return [
            index > 0 && <DsBreadcrumbs.Separator key={`${item.href}-separator`} />,
            <DsBreadcrumbs.Item key={item.href} current={isCurrent}>
              {isCurrent ? (
                <DsBreadcrumbs.Page>{item.label}</DsBreadcrumbs.Page>
              ) : (
                <RouteLink
                  href={item.href}
                  className="rounded-4 transition-colors duration-200 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus motion-reduce:transition-none"
                >
                  {item.label}
                </RouteLink>
              )}
            </DsBreadcrumbs.Item>,
          ];
        })}
      </DsBreadcrumbs.List>
    </DsBreadcrumbs>
  );
}
