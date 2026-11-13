import { inView } from "motion";
import { animate } from "motion/mini";
import { type RefObject, useEffect } from "react";

import { MOTION_EASING, REVEAL_DURATION, REVEAL_OFFSET, STAGGER_DELAY } from "@/lib/motion";

const BATCH_WINDOW_MS = 120;
const VIEWPORT_MARGIN = "0px 0px -10% 0px";
const HIDDEN_TRANSFORM = `translateY(${REVEAL_OFFSET}px)`;

export function useRevealChildren(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const stops: (() => void)[] = [];
    const hidden: HTMLElement[] = [];
    let batchStart = 0;
    let batchIndex = 0;

    for (const child of Array.from(root.children)) {
      if (!(child instanceof HTMLElement)) continue;
      if (child.getBoundingClientRect().top < window.innerHeight) continue;

      child.style.opacity = "0";
      child.style.transform = HIDDEN_TRANSFORM;
      hidden.push(child);

      const stop = inView(
        child,
        () => {
          stop();
          const now = performance.now();
          batchIndex = now - batchStart < BATCH_WINDOW_MS ? batchIndex + 1 : 0;
          batchStart = now;
          const animation = animate(
            child,
            { opacity: [0, 1], transform: [HIDDEN_TRANSFORM, "translateY(0px)"] },
            { duration: REVEAL_DURATION, ease: MOTION_EASING, delay: batchIndex * STAGGER_DELAY },
          );
          void animation.finished.then(() => {
            child.style.opacity = "";
            child.style.transform = "";
          });
        },
        { margin: VIEWPORT_MARGIN },
      );
      stops.push(stop);
    }

    return () => {
      stops.forEach((stop) => stop());
      hidden.forEach((child) => {
        child.style.opacity = "";
        child.style.transform = "";
      });
    };
  }, [ref]);
}
