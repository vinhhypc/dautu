"use client";

import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";

export function useSingleOpen() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpenKey(null);
  }

  const toggle = useCallback((key: string) => setOpenKey((current) => (current === key ? null : key)), []);
  const close = useCallback(() => setOpenKey(null), []);

  return { openKey, toggle, close };
}
