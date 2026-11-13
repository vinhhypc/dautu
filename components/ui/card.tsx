import { Card as DsCard } from "@/vendor/ds-one/components/Card";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type CardPadding = "compact" | "default" | "spacious";

const paddings: Record<CardPadding, string> = {
  compact: "p-16",
  default: "p-24",
  spacious: "p-32",
};

type CardProps = {
  padding?: CardPadding;
  className?: string;
  children: ReactNode;
};

export function Card({ padding = "default", className, children }: CardProps) {
  return (
    <DsCard type="default" className={cn("flex flex-col gap-12", paddings[padding], className)}>
      {children}
    </DsCard>
  );
}
