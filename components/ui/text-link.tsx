import type { ReactNode } from "react";

import type { IconName } from "@/types/content";

import { ButtonLink } from "./button";

type TextLinkProps = {
  href: string;
  trailingIcon?: IconName;
  className?: string;
  children: ReactNode;
};

export function TextLink({ href, trailingIcon, className, children }: TextLinkProps) {
  return (
    <ButtonLink href={href} variant="link" trailingIcon={trailingIcon} className={className}>
      {children}
    </ButtonLink>
  );
}
