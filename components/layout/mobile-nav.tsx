"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import Image from "next/image";

import { useDialog } from "@/hooks/use-dialog";
import { useDisclosure } from "@/hooks/use-disclosure";
import { fade } from "@/lib/motion";
import type { LinkItem, NavItem } from "@/types/content";

import { ButtonLink } from "../ui/button";
import { RouteLink } from "../ui/route-link";
import { Icon } from "../ui/icon";
import { useHeaderHref } from "./header-scroll-context";
import { MobileNavList } from "./mobile-nav-list";

type MobileNavProps = {
  items: NavItem[];
  logoSrc: string;
  logoAlt: string;
  homeLabel: string;
  homeHref: string;
  secondaryAction: LinkItem;
  primaryAction: LinkItem;
  navLabel: string;
  openLabel: string;
  closeLabel: string;
};

const MENU_ID = "mobile-menu";
const iconButton =
  "-my-6 -mr-6 inline-flex size-32 items-center justify-center rounded-4 transition-opacity hover:opacity-80 active:scale-95 motion-reduce:active:scale-100";

export function MobileNav({
  items,
  logoSrc,
  logoAlt,
  homeLabel,
  homeHref,
  secondaryAction,
  primaryAction,
  navLabel,
  openLabel,
  closeLabel,
}: MobileNavProps) {
  const primaryHref = useHeaderHref(primaryAction.href);
  const { isOpen, toggle, close } = useDisclosure();
  const { containerRef, initialFocusRef } = useDialog<HTMLDivElement, HTMLButtonElement>(isOpen);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={MENU_ID}
        aria-label={openLabel}
        className={iconButton}
      >
        <Icon name="menu" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <m.div
            ref={containerRef}
            id={MENU_ID}
            role="dialog"
            aria-modal="true"
            aria-label={navLabel}
            variants={fade}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-50 flex flex-col bg-background-base text-text-primary"
          >
            <div className="flex items-center justify-between gap-8 px-8 py-10">
              <RouteLink href={homeHref} aria-label={homeLabel} className="flex h-24 w-87 items-center justify-center rounded-4">
                <Image src={logoSrc} alt={logoAlt} width={75} height={19} unoptimized className="h-auto w-75" />
              </RouteLink>
              <button
                ref={initialFocusRef}
                type="button"
                onClick={close}
                aria-label={closeLabel}
                className={iconButton}
              >
                <Icon name="close" />
              </button>
            </div>

            <nav aria-label={navLabel} className="flex-1 overflow-y-auto px-16 pb-40">
              <MobileNavList items={items} />
            </nav>

            <div className="relative flex gap-12 bg-background-base px-16 pt-12 pb-24">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 -top-40 h-40 bg-linear-to-b from-transparent to-background-base"
              />
              <ButtonLink href={secondaryAction.href} variant="neutral" className="flex-1">
                {secondaryAction.label}
              </ButtonLink>
              <ButtonLink href={primaryHref} variant="primary" trailingIcon="arrow-right" className="flex-1">
                {primaryAction.label}
              </ButtonLink>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
