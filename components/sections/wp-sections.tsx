import type { ReactNode } from "react";

import { linkInContext } from "@/lib/a11y";
import { cn } from "@/lib/cn";
import { naturalWidthClass, widthFractionClass } from "@/lib/fraction";
import { linkHost } from "@/lib/image";
import {
  type MasonryItem,
  type WpRun,
  groupWidgets,
  flipCardBodies,
  isBannerSlides,
  isLabelTile,
  isStepRow,
  masonryCards,
  isTitleOnly,
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
    widget.tone === "green" && "text-system-green-primary",
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

const INVERSE_TEXT =
  "text-text-inverse [&_:is(h1,h2,h3,h4,p,li,span,strong,figcaption,blockquote)]:text-text-inverse [&_.link-text]:text-text-inverse! [&_.link-text]:decoration-2";

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


/* Chữ trắng trên cam brand chỉ đạt 3:1 (WCAG AA cần 4,5:1 cho đoạn văn) → khối nền cam của Elementor dùng nền cam nhạt, chữ đậm. */
const toneSurface: Record<WpTone, string> = {
  brand: "bg-brand-secondary",
  accent: "bg-system-orange-secondary",
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

/* Chữ trắng trên cam brand chỉ đạt 3:1 → ô nhãn dùng chữ cỡ lớn (WCAG cho phép 3:1 với chữ lớn). */
const LABEL_TILE = cn(
  "items-center justify-center self-stretch rounded-16 bg-brand-primary p-16 text-center lg:w-min lg:px-24",
  INVERSE_TEXT,
  "[&_:is(p,h2,h3,h4,strong)]:text-large-sm [&_:is(p,h2,h3,h4,strong)]:font-semibold",
);

function StepContent({ widget, labels }: { widget: WpWidget; labels: WpSectionLabels }) {
  if (widget.type === "card") return <WpCard item={widget} labels={labels} />;
  if (widget.type === "flipCard") return <WpFlipCard item={widget} labels={labels} />;
  return <Runs widgets={[widget]} labels={labels} />;
}

function StepRow({ columns, labels }: { columns: WpColumn[]; labels: WpSectionLabels }) {
  return (
    <ol className="grid gap-32 md:auto-cols-fr md:grid-flow-col">
      {columns.map((column, index) => (
        <li key={index} className="relative flex flex-col *:flex-1">
          {index > 0 && (
            <Icon
              name="arrow-right"
              className="absolute -top-26 left-1/2 -translate-x-1/2 rotate-90 text-brand-primary md:top-1/2 md:-left-26 md:translate-x-0 md:-translate-y-1/2 md:rotate-0"
            />
          )}
          <StepContent widget={column.widgets[0]} labels={labels} />
        </li>
      ))}
    </ol>
  );
}

function ColumnsWidget({ widget, labels, centered }: ColumnsWidgetProps) {
  const { columns } = widget;
  if (isStepRow(columns)) return <StepRow columns={columns} labels={labels} />;
  const masonry = masonryCards(columns);
  if (masonry) return <MasonryCards items={masonry} columnCount={columns.length} labels={labels} />;
  const subgrid = cardRows(columns);
  const stretched = columns.some((column) => column.tone || column.outline || column.elevated);
  const leadingTile = columns.length > 1 && columns[0].span === 1 && isLabelTile(columns[0]);
  return (
    <div
      className={cn(
        "grid gap-24 md:grid-cols-12 lg:gap-32",
        leadingTile && "lg:grid-cols-[auto_repeat(11,minmax(0,1fr))]",
        stretched ? "items-stretch" : centered ? "items-center" : "items-start",
        (widget.surface || widget.outline || widget.elevated) && "rounded-16 p-24 md:p-32",
        widget.surface && toneSurface[widget.surface],
        widget.outline && toneOutline[widget.outline],
        widget.elevated && "shadow-md",
      )}
    >
      {columns.map((rawColumn, index) => {
        /* Tiêu đề đứng một mình trong thanh màu trông như nút bấm → hiển thị như tiêu đề section thường. */
        const column = isTitleOnly(rawColumn.widgets) ? { ...rawColumn, tone: undefined, outline: undefined, elevated: undefined } : rawColumn;
        const labelTile = isLabelTile(column);
        const surface = !labelTile && (column.tone || column.outline || column.background || column.elevated);
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
              stretched && !surface && "[&>:last-child:is(h2,h3,h4)]:mt-auto",
              labelTile && LABEL_TILE,
              surface && "self-stretch overflow-hidden rounded-16 p-24",
              surface && column.tone && toneSurface[column.tone],
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
    "grid grid-cols-1 gap-16 md:gap-24",
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

function CardFace({ face, labels }: { face: WpCardFace; labels: WpSectionLabels }) {
  return (
    <>
      {face.image && <WpImage image={face.image} sizes="160px" className="max-h-64 w-auto max-w-full self-start object-contain" />}
      {face.title && <h3 className="text-normal-xl font-semibold whitespace-pre-line text-text-primary">{face.title}</h3>}
      {face.body.length > 0 && <RichText blocks={face.body} labels={labels} wide className="gap-8" />}
    </>
  );
}

const LINKED_CARD = "relative cursor-pointer hover:border-brand-primary [&_.link-text]:relative [&_.link-text]:z-10";

/* Cả thẻ là vùng bấm: link phủ toàn thẻ, link trong nội dung nằm trên lớp phủ nên vẫn bấm riêng được. */
function CardOverlayLink({ href, label }: { href: string; label: string }) {
  return (
    <RouteLink href={href} className="absolute inset-0 rounded-12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus">
      <span className="sr-only">{label}</span>
    </RouteLink>
  );
}

function WpCard({ item: { card, align }, labels, className }: { item: Extract<WpWidget, { type: "card" }>; labels: WpSectionLabels; className?: string }) {
  return (
    <Card className={cn("hover-rise", align === "center" && "items-center text-center", card.link && LINKED_CARD, className)}>
      <CardFace face={card} labels={labels} />
      {card.link && <CardOverlayLink href={card.link.href} label={linkInContext(card.link.label, card.title) ?? card.link.label} />}
    </Card>
  );
}

/* Thẻ lật Elementor: nội dung mặt sau chỉ hiện khi rê chuột, mặt trước thường chỉ có logo → hiện cả hai mặt trong một thẻ. */
function WpFlipCard({ item: { front, back }, labels, className }: { item: Extract<WpWidget, { type: "flipCard" }>; labels: WpSectionLabels; className?: string }) {
  const bodies = flipCardBodies(front, back);
  return (
    <Card className={cn("hover-rise", back.link && LINKED_CARD, className)}>
      <CardFace face={{ ...front, body: bodies.front }} labels={labels} />
      {/* Mặt sau thường nhắc lại tiêu đề mặt trước với chữ hơi khác ("Trái phiếu (Vietcombank)") → chỉ giữ một tiêu đề. */}
      <CardFace face={{ ...back, title: front.title ? undefined : back.title, body: bodies.back }} labels={labels} />
      {back.link && <CardOverlayLink href={back.link.href} label={linkInContext(back.link.label || labels.flipHint, front.title ?? back.title) ?? (back.link.label || labels.flipHint)} />}
    </Card>
  );
}

const MASONRY_ITEM = "mb-16 break-inside-avoid md:mb-24";

/* Elementor xếp thẻ thành các cột dọc độc lập; masonry bằng CSS columns giữ kiểu đó mà không để hở khi số cột đổi theo màn hình. */
function MasonryCards({ items, columnCount, labels }: { items: MasonryItem[]; columnCount: number; labels: WpSectionLabels }) {
  return (
    <div className={cn("gap-16 md:columns-2 md:gap-24", columnCount >= 3 && "lg:columns-3")}>
      {items.map((item, index) =>
        item.type === "card" ? (
          <WpCard key={index} item={item} labels={labels} className={MASONRY_ITEM} />
        ) : (
          <WpFlipCard key={index} item={item} labels={labels} className={MASONRY_ITEM} />
        ),
      )}
    </div>
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
          {run.items.map((item, index) => (
            <WpCard key={index} item={item} labels={labels} />
          ))}
        </div>
      );
    case "flipCards":
      return (
        <div className={gridColumns(run.items.length, maxColumns)}>
          {run.items.map((item, index) => (
            <WpFlipCard key={index} item={item} labels={labels} />
          ))}
        </div>
      );
    case "images":
      /* Ảnh liền nhau mà mỗi ảnh có độ rộng Elementor riêng (vd. logo + chữ ảnh ở hero) là bố cục xếp chồng, không phải lưới ảnh. */
      if (run.items.length > 1 && run.items.every((widget) => widget.width))
        return run.items.map((widget, index) => (
          <ImageWidget key={index} widget={widget} sizes="(min-width: 768px) 50vw, 100vw" defaultAlign="left" />
        ));
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
        const image = <WpImage image={slide.image} sizes="100vw" priority={priority && index === 0} className={cn("h-full w-full object-cover", imageClassName)} />;
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
          <figure className="flex flex-col justify-between gap-24">
            <blockquote className="text-normal-lg text-text-secondary italic md:text-normal-xl">{item.body}</blockquote>
            <figcaption className="flex items-center gap-12">
              {item.image && <WpImage image={item.image} sizes="64px" className="size-64 rounded-1000 object-cover" />}
              <span>
                <span className="block font-semibold text-text-primary">{item.name}</span>
                {item.role && <span className="block text-normal-l text-text-tertiary">{item.role}</span>}
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
  const width = widget.width || className ? widthFractionClass(widget.width) : naturalWidthClass(widget.image.width);
  /* Ảnh trong link: độ rộng đặt trên link — ảnh w-full (%) trong link tự co theo nội dung sẽ co cả hai về 0px. */
  const linkWidth = widget.href && width !== "w-auto" ? width : undefined;
  const image = (
    <WpImage
      image={widget.image}
      sizes={sizes}
      className={cn("rounded-12", linkWidth ? "w-full" : width, !widget.href && placement, className)}
    />
  );
  return widget.href ? (
    <RouteLink
      href={widget.href}
      aria-label={widget.image.alt ? undefined : linkHost(widget.href)}
      className={cn("rounded-12 transition-opacity hover:opacity-90", placement, linkWidth)}
    >
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
            widget.lead && "text-large-sm leading-32",
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
              {widget.marker === "dot" ? (
                <span aria-hidden="true" className="mt-6 size-12 shrink-0 rounded-1000 border-2 border-brand-primary" />
              ) : (
                <Icon name="check" className="mt-2 shrink-0 text-brand-primary" />
              )}
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
    case "divider":
      return (
        <hr
          className={cn(
            "w-1/2 max-w-160 border-border-default",
            widget.align === "left" ? "self-start" : widget.align === "right" ? "self-end" : "self-center",
          )}
        />
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
              {post.excerpt && <p className="text-normal-l text-text-secondary">{post.excerpt}</p>}
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

const isCardTitleOnly = (card: WpCardFace) => Boolean(card.title) && card.body.length === 0 && !card.image && !card.link;

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
      run.kind === "single" && BOXABLE.has(run.widget.type) && !isTitleOnly([run.widget])
        ? run.widget
        : run.kind === "cards" && run.items.length === 1 && !isCardTitleOnly(run.items[0].card)
          ? run.items[0]
          : undefined;
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

  return withTitle.map((section, index) => <WpSectionBlock key={section.id} section={section} index={index} labels={labels} />);
}

function WpSectionBlock({ section, index, labels }: { section: WpSection; index: number; labels: WpSectionLabels }) {
  const isHero = sectionContainsH1(section) || Boolean(section.tall) || (index === 0 && Boolean(section.background));
  const surface = section.tone ? toneSurface[section.tone] : "bg-background-base";
  /* Hero một cột trên ảnh nền: lớp phủ chỉ che nửa trái, chữ rộng hết khung sẽ đè lên ảnh. */
  const textOverImage = isHero && Boolean(section.background) && !section.tone && !section.widgets.some((widget) => widget.type === "columns");
  /* Cột chữ hero đã giới hạn bề rộng; lề phải Elementor (narrow) chồng thêm sẽ bóp đoạn văn còn nửa khối tiêu đề. */
  const widgets = textOverImage ? section.widgets.map((widget) => ({ ...widget, narrow: undefined })) : section.widgets;
  return (
    <section
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
      <SectionContainer
        reveal={!isHero}
        className={cn(
          "flex flex-col gap-24 md:gap-32",
          section.widgets.length === 0 && "hidden",
          textOverImage && "gap-12 md:gap-16 md:*:max-w-640",
        )}
      >
        {section.outline ? (
          <div
            className={cn(
              "flex flex-col gap-24 rounded-16 p-24 md:gap-32 md:p-40",
              toneOutline[section.outline],
              section.background && "bg-background-base shadow-md",
            )}
          >
            <Runs widgets={widgets} headingId={sectionHeadingId(section)} labels={labels} isHero={isHero} />
          </div>
        ) : (
          <Runs widgets={widgets} headingId={sectionHeadingId(section)} labels={labels} isHero={isHero} />
        )}
      </SectionContainer>
    </section>
  );
}
