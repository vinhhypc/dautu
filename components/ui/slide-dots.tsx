import { cn } from "@/lib/cn";

type SlideDotsProps = {
  count: number;
  active: number;
  onSelect: (index: number) => void;
  getLabel: (index: number) => string;
  className?: string;
};

export function SlideDots({ count, active, onSelect, getLabel, className }: SlideDotsProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      {Array.from({ length: count }, (_, index) => {
        const isActive = index === active;
        return (
          <button
            key={index}
            type="button"
            aria-label={getLabel(index)}
            aria-current={isActive || undefined}
            onClick={() => onSelect(index)}
            className="group flex size-24 items-center justify-center rounded-1000 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-12 rounded-1000 border border-border-default shadow-sm transition-[background-color,transform] duration-200 ease-standard group-hover:scale-110 group-active:scale-95 motion-reduce:transition-none",
                isActive ? "bg-text-secondary" : "bg-background-base",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
