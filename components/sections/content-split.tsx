import Image from "next/image";

import { cn } from "@/lib/cn";
import { IMAGE_QUALITY } from "@/lib/image";
import type { ContentSplitContent } from "@/types/content";

import { Reveal } from "../motion/reveal";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";

export function ContentSplit({ id, eyebrow, title, paragraphs, image, imagePosition = "end" }: ContentSplitContent) {
  const headingId = `${id}-title`;

  return (
    <Section id={id} labelledBy={headingId} className="md:grid md:grid-cols-2 md:items-center">
      <Reveal className="flex flex-col gap-16">
        <SectionHeading id={headingId} eyebrow={eyebrow} title={title} />
        {paragraphs.map((paragraph) => (
          <p key={paragraph} className="max-w-prose text-normal-lg text-text-secondary">
            {paragraph}
          </p>
        ))}
      </Reveal>
      <Reveal
        className={cn(
          "relative aspect-4/3 overflow-hidden rounded-16 shadow-md",
          imagePosition === "start" && "md:order-first",
        )}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          quality={IMAGE_QUALITY.standard}
          placeholder="blur"
          sizes="(min-width: 1152px) 512px, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </Reveal>
    </Section>
  );
}
