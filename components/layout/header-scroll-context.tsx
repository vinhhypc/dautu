"use client";

import { createContext, use } from "react";

import type { CtaLink } from "@/types/content";

export const HeaderPageActionContext = createContext<CtaLink | null>(null);

export function useHeaderPageAction() {
  return use(HeaderPageActionContext);
}

type HeaderHrefOverride = { from: string; to: string } | null;

export const HeaderHrefOverrideContext = createContext<HeaderHrefOverride>(null);

export function useHeaderHref(href: string) {
  const override = use(HeaderHrefOverrideContext);
  return override && href === override.from ? override.to : href;
}
