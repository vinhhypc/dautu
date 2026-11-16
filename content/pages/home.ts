import type { LinkItem, PageSeo } from "@/types/content";

import { hotlineHref } from "../links";

/* Nội dung trang chủ lấy từ trang "/" trên WordPress; ở đây chỉ là giá trị dự phòng khi không đọc được WP. */
export const homePage = {
  seo: {
    title: "Nếp sống đầu tư | VNDIRECT",
    description: "Nếp và cộng đồng đầu tư bền vững trọn đời, xây ngôi nhà đầu tư cùng VNDIRECT.",
    path: "/",
    changeFrequency: "weekly",
    priority: 1,
  } satisfies PageSeo,
  /* Thẻ "Cần hỗ trợ tư vấn?" trên WP chỉ có chữ, không có nút → thêm lối liên hệ ở Next. */
  supportActions: [
    { label: "Gọi 1900 545 409", href: hotlineHref },
    { label: "Đăng ký tư vấn", href: "/dang-ky-tim-chuyen-gia/" },
  ] satisfies LinkItem[],
};
