import type { CtaLink } from "@/types/content";

export const notFoundPage = {
  title: "Không tìm thấy trang",
  description: "Trang bạn tìm có thể đã bị xoá, đổi tên hoặc tạm thời không truy cập được.",
  code: "404",
  cta: { label: "Về trang chủ", href: "/", variant: "primary" } satisfies CtaLink,
};
