"use client";

import { Tabs as DsTabs } from "@/vendor/ds-one/components/Tabs";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

type TabsProps = {
  items: TabItem[];
  className?: string;
};

/* forceMount + ẩn bằng CSS: nội dung mọi tab vẫn có trong HTML cho SEO và khi tắt JS (Radix mặc định gỡ tab không chọn). */
export function Tabs({ items, className }: TabsProps) {
  return (
    <DsTabs defaultValue={items[0]?.id} appearance="Line bottom" className={cn("flex flex-col gap-24", className)}>
      <DsTabs.List className="max-w-full overflow-x-auto border-b border-border-subtle">
        {items.map((item) => (
          <DsTabs.Trigger key={item.id} value={item.id}>
            {item.label}
          </DsTabs.Trigger>
        ))}
      </DsTabs.List>
      {items.map((item) => (
        <DsTabs.Content
          key={item.id}
          value={item.id}
          forceMount
          className="focus-visible:rounded-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-border-focus data-[state=inactive]:hidden"
        >
          {item.content}
        </DsTabs.Content>
      ))}
    </DsTabs>
  );
}
