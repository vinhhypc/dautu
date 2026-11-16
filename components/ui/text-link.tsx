import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import type { IconName } from "@/types/content";

import { ButtonLink } from "./button";

type TextLinkProps = {
  href: string;
  trailingIcon?: IconName;
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
};

/* Variant link của ds-one dùng brand-primary (~3:1 trên nền trắng) → đổi sang màu chữ link đạt AA. */
const LINK_COLOR = "text-text-link hover:text-text-link-hover active:text-text-link";

export function TextLink({ href, trailingIcon, ariaLabel, className, children }: TextLinkProps) {
  return (
    <ButtonLink href={href} variant="link" trailingIcon={trailingIcon} ariaLabel={ariaLabel} className={cn(LINK_COLOR, className)}>
      {children}
    </ButtonLink>
  );
}
