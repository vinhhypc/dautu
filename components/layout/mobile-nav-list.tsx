"use client";

import * as m from "motion/react-m";
import { usePathname } from "next/navigation";

import { useSingleOpen } from "@/hooks/use-single-open";
import { dropdownPanel, menuItem, menuList } from "@/lib/motion";
import type { NavItem, NavMenu, NavMenuGroup, NavMenuLink } from "@/types/content";

import { MenuStage } from "../illustrations/menu-stage";
import { RouteLink } from "../ui/route-link";
import { Icon } from "../ui/icon";
import { TextLink } from "../ui/text-link";
import { useHeaderHref } from "./header-scroll-context";
import { navChevronClasses, navItemClasses } from "./nav-item-styles";

const panelId = (index: number) => `mobile-menu-panel-${index}`;

function PanelRowText({ label, description }: NavMenuLink) {
  return (
    <>
      <span className="text-normal-lg font-medium text-text-primary transition-colors duration-200 group-hover:text-brand-primary group-focus-visible:text-brand-primary motion-reduce:transition-none">
        {label}
      </span>
      {description && <span className="text-normal-l text-text-secondary">{description}</span>}
    </>
  );
}

function PanelRow(link: NavMenuLink) {
  const className = "flex flex-col gap-2";
  return link.href ? (
    <RouteLink href={link.href} className={`${className} group rounded-4`}>
      <PanelRowText {...link} />
    </RouteLink>
  ) : (
    <div className={className}>
      <PanelRowText {...link} />
    </div>
  );
}

function PanelGroupTitle({ title, href }: Pick<NavMenuGroup, "title" | "href">) {
  if (!title) return null;
  const className = "text-normal-l font-medium text-text-tertiary";
  return href ? (
    <RouteLink href={href} className={`${className} rounded-4 transition-colors duration-200 hover:text-brand-primary focus-visible:text-brand-primary motion-reduce:transition-none`}>
      {title}
    </RouteLink>
  ) : (
    <p className={className}>{title}</p>
  );
}

function MobileMenuPanel({ id, groups, feature }: NavMenu & { id: string }) {
  const ctaHref = useHeaderHref(feature?.cta.href ?? "");
  return (
    <m.div
      id={id}
      variants={dropdownPanel}
      initial="closed"
      animate="open"
      className="flex flex-col gap-24 border-b border-border-default pb-24"
    >
      {groups.map((group) => (
        <m.div key={group.title ?? group.links[0]?.label} variants={menuItem} className="flex flex-col gap-12">
          <PanelGroupTitle title={group.title} href={group.href} />
          <ul className="flex flex-col gap-12">
            {group.links.map((link) => (
              <li key={`${link.label}-${link.href}`} className="flex flex-col gap-12">
                <PanelRow {...link} />
                {link.children && (
                  <ul className="flex flex-col gap-12 pl-16">
                    {link.children.map((child) => (
                      <li key={`${child.label}-${child.href}`}>
                        <PanelRow {...child} />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </m.div>
      ))}
      {feature && (
        <m.div variants={menuItem} className="flex flex-col gap-8 rounded-8 bg-background-surface p-16">
          <MenuStage illustration={feature.illustration} size="compact" className="mb-8" />
          <p className="text-normal-lg font-semibold text-text-primary">{feature.title}</p>
          <p className="text-normal-l text-text-secondary">{feature.description}</p>
          <TextLink href={ctaHref} trailingIcon="arrow-right">
            {feature.cta.label}
          </TextLink>
        </m.div>
      )}
    </m.div>
  );
}

type MobileNavListProps = {
  items: NavItem[];
};

export function MobileNavList({ items }: MobileNavListProps) {
  const pathname = usePathname();
  const { openKey, toggle } = useSingleOpen();

  return (
    <m.ul variants={menuList} className="flex flex-col">
      {items.map((item, index) => {
        if (item.href) {
          const isCurrent = item.href === pathname;
          return (
            <m.li key={item.label} variants={menuItem}>
              <RouteLink
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
                className={navItemClasses("vertical", isCurrent)}
              >
                {item.label}
              </RouteLink>
            </m.li>
          );
        }
        const isOpen = openKey === item.label && Boolean(item.menu);
        return (
          <m.li key={item.label} variants={menuItem}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={item.menu ? panelId(index) : undefined}
              onClick={item.menu ? () => toggle(item.label) : undefined}
              className={navItemClasses("vertical", isOpen)}
            >
              {item.label}
              <Icon name="chevron-down" className={navChevronClasses(isOpen)} />
            </button>
            {isOpen && item.menu && <MobileMenuPanel id={panelId(index)} {...item.menu} />}
          </m.li>
        );
      })}
    </m.ul>
  );
}
