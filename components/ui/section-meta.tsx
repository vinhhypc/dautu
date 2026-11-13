import Image from "next/image";

import { cn } from "@/lib/cn";
import type { SectionMeta as SectionMetaContent } from "@/types/content";

type SectionMetaProps = SectionMetaContent & {
  className?: string;
};

export function SectionMeta({ label, aside, className }: SectionMetaProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-16 border-y border-border-subtle px-16 py-16 text-normal-l font-medium lg:px-24 lg:text-normal-xl",
        className,
      )}
    >
      <p className="flex items-center gap-8 text-text-primary">
        <Image src="/illustrations/stage-corner.svg" alt="" width={12} height={12} unoptimized className="size-12" />
        {label}
      </p>
      {aside && <p className="hidden text-text-secondary lg:block">{aside}</p>}
    </div>
  );
}
