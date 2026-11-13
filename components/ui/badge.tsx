import { Badge as DsBadge, type BadgeColor } from "@/vendor/ds-one/components/Badge";
import type { ReactNode } from "react";

export type BadgeTone = "brand" | "success" | "warning" | "error" | "info" | "neutral";

const DS_BADGE_COLOR: Record<BadgeTone, BadgeColor> = {
  brand: "Brand",
  success: "Green",
  warning: "Orange",
  error: "Red",
  info: "Blue",
  neutral: "Neutral",
};

type BadgeProps = {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
};

export function Badge({ tone = "brand", className, children }: BadgeProps) {
  return (
    <DsBadge appearance="Soft" color={DS_BADGE_COLOR[tone]} size="Regular" content="Text" className={className}>
      {children}
    </DsBadge>
  );
}
