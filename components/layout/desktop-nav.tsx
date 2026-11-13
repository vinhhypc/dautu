"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useDismiss } from "@/hooks/use-dismiss";
import { useOpenHref } from "@/hooks/use-open-href";
import { cn } from "@/lib/cn";
import { dropdownPanel } from "@/lib/motion";
import type { NavItem } from "@/types/content";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { RouteLink } from "../ui/route-link";
import { Icon } from "../ui/icon";
import { useHeaderPageAction } from "./header-scroll-context";
import { MegaMenu } from "./mega-menu";
import { navChevronClasses, navItemClasses, navLabelClasses } from "./nav-item-styles";
import { useNavMenu } from "./nav-menu-context";

type DesktopNavProps = {
  items: NavItem[];
  label: string;
  moreLabel: string;
  overflowFrom: number;
  overflowFromCompact: number;
};

const panelId = (index: number) => `mega-menu-${index}`;

export function DesktopNav({
  items,
  label,
  moreLabel,
  overflowFrom: defaultOverflowFrom,
  overflowFromCompact,
}: DesktopNavProps) {
  const pathname = usePathname();
  const overflowFrom = useHeaderPageAction() ? overflowFromCompact : defaultOverflowFrom;
  const openHref = useOpenHref();
  const { openKey, toggle, close } = useNavMenu();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const navRef = useDismiss<HTMLElement>(openKey !== null, close);
  const openIndex = items.findIndex((item) => item.label === openKey);
  const openMenu = items[openIndex]?.menu;
  const overflowItems = items.slice(overflowFrom);
  const isOverflowSelected = (item: NavItem) => openKey === item.label || item.href === pathname;
  const isMoreActive = isMoreOpen || overflowItems.some(isOverflowSelected);

  return (
    <nav ref={navRef} aria-label={label} className="hidden xl:block">
      <ul className="intro-fade flex items-center gap-4">
        {items.map((item, index) => {
          const itemClass = cn(index >= overflowFrom && "hidden 2xl:block");
          if (item.href) {
            const isCurrent = item.href === pathname;
            return (
              <li key={item.label} className={itemClass}>
                <RouteLink
                  href={item.href}
                  aria-current={isCurrent ? "page" : undefined}
                  className={navItemClasses("horizontal", isCurrent)}
                >
                  <span className={navLabelClasses(isCurrent)}>{item.label}</span>
                </RouteLink>
              </li>
            );
          }
          const isOpen = openKey === item.label && Boolean(item.menu);
          return (
            <li key={item.label} className={itemClass}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={item.menu ? panelId(index) : undefined}
                onClick={item.menu ? () => toggle(item.label) : undefined}
                className={navItemClasses("horizontal", isOpen)}
              >
                <span className={navLabelClasses(isOpen)}>{item.label}</span>
                <Icon name="chevron-down" className={navChevronClasses(isOpen)} />
              </button>
            </li>
          );
        })}
        {overflowItems.length > 0 && (
          <li className="2xl:hidden">
            <DropdownMenu open={isMoreOpen} onOpenChange={setIsMoreOpen}>
              <DropdownMenuTrigger aria-label={moreLabel} className={navItemClasses("horizontal", isMoreActive)}>
                <Icon name="more" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-auto min-w-200 text-normal-lg font-medium">
                {overflowItems.map((item) => (
                  <DropdownMenuItem
                    key={item.label}
                    selected={isOverflowSelected(item)}
                    onSelect={() => {
                      if (item.href) openHref(item.href);
                      else if (item.menu) toggle(item.label);
                    }}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        )}
      </ul>
      <AnimatePresence mode="wait">
        {openKey && openMenu && (
          <m.div
            key={openKey}
            variants={dropdownPanel}
            initial="closed"
            animate="open"
            exit="closed"
            className="absolute inset-x-0 top-full mx-auto max-w-1440"
          >
            <MegaMenu id={panelId(openIndex)} {...openMenu} />
          </m.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
