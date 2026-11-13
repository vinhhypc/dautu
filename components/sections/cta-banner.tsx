import type { CtaBannerContent } from "@/types/content";

import { Reveal } from "../motion/reveal";
import { ButtonLink } from "../ui/button";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";

export function CtaBanner({ id, title, description, cta }: CtaBannerContent) {
  const headingId = `${id}-title`;

  return (
    <Section id={id} labelledBy={headingId} tone="primary" className="items-center text-center">
      <Reveal className="flex flex-col items-center gap-32">
        <SectionHeading id={headingId} title={title} description={description} align="center" inverted />
        <ButtonLink href={cta.href} variant={cta.variant} size="lg">
          {cta.label}
        </ButtonLink>
      </Reveal>
    </Section>
  );
}
