"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useHideOnScroll } from "@/hooks/use-hide-on-scroll";
import { useScrolledPast } from "@/hooks/use-scrolled-past";
import { cn } from "@/lib/cn";
import { fade } from "@/lib/motion";
import type { HeaderPathHref, HeaderScrollAction } from "@/types/content";

import { HeaderHrefOverrideContext, HeaderPageActionContext } from "./header-scroll-context";
import { NavMenuProvider, useNavMenu } from "./nav-menu-context";

type HeaderShellProps = {
  overlayPaths: string[];
  scrollActions: HeaderScrollAction[];
  primaryHref: string;
  primaryActionHrefs: HeaderPathHref[];
  children: ReactNode;
};

const base =
  "group/header z-40 flex items-center gap-24 text-text-inverse transition duration-200 motion-reduce:transition-none";
const overlay = "fixed inset-x-0 top-0 px-8 py-10 lg:px-24 lg:py-16";
const solid = "sticky top-0 bg-background-inverse px-16 py-10 lg:px-24 lg:py-16";
const light = "bg-background-base text-text-secondary";
const floating = "shadow-soft";
/* Chỉ gắn khi ẩn: translate khác none biến header thành khung chứa của menu mobile (position: fixed). */
const hidden = "-translate-y-full";

function HeaderFrame({ overlayPaths, scrollActions, primaryHref, primaryActionHrefs, children }: HeaderShellProps) {
  const pathname = usePathname();
  const { openKey } = useNavMenu();
  const { isHidden: isScrollHidden, isScrolled } = useHideOnScroll();
  const isOverlay = overlayPaths.includes(pathname);
  const isExpanded = openKey !== null;
  const isHidden = isScrollHidden && !isExpanded;
  const isLight = isExpanded || isScrolled || !isOverlay;
  const scrollAction = scrollActions.find((item) => item.path === pathname);
  const isPastHero = useScrolledPast(scrollAction?.afterId);
  const pageAction = scrollAction && isPastHero ? scrollAction.action : null;
  const pagePrimaryHref = primaryActionHrefs.find((item) => item.path === pathname)?.href;
  const hrefOverride = pagePrimaryHref ? { from: primaryHref, to: pagePrimaryHref } : null;

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <m.div
            aria-hidden="true"
            variants={fade}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-30 bg-text-primary/40"
          />
        )}
      </AnimatePresence>
      <header
        data-light={isLight}
        className={cn(
          base,
          isOverlay ? overlay : solid,
          isLight && light,
          (isScrolled || !isOverlay) && !isExpanded && !isHidden && floating,
          isHidden && hidden,
        )}
      >
        <HeaderHrefOverrideContext value={hrefOverride}>
          <HeaderPageActionContext value={pageAction}>{children}</HeaderPageActionContext>
        </HeaderHrefOverrideContext>
      </header>
    </>
  );
}

export function HeaderShell(props: HeaderShellProps) {
  return (
    <NavMenuProvider>
      <HeaderFrame {...props} />
    </NavMenuProvider>
  );
}
