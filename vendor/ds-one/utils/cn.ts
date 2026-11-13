import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';
import { scales } from './scales';

export interface CnScales {
  readonly spacing?: readonly string[];
  readonly radius?: readonly string[];
  readonly text?: readonly string[];
  readonly font?: readonly string[];
  readonly fontWeight?: readonly string[];
  readonly shadow?: readonly string[];
}

const KEYS = ['spacing', 'radius', 'text', 'font', 'fontWeight', 'shadow'] as const;
const extra: Record<(typeof KEYS)[number], string[]> = {
  spacing: [], radius: [], text: [], font: [], fontWeight: [], shadow: [],
};

function build() {
  const of = (k: (typeof KEYS)[number]) => [...scales[k], ...extra[k]];
  return extendTailwindMerge({ extend: { theme: {
    spacing: of('spacing'), radius: of('radius'), text: of('text'),
    font: of('font'), 'font-weight': of('fontWeight'), shadow: of('shadow'),
  } } });
}

let twMerge = build();
export function extendCnScales(next: CnScales): void {
  let changed = false;
  for (const key of KEYS) for (const value of next[key] ?? []) {
    if (!extra[key].includes(value)) { extra[key].push(value); changed = true; }
  }
  if (changed) twMerge = build();
}
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
