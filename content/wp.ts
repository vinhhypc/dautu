import type { DocumentPageLabels, HubspotFormConfig, PostArticleLabels, WpSectionLabels } from "@/types/content";

/* Trang WordPress không dựng sang Next (rác/test/rỗng/nội bộ) — xem docs/research/site/url-inventory.csv nhóm rac-rong, noi-bo. */
export const wpExcludedPaths = [
  "/test-source-mtk/",
  "/web-dgo-test/",
  "/elementor-19605/",
  "/elementor-19970/",
  "/san-pham/elementor-68296/",
  "/shop/",
  "/service/",
  "/kien-thuc-dau-tu/",
  "/tu-van-truc-tiep/",
  "/cac-bao-cao/",
  "/khoa-hoc-dau-tu/",
  "/covered-warrant-chung-quyen/",
  "/quy-du-phong-thanh-toan/",
  "/bao-hiem/",
  "/dbond-trai-phieu-goldsun/",
  "/dao-tao-nhan-dien-khach-hang-va-phan-bo-tai-san/",
  "/dao-tao-nhan-dien-khach-hang-va-phan-bo-tai-san-17-05/",
];

/* Elementor Kit của dautu (Site Settings) — chứa màu toàn cục --e-global-color-*; đổi kit trên WP thì đổi id này. */
export const elementorKitId = "17763";

export const wpSectionLabels: WpSectionLabels = {
  openPdf: "Mở tài liệu PDF",
  formLoading: "Đang tải biểu mẫu…",
  formError: "Không tải được biểu mẫu. Vui lòng thử lại hoặc gọi 1900 545 409.",
  flipHint: "Xem thêm",
};

export const wpBreadcrumbHome = { label: "Trang chủ", href: "/" };

export const wpBlogHome = { label: "Blog", href: "/blog/" };

export const wpDocumentLabels: DocumentPageLabels = {
  breadcrumb: "Đường dẫn",
  sideNav: "Chuyên mục bài viết",
};

export const wpArchiveLabels = {
  categoriesTitle: "Chuyên mục",
  pageMeta: "Trang {current}/{total}",
  pageTitle: "{name} - Trang {current}/{total}",
  description: "Bài viết {name} trên Nếp sống đầu tư VNDIRECT.",
  empty: "Chuyên mục này chưa có bài viết.",
  pagination: "Phân trang",
  previousPage: "Trước",
  nextPage: "Sau",
};

export const wpArticleLabels: PostArticleLabels = {
  published: "Ngày đăng",
  categories: "Chuyên mục",
  relatedTitle: "Bài viết liên quan",
  subscribeTitle: "Đăng ký để cập nhật những bài viết mới nhất về đầu tư",
  tocTitle: "Mục lục",
  shareTitle: "Chia sẻ",
};

export const wpShareTargets = [
  { icon: "facebook", label: "Chia sẻ lên Facebook", url: "https://www.facebook.com/sharer/sharer.php?u={url}" },
  { icon: "linkedin", label: "Chia sẻ lên LinkedIn", url: "https://www.linkedin.com/sharing/share-offsite/?url={url}" },
] as const;

export const wpSearchPath = "/tim-kiem/";

export const wpSearchLabels = {
  title: "Tìm kiếm",
  resultsTitle: "Kết quả tìm kiếm: {query}",
  description: "Tìm bài viết trên Nếp sống đầu tư VNDIRECT.",
  formLabel: "Tìm bài viết",
  placeholder: "Nhập từ khoá…",
  submit: "Tìm kiếm",
  summary: "{total} bài viết",
  prompt: "Nhập từ khoá để tìm bài viết.",
  empty: "Không tìm thấy bài viết phù hợp.",
};

/* Form đăng ký nhận bài viết nằm trong template single-post của Elementor (không có trong REST của bài). */
export const wpBlogSubscribeForm: HubspotFormConfig = {
  portalId: "8030318",
  formId: "3911b833-228b-4ad9-9814-a327f13ad318",
  region: "na1",
};
