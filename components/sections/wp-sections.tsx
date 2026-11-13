import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { naturalWidthClass, widthFractionClass } from "@/lib/fraction";
import {
  type WpRun,
  groupWidgets,
  isBannerSlides,
  normalizeHeadings,
  sectionContainsH1,
  sectionHeadingId,
} from "@/lib/wp-layout";
import type {
  WpAlign,
  WpCardFace,
  WpColumn,
  WpSection,
  WpSectionLabels,
  WpSlide,
  WpTestimonial,
  WpTone,
  WpWidget,
} from "@/types/content";

import { ButtonLink } from "../ui/button";
import { Card } from "../ui/card";
import { RevealChildren } from "../motion/reveal-children";
import { Container } from "../ui/container";
import { Disclosure } from "../ui/disclosure";
import { HubspotForm } from "../ui/hubspot-form";
import { Icon } from "../ui/icon";
import { RouteLink } from "../ui/route-link";
import { StepSlider } from "../ui/step-slider";
import { Tabs } from "../ui/tabs";
import { TextLink } from "../ui/text-link";
import { WpImage } from "../ui/wp-image";
import { RichText } from "./rich-text";

/* Cỡ chữ gần với thang của trang gốc (h2 ~25px → 24, h3/h4 18–20px → 20) trên token ds-one. */
const headingClasses = {
  1: "text-large-md font-semibold text-text-primary md:text-large-lg",
  2: "text-large-sm leading-36 font-semibold text-text-primary",
  3: "text-normal-xl font-semibold text-text-primary",
  4: "text-normal-xl font-semibold text-text-primary",
};

const DISPLAY_HEADING = "text-large-lg font-semibold text-text-primary md:text-hero-sm";
const SMALL_HEADING = "text-normal-lg font-semibold text-text-primary";

const alignText: Record<WpAlign, string> = { left: "text-left", center: "text-center", right: "text-right" };
const alignSelf: Record<WpAlign, string> = { left: "self-start", center: "mx-auto self-center", right: "ml-auto self-end" };
const alignFlex: Record<WpAlign, string> = { left: "justify-start", center: "justify-center", right: "justify-end" };

function headingClass(widget: Extract<WpWidget, { type: "heading" }>) {
  return cn(
    "whitespace-pre-line",
    widget.hidden ? "sr-only" : widget.size === "display" ? DISPLAY_HEADING : widget.size === "small" ? SMALL_HEADING : headingClasses[widget.level],
    widget.align && alignText[widget.align],
    widget.tone === "brand" && "text-brand-primary",
    widget.tone === "purple" && "text-system-purple-primary",
  );
}


const tabletSpan = (span: number) => (span <= 6 ? "md:col-span-6" : "md:col-span-12");
const desktopSpan: Record<number, string> = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  9: "lg:col-span-9",
  10: "lg:col-span-10",
  11: "lg:col-span-11",
  12: "lg:col-span-12",
};

const INVERSE_TEXT = "text-text-inverse [&_:is(h1,h2,h3,h4,p,li,span,strong,figcaption,blockquote)]:text-text-inverse";

const toneOutline: Record<WpTone, string> = {
  brand: "border-2 border-brand-primary",
  accent: "border-2 border-system-orange-primary",
  purple: "border border-system-purple-primary",
  muted: "border border-border-default",
  inverse: "border-2 border-border-strong",
};

const ELEVATED = "rounded-16 bg-background-base p-24 shadow-md";

const MAX_CARD_ROWS = 8;
const ROW_SPAN: Record<number, string> = {
  2: "row-span-2",
  3: "row-span-3",
  4: "row-span-4",
  5: "row-span-5",
  6: "row-span-6",
  7: "row-span-7",
  8: "row-span-8",
};


const toneSurface: Record<WpTone, string> = {
  brand: cn("bg-brand-primary", INVERSE_TEXT),
  accent: cn("bg-system-orange-primary", INVERSE_TEXT),
  purple: cn("bg-system-purple-primary", INVERSE_TEXT),
  muted: "bg-background-canvas",
  inverse: cn("bg-background-inverse", INVERSE_TEXT),
};

type ColumnsWidgetProps = { widget: Extract<WpWidget, { type: "columns" }>; labels: WpSectionLabels; centered: boolean };

/* Thẻ cùng hàng có cùng cấu trúc (ảnh → tiêu đề → mô tả → nút): dùng subgrid để các phần cùng loại thẳng hàng giữa các thẻ,
   ảnh giữ kích thước gốc — như trang Elementor, nơi tiêu đề và nút của các thẻ cạnh nhau nằm cùng một dòng. */
function cardRows(columns: WpColumn[]): number | undefined {
  if (columns.length < 2 || !columns.every((column) => column.elevated || column.outline || column.tone)) return undefined;
  const counts = columns.map((column) => groupWidgets(column.widgets).length);
  const rows = Math.max(...counts);
  return rows >= 2 && rows <= MAX_CARD_ROWS ? rows : undefined;
}

function ColumnsWidget({ widget, labels, centered }: ColumnsWidgetProps) {
  const { columns } = widget;
  const subgrid = cardRows(columns);
  return (
    <div
      className={cn(
        "grid gap-24 md:grid-cols-12 lg:gap-32",
        columns.some((column) => column.tone || column.outline || column.elevated) ? "items-stretch" : centered ? "items-center" : "items-start",
        (widget.surface || widget.outline || widget.elevated) && "rounded-16 p-24 md:p-32",
        widget.surface && toneSurface[widget.surface],
        widget.outline && toneOutline[widget.outline],
        widget.elevated && "shadow-md",
      )}
    >
      {columns.map((column, index) => {
        const surface = column.tone || column.outline || column.background || column.elevated;
        return (
          <div
            key={index}
            className={cn(
              "relative isolate flex min-w-0 flex-col gap-16",
              centered && "md:justify-center",
              tabletSpan(column.span),
              desktopSpan[column.span],
              column.align === "center" && "items-center text-center",
              column.span <= 4 && "[&_h2]:text-normal-xl [&_h3]:text-normal-lg",
              surface && "self-stretch overflow-hidden rounded-16 p-24",
              column.tone && toneSurface[column.tone],
              column.outline && toneOutline[column.outline],
              column.elevated && ELEVATED,
              subgrid && cn("grid grid-rows-subgrid gap-y-16", ROW_SPAN[subgrid]),
            )}
          >
            {column.background && <WpImage image={column.background} sizes="50vw" className="absolute inset-0 -z-10 size-full object-cover" />}
            {column.widgets.length === 0 && !surface && <span aria-hidden="true" className="max-md:hidden" />}
            <Runs widgets={column.widgets} labels={labels} maxColumns={maxColumnsFor(column.span)} />
          </div>
        );
      })}
    </div>
  );
}

/* maxColumns theo độ rộng cột Elementor chứa nhóm thẻ: cột hẹp thì thẻ xếp dọc như trang gốc. */
const gridColumns = (count: number, maxColumns = 4) =>
  cn(
    "grid gap-16 md:gap-24",
    maxColumns >= 2 && count >= 2 && "sm:grid-cols-2",
    maxColumns >= 3 && count >= 3 && "lg:grid-cols-3",
    maxColumns >= 4 && count === 4 && "xl:grid-cols-4",
  );

function maxColumnsFor(span: number) {
  if (span <= 4) return 1;
  if (span <= 8) return 2;
  return 4;
}

function headingContent(widget: Extract<WpWidget, { type: "heading" }>): ReactNode {
  return widget.href ? (
    <RouteLink href={widget.href} className="transition-colors hover:text-brand-primary">
      {widget.text}
    </RouteLink>
  ) : (
    widget.text
  );
}

function CardFace({ face, labels, inverse = false }: { face: WpCardFace; labels: WpSectionLabels; inverse?: boolean }) {
  return (
    <>
      {face.image && <WpImage image={face.image} sizes="160px" className="max-h-64 w-auto self-start object-contain" />}
      {face.title && (
        <h3 className={cn("text-normal-xl font-semibold whitespace-pre-line", inverse ? "text-text-inverse" : "text-text-primary")}>{face.title}</h3>
      )}
      {face.body.length > 0 && <RichText blocks={face.body} labels={labels} wide className={cn("gap-8", inverse && "text-text-inverse")} />}
    </>
  );
}

type RunProps = { run: WpRun; labels: WpSectionLabels; isHero: boolean; maxColumns: number };

function Run({ run, labels, isHero, maxColumns }: RunProps): ReactNode {
  switch (run.kind) {
    case "cards":
      if (run.items.length === 1 && !run.items[0].card.link) {
        const { card, align } = run.items[0];
        return (
          <div className={cn("flex flex-col gap-12", align === "center" && "items-center text-center")}>
            <CardFace face={card} labels={labels} />
          </div>
        );
      }
      return (
        <div className={gridColumns(run.items.length, maxColumns)}>
          {run.items.map(({ card, align }, index) => (
            <Card key={index} className={cn("hover-rise", align === "center" && "items-center text-center")}>
              <CardFace face={card} labels={labels} />
              {card.link && (
                <TextLink href={card.link.href} trailingIcon="arrow-right" className="mt-auto self-start">
                  {card.link.label}
                </TextLink>
              )}
            </Card>
          ))}
        </div>
      );
    case "flipCards":
      return (
        <div className={gridColumns(run.items.length, maxColumns)}>
          {run.items.map(({ front, back }, index) => (
            <div
              key={index}
              tabIndex={back.link ? undefined : 0}
              className="group relative flex min-h-240 flex-col overflow-hidden rounded-16 border border-border-subtle bg-background-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
            >
              <div className="flex flex-1 flex-col gap-12 p-24">
                <CardFace face={front} labels={labels} />
              </div>
              <div className="flex flex-col gap-12 bg-brand-primary p-24 transition-opacity duration-200 ease-standard motion-reduce:transition-none pointer-fine:absolute pointer-fine:inset-0 pointer-fine:overflow-y-auto pointer-fine:opacity-0 pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:opacity-100">
                <CardFace face={back} labels={labels} inverse />
                {back.link && (
                  <ButtonLink href={back.link.href} variant="neutral" trailingIcon="arrow-right" className="mt-auto self-start">
                    {back.link.label || labels.flipHint}
                  </ButtonLink>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    case "images":
      return run.items.length === 1 ? (
        <ImageWidget
          widget={run.items[0]}
          sizes="(min-width: 1152px) 1088px, 100vw"
          defaultAlign="center"
          className={cn(isHero && !run.items[0].width && "max-h-160")}
        />
      ) : (
        <div className={gridColumns(run.items.length, maxColumns)}>
          {run.items.map((widget, index) => (
            <ImageWidget key={index} widget={widget} sizes="(min-width: 768px) 33vw, 100vw" />
          ))}
        </div>
      );
    case "buttons":
      return (
        <div className={cn("flex flex-wrap items-start gap-12", run.items[0].align && alignFlex[run.items[0].align])}>
          {run.items.map(({ link }, index) => (
            <ButtonLink key={link.href + index} href={link.href} variant={index === 0 ? "primary" : "secondary"} size="lg">
              {link.label}
            </ButtonLink>
          ))}
        </div>
      );
    case "single":
      return run.widget.type === "columns" ? (
        <ColumnsWidget widget={run.widget} labels={labels} centered={isHero} />
      ) : (
        <SingleWidget widget={run.widget} labels={labels} />
      );
  }
}

function SectionContainer({ reveal, className, children }: { reveal: boolean; className: string; children: ReactNode }) {
  return reveal ? (
    <RevealChildren container className={className}>
      {children}
    </RevealChildren>
  ) : (
    <Container className={className}>{children}</Container>
  );
}

type ImageWidgetProps = { widget: Extract<WpWidget, { type: "image" }>; sizes: string; defaultAlign?: WpAlign; className?: string };

type BannerSliderProps = { slides: WpSlide[]; priority?: boolean; imageClassName?: string };

export function BannerSlider({ slides, priority = false, imageClassName = "rounded-16" }: BannerSliderProps) {
  return (
    <StepSlider
      slides={slides.flatMap((slide, index) => {
        if (!slide.image) return [];
        const image = <WpImage image={slide.image} sizes="100vw" priority={priority && index === 0} className={cn("w-full", imageClassName)} />;
        return [
          {
            content: slide.link ? (
              <RouteLink href={slide.link.href} aria-label={slide.link.label} className="block rounded-16 transition-opacity hover:opacity-95">
                {image}
              </RouteLink>
            ) : (
              image
            ),
          },
        ];
      })}
    />
  );
}

export function TestimonialSlider({ items }: { items: WpTestimonial[] }) {
  return (
    <StepSlider
      slides={items.map((item) => ({
        label: item.name,
        content: (
          <figure className="flex flex-col gap-24">
            <blockquote className="text-normal-lg text-text-secondary italic md:text-normal-xl">{item.body}</blockquote>
            <figcaption className="flex items-center gap-12">
              {item.image && <WpImage image={item.image} sizes="64px" className="size-64 rounded-1000 object-cover" />}
              <span>
                <span className="block font-semibold text-text-primary">{item.name}</span>
                {item.role && <span className="block text-normal-md text-text-tertiary">{item.role}</span>}
              </span>
            </figcaption>
          </figure>
        ),
      }))}
    />
  );
}

/* Ảnh Elementor mặc định căn giữa; trong cột cạnh khối chữ thì theo lề trái như trang gốc. */
function ImageWidget({ widget, sizes, defaultAlign = "center", className }: ImageWidgetProps) {
  const placement = alignSelf[widget.align ?? defaultAlign];
  const image = (
    <WpImage
      image={widget.image}
      sizes={sizes}
      className={cn(
        "rounded-12",
        widget.width || className ? widthFractionClass(widget.width) : naturalWidthClass(widget.image.width),
        !widget.href && placement,
        className,
      )}
    />
  );
  return widget.href ? (
    <RouteLink href={widget.href} className={cn("rounded-12 transition-opacity hover:opacity-90", placement)}>
      {image}
    </RouteLink>
  ) : (
    image
  );
}

function SingleWidget({ widget, labels }: { widget: WpWidget; labels: WpSectionLabels }): ReactNode {
  switch (widget.type) {
    case "heading": {
      const Tag = `h${widget.level}` as const;
      return <Tag className={headingClass(widget)}>{headingContent(widget)}</Tag>;
    }
    case "richText":
      return (
        <RichText
          blocks={widget.blocks}
          labels={labels}
          wide
          className={cn(
            widget.align === "center" && "items-center text-center",
            widget.align === "right" && "items-end text-right",
            widget.narrow && "lg:max-w-1/2",
          )}
        />
      );
    case "iconList":
      return (
        <ul className="flex flex-col gap-4 text-normal-lg leading-24 text-text-primary">
          {widget.items.map((item, index) => (
            <li key={index} className="flex gap-12">
              <Icon name="check" className="mt-2 shrink-0 text-brand-primary" />
              {item.href ? (
                <RouteLink href={item.href} className="link-text">
                  {item.text}
                </RouteLink>
              ) : (
                <span>{item.text}</span>
              )}
            </li>
          ))}
        </ul>
      );
    case "faq":
      return (
        <div className="flex flex-col">
          {widget.items.map((item, index) => (
            <Disclosure key={index} title={item.title}>
              <RichText blocks={item.body} labels={labels} />
            </Disclosure>
          ))}
        </div>
      );
    case "tabs":
      return (
        <Tabs
          items={widget.items.map((item, index) => ({
            id: `tab-${index}`,
            label: item.title,
            content: <RichText blocks={item.body} labels={labels} />,
          }))}
        />
      );
    case "slides":
      if (isBannerSlides(widget)) return <BannerSlider slides={widget.items} />;
      return (
        <StepSlider
          showCounter
          slides={widget.items.map((slide) => ({
            label: slide.link?.label ?? slide.title,
            content: (
              <div className={cn("grid overflow-hidden", slide.image && "rounded-16 bg-background-surface md:grid-cols-2")}>
                <div className={cn("flex flex-col justify-center gap-16", slide.image && "p-24 md:p-40")}>
                  {slide.title && <h3 className="text-large-sm font-semibold whitespace-pre-line text-text-primary md:text-large-lg">{slide.title}</h3>}
                  {slide.body && <RichText blocks={slide.body} labels={labels} wide />}
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
      );
    case "gallery":
      return (
        <StepSlider
          slides={widget.images.map((image) => ({
            label: image.caption,
            content: (
              <WpImage
                image={image}
                sizes="(min-width: 1152px) 1088px, 100vw"
                /* Ảnh carousel không rõ kích thước tải ngay như trang gốc — lazy sẽ để khung 0px rồi giật layout khi ảnh về. */
                priority={!image.width}
                className={cn("mx-auto max-h-560 rounded-12 object-contain", naturalWidthClass(image.width))}
              />
            ),
          }))}
        />
      );
    case "testimonials":
      return <TestimonialSlider items={widget.items} />;
    case "video":
      return <RichText blocks={[{ type: "video", src: widget.src, title: widget.title }]} labels={labels} />;
    case "hubspotForm":
      return (
        <HubspotForm
          portalId={widget.portalId}
          formId={widget.formId}
          region={widget.region}
          labels={{ loading: labels.formLoading, error: labels.formError }}
        />
      );
    case "posts":
      return (
        <div className={gridColumns(widget.items.length)}>
          {widget.items.map((post) => (
            <Card key={post.href} padding="compact">
              {post.image && <WpImage image={post.image} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="w-full rounded-8" />}
              <h3 className="text-normal-lg font-semibold text-text-primary">
                <RouteLink href={post.href} className="hover:text-brand-primary">
                  {post.title}
                </RouteLink>
              </h3>
              {post.excerpt && <p className="text-normal-md text-text-secondary">{post.excerpt}</p>}
            </Card>
          ))}
        </div>
      );
    default:
      return null;
  }
}

/* Trang WP không có h1: đưa tên trang lên đầu section đầu tiên để section đó thành hero. */
function withPageHeading(sections: WpSection[], title: string): WpSection[] {
  const heading: WpWidget = { type: "heading", level: 1, text: title, hidden: true };
  const [first, ...rest] = sections;
  return first ? [{ ...first, widgets: [heading, ...first.widgets] }, ...rest] : [{ id: "s-title", widgets: [heading] }];
}

export function WpWidgetList({ widgets, labels }: { widgets: WpWidget[]; labels: WpSectionLabels }) {
  return <Runs widgets={widgets} labels={labels} />;
}

/* Nền/viền đặt trên widget chỉ giữ cho khối chữ — ảnh/logo có nền màu trong Elementor thường là lớp trang trí. */
const BOXABLE = new Set<WpWidget["type"]>(["richText", "heading", "iconList", "faq"]);

type RunsProps = {
  widgets: WpWidget[];
  headingId?: string;
  labels: WpSectionLabels;
  isHero?: boolean;
  maxColumns?: number;
};

function Runs({ widgets, headingId, labels, isHero = false, maxColumns = 4 }: RunsProps) {
  const runs = groupWidgets(widgets);
  const titleIndex = headingId ? runs.findIndex((run) => run.kind === "single" && run.widget.type === "heading") : -1;
  return runs.map((run, index) => {
    if (index === titleIndex && run.kind === "single" && run.widget.type === "heading") {
      const Tag = `h${run.widget.level}` as const;
      return (
        <Tag key={index} id={headingId} className={headingClass(run.widget)}>
          {headingContent(run.widget)}
        </Tag>
      );
    }
    const rendered = <Run key={index} run={run} labels={labels} isHero={isHero} maxColumns={maxColumns} />;
    const box =
      run.kind === "single" && BOXABLE.has(run.widget.type) ? run.widget : run.kind === "cards" && run.items.length === 1 ? run.items[0] : undefined;
    if (!box?.surface && !box?.outline) return rendered;
    return (
      <div
        key={index}
        className={cn(
          "flex flex-col gap-12 rounded-12 p-16 md:p-24",
          box.surface && toneSurface[box.surface],
          box.outline && toneOutline[box.outline],
        )}
      >
        {rendered}
      </div>
    );
  });
}

const SECTION_SPACING = { tight: "py-16 md:py-24", default: "py-32 md:py-40", loose: "py-48 md:py-64" } as const;

const OBJECT_POSITION = {
  left: "object-left",
  center: "object-center",
  right: "object-right",
  top: "object-top",
  bottom: "object-bottom",
} as const;

type WpSectionsProps = {
  title: string;
  sections: WpSection[];
  labels: WpSectionLabels;
  withPageTitle?: boolean;
};

export function WpSections({ title, sections, labels, withPageTitle = true }: WpSectionsProps) {
  const { sections: normalized, hasH1 } = normalizeHeadings(sections, withPageTitle);
  const withTitle = withPageTitle && !hasH1 ? withPageHeading(normalized, title) : normalized;

  return (
    <>
      {withTitle.map((section, index) => {
        const isHero = sectionContainsH1(section) || Boolean(section.tall) || (index === 0 && Boolean(section.background));
        const surface = section.tone ? toneSurface[section.tone] : "bg-background-base";
        return (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={sectionHeadingId(section)}
            className={cn(
              "relative isolate overflow-hidden",
              section.widgets.length > 0 && SECTION_SPACING[section.spacing ?? "default"],
              section.tall && "flex min-h-400 items-center lg:min-h-480",
              surface,
            )}
          >
            {section.background && section.widgets.length > 0 && (
              <>
                <WpImage
                  image={section.background}
                  sizes="100vw"
                  priority={isHero}
                  className={cn(
                    "absolute inset-0 -z-20 size-full",
                    section.backgroundFit === "contain" ? "object-contain" : "object-cover",
                    OBJECT_POSITION[section.backgroundPosition ?? "center"],
                  )}
                />
                {!section.tone && <span aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-background-base/90 via-background-base/40 to-transparent" />}
              </>
            )}
            {section.background && section.widgets.length === 0 && (
              <WpImage image={section.background} sizes="100vw" priority={index === 0} className="mx-auto w-full max-w-1920" />
            )}
            <SectionContainer reveal={!isHero} className={cn("flex flex-col gap-24 md:gap-32", section.widgets.length === 0 && "hidden")}>
              {section.outline ? (
                <div
                  className={cn(
                    "flex flex-col gap-24 rounded-16 p-24 md:gap-32 md:p-40",
                    toneOutline[section.outline],
                    section.background && "bg-background-base shadow-md",
                  )}
                >
                  <Runs widgets={section.widgets} headingId={sectionHeadingId(section)} labels={labels} isHero={isHero} />
                </div>
              ) : (
                <Runs widgets={section.widgets} headingId={sectionHeadingId(section)} labels={labels} isHero={isHero} />
              )}
            </SectionContainer>
          </section>
        );
      })}
    </>
  );
}
