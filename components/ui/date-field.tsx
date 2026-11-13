"use client";

import { useCallback, useId, useRef, useState } from "react";

import { useDismiss } from "@/hooks/use-dismiss";
import { cn } from "@/lib/cn";
import type { DateFieldLabels } from "@/types/content";
import { DatePicker } from "@/vendor/ds-one/components/DatePicker";
import { CalendarLine } from "@/vendor/ds-one/icons";

import { IconButton } from "./icon-button";

type DateFieldProps = {
  name: string;
  label: string;
  locale: string;
  labels: DateFieldLabels;
  defaultValue?: string;
  initialMonth?: string;
  className?: string;
};

function parseDay(value: string | undefined): Date | null {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

function toDay(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/* ds-one DatePicker chỉ là bảng lịch — bọc thêm ô bấm, popup và input ẩn để gửi cùng form GET. */
export function DateField({ name, label, locale, labels, defaultValue, initialMonth, className }: DateFieldProps) {
  const labelId = useId();
  const panelId = useId();
  const valueId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [selected, setSelected] = useState<Date | null>(() => parseDay(defaultValue));
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);
  const containerRef = useDismiss<HTMLDivElement>(isOpen, close);

  const displayValue = selected ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(selected) : labels.placeholder;

  return (
    <div ref={containerRef} className={cn("relative flex flex-col gap-4", className)}>
      <span id={labelId} className="text-normal-md text-text-tertiary">
        {label}
      </span>
      <div className="flex h-40 items-center rounded-8 border border-border-default bg-background-base transition-colors focus-within:border-text-primary hover:border-border-strong motion-reduce:transition-none">
        <button
          ref={triggerRef}
          type="button"
          aria-labelledby={`${labelId} ${valueId}`}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={isOpen ? panelId : undefined}
          onClick={() => setIsOpen((open) => !open)}
          className="flex h-full min-w-0 flex-1 items-center gap-8 rounded-8 px-12 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
        >
          <CalendarLine size={20} className="shrink-0 text-text-secondary" />
          <span id={valueId} className={cn("truncate text-normal-md", selected ? "text-text-primary" : "text-text-tertiary")}>
            {displayValue}
          </span>
        </button>
        {selected && (
          <IconButton
            icon="close"
            label={labels.clear}
            variant="plain"
            size="xs"
            className="mr-8"
            onClick={() => {
              setSelected(null);
              triggerRef.current?.focus();
            }}
          />
        )}
      </div>
      <input type="hidden" name={name} value={selected ? toDay(selected) : ""} />
      {isOpen && (
        <div id={panelId} role="dialog" aria-labelledby={labelId} className="absolute top-full left-0 z-30 mt-8 rounded-8 shadow-lg">
          <DatePicker
            value={selected}
            month={selected ?? parseDay(initialMonth) ?? undefined}
            locale={locale}
            previousLabel={labels.previous}
            nextLabel={labels.next}
            onChange={(value) => {
              if (value instanceof Date) {
                setSelected(value);
                close();
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
