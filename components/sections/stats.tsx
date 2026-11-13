import type { StatsContent } from "@/types/content";

import { RevealGroup, RevealItem } from "../motion/reveal";
import { Section } from "../ui/section";

export function Stats({ id, title, items }: StatsContent) {
  const headingId = `${id}-title`;

  return (
    <Section id={id} labelledBy={headingId} tone="primary">
      <h2 id={headingId} className="sr-only">
        {title}
      </h2>
      <RevealGroup as="dl" className="grid grid-cols-2 gap-24 md:grid-cols-4">
        {items.map((item) => (
          <RevealItem
            key={item.label}
            className="flex flex-col-reverse gap-4 rounded-12 bg-text-inverse/10 p-24 text-center"
          >
            <dt className="text-normal-l text-text-inverse">{item.label}</dt>
            <dd className="text-large-md font-semibold text-text-inverse md:text-large-lg">{item.value}</dd>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
