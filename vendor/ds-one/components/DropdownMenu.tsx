'use client';

import { createContext, useContext, type ComponentProps, type ReactNode } from 'react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '../utils/cn';
import { CheckLine } from '../icons/index';

type DropdownMenuType = 'account' | 'simple';
type DropdownMenuContentProps = ComponentProps<typeof RadixDropdownMenu.Content> & { type?: DropdownMenuType };
type DropdownMenuItemProps = ComponentProps<typeof RadixDropdownMenu.Item> & { selected?: boolean };

const MenuTypeContext = createContext<DropdownMenuType>('simple');
const DropdownMenuRoot = RadixDropdownMenu.Root;
const DropdownMenuTrigger = RadixDropdownMenu.Trigger;
const DropdownMenuPortal = RadixDropdownMenu.Portal;

function DropdownMenuContent({ type = 'simple', className, children, sideOffset = 4, ...props }: DropdownMenuContentProps) {
  return (
    <MenuTypeContext.Provider value={type}>
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          data-part="content"
          data-type={type}
          align="start"
          sideOffset={sideOffset}
          className={cn(
            'z-50 max-h-[calc(100vh_-_16px)] w-[288px] overflow-y-auto rounded-8 border border-solid border-border-subtle bg-background-canvas py-4 shadow-lg outline-none',
            className
          )}
          {...props}
        >
          {children}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </MenuTypeContext.Provider>
  );
}

function DropdownMenuAccount({ className, avatar, name, description, ...props }: ComponentProps<'div'> & { avatar?: ReactNode; name: ReactNode; description?: ReactNode }) {
  return (
    <div data-part="account" className={cn('flex items-center gap-12 px-16 py-12', className)} {...props}>
      {avatar}
      <div className="flex min-w-0 flex-1 flex-col">
        <span data-part="account-name" className="truncate font-plain text-website-body-3-highlight text-text-primary">{name}</span>
        {description != null && <span data-part="account-description" className="truncate font-plain text-website-body-3-normal text-text-secondary">{description}</span>}
      </div>
    </div>
  );
}

function DropdownMenuItem({ selected = false, className, children, ...props }: DropdownMenuItemProps) {
  const type = useContext(MenuTypeContext);
  return (
    <RadixDropdownMenu.Item
      data-part="item"
      data-type={type}
      data-selected={selected ? 'true' : undefined}
      className={cn(
        'flex cursor-default items-center rounded-8 px-6 py-2 text-text-primary outline-none data-[highlighted]:bg-background-elevated data-[selected=true]:bg-brand-secondary data-[selected=true]:text-brand-primary data-[disabled]:text-text-tertiary data-[disabled]:opacity-100',
        className
      )}
      {...props}
    >
      <span data-part="item-content" className="flex w-full min-w-0 items-center gap-8 px-10 py-8">
        {children}
      </span>
    </RadixDropdownMenu.Item>
  );
}

function DropdownMenuCheckboxItem({ className, children, ...props }: ComponentProps<typeof RadixDropdownMenu.CheckboxItem>) {
  const type = useContext(MenuTypeContext);
  return (
    <RadixDropdownMenu.CheckboxItem
      data-part="checkbox-item"
      data-type={type}
      className={cn('flex cursor-default items-center rounded-8 px-6 py-2 text-text-primary outline-none data-[highlighted]:bg-background-elevated data-[state=checked]:bg-brand-secondary data-[state=checked]:text-brand-primary data-[disabled]:text-text-tertiary', className)}
      {...props}
    >
      <span data-part="item-content" className="flex w-full min-w-0 items-center gap-8 px-10 py-8">
        {children}
        <RadixDropdownMenu.ItemIndicator className="ml-auto inline-flex items-center justify-center text-brand-primary"><CheckLine className="size-16" /></RadixDropdownMenu.ItemIndicator>
      </span>
    </RadixDropdownMenu.CheckboxItem>
  );
}

function DropdownMenuLabel({ className, ...props }: ComponentProps<typeof RadixDropdownMenu.Label>) {
  return <RadixDropdownMenu.Label data-part="label" className={cn('px-16 py-8 font-plain text-website-body-3-highlight text-text-primary', className)} {...props} />;
}

function DropdownMenuGroup({ className, ...props }: ComponentProps<typeof RadixDropdownMenu.Group>) {
  return <RadixDropdownMenu.Group data-part="group" className={cn(className)} {...props} />;
}

function DropdownMenuSeparator({ className, ...props }: ComponentProps<typeof RadixDropdownMenu.Separator>) {
  return <RadixDropdownMenu.Separator data-part="separator" className={cn('my-4 h-px bg-background-elevated', className)} {...props} />;
}

function DropdownMenuShortcut({ className, ...props }: ComponentProps<'span'>) {
  return <span data-part="shortcut" className={cn('ml-auto font-plain text-website-caption-normal text-text-tertiary', className)} {...props} />;
}

const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Root: DropdownMenuRoot,
  Trigger: DropdownMenuTrigger,
  Portal: DropdownMenuPortal,
  Content: DropdownMenuContent,
  Account: DropdownMenuAccount,
  Item: DropdownMenuItem,
  CheckboxItem: DropdownMenuCheckboxItem,
  Label: DropdownMenuLabel,
  Group: DropdownMenuGroup,
  Separator: DropdownMenuSeparator,
  Shortcut: DropdownMenuShortcut,
});

export { DropdownMenu, DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuPortal, DropdownMenuContent, DropdownMenuAccount, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuGroup, DropdownMenuSeparator, DropdownMenuShortcut };
export type { DropdownMenuType, DropdownMenuContentProps, DropdownMenuItemProps };
