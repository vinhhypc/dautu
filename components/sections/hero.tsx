import Image from "next/image";

import { cn } from "@/lib/cn";
import { IMAGE_QUALITY } from "@/lib/image";
import type { HeroContent } from "@/types/content";

import { Badge } from "../ui/badge";
import { ButtonLink } from "../ui/button";
import { Container } from "../ui/container";

const HEADING_ID = "hero-title";

export function Hero({ eyebrow, title, description, ctas, image }: HeroContent) {
  return (
    <section aria-labelledby={HEADING_ID} className="bg-brand-secondary">
      <Container className={cn("grid items-center gap-32 py-48 md:gap-48 md:py-64", image ? "md:grid-cols-2" : "md:py-96")}>
        <div className="flex flex-col gap-24">
          {eyebrow && <Badge tone="brand">{eyebrow}</Badge>}
          <h1 id={HEADING_ID} className="text-large-md font-semibold text-text-primary md:text-large-lg">
            {title}
          </h1>
          <p className="max-w-xl text-normal-lg text-text-secondary md:text-normal-xl">{description}</p>
          {ctas.length > 0 && (
            <div className="flex flex-wrap gap-12">
              {ctas.map((cta) => (
                <ButtonLink key={cta.href} href={cta.href} variant={cta.variant} size="lg">
                  {cta.label}
                </ButtonLink>
              ))}
            </div>
          )}
        </div>
        {image && (
          <div className="relative aspect-4/3 overflow-hidden rounded-16 shadow-md">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              preload
              quality={IMAGE_QUALITY.high}
              placeholder="blur"
              sizes="(min-width: 1152px) 544px, (min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        )}
      </Container>
    </section>
  );
}
