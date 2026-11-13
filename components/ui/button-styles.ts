import { cn } from "@/vendor/ds-one/utils/cn";
import {
  ICON_SIZE_CLASS,
  buttonTextboxVariants,
  buttonVariants,
  iconButtonVariants,
  type ButtonIntent as DsButtonIntent,
  type ButtonSize as DsButtonSize,
  type ButtonVariant as DsButtonVariant,
} from "@/vendor/ds-one/components/buttonStyles";

import type { ButtonSize, ButtonVariant, IconButtonSize, IconButtonVariant } from "@/types/content";

export const DS_BUTTON_VARIANT: Record<ButtonVariant, { variant: DsButtonVariant; intent: DsButtonIntent }> = {
  primary: { variant: "primary", intent: "brand" },
  secondary: { variant: "secondary", intent: "brand" },
  neutral: { variant: "subtle", intent: "brand" },
  ghost: { variant: "link-subtle", intent: "brand" },
  link: { variant: "link", intent: "brand" },
  destructive: { variant: "primary", intent: "negative" },
};

export const DS_BUTTON_SIZE: Record<ButtonSize, DsButtonSize> = {
  sm: "compact",
  md: "regular",
  lg: "prominent",
  responsive: "regular",
};

/* Size "responsive": ds-one không có size theo breakpoint → thêm class của Prominent ở lg. */
const RESPONSIVE_ROOT = "lg:gap-8 lg:px-24 lg:py-12 lg:text-webtrading-body-2-highlight";
const RESPONSIVE_TEXTBOX =
  "lg:pt-[var(--brand-spacing-textbox-regular-top)] lg:pb-[var(--brand-spacing-textbox-regular-bottom)]";

const TEXTBOX_PADDING: Record<DsButtonSize, string> = {
  prominent: "pt-[var(--brand-spacing-textbox-regular-top)] pb-[var(--brand-spacing-textbox-regular-bottom)]",
  regular: "pt-[var(--brand-spacing-textbox-large-top)] pb-[var(--brand-spacing-textbox-large-bottom)]",
  compact: "pt-[var(--brand-spacing-textbox-regular-top)] pb-[var(--brand-spacing-textbox-regular-bottom)]",
  dense: "pt-[var(--brand-spacing-textbox-regular-top)] pb-[var(--brand-spacing-textbox-regular-bottom)]",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    buttonVariants({ ...DS_BUTTON_VARIANT[variant], size: DS_BUTTON_SIZE[size] }),
    size === "responsive" && RESPONSIVE_ROOT,
    className,
  );
}

export function buttonTextboxClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md") {
  const { variant: dsVariant, intent } = DS_BUTTON_VARIANT[variant];
  return cn(
    "flex items-center justify-center",
    buttonTextboxVariants(dsVariant, intent),
    TEXTBOX_PADDING[DS_BUTTON_SIZE[size]],
    size === "responsive" && RESPONSIVE_TEXTBOX,
  );
}

export function buttonIconClasses(size: ButtonSize = "md") {
  return cn("relative flex shrink-0 items-center justify-center", ICON_SIZE_CLASS[DS_BUTTON_SIZE[size]]);
}

const DS_ICON_VARIANT: Record<IconButtonVariant, DsButtonVariant> = {
  neutral: "subtle",
  plain: "link-subtle",
};

const DS_ICON_SIZE: Record<Exclude<IconButtonSize, "xs">, DsButtonSize> = {
  md: "regular",
  lg: "prominent",
  responsive: "regular",
};

export function iconButtonClasses(
  variant: IconButtonVariant = "neutral",
  size: IconButtonSize = "md",
  className?: string,
) {
  if (size === "xs") {
    return cn(
      "inline-flex size-20 shrink-0 items-center justify-center rounded-4 text-text-primary transition-colors hover:text-brand-primary motion-reduce:transition-none",
      className,
    );
  }
  return cn(
    iconButtonVariants({ variant: DS_ICON_VARIANT[variant], intent: "brand", size: DS_ICON_SIZE[size] }),
    size === "responsive" && "lg:size-48 lg:px-12",
    className,
  );
}

export function iconButtonIconClasses(size: IconButtonSize = "md") {
  return size === "xs" ? "size-20" : "size-24";
}
