"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function useScrolledPast(elementId: string | undefined) {
  const [isPast, setIsPast] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!elementId) return;
    const update = () => {
      const element = document.getElementById(elementId);
      setIsPast(element ? element.getBoundingClientRect().bottom <= 0 : false);
    };

    const initial = window.setTimeout(update, 0);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.clearTimeout(initial);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [elementId, pathname]);

  return elementId ? isPast : false;
}
