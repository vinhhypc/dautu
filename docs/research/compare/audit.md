# So sánh 41 trang đợt 1 với trang gốc

Kiểm tra ngày 12/11/2026 trên bản production (`pnpm build` + `pnpm start -p 3040`), trang gốc `https://dautu.vndirect.com.vn`. Không gồm `/blog/` (đợt 3). Chi tiết riêng `/dgo/`: [`../dgo/audit.md`](../dgo/audit.md).

Hai phép đo, chạy lại được cho mọi trang:

1. **Nội dung** (Node, đọc HTML hai bản): chữ, ảnh, link, iframe, form HubSpot trong vùng nội dung (bỏ khối Elementor ẩn trên desktop), số `<h1>`, mã trả về.
2. **Bố cục** (trình duyệt, khung 1440px): chiều cao vùng nội dung, vị trí từng `h1/h2`, tràn ngang, ảnh hỏng.

## 1. Nội dung

41/41 trang trả 200, đúng một `<h1>`, đủ form HubSpot, không tràn ngang, không ảnh hỏng.

| # | Lỗi tìm thấy | Trang | Nguyên nhân | Trạng thái |
|---|---|---|---|---|
| 1 | Mất nút mặt sau thẻ lật ("Tìm hiểu thêm", "TÍCH LŨY NGAY") — hiện nhãn chung "Xem thêm" | `/dstock/` (7 thẻ), `/san-pham/tich-san-huu-tri/` | Nút dùng `labels.flipHint` thay cho nhãn của WP | Đã sửa |
| 2 | Mất link trên ảnh trong đoạn văn (SoundCloud/YouTube/Facebook) | `/dgo/` | `<a><img></a>` chỉ giữ ảnh | Đã sửa (`RichBlock` ảnh có `href`) |
| 3 | Mất 3 logo + link playlist, danh sách gạch đầu dòng dồn thành một đoạn trong slide | `/dgo/` | Mô tả slide đọc bằng `textContent` | Đã sửa (`WpSlide.body` là `RichBlock[]`) |
| 4 | Nút trống trong slide (link lấy nhầm từ thẻ `<a>` trong phần mô tả) | `/dgo/` | Link slide lấy thẻ `<a>` đầu tiên | Đã sửa |
| 5 | Tiêu đề có link mất link | `/dlife/` ("Tích sản mục tiêu") | Widget heading bỏ thẻ `<a>` | Đã sửa (`heading.href`) |
| 6 | Thanh bước của carousel ảnh hiện tên file (`db01`, `image (87)`, `MicrosoftTeams-image`) | ~20 trang trái phiếu | Nhãn bước lấy từ `alt` | Đã sửa — chỉ dùng chú thích thật (`elementor-image-carousel-caption`) |
| 7 | **Thiếu iframe Google Sheets** (biểu đồ NAV, phân bổ tài sản, bảng minh hoạ) — tiêu đề đứng trơ không có nội dung | `/quy-dau-tu-trai-phieu-linh-hoat-vndcf/`, `/quy-etf-ipaam-vn100/`, `/san-pham/quy-dau-tu-trai-phieu-vnd-vndbf/`, `…-vndbf-doanh-nghiep/`, `/san-pham/chung-chi-quy-mo-vndaf/`, `/san-pham/tich-san-muc-tieu/`, `/san-pham/tich-san-huu-tri/` | Quy tắc chỉ nhúng YouTube và `*.vndirect.com.vn` (`lib/wp/html.ts`) | Đã sửa (chốt 12/11/2026: cho nhúng `docs.google.com/spreadsheets/…/pubhtml\|pubchart`) — 7 trang này giờ lệch chiều cao -13% đến +22% (bảng ở mục 2 đo trước khi nhúng) |

Khác biệt còn lại là có chủ ý: email đã giải mã thay cho mã che của Cloudflare, `<h1>` ẩn lấy từ tên trang, số bước `01 02 03` của StepSlider, khối số liệu quỹ ETF hiện sẵn trong HTML.

## 2. Bố cục

Ba lỗi chung làm trang ngắn/chật hơn gốc, đã sửa trong template:

| Lỗi | Trước | Sau | Gốc |
|---|---|---|---|
| `leading-relaxed` / `leading-normal` không tồn tại trong ds-one (chỉ có bậc px) → khoảng dòng thân bài; h2 | 22px; 32px | 24px (`leading-24`); 36px (`leading-36`) | 24,6–27,2px; 37,5px |
| Bảng: cỡ chữ / đệm ô | 12px / 8px | 14px / 12px | 14,4px / 15px |
| Ảnh `w-auto` cao 0px cho tới khi tải (giật layout); ảnh carousel không có kích thước | 0px trước khi tải | giữ chỗ theo `width/height` (`naturalWidthClass`), kích thước lấy từ hậu tố `-768x498`, ảnh carousel không rõ kích thước tải ngay | có `width/height` |

Chiều cao vùng nội dung (px, khung 1440):

| Trang | Gốc | Mới | Lệch |
|---|---:|---:|---:|
| `/dstock/` | 5347 | 4904 | -8% |
| `/dlife/` | 2683 | 2842 | +6% |
| `/quy-dau-tu-trai-phieu-linh-hoat-vndcf/` | 5087 | 3917 | -23% |
| `/dgo/` | 8027 | 8175 | +2% |
| `/trai-phieu-db-vbond/` | 9371 | 7951 | -15% |
| `/trai-phieu-v-bond/` | 6695 | 7396 | +10% |
| `/dsip/` | 3457 | 3220 | -7% |
| `/trai-phieu-dbond-db/` | 5110 | 4898 | -4% |
| `/trai-phieu-dbond-crystal-bay/` | 5821 | 4910 | -16% |
| `/trai-phieu-dbond-bidv/` | 3763 | 3265 | -13% |
| `/trai-phieu-dbond-cmc/` | 5977 | 5595 | -6% |
| `/trai-phieu-dbond-vietcombank/` | 3886 | 3477 | -11% |
| `/trai-phieu-dbond-vietinbank/` | 4141 | 3437 | -17% |
| `/trai-phieu-d-bond/` | 10064 | 10261 | +2% |
| `/trai-phieu-dbond-dnp/` | 4665 | 4475 | -4% |
| `/trai-phieu-dbond-trung-nam-dak-lak-1/` | 4105 | 3886 | -5% |
| `/quy-etf-ipaam-vn100/` | 3685 | 4225 | +15% |
| `/dba-goi-chuyen-gia-moi-gioi/` | 2154 | 2452 | +14% |
| `/dwa-goi-chuyen-gia-tu-van-dau-tu-tai-chinh/` | 2315 | 2102 | -9% |
| `/trai-phieu-hut-dbond/` | 4872 | 4294 | -12% |
| `/dang-ky-tim-chuyen-gia/` | 811 | 993 | +22% |
| `/dang-ky-chung-chi-quy/`, `/dang-ky-trai-phieu/`, `/dang-ky-giai-phap-tich-san/` | 222 | 468 | +111% |
| `/lien-he-tu-van-dsip/` | 230 | 468 | +103% |
| `/trai-phieu-dbond-agribank/` | 4062 | 3564 | -12% |
| `/trai-phieu-dbond-civ/` | 5228 | 4419 | -15% |
| `/trai-phieu-dbond-edi/` | 5128 | 4744 | -7% |
| `/trai-phieu-dbond-tre/` | 5466 | 4947 | -9% |
| `/trai-phieu-dbond-ditp/` | 4679 | 3982 | -15% |
| `/san-pham/quy-dau-tu-trai-phieu-vnd-vndbf-doanh-nghiep/` | 5333 | 4318 | -19% |
| `/san-pham/tich-san-muc-tieu/` | 4875 | 3987 | -18% |
| `/san-pham/tich-san-huu-tri/` | 6237 | 5928 | -5% |
| `/san-pham/trai-phieu-dbond-bac-ha-2/` | 4555 | 3974 | -13% |
| `/san-pham/trai-phieu-dbond-ipa/` | 4744 | 4331 | -9% |
| `/san-pham/trai-phieu-dbond-sunbay/` | 5048 | 4459 | -12% |
| `/san-pham/trai-phieu-dbond-cre/` | 4068 | 3994 | -2% |
| `/san-pham/trai-phieu-dbond-goldsun/` | 4244 | 3906 | -8% |
| `/san-pham/quy-dau-tu-trai-phieu-vnd-vndbf/` | 5333 | 4318 | -19% |
| `/san-pham/chung-chi-quy-mo-vndaf/` | 5739 | 4428 | -23% |

Trước khi sửa: nhóm trái phiếu lệch -22% đến -37%, `/dgo/` -13%.

Phần lệch còn lại:

- **Trang quỹ, tích sản (-18% đến -23%)**: thiếu iframe Google Sheets (mục 1, #7).
- **Trang trái phiếu (-2% đến -17%)**: hero không có ảnh nền thấp hơn (gốc cố định 350px); carousel ảnh là slider một ảnh (gốc cao hơn do ảnh rộng hết cột); bảng vẫn gọn hơn gốc (đệm 12px so với 15px).
- **Trang form (+100%)**: số đo của gốc lấy khi form HubSpot chưa nạp trong khung đo; bản mới giữ chỗ sẵn cho form. Không phải lỗi.
- Font IBM Plex Sans, nút cam, header/footer: như đã chốt ở `../dgo/audit.md`.

## 3. Chưa kiểm tra

- Ảnh chụp so sánh `cmp-*.jpg` trong thư mục này chụp **trước** các lần sửa — chưa chụp lại (trình duyệt của phiên không chụp được màn hình).
- Mobile 375px, trạng thái hover/menu, gửi thử form.
- Trang chủ `/` mới so nội dung (đủ chữ, link), chưa đo bố cục.

## 4. Header và footer (khảo sát 12/11/2026)

Đọc từ template `header` / `footer` Elementor của trang gốc, so với `content/site.ts`.

| Phần | Trang gốc | Bản Next | Kết luận |
|---|---|---|---|
| Nút header | "Mở tài khoản" → `mydgo.vndirect.com.vn/mo-tai-khoan?sourceCode=BLOG&sourceName=Dau_tu_blog`; không có "Đăng nhập" | Trước: desktop chỉ hiện "Đăng nhập" → `accounts.vndirect.com.vn`, "Mở tài khoản" chỉ có trong menu mobile | **Đã sửa** — desktop luôn hiện "Mở tài khoản" |
| Hotline header | "Tổng đài tư vấn 1900545409" → `tel:1900545409` | Trước: không có | **Đã sửa** — thay cho "Đăng nhập", hiện từ 1536px và trong menu mobile |
| Menu chính | 6 mục, 3 cấp | Cùng cây, cùng nhãn, cùng link | Khớp |
| "Các gói dịch vụ chuyên gia" (mục cha) | Link `/?page_id=65573` — trả **404** | Không gắn link | Giữ (link gốc hỏng) |
| "Sản phẩm đầu tư" và 3 tiêu đề nhóm | `/#1`, `#` | Không gắn link | Khớp |
| Support → "Đặt lịch tư vấn" | `href="#"`, HTML không có popup nào | Chưa có (TODO trong `content/site.ts`) | Chờ BA xác nhận đích đến |
| Footer: Liên hệ, Kiến thức đầu tư, Sản phẩm | 10 link | Cùng 10 link | Khớp |
| Footer: dòng pháp lý | Chữ thường "Điều khoản sử dụng © 2018 Phát triển bởi VNDIRECT", không link | Thêm 2 link: Điều khoản sử dụng, Chính sách bảo vệ dữ liệu cá nhân (sang `www.vndirect.com.vn`) | **Đã sửa** — bỏ 2 link, dòng chữ như gốc |

Nguyên nhân nút lệch: khung header chép từ vnd-invest luôn hiện `secondaryAction` trên desktop, còn `primaryAction` chỉ hiện qua `HeaderPageAction` khi trang có cấu hình `scrollActions` (dautu để rỗng) → "Mở tài khoản" không bao giờ hiện.

Sau khi sửa, dưới 1536px hai mục cuối (Support, Blog) nằm trong nút "…" để header không xuống dòng; header cao 80px ở mọi bề rộng 1024–1920px.
