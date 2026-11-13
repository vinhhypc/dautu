import type { ContactDetailsContent } from "@/types/content";

import { Reveal } from "../motion/reveal";
import { ButtonLink } from "../ui/button";
import { Card } from "../ui/card";
import { RouteLink } from "../ui/route-link";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";

export function ContactDetails({ id, title, description, items, cta }: ContactDetailsContent) {
  const headingId = `${id}-title`;

  return (
    <Section id={id} labelledBy={headingId} className="md:grid md:grid-cols-2 md:items-start">
      <Reveal className="flex flex-col items-start gap-24">
        <SectionHeading id={headingId} title={title} description={description} />
        {cta && (
          <ButtonLink href={cta.href} variant={cta.variant} trailingIcon={cta.trailingIcon} size="lg">
            {cta.label}
          </ButtonLink>
        )}
      </Reveal>
      <Reveal>
        <Card padding="spacious">
          <dl className="flex flex-col gap-16">
            {items.map((item) => (
              <div key={item.label} className="flex flex-col gap-4 border-b border-border-subtle pb-16 last:border-b-0 last:pb-0">
                <dt className="text-normal-md text-text-tertiary">{item.label}</dt>
                <dd className="text-normal-lg font-medium text-text-primary">
                  {item.href ? (
                    <RouteLink href={item.href} className="link-text">
                      {item.value}
                    </RouteLink>
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      </Reveal>
    </Section>
  );
}
