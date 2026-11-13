import Image from "next/image";

import { IMAGE_QUALITY } from "@/lib/image";
import type { QuickToolsContent } from "@/types/content";

import { RevealGroup, RevealItem } from "../motion/reveal";
import { Card } from "../ui/card";
import { Container } from "../ui/container";
import { Icon } from "../ui/icon";
import { RouteLink } from "../ui/route-link";

export function QuickTools({ id, title, items }: QuickToolsContent) {
  const headingId = `${id}-title`;

  return (
    <section id={id} aria-labelledby={headingId} className="py-32 md:py-48">
      <Container>
        <h2 id={headingId} className="sr-only">
          {title}
        </h2>
        <Card padding="compact" className="md:p-24">
          <RevealGroup as="ul" className="grid grid-cols-3 gap-8">
            {items.map((item) => (
              <RevealItem as="li" key={item.href}>
                <RouteLink
                  href={item.href}
                  className="group flex flex-col items-center gap-12 rounded-8 p-8 text-center text-normal-md text-text-secondary md:gap-16 md:p-16 md:text-normal-l transition-colors duration-200 ease-standard hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus motion-reduce:transition-none"
                >
                  <span className="flex size-64 items-center justify-center rounded-1000 bg-background-base shadow-md transition-[transform,box-shadow] duration-200 ease-standard group-hover:-translate-y-2 group-hover:shadow-lg group-active:scale-97 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 md:size-112">
                    <Image
                      src={item.icon.src}
                      alt={item.icon.alt}
                      quality={IMAGE_QUALITY.standard}
                      sizes="(min-width: 768px) 112px, 64px"
                      className="size-full rounded-1000"
                    />
                  </span>
                  <span className="flex flex-wrap items-center justify-center gap-4">
                    {item.label}
                    <Icon name="arrow-right" className="size-16 text-brand-primary" />
                  </span>
                </RouteLink>
              </RevealItem>
            ))}
          </RevealGroup>
        </Card>
      </Container>
    </section>
  );
}
