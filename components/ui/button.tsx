"use client";

import { Button as DsButton } from "@/vendor/ds-one/components/Button";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import type { ButtonSize, ButtonVariant, IconName } from "@/types/content";

import {
  DS_BUTTON_SIZE,
  DS_BUTTON_VARIANT,
  buttonClasses,
  buttonIconClasses,
  buttonTextboxClasses,
} from "./button-styles";
import { Icon } from "./icon";
import { RouteLink } from "./route-link";

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  trailingIcon?: IconName;
  isLoading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  trailingIcon,
  isLoading = false,
  loadingLabel,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <DsButton
      {...DS_BUTTON_VARIANT[variant]}
      size={DS_BUTTON_SIZE[size]}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      iconLeading={isLoading}
      leadingIcon={
        <span
          aria-hidden="true"
          className="animate-spin rounded-1000 border-2 border-current border-t-transparent motion-reduce:animate-none"
        />
      }
      iconTrailing={Boolean(trailingIcon)}
      trailingIcon={trailingIcon ? <Icon name={trailingIcon} /> : undefined}
      className={className}
      {...rest}
    >
      {children}
      {isLoading && loadingLabel && <span className="sr-only">{loadingLabel}</span>}
    </DsButton>
  );
}

type ButtonLinkProps = {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  trailingIcon?: IconName;
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
};

/* ds-one Button chưa hỗ trợ asChild với next/link → dựng lại cấu trúc bằng class của ds-one. */
export function ButtonLink({ href, variant = "primary", size = "md", trailingIcon, ariaLabel, className, children }: ButtonLinkProps) {
  return (
    <RouteLink href={href} aria-label={ariaLabel} className={buttonClasses(variant, size, className)}>
      <span className={buttonTextboxClasses(variant, size)}>
        <span className="block text-center whitespace-nowrap">{children}</span>
      </span>
      {trailingIcon && (
        <span className={buttonIconClasses(size)}>
          <Icon name={trailingIcon} className="size-full" />
        </span>
      )}
    </RouteLink>
  );
}
