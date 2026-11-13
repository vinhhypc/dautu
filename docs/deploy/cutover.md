# Cutover: chuyển dautu.vndirect.com.vn sang Next.js

Next.js phục vụ toàn bộ domain; WordPress chuyển sang domain CMS riêng và chỉ còn là nơi marketing sửa nội dung. Phần code đã xong (giai đoạn 1–4 trong `docs/research/site/migration-plan.md`); tài liệu này là các việc hạ tầng còn lại và cách kiểm tra từng bước.

## 0. Cần chốt trước khi làm

| Việc | Ai | Ghi chú |
|---|---|---|
| Domain CMS cho WordPress (đề xuất `cms-dautu.vndirect.com.vn`) | Hạ tầng / BA | Phải `noindex` toàn bộ, chỉ marketing truy cập (có thể chặn theo IP/VPN) |
| Nơi chạy Next.js (Node ≥ 20.9, `pnpm build` + `pnpm start`) | Hạ tầng | Cần gọi được `WP_ORIGIN`, kể cả lúc **build** |
| Danh sách URL cũ không dựng lại: 301 hay 404 (mục 5) | BA | 39 URL |
| Quyền Cloudflare/DNS và Google Search Console của `dautu.vndirect.com.vn` | Hạ tầng / SEO | |

## 1. Biến môi trường

Cả ba biến địa chỉ và cờ `NEXT_PUBLIC_SITE_NOINDEX` được đọc lúc **build** — đặt trước `pnpm build`.

| Biến | Staging | Production |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL staging | `https://dautu.vndirect.com.vn` |
| `WP_ORIGIN` | domain CMS (hoặc địa chỉ nội bộ) | domain CMS (hoặc địa chỉ nội bộ) — **khác** domain site |
| `WP_SITE_ORIGIN` | domain CMS, nếu `WP_ORIGIN` là địa chỉ nội bộ | như staging |
| `NEXT_PUBLIC_SITE_NOINDEX` | `1` | bỏ trống |
| `WP_BYPASS_HEADER_NAME/VALUE` | nếu Cloudflare chặn IP server Next | như staging |

Nếu `WP_ORIGIN` trùng `NEXT_PUBLIC_SITE_URL` thì proxy `/wp-content/uploads/*` tự tắt (tránh gọi vòng) — file PDF cũ sẽ 404. Trước cutover luôn phải khác nhau.

## 2. Chuẩn bị WordPress ở domain CMS

1. Dựng WordPress ở domain CMS (bản sao hoặc di chuyển), Settings → Site Address trỏ về domain CMS.
2. Bật `noindex` (Yoast / Settings → Reading) và chặn công khai; không đặt canonical trỏ về domain CMS cho nội dung thật.
3. Kiểm tra REST từ máy chạy Next: `curl -s $WP_ORIGIN/wp-json/wp/v2/pages?per_page=1` trả JSON.
4. Lưu ý tường lửa trước WordPress từ chối một số truy vấn dài (`?slug=` quá dài trả trang HTML "Request Rejected") — code đã có đường dự phòng, nhưng cần rule cho IP server Next nếu có thể.

## 3. Staging

```bash
NEXT_PUBLIC_SITE_URL=https://staging.example.com \
NEXT_PUBLIC_SITE_NOINDEX=1 \
WP_ORIGIN=https://cms-dautu.vndirect.com.vn \
pnpm build && pnpm start
```

Kiểm tra (staging phải chặn index):

```bash
pnpm check:site --base https://staging.example.com --expect-noindex
```

Kiểm tra toàn bộ URL của WordPress cũ vẫn truy cập được trên site mới (chạy khi WordPress cũ còn ở domain chính):

```bash
pnpm check:site --base https://staging.example.com --expect-noindex --legacy https://dautu.vndirect.com.vn --all
```

Mục 5 phải chỉ còn các URL đã được BA quyết định bỏ (bảng dưới). Ngoài script: mở tay vài trang trên desktop và mobile, gửi thử một form HubSpot, kiểm tra header/footer và tìm kiếm.

## 4. Cutover

1. Hạ TTL DNS của `dautu.vndirect.com.vn` xuống 300s, 24 giờ trước.
2. Build production (không đặt `NEXT_PUBLIC_SITE_NOINDEX`) và chạy `pnpm check:site --base <URL production nội bộ>` — phải thấy "robots.txt cho phép index".
3. Trỏ `dautu.vndirect.com.vn` sang Next (DNS/proxy). WordPress đã ở domain CMS từ bước 2.
4. Chạy lại: `pnpm check:site --base https://dautu.vndirect.com.vn`.
5. Google Search Console: gửi `https://dautu.vndirect.com.vn/sitemap.xml`, bỏ sitemap Yoast cũ; kiểm tra "Inspect URL" cho trang chủ, một bài viết, một `/san-pham/`.
6. Cloudflare: xoá cache toàn bộ sau khi chuyển; không cache `/tim-kiem/`.

## 5. Sau cutover

- Theo dõi báo cáo Pages/Crawl errors trong Search Console 2 tuần; lỗi 404 mới → thêm 301.
- Nội dung WordPress tự cập nhật trên site sau tối đa 30 phút (ISR). Cần cập nhật ngay → cân nhắc webhook revalidate (chưa làm).
- Sau khi ổn định, hạ cấu hình Nginx cũ và xoá TODO liên quan.

## 6. Quay lại (rollback)

Giữ WordPress cũ nguyên cấu hình trong ít nhất 2 tuần. Rollback = trỏ DNS/proxy về WordPress cũ (Site Address của WordPress ở domain CMS chỉ cần đổi lại nếu đã sửa trực tiếp trên bản cũ). Không cần đổi gì ở Next.

## Quyết định cho URL cũ không dựng lại (kiểm tra ngày 12/11/2026)

`pnpm check:site --legacy … --all` báo 39 URL của WordPress cũ trả 404 trên site mới. Cần BA chọn 301 (về đâu) hoặc để 404/410:

| Nhóm | URL | Gợi ý |
|---|---|---|
| Trang rác, test, nội bộ (đã nằm trong `wpExcludedPaths`) | `/shop/`, `/service/`, `/kien-thuc-dau-tu/`, `/tu-van-truc-tiep/`, `/cac-bao-cao/`, `/khoa-hoc-dau-tu/`, `/covered-warrant-chung-quyen/`, `/quy-du-phong-thanh-toan/`, `/bao-hiem/`, `/dbond-trai-phieu-goldsun/`, `/dao-tao-nhan-dien-khach-hang-va-phan-bo-tai-san/` (+ bản `-17-05`), `/test-source-mtk/`, `/web-dgo-test/`, `/elementor-19605/`, `/elementor-19970/`, `/san-pham/elementor-68296/` | 404 (hoặc 301 về `/blog/` với trang có nội dung) |
| Trang `/san-pham/` cũ không có nội dung Elementor | `dwealth`, `dstock`, `dtrade`, `dcall`, `dadvisory`, `dau-tu-theo-cong-nghe-so-vn-quant`, `trai-phieu-dbond-bac-ha` | 301 về trang sản phẩm tương ứng (`/dstock/`, `/dsip/`, `/dlife/`…) |
| Landing cũ | `/mo-tai-khoan-vndirect/` | 301 sang link mở tài khoản |
| Sự kiện (The Events Calendar) | `/events/`, `/event/*` (5), `/events/category/*` (3) | 301 về `/blog/` hoặc 404 |
| Danh mục sản phẩm cũ | `/service-cat/*` (4) | 301 về `/dlife/`, `/dsip/`, `/trai-phieu-d-bond/` |

Thêm 301 bằng `redirects` trong `next.config.ts`.
