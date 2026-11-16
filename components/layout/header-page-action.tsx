"use client";

import * as m from "motion/react-m";

import { fade } from "@/lib/motion";

import type { ButtonSize, LinkItem } from "@/types/content";

import { ButtonLink } from "../ui/button";
import { useHeaderHref, useHeaderPageAction } from "./header-scroll-context";

type HeaderPageActionProps = { primaryAction: LinkItem; size?: ButtonSize };

/* Không có exit animation: lúc ẩn nút, nav trả lại một mục cùng lúc — nút còn mờ dần sẽ làm nav xuống dòng ở 1280px. */
export function HeaderPageAction({ primaryAction, size }: HeaderPageActionProps) {
  const action = useHeaderPageAction();
  const primaryHref = useHeaderHref(primaryAction.href);
  if (!action)
    return (
      <ButtonLink href={primaryHref} size={size}>
        {primaryAction.label}
      </ButtonLink>
    );

  return (
    <m.div key={action.href} variants={fade} initial="closed" animate="open">
      <ButtonLink href={action.href} variant={action.variant} size={size} trailingIcon={action.trailingIcon}>
        {action.label}
      </ButtonLink>
    </m.div>
  );
}
