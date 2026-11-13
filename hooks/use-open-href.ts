"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { isAppRoute, isExternalHref, opensInSameTab } from "@/lib/link";

export function useOpenHref() {
  const router = useRouter();
  return useCallback(
    (href: string) => {
      if (isAppRoute(href)) router.push(href);
      else if (!isExternalHref(href) || opensInSameTab(href)) window.location.assign(href);
      else window.open(href, "_blank", "noopener,noreferrer");
    },
    [router],
  );
}
