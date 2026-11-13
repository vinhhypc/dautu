import type { ReactNode, SVGProps } from 'react';
import { cn } from '../utils/cn';

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  /** Icon edge in pixels. Figma's source component is 24×24. */
  size?: number;
};

export type IconComponent = (props: IconProps) => ReactNode;

/** Render Figma vector geometry in its original 24×24 component frame. */
export function createIcon(name: string, paths: ReactNode): IconComponent {
  function Icon({ size, className, style, ...props }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable={false}
        className={cn('inline-block shrink-0 size-24', className)}
        style={size === undefined ? style : { width: size, height: size, ...style }}
        {...props}
      >
        {paths}
      </svg>
    );
  }

  Icon.displayName = name;
  return Icon;
}
