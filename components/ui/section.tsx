import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Container } from "./container";

export type SectionTone = "default" | "muted" | "primary";

const tones: Record<SectionTone, string> = {
  default: "bg-background-base text-text-primary",
  muted: "bg-background-canvas text-text-primary",
  primary: "bg-background-inverse text-text-inverse",
};

type SectionProps = {
  id: string;
  labelledBy: string;
  tone?: SectionTone;
  className?: string;
  children: ReactNode;
};

export function Section({ id, labelledBy, tone = "default", className, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("py-48 md:py-64", tones[tone])}>
      <Container className={cn("flex flex-col gap-32 md:gap-48", className)}>{children}</Container>
    </section>
  );
}
