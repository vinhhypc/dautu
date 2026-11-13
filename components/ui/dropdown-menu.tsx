"use client";

import {
  DropdownMenuContent as DsDropdownMenuContent,
  DropdownMenuItem as DsDropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger as DsDropdownMenuTrigger,
} from "@/vendor/ds-one/components/DropdownMenu";
import type { ComponentProps } from "react";

export const DropdownMenu = DropdownMenuRoot;
export const DropdownMenuTrigger = DsDropdownMenuTrigger;

export function DropdownMenuContent({ align = "end", ...props }: ComponentProps<typeof DsDropdownMenuContent>) {
  return <DsDropdownMenuContent align={align} {...props} />;
}

export function DropdownMenuItem(props: ComponentProps<typeof DsDropdownMenuItem>) {
  return <DsDropdownMenuItem {...props} />;
}
