"use client";

import { useEffect, useRef } from "react";

const SCROLL_SETTLE_MS = 150;

export function useStepStrip<T extends HTMLElement>(active: number, select: (index: number) => void) {
  const listRef = useRef<T>(null);
  const settleRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const list = listRef.current;
    const card = list?.children[active] as HTMLElement | undefined;
    if (!list || !card || list.offsetParent === null) return;
    list.scrollTo({ left: card.offsetLeft - list.offsetLeft, behavior: "smooth" });
  }, [active]);

  useEffect(() => () => window.clearTimeout(settleRef.current), []);

  function onScroll() {
    window.clearTimeout(settleRef.current);
    settleRef.current = window.setTimeout(() => {
      const list = listRef.current;
      if (!list) return;
      const maxScroll = list.scrollWidth - list.clientWidth;
      const cards = Array.from(list.children) as HTMLElement[];
      const distance = (card: HTMLElement) => Math.abs(card.offsetLeft - list.offsetLeft - list.scrollLeft);
      const nearest =
        list.scrollLeft >= maxScroll - 1
          ? cards.length - 1
          : cards.reduce((best, card, index) => (distance(card) < distance(cards[best]) ? index : best), 0);
      if (nearest !== active) select(nearest);
    }, SCROLL_SETTLE_MS);
  }

  return { listRef, onScroll };
}
