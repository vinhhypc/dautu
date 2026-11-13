"use client";

import { type ReactNode, useId } from "react";

import { useStepAutoplay } from "@/hooks/use-step-autoplay";
import { useStepStrip } from "@/hooks/use-step-strip";
import { cn } from "@/lib/cn";
import { formatStepCounter, padStep } from "@/lib/format";

import { StepTrack } from "./step-track";

export type StepSlide = {
  label?: string;
  content: ReactNode;
};

const DEFAULT_DURATION_MS = 6000;

type StepSliderProps = {
  slides: StepSlide[];
  durationMs?: number;
  showCounter?: boolean;
  className?: string;
};

const PANEL_TRANSITION = "transition-opacity duration-500 ease-standard motion-reduce:transition-none";

type StepNavProps = {
  id: string;
  slides: StepSlide[];
  active: number;
  select: (index: number) => void;
};

function StepButton({ slide, index, isActive, onSelect, panelId }: { slide: StepSlide; index: number; isActive: boolean; onSelect: () => void; panelId: string }) {
  return (
    <button
      type="button"
      aria-current={isActive ? "step" : undefined}
      aria-controls={panelId}
      onClick={onSelect}
      className={cn(
        "relative flex w-full flex-col items-start gap-4 pt-16 pr-16 text-left transition-colors hover:text-text-primary",
        isActive ? "text-text-primary" : "text-text-tertiary",
      )}
    >
      <StepTrack isActive={isActive} className="inset-x-0" />
      <span className="text-normal-lg font-medium">{padStep(index)}</span>
      {slide.label && <span className="line-clamp-2 text-normal-md font-medium md:text-normal-lg">{slide.label}</span>}
    </button>
  );
}

/* Desktop: các bước chia đều một hàng; mobile: dải cuộn ngang bám theo bước đang chạy (như Platform của vnd-20). */
function StepNav({ id, slides, active, select }: StepNavProps) {
  const { listRef, onScroll } = useStepStrip<HTMLOListElement>(active, select);
  const panelId = (index: number) => `${id}-panel-${index}`;

  return (
    <>
      <ol className="hidden gap-24 md:flex">
        {slides.map((slide, index) => (
          <li key={index} className="flex min-w-0 flex-1">
            <StepButton slide={slide} index={index} isActive={index === active} onSelect={() => select(index)} panelId={panelId(index)} />
          </li>
        ))}
      </ol>
      <ol ref={listRef} onScroll={onScroll} className="flex snap-x snap-mandatory gap-16 overflow-x-auto [scrollbar-width:none] md:hidden">
        {slides.map((slide, index) => (
          <li key={index} className={cn("flex shrink-0 snap-start", slide.label ? "w-200" : "w-64")}>
            <StepButton slide={slide} index={index} isActive={index === active} onSelect={() => select(index)} panelId={panelId(index)} />
          </li>
        ))}
      </ol>
    </>
  );
}

export function StepSlider({ slides, durationMs = DEFAULT_DURATION_MS, showCounter = false, className }: StepSliderProps) {
  const id = `step-${useId().replace(/[^\w-]/g, "")}`;
  const { scope, active, select, pauseHandlers } = useStepAutoplay<HTMLDivElement>({ count: slides.length, durationMs });

  if (slides.length === 1) return <div className={className}>{slides[0].content}</div>;

  return (
    <div ref={scope} className={cn("flex flex-col gap-24 [--step-progress:0]", className)} {...pauseHandlers}>
      {showCounter && <p className="text-normal-lg font-medium text-text-secondary">{formatStepCounter(active, slides.length)}</p>}
      {/* Chỉ slide đang hiện chiếm chỗ — slide dài không đẩy thanh bước xuống xa. */}
      <div className="relative">
        {slides.map((slide, index) => (
          <div
            key={index}
            id={`${id}-panel-${index}`}
            inert={index !== active}
            aria-hidden={index !== active}
            className={cn("min-w-0", PANEL_TRANSITION, index === active ? "relative opacity-100" : "absolute inset-x-0 top-0 opacity-0")}
          >
            {slide.content}
          </div>
        ))}
      </div>
      <StepNav id={id} slides={slides} active={active} select={select} />
    </div>
  );
}
