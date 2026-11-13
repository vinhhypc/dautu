"use client";

import { useEffect, useState } from "react";

const SCROLL_OFFSET = 80;
const SCROLL_DELTA = 8;

type HideOnScrollState = {
  isHidden: boolean;
  isScrolled: boolean;
};

export function useHideOnScroll(): HideOnScrollState {
  const [state, setState] = useState<HideOnScrollState>({ isHidden: false, isScrolled: false });

  useEffect(() => {
    let lastY = Math.max(window.scrollY, 0);

    const apply = (isHidden: boolean, isScrolled: boolean) =>
      setState((prev) =>
        prev.isHidden === isHidden && prev.isScrolled === isScrolled ? prev : { isHidden, isScrolled },
      );

    const update = () => {
      const y = Math.max(window.scrollY, 0);
      const isScrolled = y > SCROLL_OFFSET;
      const diff = y - lastY;
      if (isScrolled && Math.abs(diff) < SCROLL_DELTA) return;
      lastY = y;
      apply(isScrolled && diff > 0, isScrolled);
    };

    /* Reload giữa trang (trình duyệt khôi phục scroll) phải ra header đúng ngay, không đợi người dùng cuộn. */
    const sync = () => {
      lastY = Math.max(window.scrollY, 0);
      apply(false, lastY > SCROLL_OFFSET);
    };

    sync();
    const initial = window.setTimeout(sync, 0);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.clearTimeout(initial);
      window.removeEventListener("scroll", update);
    };
  }, []);

  return state;
}
