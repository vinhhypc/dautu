"use client";

import type { ButtonHTMLAttributes } from "react";

import type { IconButtonSize, IconButtonVariant, IconName } from "@/types/content";

import { iconButtonClasses, iconButtonIconClasses } from "./button-styles";
import { Icon } from "./icon";

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  icon: IconName;
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
};

export function IconButton({ icon, label, variant, size, className, type = "button", ...rest }: IconButtonProps) {
  return (
    <button type={type} aria-label={label} className={iconButtonClasses(variant, size, className)} {...rest}>
      <Icon name={icon} className={iconButtonIconClasses(size)} />
    </button>
  );
}

type IconLinkProps = {
  href: string;
  icon: IconName;
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  external?: boolean;
  className?: string;
};

export function IconLink({ href, icon, label, variant, size, external = false, className }: IconLinkProps) {
  return (
    <a
      href={href}
      aria-label={label}
      className={iconButtonClasses(variant, size, className)}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
    >
      <Icon name={icon} className={iconButtonIconClasses(size)} />
    </a>
  );
}
