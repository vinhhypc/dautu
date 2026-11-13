'use client';

import { createContext, useContext, type ComponentProps, type ReactNode } from 'react';
import { ArrowRightSLine, Home4Line } from '../icons/index';
import { cn } from '../utils/cn';

type BreadcrumbContextValue = {
  divider: BreadcrumbDividerValue;
  variant: BreadcrumbStyleValue;
};

type BreadcrumbDividerValue = 'chevron' | 'slash';
type BreadcrumbStyleValue = 'text' | 'tab';

const HOME_VECTOR_GEOMETRY = { x: 0.83349609375, y: 1.126220703125, width: 18.33333396911621, height: 16.373802185058594 };
const CHEVRON_VECTOR_GEOMETRY = { x: 5.4814453125, y: 3.7578125, width: 5.185452938079834, height: 8.485252380371094 };

const BreadcrumbContext = createContext<BreadcrumbContextValue>({ divider: 'chevron', variant: 'text' });

type BreadcrumbsRootProps = Omit<ComponentProps<'nav'>, 'children'> & {
  children?: ReactNode;
  divider?: BreadcrumbDivider;
  variant?: BreadcrumbVariant;
};

function Breadcrumbs({ children, className, divider = 'chevron', variant = 'text', ...props }: BreadcrumbsRootProps) {
  const normalizedDivider: BreadcrumbDividerValue = divider === 'Slash' || divider === 'slash' ? 'slash' : 'chevron';
  const normalizedVariant: BreadcrumbStyleValue = variant === 'Text' || variant === 'text' ? 'text' : 'tab';
  return (
    <BreadcrumbContext.Provider value={{ divider: normalizedDivider, variant: normalizedVariant }}>
      <nav className={cn('w-fit', className)} {...props}>
        {children}
      </nav>
    </BreadcrumbContext.Provider>
  );
}

type BreadcrumbsListRootProps = Omit<ComponentProps<'ol'>, 'children'> & { children?: ReactNode };

function BreadcrumbsList({ children, className, ...props }: BreadcrumbsListRootProps) {
  const { variant } = useContext(BreadcrumbContext);
  return (
    <ol className={cn('m-0 flex w-fit list-none items-center p-0', variant === 'text' ? 'gap-8' : 'gap-4', className)} {...props}>
      {children}
    </ol>
  );
}

type BreadcrumbsItemRootProps = Omit<ComponentProps<'li'>, 'children'> & {
  children?: ReactNode;
  current?: boolean | 'False' | 'True';
  home?: boolean;
  /** Figma `_Breadcrumb item` Type property. `home` remains supported for existing callers. */
  itemType?: 'Home' | 'Text' | 'home' | 'text';
  /** Figma `_Breadcrumb item` Label property. */
  label?: string;
  /** Internal Figma text node tag used by the ItemFigmaMatrix story. */
  'data-figma-text-node'?: string;
  'data-figma-icon-node'?: string;
};

function BreadcrumbsItem({ children, className, current = false, home = false, itemType, label, 'data-figma-text-node': textNode, 'data-figma-icon-node': iconNode, ...props }: BreadcrumbsItemRootProps) {
  const { variant } = useContext(BreadcrumbContext);
  const tab = variant !== 'text';
  const isCurrent = current === true || current === 'True';
  const isHome = itemType === undefined ? home : itemType === 'Home' || itemType === 'home';
  const content = label ?? children;
  const color = isCurrent ? (tab ? 'text-brand-primary' : 'text-text-primary') : 'text-text-secondary';
  const textStyle = isCurrent && !tab ? 'text-webtrading-body-3-highlight' : tab ? 'text-webtrading-body-3-medium' : 'text-webtrading-body-3-normal';

  return (
    <li
      data-current={isCurrent || undefined}
      data-home={isHome || undefined}
      className={cn(
        'relative flex w-fit shrink-0 items-center',
        tab ? (isHome ? 'justify-center p-4' : 'h-28 items-start px-10 pt-4') : 'h-fit',
        'font-plain',
        textStyle,
        'text-left whitespace-nowrap',
        color,
        className
      )}
      style={tab && isCurrent ? { boxShadow: 'inset 0 calc(-1 * var(--border-width-2)) 0 var(--color-brand-primary)' } : undefined}
      {...props}
    >
      {isHome ? (
        <span data-figma-node={iconNode} className="relative flex size-20 shrink-0 items-center justify-center" aria-hidden="true">
          <span
            data-figma-node={iconNode ? `I${iconNode};356:6188` : undefined}
            className="absolute overflow-visible"
            style={{ left: HOME_VECTOR_GEOMETRY.x, top: HOME_VECTOR_GEOMETRY.y, width: HOME_VECTOR_GEOMETRY.width, height: HOME_VECTOR_GEOMETRY.height }}
          >
            <Home4Line
              size={20}
              className={`absolute ${color}`}
              style={{ left: -HOME_VECTOR_GEOMETRY.x, top: -HOME_VECTOR_GEOMETRY.y }}
            />
          </span>
        </span>
      ) : label !== undefined ? (
        <span
          data-figma-node={textNode}
          aria-current={isCurrent ? 'page' : undefined}
          className="block"
          // GAP: Storybook's IBM Plex Sans text box measures 2px narrower than Figma's exported bounds.
          style={{ paddingRight: 2 }}
        >
          {label}
        </span>
      ) : content}
    </li>
  );
}

type BreadcrumbsLinkRootProps = ComponentProps<'a'> & { 'data-figma-frame-node'?: string; 'data-figma-node'?: string };

function BreadcrumbsLink({ children, className, 'data-figma-frame-node': frameNode, 'data-figma-node': nodeId, ...props }: BreadcrumbsLinkRootProps) {
  const { variant } = useContext(BreadcrumbContext);
  const tab = variant !== 'text';
  return (
    <a data-figma-node={tab ? frameNode : nodeId} data-figma-frame-node={tab ? frameNode : undefined} className={cn('block w-fit cursor-pointer no-underline', tab && 'h-[20px]', className)} {...props}>
      {tab ? <span data-figma-node={nodeId} className="block h-[18px]">{children}</span> : children}
    </a>
  );
}

type BreadcrumbsPageRootProps = ComponentProps<'span'> & { 'data-figma-frame-node'?: string; 'data-figma-node'?: string };

function BreadcrumbsPage({ children, className, 'data-figma-frame-node': frameNode, 'data-figma-node': nodeId, ...props }: BreadcrumbsPageRootProps) {
  const { variant } = useContext(BreadcrumbContext);
  if (variant === 'tab' && frameNode) {
    return (
      <span aria-current="page" className={cn('block w-fit', className)} {...props}>
        <span data-figma-node={frameNode} className="block h-[20px]">
          <span data-figma-node={nodeId} className="block h-[18px]">{children}</span>
        </span>
      </span>
    );
  }
  return <span aria-current="page" data-figma-node={nodeId} className={cn('block w-fit', className)} {...props}>{children}</span>;
}

type BreadcrumbsSeparatorRootProps = Omit<ComponentProps<'li'>, 'children'> & { children?: ReactNode; 'data-figma-node'?: string };

function BreadcrumbsSeparator({ children, className, 'data-figma-node': nodeId, ...props }: BreadcrumbsSeparatorRootProps) {
  const { divider } = useContext(BreadcrumbContext);
  return (
    <li aria-hidden="true" className={cn('flex w-fit shrink-0 items-center justify-center text-border-default', className)} {...props} data-figma-node={divider === 'chevron' ? nodeId : undefined}>
      {children ?? (divider === 'chevron' ? (
        <span className="relative flex size-16 shrink-0 items-center justify-center">
          <span
            data-figma-node={nodeId ? `I${nodeId};356:4888` : undefined}
            className="absolute overflow-visible"
            style={{ left: CHEVRON_VECTOR_GEOMETRY.x, top: CHEVRON_VECTOR_GEOMETRY.y, width: CHEVRON_VECTOR_GEOMETRY.width, height: CHEVRON_VECTOR_GEOMETRY.height }}
          >
            <ArrowRightSLine size={16} className="absolute" style={{ left: -CHEVRON_VECTOR_GEOMETRY.x, top: -CHEVRON_VECTOR_GEOMETRY.y }} />
          </span>
        </span>
      ) : <span data-figma-node={nodeId} className="block w-[6px] font-plain text-webtrading-body-3-normal">/</span>)}
    </li>
  );
}

const BreadcrumbsWithParts = Object.assign(Breadcrumbs, {
  List: BreadcrumbsList,
  Item: BreadcrumbsItem,
  Link: BreadcrumbsLink,
  Page: BreadcrumbsPage,
  Separator: BreadcrumbsSeparator,
});

export type BreadcrumbDivider = 'chevron' | 'slash' | 'Chevron' | 'Slash';
export type BreadcrumbVariant = 'text' | 'tab' | 'button' | 'Text' | 'Tab';
export type BreadcrumbsProps = BreadcrumbsRootProps;
export type BreadcrumbsListProps = BreadcrumbsListRootProps;
export type BreadcrumbsItemProps = BreadcrumbsItemRootProps;
export type BreadcrumbItemProps = BreadcrumbsItemProps;
export type BreadcrumbsLinkProps = BreadcrumbsLinkRootProps;
export type BreadcrumbsPageProps = BreadcrumbsPageRootProps;
export type BreadcrumbsSeparatorProps = BreadcrumbsSeparatorRootProps;

export {
  BreadcrumbsWithParts as Breadcrumbs,
  BreadcrumbsItem as BreadcrumbItem,
  BreadcrumbsList,
  BreadcrumbsItem,
  BreadcrumbsLink,
  BreadcrumbsPage,
  BreadcrumbsSeparator,
};
