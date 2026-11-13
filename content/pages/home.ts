import type { PageSeo } from "@/types/content";

/* Nội dung trang chủ lấy từ trang "/" trên WordPress; ở đây chỉ là giá trị dự phòng khi không đọc được WP. */
export const homePage = {
  seo: {
    title: "Nếp sống đầu tư | VNDIRECT",
    description: "Nếp và cộng đồng đầu tư bền vững trọn đời, xây ngôi nhà đầu tư cùng VNDIRECT.",
    path: "/",
    changeFrequency: "weekly",
    priority: 1,
  } satisfies PageSeo,
};
