import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Icon } from "./icon";

type DisclosureProps = {
  id?: string;
  name?: string;
  title: ReactNode;
  className?: string;
  children: ReactNode;
};

/* <details> thay cho Accordion ds-one (Radix gỡ nội dung khi đóng) — nội dung vẫn có trong HTML cho SEO và khi tắt JS; trình duyệt tự mở khi URL trỏ #id vào bên trong. */
export function Disclosure({ id, name, title, className, children }: DisclosureProps) {
  return (
    <details id={id} name={name} className={cn("group scroll-mt-96 border-b border-border-subtle", className)}>
      <summary className="flex cursor-pointer list-none items-start gap-16 py-16 text-normal-lg font-medium text-text-primary transition-colors duration-200 hover:text-brand-primary focus-visible:rounded-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus motion-reduce:transition-none md:text-normal-xl [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">{title}</span>
        <Icon
          name="chevron-down"
          className="mt-2 shrink-0 transition-transform duration-300 ease-standard group-open:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <div className="flex flex-col gap-16 pb-24">{children}</div>
    </details>
  );
}
