"use client";

import * as m from "motion/react-m";

import { cn } from "@/lib/cn";
import { menuItem } from "@/lib/motion";
import type { NavMenu, NavMenuGroup, NavMenuLink } from "@/types/content";

import { MenuStage } from "../illustrations/menu-stage";
import { RouteLink } from "../ui/route-link";
import { ButtonLink } from "../ui/button";
import { Icon } from "../ui/icon";
import { useHeaderHref } from "./header-scroll-context";

function MenuRowText({ label, description }: NavMenuLink) {
  return (
    <span className="flex min-w-0 flex-1 flex-col gap-2 text-normal-lg">
      <span className="font-medium text-text-primary transition-colors duration-200 group-hover:text-brand-primary group-focus-visible:text-brand-primary motion-reduce:transition-none">
        {label}
      </span>
      {description && <span className="text-text-secondary">{description}</span>}
    </span>
  );
}

function MenuRow({ link, nested = false }: { link: NavMenuLink; nested?: boolean }) {
  const rowClass = cn("flex items-center gap-16 py-12 pr-24", nested ? "pl-48" : "pl-24");
  if (!link.href) {
    return (
      <div className={rowClass}>
        <MenuRowText {...link} />
        <span aria-hidden="true" className="size-20 shrink-0" />
      </div>
    );
  }
  return (
    <RouteLink
      href={link.href}
      className={cn(
        rowClass,
        "group transition-colors duration-200 hover:bg-background-hover focus-visible:bg-background-hover active:bg-border-default motion-reduce:transition-none",
      )}
    >
      <MenuRowText {...link} />
      <Icon
        name="arrow-right-up"
        className="-translate-x-4 translate-y-4 text-brand-primary opacity-0 transition duration-200 group-hover:translate-0 group-hover:opacity-100 group-focus-visible:translate-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
      />
    </RouteLink>
  );
}

const groupTitleClass = "px-24 text-normal-l font-medium text-text-tertiary";

function GroupTitle({ title, href }: Pick<NavMenuGroup, "title" | "href">) {
  if (!title) return null;
  return (
    <m.p variants={menuItem} className={groupTitleClass}>
      {href ? (
        <RouteLink
          href={href}
          className="rounded-4 transition-colors duration-200 hover:text-brand-primary focus-visible:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus motion-reduce:transition-none"
        >
          {title}
        </RouteLink>
      ) : (
        title
      )}
    </m.p>
  );
}

type MegaMenuProps = NavMenu & {
  id: string;
  className?: string;
};

/* Khung rộng vừa số cột của menu (không giãn hết header) để không thừa khoảng trắng. */
export function MegaMenu({ id, groups, feature, className }: MegaMenuProps) {
  const ctaHref = useHeaderHref(feature?.cta.href ?? "");
  return (
    <div id={id} className={cn("flex max-w-full overflow-hidden rounded-b-8 bg-background-base text-text-primary shadow-soft", className)}>
      {groups.map((group, index) => (
        <div
          key={group.title ?? group.links[0]?.label}
          className={cn("flex w-320 min-w-0 shrink flex-col py-32", index > 0 && "border-l border-border-default")}
        >
          <GroupTitle title={group.title} href={group.href} />
          <ul className={cn("flex flex-col", group.title && "mt-20")}>
            {group.links.map((link) => (
              <m.li key={`${link.label}-${link.href}`} variants={menuItem}>
                <MenuRow link={link} />
                {link.children && (
                  <ul className="flex flex-col">
                    {link.children.map((child) => (
                      <li key={`${child.label}-${child.href}`}>
                        <MenuRow link={child} nested />
                      </li>
                    ))}
                  </ul>
                )}
              </m.li>
            ))}
          </ul>
        </div>
      ))}
      {feature && (
        <m.div variants={menuItem} className="flex w-400 shrink-0 flex-col gap-16 bg-background-surface p-24">
          <MenuStage illustration={feature.illustration} />
          <p className="text-large-sm font-semibold">{feature.title}</p>
          <p className="text-normal-lg text-text-secondary">{feature.description}</p>
          <div aria-hidden="true" className="min-h-24 flex-1" />
          <ButtonLink href={ctaHref} variant="primary" trailingIcon="arrow-right" className="w-full">
            {feature.cta.label}
          </ButtonLink>
        </m.div>
      )}
    </div>
  );
}
