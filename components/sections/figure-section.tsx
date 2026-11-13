import Image from "next/image";

import { IMAGE_QUALITY } from "@/lib/image";
import type { FigureSectionContent } from "@/types/content";

import { Reveal, RevealGroup, RevealItem } from "../motion/reveal";
import { ButtonLink } from "../ui/button";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";

export function FigureSection({ id, title, description, figures, cta }: FigureSectionContent) {
  const headingId = `${id}-title`;

  return (
    <Section id={id} labelledBy={headingId}>
      <Reveal className="flex flex-col items-start gap-24">
        <SectionHeading id={headingId} title={title} description={description} />
        {cta && (
          <ButtonLink href={cta.href} variant={cta.variant} trailingIcon={cta.trailingIcon}>
            {cta.label}
          </ButtonLink>
        )}
      </Reveal>
      <RevealGroup className="flex flex-col gap-32">
        {figures.map((figure) => (
          <RevealItem key={figure.caption}>
            <figure className="flex flex-col gap-12 rounded-16 border border-border-subtle bg-background-base p-16 md:p-24">
              <Image
                src={figure.image.src}
                alt={figure.image.alt}
                quality={IMAGE_QUALITY.standard}
                placeholder="blur"
                sizes="(min-width: 1152px) 1088px, 100vw"
                className="h-auto w-full"
              />
              <figcaption className="text-normal-md font-medium text-text-secondary">{figure.caption}</figcaption>
            </figure>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
