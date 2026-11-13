import type { TimelineContent } from "@/types/content";

import { Reveal, RevealGroup, RevealItem } from "../motion/reveal";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";

export function Timeline({ id, title, description, items }: TimelineContent) {
  const headingId = `${id}-title`;

  return (
    <Section id={id} labelledBy={headingId} tone="muted">
      <Reveal>
        <SectionHeading id={headingId} title={title} description={description} />
      </Reveal>
      <RevealGroup as="ol" className="flex flex-col gap-24 border-l-2 border-border-default pl-24">
        {items.map((item) => (
          <RevealItem as="li" key={item.period} className="relative flex flex-col gap-4">
            <span
              aria-hidden="true"
              className="absolute top-4 -left-32 size-16 rounded-1000 border-2 border-background-base bg-brand-primary"
            />
            <p className="text-normal-l font-semibold text-brand-primary">{item.period}</p>
            <h3 className="text-normal-xl font-semibold text-text-primary">{item.title}</h3>
            <p className="text-normal-lg text-text-secondary">{item.description}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
