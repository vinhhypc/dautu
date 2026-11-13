"use client";

import Image from "next/image";

import { useStepAutoplay } from "@/hooks/use-step-autoplay";
import { cn } from "@/lib/cn";
import { formatSlideTemplate } from "@/lib/format";
import { IMAGE_QUALITY } from "@/lib/image";
import type { HeroCarouselContent, HeroSlide, HeroSlideAccent, HeroSlideTone } from "@/types/content";

import { ButtonLink } from "../ui/button";
import { Container } from "../ui/container";
import { SlideDots } from "../ui/slide-dots";

const SLIDE_DURATION_MS = 5000;

const toneText: Record<HeroSlideTone, string> = {
  light: "text-text-secondary",
  dark: "text-text-inverse",
};

const accentText: Record<HeroSlideAccent, string> = {
  brand: "text-brand-primary",
  positive: "text-system-green-primary",
};

type SlideViewProps = {
  slide: HeroSlide;
  isActive: boolean;
  isFirst: boolean;
  roleDescription: string;
  label: string;
};

function SlideView({ slide, isActive, isFirst, roleDescription, label }: SlideViewProps) {
  const { image, tone, eyebrow, title, titleAccent, description, note, ctas = [] } = slide;
  const hasText = Boolean(eyebrow || title || description);

  return (
    <div
      role="group"
      aria-roledescription={roleDescription}
      aria-label={label}
      inert={!isActive}
      className={cn(
        "absolute inset-0 transition-[opacity,visibility] duration-700 ease-standard motion-reduce:transition-none",
        isActive ? "visible opacity-100" : "invisible opacity-0",
      )}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        preload={isFirst}
        quality={IMAGE_QUALITY.high}
        placeholder="blur"
        sizes="100vw"
        className="object-cover"
      />
      <Container
        className={cn(
          "relative flex h-full flex-col gap-8",
          hasText ? "justify-center pb-32" : "justify-end pb-96",
          toneText[tone],
        )}
      >
        {eyebrow && <p className="max-w-560 text-normal-xl uppercase md:text-large-sm">{eyebrow}</p>}
        {title && (
          <h2
            className={cn(
              "max-w-560 text-large-md font-regular md:text-hero-sm",
              titleAccent ? accentText[titleAccent] : undefined,
            )}
          >
            {title}
          </h2>
        )}
        {description && <p className="max-w-560 text-normal-lg md:text-normal-xl">{description}</p>}
        {note && <p className="max-w-560 text-normal-md italic">{note}</p>}
        {ctas.length > 0 && (
          <div className="mt-16 flex flex-wrap gap-12">
            {ctas.map((cta) => (
              <ButtonLink key={cta.href} href={cta.href} variant={cta.variant} trailingIcon={cta.trailingIcon}>
                {cta.label}
              </ButtonLink>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}

export function HeroCarousel({ id, title, slides, labels }: HeroCarouselContent) {
  const headingId = `${id}-title`;
  const { scope, active, select, pauseHandlers } = useStepAutoplay<HTMLElement>({
    count: slides.length,
    durationMs: SLIDE_DURATION_MS,
  });

  return (
    <section
      ref={scope}
      id={id}
      aria-labelledby={headingId}
      aria-roledescription={labels.carousel}
      className="relative h-360 overflow-hidden bg-background-canvas"
      {...pauseHandlers}
    >
      <h1 id={headingId} className="sr-only">
        {title}
      </h1>
      {slides.map((slide, index) => (
        <SlideView
          key={slide.id}
          slide={slide}
          isActive={index === active}
          isFirst={index === 0}
          roleDescription={labels.slide}
          label={formatSlideTemplate(labels.slidePosition, index, slides.length)}
        />
      ))}
      <SlideDots
        count={slides.length}
        active={active}
        onSelect={select}
        getLabel={(index) => formatSlideTemplate(labels.goToSlide, index, slides.length)}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      />
    </section>
  );
}
