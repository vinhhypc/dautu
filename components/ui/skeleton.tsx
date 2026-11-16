import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-8 bg-background-hover motion-reduce:animate-none", className)} />;
}

type FormSkeletonProps = { fieldCount?: number; className?: string };

export function FormSkeleton({ fieldCount = 3, className }: FormSkeletonProps) {
  return (
    <div aria-hidden="true" className={cn("flex w-full flex-col gap-24", className)}>
      {Array.from({ length: fieldCount }, (_, index) => (
        <div key={index} className="flex flex-col gap-8">
          <Skeleton className="h-16 w-1/3 max-w-160" />
          <Skeleton className="h-48 w-full" />
        </div>
      ))}
      <Skeleton className="h-48 w-160" />
    </div>
  );
}

export function EmbedSkeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("flex size-full flex-col gap-16 p-24", className)}>
      <Skeleton className="h-24 w-1/2" />
      <Skeleton className="h-16 w-3/4" />
      <Skeleton className="min-h-120 w-full flex-1" />
    </div>
  );
}
