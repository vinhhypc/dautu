'use client';

import { cloneElement, isValidElement, type ComponentProps, type ReactElement, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ArrowUpLine } from '../icons/index';
import { cn } from '../utils/cn';

type FigmaBadgeAppearance = 'Soft' | 'Outline';
type FigmaBadgeColor = 'Brand' | 'Orange' | 'Red' | 'Green' | 'Cyan' | 'Purple' | 'Blue' | 'Neutral';
type FigmaBadgeSize = 'Compact' | 'Regular' | 'Prominent';
type FigmaBadgeContent = 'Text' | 'Dot' | 'Icon leading' | 'Icon trailing' | 'Avatar' | 'Label left' | 'Label right' | 'Dot only';
type BadgeAppearance = FigmaBadgeAppearance;
type BadgeColor = FigmaBadgeColor | 'brand' | 'orange' | 'red' | 'green' | 'cyan' | 'purple' | 'blue' | 'neutral';
type BadgeSize = FigmaBadgeSize | 'sm' | 'md' | 'lg';
type BadgeContent = FigmaBadgeContent | 'text' | 'dot' | 'icon-leading' | 'icon-trailing' | 'avatar' | 'label-left' | 'label-right' | 'dot-only';
type BadgeEffect = 'soft' | 'subtle';

type BadgeColorTokens = {
  primaryText: string;
  primaryFill: string;
  softFill: string;
  subLabelStroke: string;
  avatarStroke: string;
  outlineStroke: string;
  outlineShadow: string;
};

const colorTokens: Record<FigmaBadgeColor, BadgeColorTokens> = {
  Brand: {
    primaryText: 'text-brand-primary', primaryFill: 'bg-brand-primary', softFill: 'bg-brand-secondary',
    subLabelStroke: 'shadow-[inset_0_0_0_var(--border-width-1)_var(--color-brand-secondary-hover)]',
    avatarStroke: 'border-brand-secondary-hover', outlineStroke: 'border-brand-primary',
    outlineShadow: 'shadow-[inset_0_0_0_var(--border-width-1)_var(--color-brand-primary)]',
  },
  Orange: {
    primaryText: 'text-system-orange-primary', primaryFill: 'bg-system-orange-primary', softFill: 'bg-system-orange-secondary',
    subLabelStroke: 'shadow-[inset_0_0_0_var(--border-width-1)_var(--color-system-orange-secondary-hover)]',
    avatarStroke: 'border-system-orange-secondary-hover', outlineStroke: 'border-system-orange-primary',
    outlineShadow: 'shadow-[inset_0_0_0_var(--border-width-1)_var(--color-system-orange-primary)]',
  },
  Red: {
    primaryText: 'text-system-red-primary', primaryFill: 'bg-system-red-primary', softFill: 'bg-system-red-secondary',
    subLabelStroke: 'shadow-[inset_0_0_0_var(--border-width-1)_var(--color-system-red-secondary-hover)]',
    avatarStroke: 'border-system-red-secondary-hover', outlineStroke: 'border-system-red-primary',
    outlineShadow: 'shadow-[inset_0_0_0_var(--border-width-1)_var(--color-system-red-primary)]',
  },
  Green: {
    primaryText: 'text-system-green-primary', primaryFill: 'bg-system-green-primary', softFill: 'bg-system-green-secondary',
    subLabelStroke: 'shadow-[inset_0_0_0_var(--border-width-1)_var(--color-system-green-secondary-hover)]',
    avatarStroke: 'border-system-green-secondary-hover', outlineStroke: 'border-system-green-primary',
    outlineShadow: 'shadow-[inset_0_0_0_var(--border-width-1)_var(--color-system-green-primary)]',
  },
  Cyan: {
    primaryText: 'text-system-cyan-primary', primaryFill: 'bg-system-cyan-primary', softFill: 'bg-system-cyan-secondary',
    subLabelStroke: 'shadow-[inset_0_0_0_var(--border-width-1)_var(--color-system-cyan-secondary-hover)]',
    avatarStroke: 'border-system-cyan-secondary-hover', outlineStroke: 'border-system-cyan-primary',
    outlineShadow: 'shadow-[inset_0_0_0_var(--border-width-1)_var(--color-system-cyan-primary)]',
  },
  Purple: {
    primaryText: 'text-system-purple-primary', primaryFill: 'bg-system-purple-primary', softFill: 'bg-system-purple-secondary',
    subLabelStroke: 'shadow-[inset_0_0_0_var(--border-width-1)_var(--color-system-purple-secondary-hover)]',
    avatarStroke: 'border-system-purple-secondary-hover', outlineStroke: 'border-system-purple-primary',
    outlineShadow: 'shadow-[inset_0_0_0_var(--border-width-1)_var(--color-system-purple-primary)]',
  },
  Blue: {
    primaryText: 'text-system-blue-primary', primaryFill: 'bg-system-blue-primary', softFill: 'bg-system-blue-secondary',
    subLabelStroke: 'shadow-[inset_0_0_0_var(--border-width-1)_var(--color-system-blue-secondary-hover)]',
    avatarStroke: 'border-system-blue-secondary-hover', outlineStroke: 'border-system-blue-primary',
    outlineShadow: 'shadow-[inset_0_0_0_var(--border-width-1)_var(--color-system-blue-primary)]',
  },
  Neutral: {
    primaryText: 'text-text-primary', primaryFill: 'bg-text-primary', softFill: 'bg-background-surface',
    subLabelStroke: 'shadow-[inset_0_0_0_var(--border-width-1)_var(--color-border-subtle)]',
    avatarStroke: 'border-border-subtle', outlineStroke: 'border-border-strong',
    outlineShadow: 'shadow-[inset_0_0_0_var(--border-width-1)_var(--color-border-strong)]',
  },
};

const sizeClass: Record<FigmaBadgeSize, string> = {
  Compact: 'py-2',
  Regular: 'py-2',
  Prominent: 'py-4',
};

const horizontalPadding: Record<FigmaBadgeSize, string> = {
  Compact: 'px-8',
  Regular: 'px-10',
  Prominent: 'px-12',
};

const labelClass: Record<FigmaBadgeSize, string> = {
  Compact: 'text-webtrading-caption-medium',
  Regular: 'text-webtrading-body-3-medium',
  Prominent: 'text-webtrading-body-3-medium',
};

const labelBoxClass: Record<FigmaBadgeSize, string> = {
  Compact: 'h-16 pb-2',
  Regular: 'h-20 pb-2',
  Prominent: 'h-20 pb-2',
};

const avatarSizeClass: Record<FigmaBadgeSize, string> = {
  Compact: 'size-16',
  Regular: 'size-20',
  Prominent: 'size-20',
};

const dotOnlySizeClass: Record<FigmaBadgeSize, string> = {
  Compact: 'size-6',
  Regular: 'size-8',
  Prominent: 'size-10',
};

function contentClass(size: FigmaBadgeSize, content: FigmaBadgeContent) {
  if (content === 'Dot only') return cn('flex shrink-0 items-center justify-center rounded-1000 border-0', dotOnlySizeClass[size]);
  if (content === 'Avatar' || content === 'Label left') {
    return cn(sizeClass[size], horizontalPadding[size], size === 'Compact' ? 'pl-2 pr-8' : size === 'Regular' ? 'pl-2 pr-10' : 'pl-4 pr-12');
  }
  if (content === 'Label right') {
    return cn(sizeClass[size], size === 'Compact' ? 'pl-8 pr-2' : size === 'Regular' ? 'pl-10 pr-2' : 'pl-12 pr-4');
  }
  return cn(sizeClass[size], horizontalPadding[size]);
}

function outlineStrokeClass(color: FigmaBadgeColor, size: FigmaBadgeSize, content: FigmaBadgeContent) {
  // Outline/Regular Avatar and Badge/Brand|Neutral label slots keep stroke overlaid; other mapped label slots include it in their child offsets.
  if (size === 'Regular' && (
    content === 'Avatar'
    || ((content === 'Label left' || content === 'Label right') && (color === 'Brand' || color === 'Neutral'))
  )) {
    return colorTokens[color].outlineShadow;
  }
  return cn('border border-solid', colorTokens[color].outlineStroke);
}

const badgeVariants = cva('flex w-fit shrink-0 items-center gap-4 rounded-1000 font-plain', {
  variants: {
    size: { Compact: '', Regular: '', Prominent: '' },
    appearance: { Soft: '', Outline: '' },
    color: { Brand: '', Orange: '', Red: '', Green: '', Cyan: '', Purple: '', Blue: '', Neutral: '' },
    content: {
      Text: '', Dot: '', 'Icon leading': '', 'Icon trailing': '', Avatar: '', 'Label left': '', 'Label right': '', 'Dot only': '',
    },
  },
  compoundVariants: [
    ...(['Compact', 'Regular', 'Prominent'] as const).flatMap((size) =>
      (['Text', 'Dot', 'Icon leading', 'Icon trailing', 'Avatar', 'Label left', 'Label right', 'Dot only'] as const).map((content) => ({
        size, content, class: contentClass(size, content),
      })),
    ),
    ...(['Soft', 'Outline'] as const).flatMap((appearance) =>
      (['Brand', 'Orange', 'Red', 'Green', 'Cyan', 'Purple', 'Blue', 'Neutral'] as const).map((color) => ({
        appearance, color, class: appearance === 'Soft' ? colorTokens[color].softFill : 'bg-transparent',
      })),
    ),
    ...(['Soft', 'Outline'] as const).flatMap((appearance) =>
      (['Brand', 'Orange', 'Red', 'Green', 'Cyan', 'Purple', 'Blue', 'Neutral'] as const).map((color) => ({
        appearance, color, content: 'Dot only' as const, class: colorTokens[color].primaryFill,
      })),
    ),
  ],
  defaultVariants: { appearance: 'Soft', color: 'Brand', size: 'Compact', content: 'Text' },
});

type BadgeVariantProps = Omit<VariantProps<typeof badgeVariants>, 'appearance' | 'color' | 'size' | 'content'> & {
  appearance?: BadgeAppearance;
  effect?: BadgeEffect;
  color?: BadgeColor;
  size?: BadgeSize;
  content?: BadgeContent;
};

type FigmaNodeProps = {
  'data-figma-node'?: string;
  'data-figma-textbox-node'?: string;
  'data-figma-label-node'?: string;
  'data-figma-dot-node'?: string;
  'data-figma-icon-node'?: string;
  'data-figma-icon-vector-node'?: string;
  'data-figma-avatar-node'?: string;
  'data-figma-avatar-initials-node'?: string;
  'data-figma-sublabel-node'?: string;
  'data-figma-sublabel-text-node'?: string;
};

type BadgeLabelProps = Omit<ComponentProps<'div'>, 'children'> & {
  color?: BadgeColor;
  size?: BadgeSize;
  'data-figma-node'?: string;
  children?: ReactNode;
  textNodeId?: string;
};

type BadgeProps = Omit<ComponentProps<'div'>, 'children'> & FigmaNodeProps & BadgeVariantProps & {
  children?: ReactNode;
  label?: ReactNode;
  subLabel?: ReactNode;
  iconSwap?: '643:8449' | string;
  icon?: ReactNode;
  avatarInitials?: string;
  indicator?: ReactNode;
  avatar?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
};

function normalizeColor(color: BadgeColor): FigmaBadgeColor {
  return `${color.slice(0, 1).toUpperCase()}${color.slice(1)}` as FigmaBadgeColor;
}

function normalizeSize(size: BadgeSize): FigmaBadgeSize {
  if (size === 'sm') return 'Compact';
  if (size === 'md') return 'Regular';
  if (size === 'lg') return 'Prominent';
  return size;
}

function normalizeContent(content: BadgeContent): FigmaBadgeContent {
  const aliases: Record<string, FigmaBadgeContent> = {
    text: 'Text', dot: 'Dot', 'icon-leading': 'Icon leading', 'icon-trailing': 'Icon trailing',
    avatar: 'Avatar', 'label-left': 'Label left', 'label-right': 'Label right', 'dot-only': 'Dot only',
  };
  return aliases[content] ?? content as FigmaBadgeContent;
}

function BadgeLabel({ color: colorProp = 'Brand', size: sizeProp = 'Compact', className, children = 'Label', textNodeId, 'data-figma-node': nodeId, ...props }: BadgeLabelProps) {
  const color = normalizeColor(colorProp);
  const size = normalizeSize(sizeProp);
  return (
    <div
      data-part="sub-label"
      data-figma-node={nodeId}
      className={cn(
        'flex h-16 w-fit shrink-0 items-center justify-center rounded-1000 bg-background-canvas px-4 pb-2 font-plain text-center text-webtrading-caption-medium whitespace-nowrap',
        size === 'Compact' ? '' : 'h-20',
        colorTokens[color].subLabelStroke,
        colorTokens[color].primaryText,
        className,
      )}
      {...props}
    >
      <div data-part="sub-label-text" data-figma-node={textNodeId} className="block h-14 w-fit shrink-0 font-plain text-webtrading-caption-medium whitespace-nowrap">
        {children}
      </div>
    </div>
  );
}

function FigmaAvatar({
  color,
  size,
  initials,
  avatarNode,
  initialsNode,
}: {
  color: FigmaBadgeColor;
  size: FigmaBadgeSize;
  initials: string;
  avatarNode?: string;
  initialsNode?: string;
}) {
  return (
    <div
      data-part="avatar"
      data-figma-node={avatarNode}
      className={cn('flex shrink-0 items-center justify-center rounded-1000 border border-solid bg-background-canvas', avatarSizeClass[size], colorTokens[color].avatarStroke)}
    >
      <div
        data-part="avatar-initials"
        data-figma-node={initialsNode}
        className={cn('flex size-14 shrink-0 items-center justify-center whitespace-nowrap font-plain text-webtrading-tiny-highlight', colorTokens[color].primaryText)}
      >
        {initials}
      </div>
    </div>
  );
}

function Badge({
  appearance: appearanceProp,
  effect,
  size: sizeProp = 'Compact',
  color: colorProp = 'Brand',
  content: contentProp = 'Text',
  children,
  label = children ?? 'Badge',
  subLabel = 'Label',
  iconSwap = '643:8449',
  icon,
  avatarInitials = 'AB',
  indicator,
  avatar,
  leading,
  trailing,
  className,
  style,
  'data-figma-node': nodeId,
  'data-figma-textbox-node': textboxNode,
  'data-figma-label-node': labelNode,
  'data-figma-dot-node': dotNode,
  'data-figma-icon-node': iconNode,
  'data-figma-icon-vector-node': iconVectorNode,
  'data-figma-avatar-node': avatarNode,
  'data-figma-avatar-initials-node': avatarInitialsNode,
  'data-figma-sublabel-node': subLabelNode,
  'data-figma-sublabel-text-node': subLabelTextNode,
  ...props
}: BadgeProps) {
  const appearance: FigmaBadgeAppearance = appearanceProp ?? (effect === 'subtle' ? 'Outline' : 'Soft');
  const size = normalizeSize(sizeProp);
  const color = normalizeColor(colorProp);
  const content = normalizeContent(contentProp);
  const resolvedContent = content === 'Text'
    ? leading ? 'Icon leading' : trailing ? 'Icon trailing' : avatar ? 'Avatar' : indicator ? 'Dot' : content
    : content;
  const iconSwaps: Record<string, ReactNode> = { '643:8449': <ArrowUpLine /> };
  const iconElement = icon ?? iconSwaps[iconSwap] ?? <ArrowUpLine />;
  const sizedIcon = isValidElement(iconElement)
    ? cloneElement(iconElement as ReactElement<{ className?: string }>, {
        className: cn((iconElement.props as { className?: string }).className, 'size-16'),
      })
    : iconElement;
  const text = (
    <div data-part="textbox" data-figma-node={textboxNode} className={cn('flex w-fit shrink-0 items-center justify-center', labelBoxClass[size])}>
      <div data-part="label" data-figma-node={labelNode} className={cn('block w-fit text-center font-plain whitespace-nowrap', labelClass[size], colorTokens[color].primaryText)}>
        {label}
      </div>
    </div>
  );
  const dot = <div data-part="dot" data-figma-node={dotNode} className={cn('size-6 shrink-0 rounded-1000', colorTokens[color].primaryFill)} />;
  const iconPart = (
    <div data-part="icon" data-figma-node={iconNode} className={cn('flex size-16 shrink-0 items-center justify-center', colorTokens[color].primaryText)}>
      {isValidElement(sizedIcon) ? cloneElement(sizedIcon as ReactElement<{ 'data-figma-icon-vector-node'?: string }>, { 'data-figma-icon-vector-node': iconVectorNode }) : sizedIcon}
    </div>
  );
  const avatarPart = avatar ?? <FigmaAvatar color={color} size={size} initials={avatarInitials} avatarNode={avatarNode} initialsNode={avatarInitialsNode} />;
  const subLabelPart = <BadgeLabel color={color} size={size} data-figma-node={subLabelNode} textNodeId={subLabelTextNode}>{subLabel}</BadgeLabel>;

  return (
    <div
      data-part="root"
      data-content={resolvedContent}
      data-figma-node={nodeId}
      className={cn(
        badgeVariants({ size, appearance, color, content: resolvedContent }),
        appearance === 'Outline' && resolvedContent !== 'Dot only' ? outlineStrokeClass(color, size, resolvedContent) : '',
        className,
      )}
      style={style}
      {...props}
    >
      {resolvedContent === 'Dot' && dot}
      {resolvedContent === 'Icon leading' && iconPart}
      {resolvedContent === 'Avatar' && avatarPart}
      {resolvedContent === 'Label left' && subLabelPart}
      {resolvedContent !== 'Dot only' && text}
      {resolvedContent === 'Icon trailing' && iconPart}
      {resolvedContent === 'Label right' && subLabelPart}
    </div>
  );
}

const BadgeWithLabel = Object.assign(Badge, { Label: BadgeLabel });

export { BadgeWithLabel as Badge, BadgeLabel, badgeVariants };
export type { BadgeProps, BadgeColor, BadgeEffect, BadgeAppearance, BadgeSize, BadgeVariantProps, BadgeLabelProps };
