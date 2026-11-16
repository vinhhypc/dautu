import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { widthFractionClass } from "@/lib/fraction";
import { linkHost, sheetChartImageSrc } from "@/lib/image";
import { splitHotlines } from "@/lib/phone";
import type { RichBlock, RichInline, RichTableCell, RichTextLabels } from "@/types/content";

import { ButtonLink } from "../ui/button";
import { Disclosure } from "../ui/disclosure";
import { RouteLink } from "../ui/route-link";
import { EmbedSkeleton } from "../ui/skeleton";
import { TextLink } from "../ui/text-link";
import { WpImage } from "../ui/wp-image";

/* Chiều cao iframe theo thuộc tính height của WP → bậc gần nhất. */
function embedHeight(height?: number) {
  if (!height) return "h-720";
  if (height <= 260) return "h-240";
  if (height <= 420) return "h-400";
  if (height <= 600) return "h-560";
  return "h-720";
}

function Inlines({ items, inLink = false }: { items: RichInline[]; inLink?: boolean }) {
  return items.map((item, index) => <InlineNode key={index} item={item} inLink={inLink} />);
}

function TextWithHotlines({ value }: { value: string }) {
  return splitHotlines(value).map((part, index) =>
    part.tel ? (
      <RouteLink key={index} href={part.tel} className="link-text whitespace-nowrap">
        {part.text}
      </RouteLink>
    ) : (
      part.text
    ),
  );
}

function InlineNode({ item, inLink }: { item: RichInline; inLink: boolean }): ReactNode {
  switch (item.type) {
    case "text":
      return inLink ? item.value : <TextWithHotlines value={item.value} />;
    case "break":
      return <br />;
    case "strong":
      return (
        <strong className="font-semibold text-text-primary">
          <Inlines items={item.children} inLink={inLink} />
        </strong>
      );
    case "em":
      return (
        <em>
          <Inlines items={item.children} inLink={inLink} />
        </em>
      );
    case "link":
      return (
        <RouteLink href={item.href} className="link-text break-words">
          <Inlines items={item.children} inLink />
        </RouteLink>
      );
  }
}

function TableCell({ cell, labels }: { cell: RichTableCell; labels: RichTextLabels }) {
  const Tag = cell.header ? "th" : "td";
  return (
    <Tag
      colSpan={cell.colSpan}
      rowSpan={cell.rowSpan}
      className={cn(
        "border border-border-subtle px-16 py-12 text-left align-top",
        cell.header ? "bg-background-surface font-semibold text-text-primary" : "text-text-secondary",
      )}
    >
      <RichText blocks={cell.children} labels={labels} compact />
    </Tag>
  );
}

const MIN_STACK_COLUMNS = 3;

/* Bảng so sánh (hàng đầu là tên cột, cột đầu là nhãn hàng, không gộp ô) mới chuyển được thành thẻ trên mobile. */
function isComparisonGrid(rows: RichTableCell[][]) {
  const width = rows[0]?.length ?? 0;
  return (
    rows.length >= 2 &&
    width >= MIN_STACK_COLUMNS &&
    rows.every((row) => row.length === width && row.every((cell) => (cell.colSpan ?? 1) === 1 && (cell.rowSpan ?? 1) === 1))
  );
}

const hasContent = (cell?: RichTableCell) => Boolean(cell && cell.children.length > 0);

/* Bảng nhiều cột trên màn hẹp: mỗi cột thành một thẻ, mỗi hàng thành cặp nhãn – giá trị (cột ~150px không đọc được). */
function StackedTable({ rows, labels }: { rows: RichTableCell[][]; labels: RichTextLabels }) {
  const [head, ...body] = rows;
  return (
    <div className="flex flex-col gap-16 md:hidden">
      {head.slice(1).map((title, offset) => {
        const column = offset + 1;
        return (
          <div key={column} className="flex flex-col gap-12 rounded-8 border border-border-subtle p-16">
            {hasContent(title) && (
              <div className="text-normal-lg font-semibold text-text-primary">
                <RichText blocks={title.children} labels={labels} compact />
              </div>
            )}
            <dl className="flex flex-col gap-12">
              {body.map((row, rowIndex) =>
                hasContent(row[column]) ? (
                  <div key={rowIndex} className="flex flex-col gap-4">
                    {hasContent(row[0]) && (
                      <dt className="text-normal-l font-medium text-text-tertiary">
                        <RichText blocks={row[0].children} labels={labels} compact />
                      </dt>
                    )}
                    <dd className="text-text-secondary">
                      <RichText blocks={row[column].children} labels={labels} compact />
                    </dd>
                  </div>
                ) : null,
              )}
            </dl>
          </div>
        );
      })}
    </div>
  );
}

type ImageBlock = Extract<RichBlock, { type: "image" }>;

/* Icon nhỏ (width ≤ 1/3) đứng liền nhau — vd. SoundCloud/YouTube/Facebook trong cùng đoạn — hiển thị cùng một hàng như WordPress. */
function groupImageRows(blocks: RichBlock[]): (RichBlock | ImageBlock[])[] {
  const result: (RichBlock | ImageBlock[])[] = [];
  for (const block of blocks) {
    const isIcon = block.type === "image" && block.scale !== undefined && block.scale <= 1 / 3;
    const last = result.at(-1);
    if (isIcon && Array.isArray(last)) last.push(block as ImageBlock);
    else if (isIcon) result.push([block as ImageBlock]);
    else result.push(block);
  }
  return result.map((group) => (Array.isArray(group) && group.length === 1 ? group[0] : group));
}

const SMALL_ICON_SCALE = 0.15;

function isSmallIcon(block: ImageBlock): boolean {
  return (block.scale ?? 0) <= SMALL_ICON_SCALE;
}

const ALIGN = { center: "self-center text-center", right: "self-end text-right" } as const;

type BlockProps = { block: RichBlock; compact: boolean; wide: boolean; labels: RichTextLabels };

function Block({ block, compact, wide, labels }: BlockProps): ReactNode {
  switch (block.type) {
    case "heading": {
      const Tag = `h${block.level}` as const;
      return (
        <Tag
          id={block.id}
          className={cn(
            "scroll-mt-96 font-semibold text-text-primary",
            block.align && ALIGN[block.align],
            block.level === 2 && "mt-16 text-large-sm md:text-large-md",
            block.level === 3 && "mt-8 text-normal-xl",
            block.level === 4 && "text-normal-lg",
          )}
        >
          <Inlines items={block.children} />
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p className={cn(!compact && !wide && "max-w-prose", block.align && ALIGN[block.align])}>
          <Inlines items={block.children} />
        </p>
      );
    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag
          start={block.start}
          className={cn("flex flex-col gap-8 pl-24", block.ordered ? "list-decimal" : "list-disc", "marker:text-brand-primary")}
        >
          {block.items.map((item, index) => (
            <li key={index} className="pl-4">
              <RichText blocks={item} labels={labels} wide={wide} className="gap-8" />
            </li>
          ))}
        </Tag>
      );
    }
    case "table": {
      const stacked = isComparisonGrid(block.rows);
      return (
        <>
          {stacked && <StackedTable rows={block.rows} labels={labels} />}
          <div className={cn("max-w-full overflow-x-auto rounded-8 border border-border-subtle", stacked && "max-md:hidden")}>
            <table className="w-full border-collapse text-normal-l">
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex} cell={cell} labels={labels} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    }
    case "image": {
      const image = (
        // eslint-disable-next-line @next/next/no-img-element -- ảnh trong nội dung WordPress giữ link gốc, không biết trước kích thước (ngoại lệ K6, docs/research/site/migration-plan.md).
        <img
          src={block.src}
          alt={block.alt}
          width={block.width}
          height={block.height}
          loading="lazy"
          decoding="async"
          className={cn("h-auto max-w-full rounded-8", block.scale && !block.href && widthFractionClass(block.scale))}
        />
      );
      return block.href ? (
        <RouteLink
          href={block.href}
          aria-label={block.alt ? undefined : linkHost(block.href)}
          className={cn("block rounded-8 transition-opacity hover:opacity-90", block.scale && widthFractionClass(block.scale))}
        >
          {image}
        </RouteLink>
      ) : (
        image
      );
    }
    case "video":
      return (
        <div className="relative aspect-video w-full max-w-720 overflow-hidden rounded-12 bg-background-inverse">
          <iframe
            src={block.src}
            title={block.title}
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        </div>
      );
    /* Biểu đồ Google Sheets, form mở tài khoản tải 5–10 giây: skeleton nằm dưới iframe (nền trong suốt) đến khi nội dung vẽ đè lên. */
    case "embed": {
      const chartImage = block.chart ?? sheetChartImageSrc(block.src);
      if (chartImage)
        return (
          <div className="flex w-full flex-col gap-8">
            <div className="relative isolate min-h-160 overflow-hidden rounded-12 border border-border-subtle bg-background-base">
              <EmbedSkeleton className="absolute inset-0 -z-10" />
              <WpImage image={{ src: chartImage, alt: block.title }} sizes="100vw" className="w-full bg-background-base" />
            </div>
            <TextLink href={block.src} trailingIcon="arrow-right-up" className="self-end">
              {labels.openEmbed}
            </TextLink>
          </div>
        );
      return (
        <div className={cn("flex w-full flex-col gap-8", !block.wide && "max-w-720")}>
          <div className={cn("relative isolate overflow-hidden rounded-12 border border-border-subtle bg-background-base", embedHeight(block.height))}>
            <EmbedSkeleton className="absolute inset-0 -z-10" />
            <p className="sr-only">{labels.embedLoading}</p>
            <iframe src={block.src} title={block.title} loading="lazy" className="size-full" />
          </div>
          <TextLink href={block.src} trailingIcon="arrow-right-up" className="self-end">
            {labels.openEmbed}
          </TextLink>
        </div>
      );
    }
    case "disclosure":
      return (
        <Disclosure id={block.id} title={<Inlines items={block.title} inLink />}>
          <RichText blocks={block.children} labels={labels} wide={wide} />
        </Disclosure>
      );
    case "pdf":
      /* static-02 gửi X-Frame-Options: SAMEORIGIN nên không nhúng xem trong trang được — mở PDF ở tab mới. */
      return (
        <div className="flex flex-col gap-16 rounded-12 border border-border-subtle bg-background-surface p-16 sm:flex-row sm:items-center sm:justify-between md:p-24">
          <p className="min-w-0 break-words text-normal-lg font-medium text-text-primary">{block.title}</p>
          <ButtonLink href={block.src} variant="primary" trailingIcon="arrow-right-up" className="shrink-0">
            {labels.openPdf}
          </ButtonLink>
        </div>
      );
    case "rule":
      return <hr className="border-border-subtle" />;
  }
}

/* wide: nội dung trang WordPress — chữ đậm màu, đoạn văn trải hết cột như trang gốc (không giới hạn max-w-prose). */
type RichTextProps = {
  blocks: RichBlock[];
  labels: RichTextLabels;
  compact?: boolean;
  wide?: boolean;
  className?: string;
};

export function RichText({ blocks, labels, compact = false, wide = false, className }: RichTextProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col",
        wide ? "text-text-primary" : "text-text-secondary",
        compact ? "gap-8 text-normal-l" : "gap-16 text-normal-lg",
        /* ds-one không có leading-relaxed/normal — chỉ có bậc px; đặt sau cỡ chữ vì tailwind-merge bỏ leading-* đứng trước text-normal-*. */
        wide && "leading-24",
        className,
      )}
    >
      {groupImageRows(blocks).map((group, index) =>
        Array.isArray(group) ? (
          <div key={index} className={cn("flex flex-wrap items-center gap-12", group[0].align === "center" && "justify-center")}>
            {group.map((block, item) => (
              <span key={item} className={cn("block", isSmallIcon(block) ? "size-40" : widthFractionClass(block.scale))}>
                <Block block={{ ...block, scale: undefined }} compact={compact} wide={wide} labels={labels} />
              </span>
            ))}
          </div>
        ) : (
          <Block key={index} block={group} compact={compact} wide={wide} labels={labels} />
        ),
      )}
    </div>
  );
}
