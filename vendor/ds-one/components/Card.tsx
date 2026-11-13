'use client';

import type { ComponentProps } from 'react';
import { cn } from '../utils/cn';

/** Card — Figma 954:166. Figma Type maps to `type`; Hover is a CSS interaction state. */
type CardType = 'default' | 'horizontal' | 'stat' | 'stock';
type CardProps = ComponentProps<'div'> & { type?: CardType };

const cardTypeClasses: Record<CardType, string> = {
  default: 'flex flex-col',
  horizontal: 'flex flex-row items-center',
  stat: 'flex flex-col gap-12 p-20',
  stock: 'flex flex-row items-center gap-12 p-16',
};

function Card({ type = 'default', className, ...props }: CardProps) {
  return (
    <div
      data-part="card"
      data-type={type}
      className={cn(
        'rounded-12 border border-border-subtle bg-background-canvas',
        'hover:border-border-default hover:shadow-md',
        cardTypeClasses[type],
        className
      )}
      {...props}
    />
  );
}

export { Card };
export type { CardProps, CardType };
