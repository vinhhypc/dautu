# Kế hoạch chuyển dautu.vndirect.com.vn sang Next.js (giao diện ds-one, nội dung từ WordPress)

Khảo sát ngày 12/11/2026 từ sitemap Yoast (`/sitemap_index.xml`), WP REST API (`/wp-json/wp/v2/`) và HTML trang gốc.
Danh sách đầy đủ 955 URL: [`url-inventory.csv`](url-inventory.csv) (cột `path, type, group, wave, in_menu, lastmod`).

> **Cập nhật 13/11/2026:** bỏ mô hình chạy chung domain với WordPress qua Nginx. Next là site độc lập phục vụ toàn bộ domain; WordPress sẽ chuyển sang domain CMS riêng (chưa chốt). Đã xong giai đoạn 1: link nội bộ dùng `next/link`, asset về gốc `public/`, `sitemap/robots/manifest/icon` theo chuẩn Next, bỏ `content/routes.ts` và script kiểm tra `/nx/`. Đã xong giai đoạn 2: tách `NEXT_PUBLIC_SITE_URL` / `WP_ORIGIN` / `WP_SITE_ORIGIN` (`lib/wp/origin.ts`), link nội dung về path nội bộ, ảnh theo domain CMS, proxy `/wp-content/uploads/*`; đã thử bằng proxy giả lập WordPress ở domain khác. Đã xong giai đoạn 3 (SEO): `/sitemap.xml` gồm trang chủ, trang WordPress, `/san-pham/*` hiển thị được, chuyên mục, bài viết (bỏ trang loại trừ và trang Yoast `noindex`) — đã thử toàn bộ URL đều 200, một `<h1>`, canonical tự trỏ; bài viết có `article:published_time`/`modified_time`; JSON-LD `FAQPage` cho accordion; `proxy.ts` chuyển 301 `/?p=`, `/?page_id=` về permalink. Còn 8 trang `/san-pham/` cũ không dựng bằng Elementor (hoặc đã chuyển hướng trên WordPress) chưa hiển thị được. Đã xong giai đoạn 4: trang tìm kiếm `/tim-kiem/` (`noindex`, `/?s=` chuyển 301 sang), mục lục và nút chia sẻ ở bài viết, ô tìm kiếm ở chuyên mục, 301 cho `/blog/page/N/`, `/author/*`, `/YYYY/MM/` và cho URL WordPress đã tự chuyển hướng (vd. `/san-pham/dcash/`), `SearchAction` trong JSON-LD. Còn 7 trang `/san-pham/` cũ không có nội dung Elementor nên vẫn 404. Giai đoạn 5 (cutover): đã có cờ `NEXT_PUBLIC_SITE_NOINDEX` cho staging, script `pnpm check:site` và runbook `docs/deploy/cutover.md`; việc hạ tầng (domain CMS, DNS, Search Console) chờ người có quyền. Các đoạn nói về Nginx, `/nx/`, `content/routes.ts` bên dưới (K7, mục kiểm tra) không còn áp dụng.

## 0. Mục tiêu và nguyên tắc (chốt 12/11/2026)

- **Không clone giao diện cũ.** Đổi toàn bộ giao diện sang bộ UI ds-one; **nội dung giữ nguyên** như WordPress.
- **WordPress là nguồn nội dung (headless).** Next đọc WP REST API khi chạy (ISR); marketing vẫn sửa nội dung trong WordPress/Elementor như hiện tại, trang Next tự cập nhật. Không chép tay nội dung vào `content/`.
- **Bỏ bố cục, màu, font, khoảng cách của Elementor**; chỉ giữ **ngữ nghĩa** của từng widget (tiêu đề, đoạn văn, ảnh, nút, thẻ, FAQ, tab, slider, form) rồi hiển thị bằng component ds-one.
- **URL giữ nguyên** như WordPress (kể cả `/san-pham/…`, dấu `/` cuối). **SEO lấy từ Yoast** (`yoast_head_json`).
- **Form giữ HubSpot** (portal `8030318`), nhúng lại bằng component chung — dữ liệu vẫn về HubSpot.
- Riêng **trang chủ** (và landing nào BA muốn) có thể thiết kế riêng bằng section ds-one, nội dung vẫn lấy từ WP.

## 1. Lấy dữ liệu từ WordPress được không? — Được

Đã thử trực tiếp (12/11/2026):

| Nguồn | Trạng thái | Dùng cho |
|---|---|---|
| `/wp-json/wp/v2/pages` | 200, công khai | 119 trang: `content.rendered` (HTML Elementor đã render, **giữ nhãn `data-widget_type`**), `yoast_head_json`, `modified` |
| `/wp-json/wp/v2/posts`, `categories`, `tags`, `media` | 200, công khai | 764 bài (HTML WordPress thường: `p`, `h3`, `ul`, `img`, `figure`, YouTube), 24 chuyên mục, ảnh |
| `/wp-json/yoast/v1/get_head?url=` | 200 | SEO cho trang không có trong REST (`/san-pham/*`) |
| Custom post type `service` (`/san-pham/*`, 33 URL) | **Không có trong REST** (404) | Đọc HTML trang, lấy khối `[data-elementor-type="wp-post"]` — cùng dạng markup với REST |
| Menu (`menus`, `menu-items`), template header/footer, `elementor_library` | 401 (cần đăng nhập) | Menu/footer giữ trong `content/site.ts` (đã có) |
| Dữ liệu JSON gốc của Elementor (`_elementor_data`) | Không công khai | Không cần — đọc từ HTML đã render |

**Thử tách widget** trên cả 42 trang đợt 1 (script khảo sát, chưa đưa vào dự án): 1.856 widget, **~95% map được sang component có cấu trúc**:

| Widget Elementor | Số lượng | Component ds-one |
|---|---:|---|
| `heading` | 635 | Heading theo cấp (`h1`–`h3`), dùng để chia section |
| `text-editor` | 482 | `RichText` (bộ lọc HTML của vnd-invest: đoạn, danh sách, **bảng**, link, ảnh) |
| `image` | 166 | `next/image` (ảnh WP, ngoại lệ quy tắc WebP như vnd-invest) |
| `icon-box`, `image-box` | 127 | `Card` có icon/ảnh — gom các thẻ liền nhau thành lưới |
| `button` | 87 | `ButtonLink` |
| `flip-box` | 77 | `Card` mặt trước/sau (lật khi hover/tap) |
| `html` (đa số là `hbspt.forms.create`) | 74 | `HubSpotForm` (portal/form/region lấy từ script); HTML khác (2 khối số liệu quỹ) xử lý riêng |
| `accordion`, `toggle` | 57 | `Disclosure` |
| `icon-list` | 41 | Danh sách có icon check |
| `image-carousel`, `slides`, `testimonial-carousel` | 40 | Carousel tự viết + `SlideDots` (ds-one chưa có Carousel) |
| `tabs` | 12 | Tabs (chép từ ds-one) |
| `template` | 27 | Nội dung template đã được render sẵn bên trong → đệ quy |
| `shortcode`, `icon`, `call-to-action`, `posts`, `video` | 27 | Xử lý từng loại; `posts` → danh sách bài lấy từ REST |

Ví dụ `/trai-phieu-dbond-ditp/` tách ra: tiêu đề "TRÁI PHIẾU DBOND", logo DITP, `h1` tên doanh nghiệp, các mục "Thông tin doanh nghiệp", "Tình hình tài chính" (carousel 3 ảnh), "Thông tin trái phiếu" (bảng), "Minh họa đầu tư" (bảng) → đủ để dựng trang bằng ds-one mà không chép tay.

Lưu ý kỹ thuật:
- Máy dev đi qua proxy TLS nội bộ: `curl` gọi được, Node `fetch` báo `SELF_SIGNED_CERT_IN_CHAIN` → chạy dev cần `NODE_EXTRA_CA_CERTS=<chứng chỉ proxy>` (hoặc `NODE_OPTIONS=--use-system-ca` với Node ≥ 22.15).
- Môi trường deploy ngoài mạng VNDIRECT có thể bị Cloudflare chặn (đã gặp với invest) → cần rule WAF bỏ qua theo header bí mật, hoặc `WP_ORIGIN` trỏ origin nội bộ. Snapshot chỉ là dự phòng vì nội dung dautu vẫn cập nhật.

## 2. Kiến trúc

| # | Thành phần | Mô tả |
|---|---|---|
| K1 | `lib/wp/client.ts`, `pages.ts`, `archive.ts`, `html.ts` | Chép từ vnd-invest, đổi origin sang dautu; `fetch` có `revalidate`; API lỗi → trang lỗi có kiểm soát. |
| K2 | `lib/wp/elementor.ts` | HTML Elementor → `WpSection[]`: mỗi section top-level (`elementor-top-section` / `e-con e-parent`) thành danh sách widget có kiểu (`heading`, `richText`, `image`, `button`, `cards`, `flipCards`, `faq`, `tabs`, `carousel`, `iconList`, `hubspotForm`, `posts`…). Bỏ mọi class/style/bố cục; widget lạ → log + bỏ qua (hoặc rich text nếu có chữ). |
| K3 | `components/sections/wp-section.tsx` | Render `WpSection` bằng component ds-one; tự chọn bố cục theo nội dung (thẻ liền nhau → lưới 2–4 cột, ảnh + chữ → `ContentSplit`, bảng → bảng ds-one cuộn ngang trên mobile). |
| K4 | `components/ui/hubspot-form.tsx` | Nạp script HubSpot lazy khi form vào màn hình, giữ chỗ để không nhảy layout, style theo token ds-one. |
| K5 | Route `app/[...slug]/page.tsx` | Tra path → trang (REST theo `link`) / `service` (HTML) / bài viết / chuyên mục / tag; `generateMetadata` từ Yoast; trang trong danh sách loại trừ (rác, nội bộ) → 404. |
| K6 | Trang tự thiết kế | `app/page.tsx` (trang chủ) và landing được chọn: dùng section ds-one riêng, nội dung vẫn lấy từ WP qua K2. |
| K7 | Cutover | Nginx route từng nhóm path sang Next; thêm vào `content/routes.ts`; `robots.txt` thêm `Sitemap: https://dautu.vndirect.com.vn/nx/sitemap.xml`. |

## 3. Kế hoạch theo đợt

Ước lượng phần AI làm; chưa gồm thời gian bạn duyệt.

### Đợt 1 — nền tảng + template trang Elementor (~3–4 ngày)

**Trạng thái (12/11/2026): đã code xong, chưa deploy.** Route `app/[...slug]` phục vụ mọi trang WordPress (trang + `/san-pham/*`), ISR 30 phút. Đã chạy cả 41 URL đợt 1 (trừ trang chủ): 41/41 trả 200, đúng một `<h1>`, nhận đủ form HubSpot, không còn widget chưa hỗ trợ; mobile 375px không tràn ngang trên 5 trang thử. Ảnh chụp desktop 3 trang mẫu: `docs/research/wp-render/`. Form HubSpot và iframe mở tài khoản (`account-v2.vndirect.com.vn`) chạy trên bản production. Còn lại: bạn duyệt giao diện; widget `icon` và khối Elementor ẩn trên desktop (bản riêng cho mobile) đang bỏ qua.

| Bước | Việc | Ước lượng |
|---|---|---|
| 1 | K1 (chép `lib/wp` từ vnd-invest, cấu hình origin, proxy TLS), K5 route bắt tất cả + SEO Yoast | ~0,5 ngày |
| 2 | K2 bộ tách widget + test trên 42 trang đợt 1 (báo cáo widget chưa map) | ~1 ngày |
| 3 | K3 render + K4 HubSpot + Tabs/Carousel/FlipCard; duyệt trên 3 trang đại diện: `/dgo/` (slides + form), `/trai-phieu-d-bond/` (flip-box + accordion), `/trai-phieu-dbond-ditp/` (bảng + carousel) | ~1,5 ngày |
| 4 | Kiểm tra: ảnh desktop/mobile 3 trang, gửi thử form HubSpot, `pnpm lint && pnpm typecheck && pnpm build` | ~0,5 ngày |

### Đợt 2 — phủ 42 trang đợt 1 + trang chủ (~2–3 ngày)

**Trạng thái (12/11/2026): đã code xong, chờ duyệt giao diện.** Sửa chung trong template (không sửa theo trang):
- Gộp section Elementor chỉ có tiêu đề vào section nội dung ngay sau (`lib/wp/sections.ts`) — hết các dải nền chỉ có một dòng tiêu đề.
- Section có một ảnh + chữ → bố cục 2 cột (`splitLayout` trong `lib/wp-layout.ts`); trang không có `h1` thì tên trang được đưa vào section đầu thành hero (logo + tên + mô tả).
- Slider banner chỉ có ảnh: ảnh nền đọc từ file CSS Elementor `post-<id>.css` (không có trong HTML), hiển thị thành carousel ảnh có link.
- **Trang chủ** (`app/page.tsx`, `components/sections/home.tsx`, `lib/wp/home.ts`): giữ **bố cục của trang gốc** — banner tràn ngang → "Đầu tư tài chính đâu dễ dàng…" (slider câu hỏi + ảnh + nút) → 3 thẻ danh mục DLIFE/DSIP/DGROW trên nền ảnh → "Tại sao lựa chọn VNDIRECT?" (khung viền, 2 cột) → cảm nhận khách hàng + "Cần hỗ trợ tư vấn?" (2 cột). Mọi chữ, ảnh, link vẫn đọc từ trang `/` trên WP (tách theo tiêu đề); khối không nhận ra được rơi về template chung. Ảnh banner/slide và ảnh nền section đọc từ CSS Elementor. Khối "Cần hỗ trợ tư vấn?" trên trang gốc cũng không có form. So sánh: `docs/research/home/source-desktop.png` ↔ `local-desktop.png`.

Kiểm tra: 42/42 URL (gồm `/`) trả 200, đúng một `<h1>`; lint, typecheck, build sạch. Ảnh chụp: `docs/research/home/`, `docs/research/wp-render/dgo-desktop.png`.

- Chạy hết 16 landing menu, 20 trang trái phiếu, 5 form HubSpot; sửa chỗ hiển thị chưa ổn trong K2/K3 (không sửa từng trang).
- Trang chủ (K6) thiết kế bằng section ds-one, nội dung lấy từ trang `/` trên WP.
- Checklist mỗi trang: đủ chữ/ảnh/link/bảng như WP, FAQ/tab/carousel chạy bằng chuột, bàn phím, cảm ứng, form đúng `formId`, một `<h1>`, SEO đúng Yoast.

### Đợt 3 — Blog (~2 ngày)

**Trạng thái (12/11/2026): đã code xong, chưa deploy.** `lib/wp/archive.ts` đọc bài, chuyên mục, tag qua REST; `app/_site/blog-pages.tsx` + `components/sections/post-list.tsx`, `post-article.tsx` hiển thị; route `app/[...slug]` thử chuyên mục/tag → trang → bài viết. Đã thử: 24/24 chuyên mục (đủ thẻ bài, trang cuối 200, trang vượt quá 404), 59/764 bài mẫu đủ nội dung và một `<h1>`, sitemap có bài + chuyên mục. Chưa làm: ô tìm kiếm, mục lục bài, nút chia sẻ, video/nút ở cột bên, phân trang `/blog/page/N/`; chưa xem bằng ảnh chụp.

- `/blog/` + chuyên mục/tag (`/category/<slug>/`, `/tag/<slug>/`, `/page/N/`) + bài viết `/<slug>/` (cùng route K5).
- Bài là HTML WordPress thường → `RichText` có sẵn; nhúng YouTube; bài liên quan; thêm vào `/nx/sitemap.xml`.

### Đợt 4 — trang cũ (~1 ngày)

Nhờ dùng chung pipeline, 33 trang nội dung cũ, 43 landing cũ, 12 trái phiếu cũ, 5 form cũ **hiển thị được ngay** bằng K5. Việc còn lại là duyệt nhanh và quyết định từng trang: giữ (index) / `noindex` / 301 (mục 5).

**Cộng: ~8–10 ngày.** Không làm: 15 trang rác/rỗng, 16 URL sự kiện/tác giả/`service-cat`; 2 trang đào tạo nội bộ để WordPress.

## 4. Rủi ro

| Rủi ro | Giảm thiểu |
|---|---|
| Trang Elementor dựa nhiều vào bố cục (chữ đè ảnh, cột so le) → bỏ bố cục mất ý | Duyệt 3 trang đại diện trước; trang quan trọng dùng K6 thiết kế riêng. |
| Marketing thêm widget mới trong Elementor mà K2 chưa hỗ trợ | Widget lạ không làm vỡ trang (bỏ qua + log); báo cáo định kỳ widget chưa map. |
| Nội dung WP bị chèn mã độc | Lọc HTML theo danh sách thẻ cho phép (như vnd-invest); script chỉ nhận HubSpot. |
| Cloudflare chặn server Next gọi WP | Rule WAF theo header bí mật hoặc `WP_ORIGIN` nội bộ; snapshot dự phòng. |
| WP chậm/sập | ISR: trang đã cache vẫn phục vụ. |
| Ảnh WP là PNG/JPG kích thước lớn | Qua `next/image` (AVIF/WebP) với `remotePatterns` cho `dautu.vndirect.com.vn/wp-content`. |

## 5. Cần chốt

1. **Hướng này** (WP headless, đổi giao diện, giữ nội dung) — ✅ đã chốt 12/11/2026.
2. Form giữ HubSpot, nhúng lại — đề xuất: có.
3. Trang chủ thiết kế riêng (K6) hay dùng chung template như các landing — đề xuất: thiết kế riêng.
4. 60 trang cũ (landing/trái phiếu/form cũ): giữ hiển thị / `noindex` / 301 — đề xuất: hiển thị qua template chung, BA duyệt danh sách `noindex`/301 sau.
5. Chứng chỉ proxy nội bộ cho máy dev; người có quyền Cloudflare/Nginx cho môi trường deploy.
