"use client";

import * as m from "motion/react-m";
import type { ReactNode } from "react";

import { fadeUp, revealViewport, slideFromLeft, slideFromRight, staggerGroup, staggerListGroup } from "@/lib/motion";

type RevealTag = "div" | "ul" | "ol" | "li" | "dl" | "span";

export type RevealFrom = "up" | "left" | "right";

const REVEAL_VARIANTS = { up: fadeUp, left: slideFromLeft, right: slideFromRight };

const STAGGER_VARIANTS = { default: staggerGroup, slow: staggerListGroup };

type RevealProps = {
  as?: RevealTag;
  from?: RevealFrom;
  className?: string;
  "aria-labelledby"?: string;
  children: ReactNode;
};

/** Không dùng cho nội dung LCP (hero). */
export function Reveal({ as = "div", from = "up", className, children }: RevealProps) {
  const Tag = m[as];
  return (
    <Tag
      data-reveal=""
      className={className}
      variants={REVEAL_VARIANTS[from]}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
    >
      {children}
    </Tag>
  );
}

type RevealGroupProps = Omit<RevealProps, "from"> & {
  stagger?: keyof typeof STAGGER_VARIANTS;
};

export function RevealGroup({ as = "div", stagger = "default", className, "aria-labelledby": labelledBy, children }: RevealGroupProps) {
  const Tag = m[as];
  return (
    <Tag
      className={className}
      aria-labelledby={labelledBy}
      variants={STAGGER_VARIANTS[stagger]}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({ as = "div", from = "up", className, children }: RevealProps) {
  const Tag = m[as];
  return (
    <Tag data-reveal="" className={className} variants={REVEAL_VARIANTS[from]}>
      {children}
    </Tag>
  );
}
