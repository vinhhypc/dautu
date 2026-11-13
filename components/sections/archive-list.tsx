import type { ArchiveFilterContent, ArchiveListItem, PaginationContent } from "@/types/content";

import { Button } from "../ui/button";
import { DateField } from "../ui/date-field";
import { Icon } from "../ui/icon";
import { Input } from "../ui/input";
import { Pagination } from "../ui/pagination";
import { RouteLink } from "../ui/route-link";

type ArchiveListProps = {
  filter: ArchiveFilterContent;
  summary: string;
  empty: string;
  items: ArchiveListItem[];
  pagination: PaginationContent;
};

function ArchiveFilter({
  action,
  label,
  locale,
  dateLabels,
  initialMonth,
  fromLabel,
  toLabel,
  queryLabel,
  submitLabel,
  resetLabel,
  from,
  to,
  query,
}: ArchiveFilterContent) {
  return (
    <form action={action} method="get" aria-label={label} className="grid gap-16 rounded-12 border border-border-subtle p-16 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_2fr_auto] lg:items-end">
      <DateField name="from" label={fromLabel} locale={locale} labels={dateLabels} defaultValue={from} initialMonth={initialMonth} />
      <DateField name="to" label={toLabel} locale={locale} labels={dateLabels} defaultValue={to} initialMonth={initialMonth} />
      <label className="flex flex-col gap-4 text-normal-md text-text-tertiary sm:col-span-2 lg:col-span-1">
        {queryLabel}
        <Input
          type="search"
          name="q"
          defaultValue={query}
          wrapperClassName="h-40 rounded-8 border border-border-default bg-background-base px-12 py-0 focus-within:border-text-primary"
          className="text-normal-md"
        />
      </label>
      <div className="flex items-center gap-12 sm:col-span-2 lg:col-span-1">
        <Button type="submit">{submitLabel}</Button>
        {(from || to || query) && (
          <RouteLink href={action} className="link-text text-normal-md">
            {resetLabel}
          </RouteLink>
        )}
      </div>
    </form>
  );
}

export function ArchiveList({ filter, summary, empty, items, pagination }: ArchiveListProps) {
  return (
    <div className="flex flex-col gap-24">
      <ArchiveFilter {...filter} />
      <p className="text-normal-md text-text-tertiary" aria-live="polite">
        {summary}
      </p>
      {items.length === 0 ? (
        <p className="rounded-12 bg-background-surface p-24 text-normal-lg text-text-secondary">{empty}</p>
      ) : (
        <ul className="flex flex-col border-t border-border-subtle">
          {items.map((item) => (
            <li key={item.href} className="border-b border-border-subtle">
              <RouteLink
                href={item.href}
                className="group flex items-start gap-16 py-16 transition-colors duration-200 hover:bg-background-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus motion-reduce:transition-none md:px-8"
              >
                <span className="flex min-w-0 flex-1 flex-col gap-4">
                  <span className="text-normal-lg font-medium text-text-primary transition-colors group-hover:text-brand-primary">{item.title}</span>
                  <time className="text-normal-md text-text-tertiary">{item.date}</time>
                </span>
                <Icon name="arrow-right" className="mt-4 shrink-0 text-text-tertiary transition-colors group-hover:text-brand-primary" />
              </RouteLink>
            </li>
          ))}
        </ul>
      )}
      <Pagination {...pagination} />
    </div>
  );
}
