import { cn } from "@/lib/cn";
import type { IconName } from "@/types/content";

const icons: Record<IconName, string> = {
  "arrow-right": "icon-arrow-right",
  "chevron-down": "icon-chevron-down",
  menu: "icon-menu",
  more: "icon-more",
  close: "icon-close",
  "arrow-right-up": "icon-arrow-right-up",
  "external-link": "icon-external-link",
  check: "icon-check",
  facebook: "icon-facebook",
  youtube: "icon-youtube",
  linkedin: "icon-linkedin",
  tiktok: "icon-tiktok",
  shield: "icon-shield",
  chart: "icon-chart",
  send: "icon-send",
};

type IconProps = {
  name: IconName;
  className?: string;
};

export function Icon({ name, className }: IconProps) {
  return <span aria-hidden="true" className={cn("icon-mask size-20", icons[name], className)} />;
}
