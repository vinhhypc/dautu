import { linkInContext } from "@/lib/a11y";
import type { HomeContent } from "@/lib/wp/home";
import type { LinkItem, WpSectionLabels } from "@/types/content";

import { RevealGroup, RevealItem } from "../motion/reveal";
import { RevealChildren } from "../motion/reveal-children";
import { ButtonLink } from "../ui/button";
import { Card } from "../ui/card";
import { Icon } from "../ui/icon";
import { StepSlider } from "../ui/step-slider";
import { TextLink } from "../ui/text-link";
import { WpImage } from "../ui/wp-image";
import { RichText } from "./rich-text";
import { BannerSlider, TestimonialSlider, WpWidgetList } from "./wp-sections";

type HomeSectionProps<K extends keyof HomeContent> = {
  content: NonNullable<HomeContent[K]>;
  labels: WpSectionLabels;
};

const sectionTitle = "text-large-sm font-semibold text-text-primary text-center uppercase md:text-large-md";

export function HomeBanner({ title, banners }: { title: string; banners: HomeContent["banners"] }) {
  return (
    <section aria-labelledby="home-title" className="bg-background-base pt-16 md:pt-32">
      <h1 id="home-title" className="sr-only">
        {title}
      </h1>
      {banners.length > 0 && (
        <div className="mx-auto w-full max-w-1920 px-16 lg:px-24">
          <BannerSlider slides={banners} priority imageClassName="rounded-12 md:rounded-16" />
        </div>
      )}
    </section>
  );
}

export function HomeChallenges({ content, labels }: HomeSectionProps<"challenges">) {
  return (
    <section aria-labelledby="home-challenges" className="bg-background-base py-48 md:py-64">
      <RevealChildren container className="flex flex-col gap-24 md:gap-32">
        {content.title && (
          <h2 id="home-challenges" className={sectionTitle}>
            {content.title}
          </h2>
        )}
        <StepSlider
          showCounter
          slides={content.slides.map((slide) => ({
            label: slide.link?.label ?? slide.title,
            content: (
              <div className="grid overflow-hidden rounded-16 bg-background-canvas md:grid-cols-2">
                <div className="flex flex-col justify-center gap-24 p-24 md:p-48">
                  {slide.title && <p className="text-normal-xl font-semibold text-text-primary md:text-large-sm">{slide.title}</p>}
                  {slide.body && <RichText blocks={slide.body} labels={labels} />}
                  {slide.link && (
                    <ButtonLink href={slide.link.href} variant="secondary" className="self-start">
                      {slide.link.label}
                    </ButtonLink>
                  )}
                </div>
                {slide.image && <WpImage image={slide.image} sizes="(min-width: 768px) 50vw, 100vw" className="h-full max-h-400 w-full object-cover" />}
              </div>
            ),
          }))}
        />
      </RevealChildren>
    </section>
  );
}

const PRODUCT_CARD =
  "group hover-rise w-full items-center border-2 border-transparent text-center shadow-md hover:border-brand-primary";
const PRODUCT_ICON_RING =
  "flex size-64 items-center justify-center rounded-1000 bg-brand-secondary text-brand-primary transition-[transform,background-color,color] duration-[var(--duration)] group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-text-inverse motion-reduce:transition-none motion-reduce:group-hover:scale-100";
const PRODUCT_LINK =
  "mt-auto [&_.icon-arrow-right]:transition-transform [&_.icon-arrow-right]:duration-[var(--duration)] group-hover:[&_.icon-arrow-right]:translate-x-4 motion-reduce:group-hover:[&_.icon-arrow-right]:translate-x-0";

export function HomeProducts({ content, labels }: HomeSectionProps<"products">) {
  return (
    <section aria-labelledby="home-products" className="relative isolate overflow-hidden bg-background-canvas py-48 md:py-64">
      {content.background && (
        <WpImage image={content.background} sizes="100vw" className="absolute inset-0 -z-10 size-full object-cover opacity-30" />
      )}
      <RevealChildren container className="flex flex-col gap-32 md:gap-48">
        {content.title && (
          <h2 id="home-products" className={sectionTitle}>
            {content.title}
          </h2>
        )}
        <RevealGroup stagger="slow" className="grid gap-16 md:grid-cols-3 md:gap-24">
          {content.cards.map(({ front, back }, index) => (
            <RevealItem key={index} className="flex">
              <Card padding="spacious" className={PRODUCT_CARD}>
                {front.icon && (
                  <span className={PRODUCT_ICON_RING}>
                    <Icon name={front.icon} className="size-32" />
                  </span>
                )}
                {front.title && <h3 className="text-normal-xl font-semibold text-text-primary">{front.title}</h3>}
                <RichText blocks={front.body} labels={labels} compact className="items-center" />
                {back.link && (
                  <TextLink
                    href={back.link.href}
                    trailingIcon="arrow-right"
                    ariaLabel={linkInContext(labels.flipHint, front.title)}
                    className={PRODUCT_LINK}
                  >
                    {labels.flipHint}
                  </TextLink>
                )}
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </RevealChildren>
    </section>
  );
}

export function HomeWhy({ content, labels }: HomeSectionProps<"why">) {
  return (
    <section aria-labelledby="home-why" className="bg-background-base py-48 md:py-64">
      <RevealChildren container>
        <div className="flex flex-col gap-32 rounded-16 border-2 border-brand-primary p-24 md:p-48">
          {content.title && (
            <h2 id="home-why" className={sectionTitle}>
              {content.title}
            </h2>
          )}
          <div className="grid gap-32 lg:grid-cols-2 lg:gap-48">
            <div className="flex min-w-0 flex-col gap-24">
              <WpWidgetList widgets={content.main} labels={labels} />
            </div>
            <div className="flex min-w-0 flex-col gap-24">
              <WpWidgetList widgets={content.aside} labels={labels} />
            </div>
          </div>
        </div>
      </RevealChildren>
    </section>
  );
}

type HomeVoicesProps = {
  testimonials?: HomeContent["testimonials"];
  support?: HomeContent["support"];
  supportActions: LinkItem[];
  labels: WpSectionLabels;
};

export function HomeVoices({ testimonials, support, supportActions, labels }: HomeVoicesProps) {
  return (
    <section aria-labelledby="home-voices" className="relative isolate overflow-hidden bg-background-canvas py-48 md:py-64">
      {testimonials?.background && (
        <WpImage image={testimonials.background} sizes="100vw" className="absolute inset-0 -z-10 size-full object-cover opacity-20" />
      )}
      <RevealChildren container className="flex flex-col gap-32 lg:gap-48">
        {testimonials && (
          <div className="flex min-w-0 flex-col gap-24">
            {testimonials.title && (
              <h2 id="home-voices" className="text-large-sm font-semibold text-text-primary uppercase md:text-large-md">
                {testimonials.title}
              </h2>
            )}
            <TestimonialSlider items={testimonials.items} />
          </div>
        )}
        {support && (
          <Card padding="spacious" className="items-center text-center shadow-lg">
            {support.title && <h2 className="text-large-sm font-semibold text-text-primary uppercase">{support.title}</h2>}
            <RichText blocks={support.body} labels={labels} compact className="items-center" />
            <div className="flex flex-wrap justify-center gap-12">
              {supportActions.map((action, index) => (
                <ButtonLink key={action.href} href={action.href} variant={index === 0 ? "primary" : "secondary"}>
                  {action.label}
                </ButtonLink>
              ))}
            </div>
          </Card>
        )}
      </RevealChildren>
    </section>
  );
}
