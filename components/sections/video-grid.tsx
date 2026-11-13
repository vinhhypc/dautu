import type { VideoGridContent } from "@/types/content";

import { Reveal, RevealGroup, RevealItem } from "../motion/reveal";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";

export function VideoGrid({ id, title, description, items }: VideoGridContent) {
  const headingId = `${id}-title`;

  return (
    <Section id={id} labelledBy={headingId} tone="muted">
      <Reveal>
        <SectionHeading id={headingId} title={title} description={description} />
      </Reveal>
      <RevealGroup as="ul" className="grid gap-24 md:grid-cols-3">
        {items.map((item) => (
          <RevealItem as="li" key={item.src} className="flex flex-col gap-12">
            <div className="relative aspect-video overflow-hidden rounded-12 bg-background-inverse shadow-sm">
              <iframe
                src={item.src}
                title={item.title}
                loading="lazy"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 size-full"
              />
            </div>
            <h3 className="text-normal-lg font-medium text-text-primary">{item.title}</h3>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
