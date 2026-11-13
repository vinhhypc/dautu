import { cn } from "@/lib/cn";
import type { FeatureGridContent } from "@/types/content";

import { Reveal, RevealGroup, RevealItem } from "../motion/reveal";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { TextLink } from "../ui/text-link";

export function FeatureGrid({ id, eyebrow, title, description, items }: FeatureGridContent) {
  const headingId = `${id}-title`;

  return (
    <Section id={id} labelledBy={headingId}>
      <Reveal>
        <SectionHeading id={headingId} eyebrow={eyebrow} title={title} description={description} />
      </Reveal>
      <RevealGroup as="ul" className={cn("grid gap-24", items.length === 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-3")}>
        {items.map((item) => (
          <RevealItem as="li" key={item.title} className="flex">
            <Card className="w-full">
              {item.tag && <Badge tone="neutral">{item.tag}</Badge>}
              <h3 className="text-normal-xl font-semibold text-text-primary">{item.title}</h3>
              <p className="text-normal-lg text-text-secondary">{item.description}</p>
              {item.link && (
                <TextLink href={item.link.href} trailingIcon={item.link.trailingIcon} className="mt-auto self-start pt-8">
                  {item.link.label}
                </TextLink>
              )}
            </Card>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
