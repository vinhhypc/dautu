"use client";

import { createContext, use, type ReactNode } from "react";

import { useSingleOpen } from "@/hooks/use-single-open";

type NavMenuState = ReturnType<typeof useSingleOpen>;

const NavMenuContext = createContext<NavMenuState | null>(null);

export function NavMenuProvider({ children }: { children: ReactNode }) {
  const state = useSingleOpen();
  return <NavMenuContext value={state}>{children}</NavMenuContext>;
}

export function useNavMenu() {
  const state = use(NavMenuContext);
  if (!state) throw new Error("useNavMenu phải nằm trong NavMenuProvider");
  return state;
}
