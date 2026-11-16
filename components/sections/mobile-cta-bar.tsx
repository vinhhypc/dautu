import type { LinkItem } from "@/types/content";

import { ButtonLink } from "../ui/button";

type MobileCtaBarProps = { label: string; actions: LinkItem[] };

/* Landing dài 5.000–17.000px trên mobile, nút hành động đầu tiên thường nằm sâu dưới hero → giữ lối liên hệ ở đáy màn hình. */
export function MobileCtaBar({ label, actions }: MobileCtaBarProps) {
  return (
    <>
      <div aria-hidden="true" className="h-72 md:hidden" />
      <nav
        aria-label={label}
        className="fixed inset-x-0 bottom-0 z-40 flex gap-8 border-t border-border-subtle bg-background-base px-16 py-12 shadow-lg md:hidden"
      >
        {actions.map((action, index) => (
          <ButtonLink key={action.href} href={action.href} variant={index === actions.length - 1 ? "primary" : "secondary"} className="flex-1">
            {action.label}
          </ButtonLink>
        ))}
      </nav>
    </>
  );
}
