// eslint-disable-next-line no-restricted-imports -- RouteLink là nơi duy nhất được bọc next/link.
import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import { isAppRoute, linkTargetProps } from "@/lib/link";

type RouteLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "target" | "rel"> & {
  href: string;
  children: ReactNode;
};

/* Path nội bộ → next/link; link ngoài, #, mailto:, tel: → <a>. */
export function RouteLink({ href, children, ...props }: RouteLinkProps) {
  const targetProps = linkTargetProps(href);
  if (isAppRoute(href)) {
    return (
      <Link href={href} {...targetProps} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} {...targetProps} {...props}>
      {children}
    </a>
  );
}
