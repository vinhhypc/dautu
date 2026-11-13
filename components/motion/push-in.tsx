"use client";

import * as m from "motion/react-m";
import type { ReactNode } from "react";

import { pushInGroup, pushInItem, revealViewport } from "@/lib/motion";

type PushInGroupProps = {
  className?: string;
  children: ReactNode;
};

export function PushInGroup({ className, children }: PushInGroupProps) {
  return (
    <m.ul
      className={className ? `overflow-hidden ${className}` : "overflow-hidden"}
      variants={pushInGroup}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
    >
      {children}
    </m.ul>
  );
}

type PushInItemProps = {
  index: number;
  className?: string;
  children: ReactNode;
};

export function PushInItem({ index, className, children }: PushInItemProps) {
  return (
    <m.li data-reveal="" custom={index} variants={pushInItem} className={className}>
      {children}
    </m.li>
  );
}
