import type { ElementType, ReactNode, Ref } from "react";

import { cn } from "@/lib/cn";

type ContainerProps = {
  as?: ElementType;
  ref?: Ref<HTMLElement>;
  className?: string;
  children: ReactNode;
};

export function Container({ as: Tag = "div", ref, className, children }: ContainerProps) {
  return (
    <Tag ref={ref} className={cn("mx-auto w-full max-w-6xl px-16 md:px-32", className)}>
      {children}
    </Tag>
  );
}
