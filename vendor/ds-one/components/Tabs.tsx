'use client';

import { createContext, useContext, type ComponentProps } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../utils/cn';

type FigmaAppearance = 'Fill' | 'Outline' | 'Line bottom';
type FigmaColor = 'Brand' | 'Neutral';
type FigmaSize = 'Regular' | 'Compact';
type FigmaRadius = 'Default' | 'Full';

type TabsContextValue = {
  appearance: FigmaAppearance;
  color: FigmaColor;
  size: FigmaSize;
  radius: FigmaRadius;
};

const TabsContext = createContext<TabsContextValue>({ appearance: 'Fill', color: 'Brand', size: 'Regular', radius: 'Default' });

export type TabsProps = ComponentProps<typeof TabsPrimitive.Root> & {
  appearance?: FigmaAppearance;
  color?: FigmaColor;
  size?: FigmaSize;
  radius?: FigmaRadius;
};

function TabsRoot({ appearance = 'Fill', color = 'Brand', size = 'Regular', radius = 'Default', children, ...props }: TabsProps) {
  return (
    <TabsContext.Provider value={{ appearance, color, size, radius }}>
      <TabsPrimitive.Root data-part="root" {...props}>{children}</TabsPrimitive.Root>
    </TabsContext.Provider>
  );
}

type TabsListProps = ComponentProps<typeof TabsPrimitive.List>;
function TabsList({ className, children, ...props }: TabsListProps) {
  return <TabsPrimitive.List data-part="list" className={cn('flex w-fit', className)} {...props}>{children}</TabsPrimitive.List>;
}

function itemClass(appearance: FigmaAppearance, color: FigmaColor, size: FigmaSize, radius: FigmaRadius) {
  const unselectedHover = 'hover:data-[state=inactive]:bg-background-hover';
  const compactSelectedHover = size === 'Compact' && appearance === 'Fill' && color === 'Brand'
    ? 'hover:data-[state=active]:bg-brand-primary-hover'
    : '';
  const radiusClass = appearance !== 'Line bottom' ? (radius === 'Full' ? 'rounded-1000' : 'rounded-4') : '';
  const base = cn('group/item relative flex shrink-0 items-center justify-center gap-8 whitespace-nowrap border-0 p-0 font-plain', radiusClass, unselectedHover, compactSelectedHover);
  if (appearance === 'Fill') {
    return cn(base, 'text-text-secondary',
      color === 'Brand'
        ? 'data-[state=active]:bg-brand-primary data-[state=active]:text-text-inverse'
        : 'data-[state=active]:bg-background-elevated data-[state=active]:text-text-primary',
    );
  }
  if (appearance === 'Outline') {
    return cn(base, 'shadow-[inset_0_0_0_var(--border-width-1)_var(--color-border-default)] bg-background-canvas text-text-secondary',
      color === 'Brand'
        ? 'data-[state=active]:shadow-[inset_0_0_0_var(--border-width-1)_var(--color-brand-primary)] data-[state=active]:text-brand-primary'
        : 'data-[state=active]:shadow-[inset_0_0_0_var(--border-width-1)_var(--color-border-strong)] data-[state=active]:text-text-primary',
    );
  }
  return cn(base, 'text-text-secondary',
    color === 'Brand'
      ? 'data-[state=active]:text-brand-primary data-[state=active]:shadow-[inset_0_calc(var(--border-width-2)*-1)_0_0_var(--color-brand-primary)] hover:data-[state=active]:shadow-[inset_0_calc(var(--border-width-2)*-1)_0_0_var(--color-brand-primary-hover)]'
      : 'data-[state=active]:text-text-primary',
  );
}

type TabsTriggerProps = ComponentProps<typeof TabsPrimitive.Trigger>;
function TabsTrigger({ className, children, ...props }: TabsTriggerProps) {
  const { appearance, color, size, radius } = useContext(TabsContext);
  const pad = size === 'Regular' ? 'px-[12.5px] py-6' : 'px-[10.5px] py-4';
  return (
    <TabsPrimitive.Trigger data-part="trigger" className={cn(itemClass(appearance, color, size, radius), pad, 'cursor-pointer', className)} {...props}>
      <span data-part="textbox" className="flex items-center justify-center pb-2">
        <span data-part="label" className="block whitespace-nowrap text-webtrading-body-3-medium">{children}</span>
      </span>
      {appearance === 'Line bottom' && color === 'Neutral' && (
        <span data-part="indicator" className="absolute inset-x-0 bottom-0 hidden h-2 bg-background-inverse group-data-[state=active]/item:block" />
      )}
    </TabsPrimitive.Trigger>
  );
}

type TabsContentProps = ComponentProps<typeof TabsPrimitive.Content>;
function TabsContent(props: TabsContentProps) {
  return <TabsPrimitive.Content data-part="content" {...props} />;
}

const Tabs = Object.assign(TabsRoot, { List: TabsList, Trigger: TabsTrigger, Content: TabsContent });

export { Tabs, TabsList, TabsTrigger, TabsContent };
export type { TabsListProps, TabsTriggerProps, TabsContentProps };
