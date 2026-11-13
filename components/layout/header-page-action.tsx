"use client";

import * as m from "motion/react-m";

import { fade } from "@/lib/motion";

import type { LinkItem } from "@/types/content";

import { ButtonLink } from "../ui/button";
import { useHeaderHref, useHeaderPageAction } from "./header-scroll-context";

/* Không có exit animation: lúc ẩn nút, nav trả lại một mục cùng lúc — nút còn mờ dần sẽ làm nav xuống dòng ở 1280px. */
export function HeaderPageAction({ primaryAction }: { primaryAction: LinkItem }) {
  const action = useHeaderPageAction();
  const primaryHref = useHeaderHref(primaryAction.href);
  if (!action) return <ButtonLink href={primaryHref}>{primaryAction.label}</ButtonLink>;

  return (
    <m.div key={action.href} variants={fade} initial="closed" animate="open">
      <ButtonLink href={action.href} variant={action.variant} trailingIcon={action.trailingIcon}>
        {action.label}
      </ButtonLink>
    </m.div>
  );
}
