import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type InputVariant = "underline";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  variant?: InputVariant;
  endAdornment?: ReactNode;
  wrapperClassName?: string;
};

const wrappers: Record<InputVariant, string> = {
  underline:
    "border-b border-border-strong pt-8 pb-12 transition-colors focus-within:border-text-primary has-[input[aria-invalid=true]]:border-system-red-primary motion-reduce:transition-none",
};

export function Input({ variant = "underline", endAdornment, wrapperClassName, className, ...rest }: InputProps) {
  return (
    <div className={cn("flex w-full items-center gap-12", wrappers[variant], wrapperClassName)}>
      <input
        className={cn(
          "min-w-0 flex-1 bg-transparent text-text-primary placeholder:text-text-tertiary focus:outline-none disabled:opacity-50",
          className,
        )}
        {...rest}
      />
      {endAdornment}
    </div>
  );
}
