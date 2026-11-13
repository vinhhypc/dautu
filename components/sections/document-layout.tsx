import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import type { BreadcrumbItem, DocumentPageLabels, SideNavSection } from "@/types/content";

import { Breadcrumbs } from "../ui/breadcrumbs";
import { Container } from "../ui/container";
import { Icon } from "../ui/icon";
import { RouteLink } from "../ui/route-link";

const navLinkClasses =
  "block rounded-8 px-12 py-8 transition-colors duration-200 hover:bg-background-hover hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus motion-reduce:transition-none";

function navLinkState(current: boolean) {
  return current ? "bg-background-surface font-medium text-brand-primary" : "text-text-secondary";
}

function SideNavLinks({ section }: { section: SideNavSection }) {
  return (
    <div className="flex flex-col gap-20">
      {section.groups.map((group, index) => (
        <div key={group.title ?? index} className="flex flex-col gap-4">
          {group.title &&
            (group.href ? (
              <RouteLink href={group.href} className="px-12 text-normal-md font-medium text-text-tertiary hover:text-text-primary">
                {group.title}
              </RouteLink>
            ) : (
              <p className="px-12 text-normal-md font-medium text-text-tertiary">{group.title}</p>
            ))}
          <ul className="flex flex-col gap-2 text-normal-lg">
            {group.links.map((link) => (
              <li key={`${link.label}-${link.href}`}>
                <RouteLink href={link.href} aria-current={link.current ? "page" : undefined} className={cn(navLinkClasses, navLinkState(link.current))}>
                  {link.label}
                </RouteLink>
                {link.children && link.children.length > 0 && (
                  <ul className="mt-2 flex flex-col gap-2 pl-16 text-normal-md">
                    {link.children.map((child) => (
                      <li key={`${child.label}-${child.href}`}>
                        <RouteLink
                          href={child.href}
                          aria-current={child.current ? "page" : undefined}
                          className={cn(navLinkClasses, navLinkState(child.current))}
                        >
                          {child.label}
                        </RouteLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function SideNav({ section, label }: { section: SideNavSection; label: string }) {
  return (
    <nav aria-label={label} className="lg:sticky lg:top-96 lg:w-280 lg:shrink-0 lg:self-start">
      <details className="group rounded-12 border border-border-subtle lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-12 px-16 py-12 text-normal-lg font-medium text-text-primary [&::-webkit-details-marker]:hidden">
          {section.title}
          <Icon name="chevron-down" className="transition-transform duration-300 ease-standard group-open:rotate-180 motion-reduce:transition-none" />
        </summary>
        <div className="border-t border-border-subtle p-8">
          <SideNavLinks section={section} />
        </div>
      </details>
      <div className="hidden flex-col gap-16 lg:flex">
        <p className="px-12 text-normal-xl font-semibold text-text-primary">{section.title}</p>
        <SideNavLinks section={section} />
      </div>
    </nav>
  );
}

type DocumentLayoutProps = {
  breadcrumb: BreadcrumbItem[];
  title: string;
  meta?: string;
  sideNav?: SideNavSection;
  labels: DocumentPageLabels;
  children: ReactNode;
};

export function DocumentLayout({ breadcrumb, title, meta, sideNav, labels, children }: DocumentLayoutProps) {
  return (
    <article className="pt-24 pb-64 md:pt-32 md:pb-96">
      <Container className="flex flex-col gap-24 md:gap-32">
        <Breadcrumbs label={labels.breadcrumb} items={breadcrumb} />
        <header className="flex max-w-3xl flex-col gap-8">
          <h1 className="text-large-md font-semibold text-text-primary md:text-large-lg">{title}</h1>
          {meta && <p className="text-normal-md text-text-tertiary">{meta}</p>}
        </header>
        <div className="flex flex-col gap-32 lg:flex-row lg:gap-64">
          {sideNav && <SideNav section={sideNav} label={labels.sideNav} />}
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </Container>
    </article>
  );
}
