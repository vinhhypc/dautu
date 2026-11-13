import Image from "next/image";

import type { HeaderContent } from "@/types/content";

import { ButtonLink } from "../ui/button";
import { RouteLink } from "../ui/route-link";
import { DesktopNav } from "./desktop-nav";
import { HeaderPageAction } from "./header-page-action";
import { HeaderShell } from "./header-shell";
import { MobileNav } from "./mobile-nav";

export function Header({
  logoSrc,
  logoOnLightSrc,
  logoAlt,
  homeLabel,
  navLabel,
  menuOpenLabel,
  menuCloseLabel,
  nav,
  navMoreLabel,
  navOverflowFrom,
  navOverflowFromCompact,
  scrollActions,
  secondaryAction,
  primaryAction,
  primaryActionHrefs,
  overlayPaths,
  homeHref,
}: HeaderContent) {
  return (
    <HeaderShell
      overlayPaths={overlayPaths}
      scrollActions={scrollActions}
      primaryHref={primaryAction.href}
      primaryActionHrefs={primaryActionHrefs}
    >
      <RouteLink
        href={homeHref}
        aria-label={homeLabel}
        className="flex h-24 w-87 shrink-0 items-center justify-center rounded-4 transition-opacity hover:opacity-80 active:opacity-70 lg:h-48 lg:w-174"
      >
        <Image
          src={logoSrc}
          alt={logoAlt}
          width={150}
          height={38}
          preload
          unoptimized
          className="h-auto w-75 group-data-[light=true]/header:hidden lg:w-150"
        />
        <Image
          src={logoOnLightSrc}
          alt={logoAlt}
          width={150}
          height={38}
          unoptimized
          className="hidden h-auto w-75 group-data-[light=true]/header:block lg:w-150"
        />
      </RouteLink>
      <DesktopNav
        items={nav}
        label={navLabel}
        moreLabel={navMoreLabel}
        overflowFrom={navOverflowFrom}
        overflowFromCompact={navOverflowFromCompact}
      />
      <div className="intro-fade ml-auto flex items-center gap-8">
        <div className="hidden items-center gap-8 xl:flex">
          <div className="hidden 2xl:block">
            <ButtonLink href={secondaryAction.href} variant="neutral">
              {secondaryAction.label}
            </ButtonLink>
          </div>
          <HeaderPageAction primaryAction={primaryAction} />
        </div>
        <MobileNav
          items={nav}
          logoSrc={logoOnLightSrc}
          logoAlt={logoAlt}
          homeLabel={homeLabel}
          homeHref={homeHref}
          secondaryAction={secondaryAction}
          primaryAction={primaryAction}
          navLabel={navLabel}
          openLabel={menuOpenLabel}
          closeLabel={menuCloseLabel}
        />
      </div>
    </HeaderShell>
  );
}
