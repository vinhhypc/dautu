import { padStep } from "@/lib/format";
import type { FaqContent, FaqItem } from "@/types/content";

import { Reveal } from "../motion/reveal";
import { Icon } from "../ui/icon";
import { SectionMeta } from "../ui/section-meta";

type FaqRowProps = {
  item: FaqItem;
  index: number;
  group: string;
};

/* Padding summary thay margin âm (overflow: hidden của ::details-content cắt dòng đầu); flex-1 thay h-full để câu trả lời đang thu không bị đẩy ra. */
const OPEN_TRANSITION = "duration-300 ease-standard motion-reduce:transition-none";

function FaqRow({ item, index, group }: FaqRowProps) {
  return (
    <details name={group} className="faq-item group border-b border-border-subtle xl:flex xl:flex-1 xl:flex-col xl:last:border-b-0">
      <summary
        className={`flex cursor-pointer list-none items-start gap-16 py-20 transition-[padding,background-color] group-[:not([open])]:hover:bg-background-canvas group-open:pb-8 xl:flex-1 xl:items-center xl:gap-0 xl:px-32 xl:py-24 xl:group-open:pb-12 [&::-webkit-details-marker]:hidden ${OPEN_TRANSITION}`}
      >
        <span className="hidden w-72 shrink-0 text-normal-lg font-medium text-text-tertiary xl:block">{padStep(index)}</span>
        <h3 className="min-w-0 flex-1 text-normal-lg font-medium text-text-primary xl:text-normal-xl">{item.question}</h3>
        <span className="flex shrink-0 justify-end xl:w-48">
          <Icon name="chevron-down" className={`text-text-primary transition-transform group-open:rotate-180 ${OPEN_TRANSITION}`} />
        </span>
      </summary>
      <p className="pr-36 pb-20 text-normal-l whitespace-pre-line text-text-secondary xl:pr-80 xl:pb-24 xl:pl-104 xl:text-normal-xl">
        {item.answer}
      </p>
    </details>
  );
}

export function Faq({ id, meta, title, highlight, description, columns, items, support }: FaqContent) {
  const headingId = `${id}-title`;
  const group = `${id}-items`;

  return (
    <section id={id} aria-labelledby={headingId} className="flex flex-col pb-64 xl:pb-120">
      <SectionMeta {...meta} />
      <div className="flex flex-col gap-40 px-16 pt-64 xl:gap-64 xl:px-24 xl:pt-96">
        <Reveal className="flex flex-col items-center gap-16 text-center xl:gap-24">
          <h2 id={headingId} className="text-large-lg font-semibold text-text-primary xl:text-hero-lg">
            {title} <span className="xl:text-brand-primary">{highlight}</span>
          </h2>
          <p className="max-w-720 text-normal-l text-text-secondary xl:text-normal-xl">{description}</p>
        </Reveal>

        <div className="flex flex-col gap-40 xl:flex-row xl:gap-0 xl:border-y xl:border-border-subtle">
          <div className="border-t border-border-subtle xl:order-last xl:flex xl:min-w-0 xl:flex-1 xl:flex-col xl:border-t-0 xl:border-l">
            <div className="hidden border-b border-border-subtle px-32 py-16 text-normal-lg text-text-tertiary xl:flex">
              <span className="w-72 shrink-0">{columns.index}</span>
              <span>{columns.question}</span>
            </div>
            {items.map((item, index) => (
              <FaqRow key={item.question} item={item} index={index} group={group} />
            ))}
          </div>

          <aside className="flex flex-col gap-12 bg-background-surface px-16 py-20 xl:w-1/3 xl:shrink-0 xl:gap-24 xl:p-32">
            <p className="hidden text-normal-lg font-medium text-text-tertiary xl:block">{support.label}</p>
            <div aria-hidden="true" className="hidden flex-1 xl:block" />
            <p className="text-normal-xl font-semibold text-text-primary xl:text-large-xl">{support.title}</p>
            <a
              href={support.cta.href}
              className="flex items-center justify-between border-t border-border-subtle pt-12 text-normal-md font-medium text-text-secondary transition-colors hover:text-text-primary xl:pt-24"
            >
              {support.cta.label}
              <Icon name="arrow-right-up" className="text-text-primary" />
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}
