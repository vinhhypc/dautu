"use client";

import { type ReactNode, useRef } from "react";

import { useRevealChildren } from "@/hooks/use-reveal-children";

import { Container } from "../ui/container";

type RevealChildrenProps = {
  as?: "div" | "ul" | "ol";
  container?: boolean;
  className?: string;
  children: ReactNode;
};

/** Mỗi phần tử con trực tiếp nằm dưới màn hình hiện dần khi cuộn tới; phần đã thấy lúc tải trang (LCP) và nội dung khi tắt JS không bị ẩn. */
export function RevealChildren({ as: Tag = "div", container = false, className, children }: RevealChildrenProps) {
  const ref = useRef<HTMLElement>(null);
  useRevealChildren(ref);
  if (container) {
    return (
      <Container ref={ref} className={className}>
        {children}
      </Container>
    );
  }
  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
