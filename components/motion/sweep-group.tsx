"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { playSweep } from "@/lib/text-sweep";

const ITEM_STAGGER = 100;

type SweepGroupProps = {
  className?: string;
  children: ReactNode;
};

export function SweepGroup({ className, children }: SweepGroupProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const group = ref.current;
    if (!group) return;
    const targets = Array.from(group.querySelectorAll<HTMLElement>("[data-sweep]"));

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      group.dataset.sweepEntered = "";
      targets.forEach((el) => (el.dataset.sweepState = "done"));
      return;
    }

    let cancelled = false;
    let cancels: (() => void)[] = [];

    const observer = new IntersectionObserver(
      ([entry]) => {
        const passed = entry.boundingClientRect.top < (entry.rootBounds?.bottom ?? window.innerHeight);
        if (!entry.isIntersecting && !passed) return;
        observer.disconnect();
        // Đợi font về rồi mới đo dòng, nếu không vị trí ngắt dòng sẽ sai.
        void document.fonts.ready.then(() => {
          if (cancelled) return;
          group.dataset.sweepEntered = "";
          cancels = targets.map((el, index) => playSweep(el, ITEM_STAGGER * (index + 1)));
        });
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(group);

    return () => {
      cancelled = true;
      observer.disconnect();
      cancels.forEach((cancel) => cancel());
      delete group.dataset.sweepEntered;
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
