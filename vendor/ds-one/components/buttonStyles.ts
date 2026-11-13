'use client';

import { cva } from 'class-variance-authority';
import { cn } from '../utils/cn';

export const HIERARCHIES = [
  'primary',
  'secondary',
  'tertiary',
  'subtle',
  'link',
  'link-subtle',
] as const;
export type ButtonVariant = (typeof HIERARCHIES)[number];

export const INTENTS = ['brand', 'negative', 'positive'] as const;
export type ButtonIntent = (typeof INTENTS)[number];

export const BUTTON_SIZES = ['prominent', 'regular', 'compact', 'dense'] as const;
export type ButtonSize = (typeof BUTTON_SIZES)[number];

export const BUTTON_RADII = ['default', 'full'] as const;
export type ButtonRadius = (typeof BUTTON_RADII)[number];

// GAP: the Figma set defines no Focus state or focus paint.
export const BUTTON_STATES = ['Default', 'Hover', 'Pressed', 'Disabled'] as const;
export type ButtonState = (typeof BUTTON_STATES)[number];

const INTENT_COLOR = {
  brand: 'brand-primary',
  negative: 'system-red-primary',
  positive: 'system-green-primary',
} satisfies Record<ButtonIntent, string>;

const INTENT_HOVER_COLOR = {
  brand: 'brand-primary-hover',
  negative: 'system-red-primary-hover',
  positive: 'system-green-primary-hover',
} satisfies Record<ButtonIntent, string>;

const PRIMARY_SURFACE = {
  brand: 'bg-brand-primary hover:bg-brand-primary-hover data-[figma-state=Hover]:bg-brand-primary-hover active:bg-brand-primary data-[figma-state=Pressed]:bg-brand-primary',
  negative: 'bg-system-red-primary hover:bg-system-red-primary-hover data-[figma-state=Hover]:bg-system-red-primary-hover active:bg-system-red-primary data-[figma-state=Pressed]:bg-system-red-primary',
  positive: 'bg-system-green-primary hover:bg-system-green-primary-hover data-[figma-state=Hover]:bg-system-green-primary-hover active:bg-system-green-primary data-[figma-state=Pressed]:bg-system-green-primary',
} satisfies Record<ButtonIntent, string>;

const SECONDARY_SURFACE = {
  brand: 'bg-brand-secondary hover:bg-brand-secondary-hover data-[figma-state=Hover]:bg-brand-secondary-hover active:bg-brand-secondary data-[figma-state=Pressed]:bg-brand-secondary',
  negative: 'bg-system-red-secondary hover:bg-system-red-secondary-hover data-[figma-state=Hover]:bg-system-red-secondary-hover active:bg-system-red-secondary data-[figma-state=Pressed]:bg-system-red-secondary',
  positive: 'bg-system-green-secondary hover:bg-system-green-secondary-hover data-[figma-state=Hover]:bg-system-green-secondary-hover active:bg-system-green-secondary data-[figma-state=Pressed]:bg-system-green-secondary',
} satisfies Record<ButtonIntent, string>;

const TERTIARY_STROKE = {
  brand: 'shadow-[inset_0_0_0_var(--border-width-2)_var(--color-brand-primary)] hover:shadow-[inset_0_0_0_var(--border-width-2)_var(--color-brand-primary)] data-[figma-state=Hover]:shadow-[inset_0_0_0_var(--border-width-2)_var(--color-brand-primary)] active:shadow-[inset_0_0_0_var(--border-width-2)_var(--color-brand-primary)] data-[figma-state=Pressed]:shadow-[inset_0_0_0_var(--border-width-2)_var(--color-brand-primary)] disabled:shadow-[inset_0_0_0_var(--border-width-2)_var(--color-border-default)] aria-disabled:shadow-[inset_0_0_0_var(--border-width-2)_var(--color-border-default)]',
  negative: 'shadow-[inset_0_0_0_var(--border-width-2)_var(--color-system-red-primary)] hover:shadow-[inset_0_0_0_var(--border-width-2)_var(--color-system-red-primary)] data-[figma-state=Hover]:shadow-[inset_0_0_0_var(--border-width-2)_var(--color-system-red-primary)] active:shadow-[inset_0_0_0_var(--border-width-2)_var(--color-system-red-primary)] data-[figma-state=Pressed]:shadow-[inset_0_0_0_var(--border-width-2)_var(--color-system-red-primary)] disabled:shadow-[inset_0_0_0_var(--border-width-2)_var(--color-border-default)] aria-disabled:shadow-[inset_0_0_0_var(--border-width-2)_var(--color-border-default)]',
  positive: 'shadow-[inset_0_0_0_var(--border-width-2)_var(--color-system-green-primary)] hover:shadow-[inset_0_0_0_var(--border-width-2)_var(--color-system-green-primary)] data-[figma-state=Hover]:shadow-[inset_0_0_0_var(--border-width-2)_var(--color-system-green-primary)] active:shadow-[inset_0_0_0_var(--border-width-2)_var(--color-system-green-primary)] data-[figma-state=Pressed]:shadow-[inset_0_0_0_var(--border-width-2)_var(--color-system-green-primary)] disabled:shadow-[inset_0_0_0_var(--border-width-2)_var(--color-border-default)] aria-disabled:shadow-[inset_0_0_0_var(--border-width-2)_var(--color-border-default)]',
} satisfies Record<ButtonIntent, string>;

const SUBTLE_SURFACE = 'bg-background-surface hover:bg-background-hover data-[figma-state=Hover]:bg-background-hover active:bg-background-surface data-[figma-state=Pressed]:bg-background-surface';

/** Surface classes shared by Button and IconButton. */
export const SURFACE: Record<ButtonVariant, Record<ButtonIntent, string>> = {
  primary: PRIMARY_SURFACE,
  secondary: SECONDARY_SURFACE,
  tertiary: {
    brand: `bg-transparent hover:bg-background-hover data-[figma-state=Hover]:bg-background-hover active:bg-transparent data-[figma-state=Pressed]:bg-transparent ${TERTIARY_STROKE.brand}`,
    negative: `bg-transparent hover:bg-background-hover data-[figma-state=Hover]:bg-background-hover active:bg-transparent data-[figma-state=Pressed]:bg-transparent ${TERTIARY_STROKE.negative}`,
    positive: `bg-transparent hover:bg-background-hover data-[figma-state=Hover]:bg-background-hover active:bg-transparent data-[figma-state=Pressed]:bg-transparent ${TERTIARY_STROKE.positive}`,
  },
  subtle: {
    brand: SUBTLE_SURFACE,
    negative: SUBTLE_SURFACE,
    positive: SUBTLE_SURFACE,
  },
  link: { brand: 'bg-transparent', negative: 'bg-transparent', positive: 'bg-transparent' },
  'link-subtle': { brand: 'bg-transparent', negative: 'bg-transparent', positive: 'bg-transparent' },
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  prominent: 'gap-8 px-24 py-12',
  regular: 'gap-8 px-16 py-8',
  compact: 'gap-8 px-16 py-8',
  dense: 'gap-8 px-12 py-6',
};

const ICON_ONLY_CLASS: Record<ButtonSize, string> = {
  prominent: 'px-12',
  regular: 'px-8',
  compact: 'px-8',
  dense: 'px-6',
};

const INTENT_TEXT_CLASS: Record<ButtonIntent, string> = {
  brand: 'text-brand-primary hover:text-brand-primary-hover data-[figma-state=Hover]:text-brand-primary-hover active:text-brand-primary data-[figma-state=Pressed]:text-brand-primary',
  negative: 'text-system-red-primary hover:text-system-red-primary-hover data-[figma-state=Hover]:text-system-red-primary-hover active:text-system-red-primary data-[figma-state=Pressed]:text-system-red-primary',
  positive: 'text-system-green-primary hover:text-system-green-primary-hover data-[figma-state=Hover]:text-system-green-primary-hover active:text-system-green-primary data-[figma-state=Pressed]:text-system-green-primary',
};

const DISABLED_TEXT = 'disabled:text-text-disabled aria-disabled:text-text-disabled';
const DISABLED_SURFACE = 'disabled:bg-background-disabled aria-disabled:bg-background-disabled';

const base = [
  'group relative flex w-fit shrink-0 items-center justify-center border-0 bg-transparent font-plain whitespace-nowrap',
  'cursor-pointer disabled:pointer-events-none aria-disabled:pointer-events-none',
];

const buttonVariantsCva = cva(base, {
  variants: {
    variant: {
      primary: '', secondary: '', tertiary: '', subtle: '', link: '', 'link-subtle': '',
    },
    intent: { brand: '', negative: '', positive: '' },
    size: {
      prominent: 'text-webtrading-body-2-highlight',
      regular: 'text-webtrading-body-3-highlight',
      compact: 'text-webtrading-body-3-highlight',
      dense: 'text-webtrading-body-3-highlight',
    },
    radius: { default: 'rounded-4', full: 'rounded-1000' },
    iconOnly: { true: '', false: '' },
  },
  defaultVariants: { variant: 'primary', intent: 'brand', size: 'regular', radius: 'default', iconOnly: false },
});

type ButtonClassOptions = {
  variant?: ButtonVariant | null;
  intent?: ButtonIntent | null;
  size?: ButtonSize | null;
  radius?: ButtonRadius | null;
  iconOnly?: boolean | null;
  state?: ButtonState | null;
};

function stateSurface(variant: ButtonVariant, intent: ButtonIntent): string {
  const link = variant === 'link' || variant === 'link-subtle';
  const hasDisabledFill = variant === 'primary' || variant === 'secondary' || variant === 'subtle';
  return `${SURFACE[variant][intent]} ${!link && hasDisabledFill ? DISABLED_SURFACE : ''}`;
}

function stateText(variant: ButtonVariant, intent: ButtonIntent): string {
  if (variant === 'primary') return `text-text-inverse ${DISABLED_TEXT}`;
  if (variant === 'subtle') return `text-text-primary ${DISABLED_TEXT}`;
  if (variant === 'link-subtle') {
    return `text-text-primary hover:text-text-secondary data-[figma-state=Hover]:text-text-secondary active:text-text-primary data-[figma-state=Pressed]:text-text-primary ${DISABLED_TEXT}`;
  }
  if (variant === 'link') return `${INTENT_TEXT_CLASS[intent]} ${DISABLED_TEXT}`;
  if (variant === 'secondary' || variant === 'tertiary') return `text-${INTENT_COLOR[intent]} ${DISABLED_TEXT}`;
  return `${INTENT_TEXT_CLASS[intent]} ${DISABLED_TEXT}`;
}

export function buttonTextboxVariants(variant: ButtonVariant, intent: ButtonIntent): string {
  if (variant === 'link-subtle') {
    return 'group-hover:shadow-[inset_0_calc(var(--spacing-2)*-1)_0_var(--color-text-secondary)] group-data-[figma-state=Hover]:shadow-[inset_0_calc(var(--spacing-2)*-1)_0_var(--color-text-secondary)] group-active:shadow-[inset_0_calc(var(--border-width-2)*-1)_0_var(--color-text-primary)] group-data-[figma-state=Pressed]:shadow-[inset_0_calc(var(--border-width-2)*-1)_0_var(--color-text-primary)]';
  }
  if (variant !== 'link') return '';
  const color = INTENT_COLOR[intent];
  const hover = INTENT_HOVER_COLOR[intent];
  return `group-hover:shadow-[inset_0_calc(var(--spacing-2)*-1)_0_var(--color-${hover})] group-data-[figma-state=Hover]:shadow-[inset_0_calc(var(--spacing-2)*-1)_0_var(--color-${hover})] group-active:shadow-[inset_0_calc(var(--spacing-2)*-1)_0_var(--color-${color})] group-data-[figma-state=Pressed]:shadow-[inset_0_calc(var(--spacing-2)*-1)_0_var(--color-${color})]`;
}

export function buttonVariants({
  variant: variantInput,
  intent: intentInput,
  size: sizeInput,
  radius: radiusInput,
  iconOnly = false,
}: ButtonClassOptions = {}) {
  const variant = variantInput ?? 'primary';
  const intent = intentInput ?? 'brand';
  const size = sizeInput ?? 'regular';
  const radius = radiusInput ?? 'default';
  const isLink = variant === 'link' || variant === 'link-subtle';

  return cn(
    buttonVariantsCva({ variant, intent, size, radius, iconOnly }),
    SIZE_CLASS[size],
    isLink ? 'p-0' : stateSurface(variant, intent),
    stateText(variant, intent),
    iconOnly && !isLink ? ICON_ONLY_CLASS[size] : '',
  );
}

export const ICON_SIZE_CLASS: Record<ButtonSize, string> = {
  prominent: 'size-[var(--font-size-large-sm)]',
  regular: 'size-[var(--font-size-large-sm)]',
  compact: 'size-[var(--font-size-normal-xl)]',
  dense: 'size-[var(--font-size-normal-xl)]',
};

function iconButtonStateSurface(variant: ButtonVariant, intent: ButtonIntent): string {
  const legacySurface: Record<ButtonVariant, Record<ButtonIntent, string>> = {
    primary: PRIMARY_SURFACE,
    secondary: SECONDARY_SURFACE,
    tertiary: {
      brand: 'bg-background-canvas hover:bg-background-hover active:bg-background-canvas',
      negative: 'bg-background-canvas hover:bg-background-hover active:bg-background-canvas',
      positive: 'bg-background-canvas hover:bg-background-hover active:bg-background-canvas',
    },
    subtle: {
      brand: 'bg-background-surface hover:bg-background-hover active:bg-background-surface',
      negative: 'bg-background-surface hover:bg-background-hover active:bg-background-surface',
      positive: 'bg-background-surface hover:bg-background-hover active:bg-background-surface',
    },
    link: { brand: 'bg-transparent', negative: 'bg-transparent', positive: 'bg-transparent' },
    'link-subtle': { brand: 'bg-transparent', negative: 'bg-transparent', positive: 'bg-transparent' },
  };
  const isLink = variant === 'link' || variant === 'link-subtle';
  return `${legacySurface[variant][intent]} ${isLink ? '' : DISABLED_SURFACE}`;
}

function iconButtonStateText(variant: ButtonVariant, intent: ButtonIntent): string {
  if (variant === 'primary') return `text-text-inverse ${DISABLED_TEXT}`;
  if (variant === 'subtle') return `text-text-primary ${DISABLED_TEXT}`;
  if (variant === 'link-subtle') {
    return `text-text-primary hover:text-text-secondary active:text-text-primary ${DISABLED_TEXT}`;
  }
  if (variant === 'link') return `${INTENT_TEXT_CLASS[intent]} ${DISABLED_TEXT}`;
  return `text-${INTENT_COLOR[intent]} ${DISABLED_TEXT}`;
}

const iconButtonVariantsCva = cva(
  'relative flex aspect-square w-fit shrink-0 items-center justify-center border-0 bg-transparent font-plain cursor-pointer disabled:pointer-events-none aria-disabled:pointer-events-none',
  {
    variants: {
      size: {
        prominent: 'size-48', regular: 'size-40', compact: 'size-36', dense: 'size-32',
      },
      variant: {
        primary: '', secondary: '', tertiary: '', subtle: '', link: '', 'link-subtle': '',
      },
      intent: { brand: '', negative: '', positive: '' },
      radius: { default: 'rounded-4', full: 'rounded-1000' },
    },
    defaultVariants: { variant: 'primary', intent: 'brand', size: 'regular', radius: 'default' },
  },
);

type IconButtonClassOptions = ButtonClassOptions;
export function iconButtonVariants({
  variant: variantInput,
  intent: intentInput,
  size: sizeInput,
  radius: radiusInput,
}: IconButtonClassOptions = {}) {
  const variant = variantInput ?? 'primary';
  const intent = intentInput ?? 'brand';
  const size = sizeInput ?? 'regular';
  const radius = radiusInput ?? 'default';
  return cn(
    iconButtonVariantsCva({ variant, intent, size, radius }),
    iconButtonStateSurface(variant, intent),
    iconButtonStateText(variant, intent),
  );
}
