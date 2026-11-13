"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export function useDialog<TContainer extends HTMLElement, TInitial extends HTMLElement>(isOpen: boolean) {
  const containerRef = useRef<TContainer>(null);
  const initialFocusRef = useRef<TInitial>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    initialFocusRef.current?.focus();

    const trapTab = (event: KeyboardEvent) => {
      const container = containerRef.current;
      if (event.key !== "Tab" || !container) return;
      const focusable = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trapTab);

    return () => {
      document.removeEventListener("keydown", trapTab);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  return { containerRef, initialFocusRef };
}
