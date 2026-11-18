"use client";

import { useLayoutEffect, useState } from "react";

const ANCHOR_LEFT_VAR = "--anchor-left";

/* Đặt khung (phần tử con đầu của wrapper) thẳng dưới phần tử điều khiển nó (aria-controls), lùi vào nếu chạm mép phải.
   Callback ref: với AnimatePresence mode="wait", wrapper mới gắn vào sau khi wrapper cũ đóng xong nên phải đo lại theo phần tử. */
export function useAnchoredPanel<T extends HTMLElement>(panelId: string | undefined) {
  const [wrapper, setWrapper] = useState<T | null>(null);

  useLayoutEffect(() => {
    const anchor = panelId ? document.querySelector<HTMLElement>(`[aria-controls="${panelId}"]`) : null;
    if (!wrapper || !anchor) return;

    const place = () => {
      const panel = wrapper.firstElementChild as HTMLElement | null;
      if (!panel) return;
      const bounds = wrapper.getBoundingClientRect();
      const maxLeft = Math.max(0, bounds.width - panel.offsetWidth);
      const left = Math.min(Math.max(0, anchor.getBoundingClientRect().left - bounds.left), maxLeft);
      wrapper.style.setProperty(ANCHOR_LEFT_VAR, `${left}px`);
    };

    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [wrapper, panelId]);

  return setWrapper;
}
