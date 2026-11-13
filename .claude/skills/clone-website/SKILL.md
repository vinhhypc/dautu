---
name: clone-website
description: Dựng lại một trang của https://dautu.vndirect.com.vn trong dautu-vndirect theo đúng quy tắc dự án — khảo sát trang gốc bằng trình duyệt (desktop + mobile, các trạng thái), tách nội dung vào content/, ghép section dùng ds-one (vendor/ds-one), rồi so sánh ảnh chụp và sửa lệch. Dùng khi được yêu cầu clone, dựng lại, chuyển (migrate) một trang/URL của dautu từ WordPress sang Next. Cú pháp - /clone-website <url> [<url>...]
---

# Clone một trang dautu.vndirect.com.vn

Mục tiêu là **bản dựng lại theo kiến trúc dautu-vndirect (khung giống vnd-invest)**, không phải copy HTML/CSS. Giống trang gốc về bố cục, nội dung, hành vi; khác ở chỗ code dùng ds-one, tách content, đạt chuẩn SEO/ảnh của dự án. Khi giống-pixel mâu thuẫn với quy tắc trong `AGENTS.md` → **quy tắc thắng**, ghi lại chỗ lệch.

Đọc trước: `AGENTS.md`, `docs/design-system/ai-rules.md`, skill `add-page`, `add-section`, `motion-patterns`.

Cách khảo sát chi tiết (đo layout/chữ, tải asset, ghi trạng thái, trang có animation) lấy từ template [ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template) (MIT): `references/inspection-guide.md`, `references/framer-and-motion.md`. Phần trong template nói về shadcn/Lucide, `src/`, `public/sites/` **không áp dụng** — dự án dùng ds-one, `components/ui/`, `public/`.

Chỉ clone trang của `dautu.vndirect.com.vn`. URL thuộc host khác (ví dụ `banggia.`, `trade.`) → dừng và hỏi lại.

## 0. Phân loại trang

Mở URL, xếp vào một loại rồi báo người dùng trước khi làm:

| Loại | Ví dụ | Cách làm |
|---|---|---|
| Tĩnh / giới thiệu | `/`, `/dgo/`, `/dlife/`, `/dsip/`, `/dstock/`, `/trai-phieu-d-bond/` | Làm đầy đủ theo các bước dưới |
| Danh sách bài, bài viết (WordPress post/category) | `/blog/`, `/category/...`, bài hướng dẫn | **Dừng, hỏi** — cần quyết định nguồn dữ liệu (WP REST API + ISR, hay để WordPress phục vụ) |
| Form, tài khoản | `/dang-ky-tim-chuyen-gia/`, popup "Đặt lịch tư vấn", mở tài khoản (mydgo) | **Dừng, hỏi** — cần API backend; mặc định giữ link sang trang cũ |

## 1. Map

Ghi vào `docs/research/<slug>/brief.md`:

- URL gốc → route Next (`app/<slug>/page.tsx`; site chỉ có tiếng Việt). Giữ nguyên path của WordPress (kể cả dấu `/` cuối nếu có — để link cũ và canonical không đổi).
- Route đã tồn tại? → chỉ cập nhật phần khác, không viết đè nội dung đã chỉnh tay.
- `<title>`, meta description, canonical, OG image của trang gốc (lấy từ source) → dùng cho `seo`.

## 2. Observe

Dùng trình duyệt của phiên (built-in browser). Với mỗi viewport **1440×900** và **375×812**:

1. Chụp toàn trang → `docs/research/<slug>/source-desktop.png`, `source-mobile.png`.
2. Đọc cấu trúc (`read_page` / `get_page_text`): chia trang thành **danh sách section** từ trên xuống, mỗi section ghi: vai trò (hero, grid tính năng, số liệu, FAQ, CTA…), heading, toàn bộ chữ, link + href, ảnh + alt.
3. Thử các trạng thái và ghi lại: hover nút/thẻ, menu header mở (desktop và mobile), accordion/tab, slider, sticky khi cuộn, animation khi vào màn hình.
4. Đo bằng `javascript_tool` (chỉ để đọc): màu, cỡ chữ, khoảng cách, radius chính của từng section.

Ghi vào `brief.md`:

```md
## Sections
1. hero — h1 "…", mô tả "…", CTA "Open account" → /open-account, ảnh nền (asset: hero)
2. …

## Assets
| id | URL gốc | dùng ở | ghi chú |

## States & motion
- …

## Token mapping
| giá trị gốc | token ds-one |
| #1A1A1A | text-primary |
| 48px heading | text-large-lg |
```

**Token mapping**: mọi màu/cỡ chữ/spacing đo được phải map sang token gần nhất (`docs/design-system/design-tokens.md`). Không có token tương đương → ghi rõ, **không** ghi hex vào code.

## 3. Assets

- Ảnh raster: tải bản gốc lớn nhất (thường ở `dautu.vndirect.com.vn/wp-content/uploads/…`, bỏ hậu tố `-300x200`; ưu tiên `currentSrc`/`srcset` lớn nhất). Chuyển sang `.webp` quality ≥ 90 bằng `sharp`, đặt `public/images/<slug>/`.
  - Rộng < 1200px (hero < 1920px) → vẫn dùng tạm, thêm vào `LOW_RES_ALLOWLIST` trong `scripts/check-images.mjs` kèm `// TODO: xin ảnh gốc ≥ …px`, liệt kê trong báo cáo.
- Icon/hình SVG → `public/icons/` hoặc `public/illustrations/<slug>/`. Logo dùng file trong `public/brand/`, không tải lại logo từ site.
- Font: dự án đã tự host IBM Plex Sans (trang gốc dùng font hệ thống). Trang gốc dùng font khác → ghi vào báo cáo, **không** thêm font mới khi chưa hỏi.
- Không hotlink asset từ domain gốc.

## 4. Build

Làm theo thứ tự, mỗi bước theo skill tương ứng:

1. **Section**: với từng section trong brief, tìm khối có sẵn trong `components/sections/` (`hero`, `feature-grid`, `stats`, `content-split`, `timeline`, `faq`, `cta-banner`). Khớp được → dùng. Không khớp → skill `add-section` (type trong `types/content.ts`, component chỉ dùng `components/ui/*`, không chữ cứng).
2. **Content**: `content/pages/<slug>.ts` chứa toàn bộ chữ, link, alt, SEO lấy nguyên văn từ trang gốc (tiếng Việt). Link tới trang WordPress cùng site dùng **path tương đối** (`/dlife/`), link sang host khác dùng URL tuyệt đối hoặc hằng trong `content/links.ts`.
3. **Route + SEO**: skill `add-page` — `buildMetadata`, breadcrumb JSON-LD, thêm vào `content/pages/index.ts`.
4. **Header/footer**: nếu menu/footer gốc khác `content/site.ts` → cập nhật ở đó (một lần, không theo trang).
5. **Motion**: chỉ animation thật sự có ở trang gốc, theo skill `motion-patterns` (không làm trễ LCP, tôn trọng reduced-motion).

Trang dài (≥ 5 section mới) có thể giao từng section độc lập cho subagent, mỗi subagent nhận: đoạn brief của section, ảnh chụp vùng đó, file type/component/content cần tạo. Ghép và kiểm tra ở phiên chính.

## 5. Compare

1. Chạy dev server (`preview_start` với `dautu-vndirect-dev`), mở route mới.
2. Chụp cùng 2 viewport, cùng trạng thái → `docs/research/<slug>/local-desktop.png`, `local-mobile.png`.
3. So từng section với ảnh gốc: bố cục, thứ tự, chữ, ảnh, khoảng cách tương đối, trạng thái hover/menu. Sửa chỗ lệch nhìn thấy được, chụp lại.
4. Kiểm tra: một `<h1>`, heading không nhảy cấp, mọi ảnh có `alt`, console không lỗi.
5. `pnpm lint && pnpm typecheck && pnpm build` sạch.

Ảnh chụp trong `docs/research/` chỉ để đối chiếu — không import vào code.

## 6. Báo cáo

Kết thúc bằng:

- Route đã tạo/sửa và URL gốc tương ứng.
- Cách xem: `pnpm dev` → `http://localhost:3041/<slug>`.
- Đường dẫn ảnh so sánh.
- **Chỗ còn lệch** và lý do (quy tắc dự án, thiếu token, ảnh độ phân giải thấp, font khác, nội dung động chưa làm).
- Việc cần người khác làm: xin ảnh gốc, xác nhận nội dung.
