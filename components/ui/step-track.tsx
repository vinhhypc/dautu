import { cn } from "@/lib/cn";

type StepTrackProps = {
  isActive: boolean;
  className?: string;
};

export function StepTrack({ isActive, className }: StepTrackProps) {
  return (
    <span aria-hidden="true" className={cn("absolute top-0 h-px bg-border-default", className)}>
      <span
        className={cn(
          "absolute top-0 left-0 h-2 w-full origin-left bg-text-primary",
          isActive ? "scale-x-(--step-progress)" : "scale-x-0",
        )}
      />
    </span>
  );
}
