'use client';

import { cloneElement, isValidElement, type ComponentProps, type CSSProperties, type ReactElement, type ReactNode } from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { CircleLine } from '../icons/index';
import { cn } from '../utils/cn';
import {
  ICON_SIZE_CLASS,
  buttonVariants,
  buttonTextboxVariants,
  type ButtonIntent,
  type ButtonRadius,
  type ButtonSize,
  type ButtonState,
  type ButtonVariant,
} from './buttonStyles';

export type ButtonProps = Omit<ComponentProps<'button'>, 'size'> & {
  /** Figma Hierarchy; `link-subtle` maps to Figma's `Link subtle`. */
  variant?: ButtonVariant;
  intent?: ButtonIntent;
  size?: ButtonSize;
  radius?: ButtonRadius;
  iconOnly?: boolean;
  /** Figma `Icon leading` visibility property. Icon-only variants always keep their leading icon. */
  iconLeading?: boolean;
  /** Figma `Icon leading swap` property; defaults to the mapped Circle Line component. */
  iconLeadingSwap?: ReactNode;
  /** Figma `Icon trailing` visibility property. */
  iconTrailing?: boolean;
  /** Figma `Icon trailing swap` property; defaults to the mapped Circle Line component. */
  iconTrailingSwap?: ReactNode;
  /** Existing icon slot props remain supported as aliases for the swap properties. */
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /** Figma `Label` text property. Explicit React children take precedence. */
  label?: string;
  asChild?: boolean;
  /** Force a Figma interaction state in a static story. */
  state?: ButtonState;
  /** Compatibility for existing static stories. */
  forceState?: 'Hover' | 'Pressed';
  /** Existing Figma part instrumentation. */
  figmaPart?: string;
  /** Exact mapped label width used by older harness stories. */
  figmaLabelWidth?: number;
  /** Root Figma node id used by the Figma matrix. */
  figmaNodeId?: string;
};

const TEXTBOX_SPACING: Record<ButtonSize, Pick<CSSProperties, 'paddingTop' | 'paddingBottom'>> = {
  prominent: {
    paddingTop: 'var(--brand-spacing-textbox-regular-top)',
    paddingBottom: 'var(--brand-spacing-textbox-regular-bottom)',
  },
  regular: {
    paddingTop: 'var(--brand-spacing-textbox-large-top)',
    paddingBottom: 'var(--brand-spacing-textbox-large-bottom)',
  },
  compact: {
    paddingTop: 'var(--brand-spacing-textbox-regular-top)',
    paddingBottom: 'var(--brand-spacing-textbox-regular-bottom)',
  },
  dense: {
    paddingTop: 'var(--brand-spacing-textbox-regular-top)',
    paddingBottom: 'var(--brand-spacing-textbox-regular-bottom)',
  },
};

const RING_COLOR: Record<ButtonIntent, string> = {
  brand: 'border-brand-primary',
  negative: 'border-system-red-primary',
  positive: 'border-system-green-primary',
};

function nodeIdAtOffset(rootId: string | undefined, offset: number) {
  if (!rootId) return undefined;
  const separator = rootId.lastIndexOf(':');
  if (separator < 0) return undefined;
  const localId = Number(rootId.slice(separator + 1));
  if (!Number.isFinite(localId)) return undefined;
  return `${rootId.slice(0, separator + 1)}${localId + offset}`;
}

type IconSlotProps = {
  icon: ReactNode;
  size: ButtonSize;
  part: 'icon-leading' | 'icon-trailing';
  figmaNodeId?: string;
  vectorNodeId?: string;
};

function IconSlot({ icon, size, part, figmaNodeId, vectorNodeId }: IconSlotProps) {
  const child = isValidElement(icon)
    ? cloneElement(icon as ReactElement<{ className?: string; style?: CSSProperties; 'data-figma-part'?: string; 'data-figma-node'?: string }>, {
        className: cn((icon.props as { className?: string }).className, 'block size-full text-current'),
        style: {
          ...(icon.props as { style?: CSSProperties }).style,
          width: '100%',
          height: '100%',
        },
        'data-figma-part': `${part}-vector`,
        'data-figma-node': vectorNodeId,
      })
    : icon;

  return (
    <span
      data-figma-part={part}
      data-figma-node={figmaNodeId}
      className={cn('relative flex shrink-0 items-center justify-center', ICON_SIZE_CLASS[size])}
    >
      {child}
    </span>
  );
}

function pressedRingVisible(variant: ButtonVariant, intent: ButtonIntent, size: ButtonSize, radius: ButtonRadius, iconOnly: boolean) {
  if (variant === 'primary' || variant === 'subtle') return true;
  if (variant === 'tertiary') return iconOnly;
  if (variant === 'secondary') {
    if (iconOnly) return true;
    if (intent === 'brand') return radius === 'default' && (size === 'prominent' || size === 'regular');
    if (intent === 'negative') return radius === 'default' || size === 'prominent' || size === 'regular';
    return size === 'prominent' || size === 'regular';
  }
  return false;
}

function ringWidth(variant: ButtonVariant, intent: ButtonIntent, size: ButtonSize, iconOnly: boolean) {
  return variant === 'secondary' && intent === 'brand' && size === 'dense' && iconOnly
    ? 'var(--border-width-2)'
    : 'var(--spacing-2)';
}

function Button({
  variant = 'primary',
  intent = 'brand',
  size = 'regular',
  radius = 'default',
  iconOnly = false,
  iconLeading = true,
  iconLeadingSwap,
  iconTrailing = true,
  iconTrailingSwap,
  leadingIcon,
  trailingIcon,
  label = 'Button',
  asChild = false,
  disabled = false,
  type = 'button',
  className,
  children,
  state,
  forceState,
  figmaPart,
  figmaLabelWidth,
  figmaNodeId,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || state === 'Disabled';
  const forcedState = state && state !== 'Default' ? state : forceState;
  const leading = iconLeadingSwap !== undefined ? iconLeadingSwap : leadingIcon !== undefined ? leadingIcon : <CircleLine />;
  const trailing = iconTrailingSwap !== undefined ? iconTrailingSwap : trailingIcon !== undefined ? trailingIcon : <CircleLine />;
  const showLeading = (iconOnly || iconLeading) && leading != null;
  const showTrailing = !iconOnly && iconTrailing && trailing != null;
  const visibleLabel = children ?? label;
  const leadingNodeId = nodeIdAtOffset(figmaNodeId, 1);
  const textboxNodeId = nodeIdAtOffset(figmaNodeId, 2);
  const labelNodeId = nodeIdAtOffset(figmaNodeId, 3);
  const trailingNodeId = nodeIdAtOffset(figmaNodeId, 4);
  const classNames = cn(buttonVariants({ variant, intent, size, radius, iconOnly }), className);
  const content = (
    <>
      {showLeading && (
        <IconSlot
          icon={leading}
          size={size}
          part="icon-leading"
          figmaNodeId={leadingNodeId}
          vectorNodeId={leadingNodeId ? `I${leadingNodeId};356:11452` : undefined}
        />
      )}
      {!iconOnly && (
        <span
          data-figma-part="textbox"
          data-figma-node={textboxNodeId}
          className={cn('flex items-center justify-center', buttonTextboxVariants(variant, intent))}
          style={TEXTBOX_SPACING[size]}
        >
          <span
            data-figma-part="label"
            data-figma-node={labelNodeId}
            className="block whitespace-nowrap text-center"
            style={figmaLabelWidth === undefined ? undefined : { width: figmaLabelWidth }}
          >
            {visibleLabel}
          </span>
        </span>
      )}
      {showTrailing && (
        <IconSlot
          icon={trailing}
          size={size}
          part="icon-trailing"
          figmaNodeId={trailingNodeId}
          vectorNodeId={trailingNodeId ? `I${trailingNodeId};356:11452` : undefined}
        />
      )}
      {pressedRingVisible(variant, intent, size, radius, iconOnly) && (
        <span
          aria-hidden="true"
          data-figma-part="pressed-ring"
          className={cn(
            'pointer-events-none absolute -inset-4 hidden border-solid group-active:flex group-data-[figma-state=Pressed]:flex',
            radius === 'full' ? 'rounded-1000' : 'rounded-8',
            RING_COLOR[intent],
          )}
          style={{ borderWidth: ringWidth(variant, intent, size, iconOnly) }}
        />
      )}
    </>
  );
  const dataState = state === 'Default' ? undefined : forcedState;

  if (asChild) {
    return (
      <Slot
        {...props}
        aria-disabled={props['aria-disabled'] ?? (isDisabled || undefined)}
        className={classNames}
        data-figma-part={figmaPart ?? 'root'}
        data-figma-node={figmaNodeId}
        data-figma-state={dataState}
      >
        <Slottable>{content}</Slottable>
      </Slot>
    );
  }

  return (
    <button
      {...props}
      type={type}
      disabled={isDisabled}
      className={classNames}
      data-figma-part={figmaPart ?? 'root'}
      data-figma-node={figmaNodeId}
      data-figma-state={dataState}
    >
      {content}
    </button>
  );
}

export { Button, buttonVariants };
export type { ButtonIntent, ButtonRadius, ButtonSize, ButtonState, ButtonVariant };
