# Plan review UI/UX — 25 trang trên menu và footer

Kiểm tra ngày 16/11/2026 trên dev server (`localhost:3000`), Chrome headless ở 2 khung **1440px** (desktop) và **390px** (mobile): chụp toàn trang + đo tự động (heading, alt ảnh, link, cỡ chữ, tỉ lệ tương phản, vùng bấm, tràn ngang). Header/footer và menu mobile kiểm tra thêm trên trình duyệt trong app.

Phạm vi: 25 trang nội bộ link từ `content/site.ts` — trang chủ, 16 landing, `/blog/`, 5 chuyên mục, 2 bài viết.

Mức độ:

- **Cao** — mất thông tin, không bấm/đọc được, trượt WCAG AA, ảnh hưởng chuyển đổi (mở tài khoản, đăng ký tư vấn).
- **TB** — xấu, khó dùng, lệch ds-one nhưng vẫn dùng được.
- **Thấp** — đánh bóng, nhất quán.

Cột "Ai sửa": **FE** = sửa trong Next (template, áp cho mọi trang); **ND** = marketing sửa trên WordPress; **BA** = cần quyết định.

---

## 1. Tóm tắt

| | Số lỗi | Ghi chú |
|---|---:|---|
| Lỗi chung (sửa 1 chỗ, ăn nhiều trang) | 18 | 7 mức Cao |
| Header, footer | 10 | 2 mức Cao |
| Riêng từng trang | ~40 | phần lớn do nội dung WP |
| Điểm chưa hợp lý về cấu trúc / nội dung | 7 | cần BA |

Không có trang nào tràn ngang, thiếu `h1` hay ảnh hỏng. Vấn đề lớn nhất nằm ở **template chung**: link vô hình trên nền cam, chữ cam/trắng-trên-cam thiếu tương phản, hero chữ đè ảnh, thẻ lật trống trên desktop, bảng so sánh vỡ trên mobile, form HubSpot lệch giao diện. Sửa 7 lỗi Cao của mục 2 là xử lý được phần lớn cảm giác "tệ" trên cả 17 landing.

---

## 2. Lỗi chung (template)

| # | Vấn đề | Trang bị | Mức | Cách sửa | Ai sửa |
|---|---|---|---|---|---|
| G1 | **Link cùng màu nền → vô hình.** Khối "HỖ TRỢ TƯ VẤN" nền cam: "TẠI ĐÂY", "Mạng lưới chi nhánh VNDIRECT" màu cam trên nền cam (tương phản 1,0:1) | `/dgo/`, `/dlife/`, `/dsip/` và mọi trang có khối này | Cao | `link-text` (`app/globals.css`) luôn dùng `brand-primary`. Trong section có `tone` brand/inverse: link dùng `currentColor` + gạch chân (`[&_.link-text]:text-current underline`) | FE |
| G2 | **Chữ cam trên nền trắng/xám thiếu tương phản.** Link nội dung, nhãn cam: ~2,8–3,0:1 (cần 4,5:1) | Mọi trang có link trong đoạn văn (D-Bond 7 link, V-Bond 5…) | Cao | Link trong thân bài dùng token cam đậm hơn (`brand-primary-hover` hoặc token chữ brand của ds-one) và **gạch chân mặc định** — hiện chỉ phân biệt bằng màu (WCAG 1.4.1) | FE |
| G3 | **Chữ trắng trên nền cam `#E77500` = 3,0:1** — trượt AA với chữ thường 14–16px: khối "Tại sao lựa chọn DBA", 3 bước DLIFE/DSIP, mặt sau thẻ lật, nút primary | `/dba…`, `/dwa…`, `/dlife/`, `/dsip/`, `/dstock/` | Cao | Đoạn văn dài: không đặt trên nền cam — đổi sang nền `brand` nhạt + chữ `text-primary`, giữ cam cho tiêu đề/viền. Nút: báo nhóm ds-one (token nút primary) | FE + DS |
| G4 | **Hero có ảnh nền: chữ đè lên ảnh.** Cột chữ rộng hết khung, lớp phủ chỉ mờ bên trái | `/trai-phieu-d-bond/` ("…theo thời gian đầu tư đã xác định" đè lên ảnh đồng xu), `/san-pham/chung-chi-quy-mo-vndaf/` | Cao | `wp-sections.tsx` (section `isHero` + `background`, không có `tone`): giới hạn cột chữ `md:max-w-560` / `md:w-1/2`, hoặc phủ nền đặc hơn ở vùng chữ | FE |
| G5 | **Thẻ lật trống trên desktop.** Mặt trước chỉ có logo/tiêu đề, cao 240px; nội dung + nút chỉ hiện khi rê chuột. Mobile thì hiện khối cam xếp chồng | `/dstock/` (7 thẻ "Kiến thức giao dịch" trông như ô trắng), `/blog/` (4 thẻ chuyên mục), `/san-pham/tich-san-huu-tri/` | Cao | Bỏ hiệu ứng lật (`case "flipCards"` trong `wp-sections.tsx`): hiện mặt sau ngay dưới mặt trước trong cùng một Card, nút "Tìm hiểu thêm" luôn thấy, bỏ `min-h-240` | FE |
| G6 | **Bảng so sánh vỡ trên mobile.** Cột ~150px, mỗi dòng 2–3 chữ, cuộn ngang không có gợi ý, bảng còn nằm trong khung viền cam (đệm 2 lớp) | `/dsip/`, `/dstock/` ("Thông tin chi tiết"), bảng lãi suất `/trai-phieu-d-bond/` | Cao | Dưới `md`: đổi bảng nhiều cột thành thẻ xếp dọc theo cột (mỗi sản phẩm một thẻ, hàng thành cặp nhãn–giá trị); hoặc tối thiểu cột 220px + cột đầu `sticky` + bóng mép báo còn nội dung | FE |
| G7 | **Form HubSpot mỗi form một kiểu, lệch ds-one.** Ô nhập xanh xám, nút xanh lá ("Đăng ký"), cam viên thuốc ("Gửi thông tin"), vàng ("Gửi"); nhãn 12px; có nhãn tiếng Anh "Phone number" | `/dlife/`, `/dgo/`, `/quy-etf…`, `/vndcf`, `/vndaf`, `/vndbf`, `/dang-ky-tim-chuyen-gia/`… | Cao | `HubspotForm`: tạo form với `css: ""` (tắt CSS HubSpot) và tự style `.hs-form` theo token (input như `components/ui/input`, nút như `Button` primary, nhãn 14px). Báo marketing sửa nhãn tiếng Anh | FE + ND |
| G8 | **Khối nhúng là ô trắng lớn khi đang tải**: iframe mở tài khoản (718×718, qua 2 lần chuyển hướng), biểu đồ Google Sheets (5–10 giây mới vẽ), widget iNAV | `/dstock/`, `/dba…`, `/dwa…`, các trang quỹ, tích sản | TB | Khung giữ chỗ có nền + chữ "Đang tải…" + link mở trong tab mới làm phương án dự phòng; iframe mở tài khoản trỏ thẳng URL cuối (`mydgo.vndirect.com.vn/mo-tai-khoan/…`); đặt tỉ lệ theo nội dung thay vì vuông | FE |
| G9 | **Tiêu đề section dạng thanh cam full-width** trông như nút bấm | `/dba…`, `/dwa…` ("Nền tảng trực tuyến hỗ trợ…", "Cách đăng ký…", "HỖ TRỢ TƯ VẤN") | TB | Heading nằm trong cột có nền brand mà cột chỉ có heading → hiển thị như `SectionHeading` thường; chỉ giữ nền cam cho dải CTA thật | FE |
| G10 | **Ảnh infographic chứa chữ nhỏ**, mobile không đọc được, thường không có alt | `/dgo/` (Bài học, Hành trình DGO, vòng HIỂU–ĐỒNG HÀNH–PHÙ HỢP), `/trai-phieu-v-bond/` (ví dụ coupon), `/vndcf` (logo đối tác), trang chủ (banner) | TB | Ngắn hạn: bấm ảnh để phóng to (lightbox) + alt mô tả. Dài hạn: dựng lại các khối chính bằng HTML | FE + ND |
| G11 | **Ảnh thiếu alt**: 146 ảnh trên 25 trang (DGO 34, Tích sản mục tiêu 15, D-Bond 14, bài mở tài khoản 12…); 6 ảnh-link ở DGO không có tên (trình đọc màn hình đọc URL) | Hầu hết landing | TB | ND bổ sung alt trên WP. FE: ảnh có `href` mà `alt` rỗng → `aria-label` lấy từ tên miền/tiêu đề gần nhất | ND + FE |
| G12 | **Link chung chung** "Xem thêm", "Tìm hiểu thêm", "TẠI ĐÂY", "Xem ngay" (DSTOCK 12, DSIP 12, VNDAF 9) | Nhiều trang | TB | FE: link/nút trong thẻ tự thêm `aria-label` = nhãn + tiêu đề thẻ. ND: đổi "TẠI ĐÂY" thành chữ mô tả đích đến | FE + ND |
| G13 | **Số tổng đài trong nội dung không bấm được** ("1900545409") | `/dgo/`, `/dlife/`, `/dstock/`, `/dsip/`, D-Bond (3), V-Bond (3), DBA, DWA | TB | `RichText`: tự nhận dạng số `1900 545 409` → `tel:` | FE |
| G14 | **Hero thiếu nút hành động**; CTA đầu tiên nằm sâu dưới 1–2 màn hình | `/dgo/`, `/dlife/`, `/dsip/`, D-Bond, V-Bond, VNDCF, VNDAF, VNDBF, DBA, DWA, Tích sản mục tiêu (hero là ảnh có chữ in sẵn) | TB | ND thêm nút trong hero Elementor. FE (mobile): thanh CTA dính đáy màn hình "Mở tài khoản / Đăng ký tư vấn" trên landing | ND + FE |
| G15 | **Lạm dụng chữ IN HOA + căn giữa đoạn dài**: D-Bond 35 tiêu đề in hoa, V-Bond 26, DSTOCK 22, DGO 19; đoạn mô tả nhiều dòng căn giữa trong cột tính năng | Hầu hết landing | Thấp | ND viết thường tiêu đề. FE: đoạn > 3 dòng trong cột tính năng căn trái trên mobile | ND + FE |
| G16 | **Lưới thẻ để ô mồ côi** (4 thẻ trong lưới 3 cột → 3 + 1) | `/trai-phieu-v-bond/` ("Tại sao nên chọn"), D-Bond (danh sách TCPH 2 thẻ trong lưới 3) | Thấp | `gridColumns`: 4 mục → 4 cột hoặc 2×2; ít mục hơn số cột → căn giữa | FE |
| G17 | **Hiệu ứng làm nội dung hiện muộn**: menu + nút "Mở tài khoản" mờ dần 0,2–0,8s mỗi lần tải (`intro-fade`); cuộn nhanh thấy vùng trắng do reveal | Mọi trang | Thấp | Bỏ `intro-fade` ở header; reveal chỉ cho khối nhỏ, không ẩn khối đầu trang | FE |
| G18 | **Ảnh đại diện bài viết bị cắt chữ** (khung 16:9, ảnh WP ~1,91:1 có chữ sát mép: "RECT", "VN" bị cụt) | 5 chuyên mục | Thấp | `post-list.tsx`: `aspect-[1200/628]` hoặc `object-contain` trên nền | FE |

---

## 3. Header và footer

| # | Vấn đề | Mức | Cách sửa | Ai sửa |
|---|---|---|---|---|
| H1 | **Mobile: nút "Mở tài khoản" chỉ nằm trong menu hamburger** — CTA chính của site không thấy trên mobile | Cao | Hiện nút compact cạnh nút menu dưới `xl` (`header.tsx`) | FE |
| H2 | **Desktop 1280–1535px: "Support" và "Blog" bị giấu trong nút "…"** — Blog là cụm nội dung lớn nhất (764 bài). Laptop phổ biến (1366, 1440) đều rơi vào khoảng này | Cao | Rút gọn nhãn ("Gói chuyên gia"), giảm `gap`, đưa Blog lên trước; chỉ dồn vào "…" khi thật sự thiếu chỗ (đo thay vì cố định `navOverflowFrom: 4`) | FE + BA |
| H3 | Nhãn **"Support"** tiếng Anh giữa menu tiếng Việt | TB | Đổi "Hỗ trợ" (`content/site.ts`) | FE |
| H4 | Mục "Đặt lịch tư vấn" (trang gốc có) vẫn TODO | TB | Chờ BA chốt đích đến | BA |
| H5 | Menu + nút header mờ dần khi tải (xem G17) | Thấp | — | FE |
| F1 | **Footer lệch lề với nội dung**: footer và header bắt đầu ở 24px, nội dung ở 168px (khung 1440) — trên 1920 cột footer giãn rất rộng | TB | Bọc footer bằng `Container` chung | FE |
| F2 | Cột footer cách nhau không đều (24 / 378 / 910px), cột giữa rỗng | TB | Lưới 4 cột đều: Liên hệ · Kiến thức · Sản phẩm · (Hỗ trợ/Blog) | FE |
| F3 | Footer thiếu thông tin pháp lý của công ty chứng khoán (pháp nhân, địa chỉ, giấy phép, cảnh báo rủi ro đầu tư) và link Blog / Hỗ trợ (trang gốc cũng thiếu) | TB | BA/pháp chế cung cấp nội dung | BA |
| F4 | "Điều khoản sử dụng" là chữ thường, không link — trông như link hỏng | Thấp | Gắn link điều khoản hoặc bỏ chữ | BA |
| F5 | Link footer trên mobile cao 20px (khuyến nghị ≥ 44px) | Thấp | `py-12` cho link footer | FE |

---

## 4. Theo trang

Chỉ ghi lỗi riêng của trang; lỗi chung ở mục 2.

### Trang chủ `/`

- **Cao** — Thẻ "CẦN HỖ TRỢ TƯ VẤN?" chỉ có tiêu đề + 1 dòng, không có nút/form → ngõ cụt. Thêm nút gọi tổng đài + "Đăng ký tư vấn" (hoặc nhúng form) — `HomeVoices` trong `components/sections/home.tsx`.
- **TB** — Banner là ảnh có chữ in sẵn; trên mobile cao ~95px, chữ không đọc được. Cần ảnh banner riêng cho mobile (thêm trường trên WP) hoặc tỉ lệ cao hơn.
- **TB** — Slider tự chạy, không có nút tạm dừng (WCAG 2.2.2); thanh bước chỉ có "01 02" không nhãn.
- **TB** — "Tại sao lựa chọn VNDIRECT": khối chữ dày 2 cột, gạch đầu dòng bằng "–" gõ tay. FE: dòng bắt đầu bằng "– " trong `RichText` → danh sách thật; ND: rút gọn.
- **Thấp** — Lời khách hàng in nghiêng đậm, 8–10 dòng → chữ thường, giới hạn 4 dòng.
- **Thấp** — 3 thẻ DLIFE/DSIP/DGROW đều "Xem thêm" → cả thẻ bấm được, nhãn "Xem DLIFE".

### `/dgo/` La bàn đầu tư

- **TB** — Trang dài 8.700px (mobile 12.000px), 11 nút "Trải nghiệm ngay" giống hệt → loãng CTA. Gom thành 1 CTA chính cho mỗi nhóm.
- **TB** — Hero mobile: ảnh vòng tròn bị cắt, logo DGO đè lên chữ.
- **TB** — Pha màu tím (VNDSTOCK) giữa trang cam → lệch nhận diện; ND thống nhất màu.

### `/dlife/` Tài chính an sinh

- **TB** — Thẻ "Kế hoạch bảo hiểm — Sắp ra mắt" đứng ngang hàng 2 sản phẩm thật, không có nút → làm mờ hoặc gắn nhãn "Sắp ra mắt" dạng Badge.
- Các lỗi còn lại thuộc G1, G3, G7.

### `/dstock/` (DGROW)

- **Cao** — Khối "Kiến thức giao dịch": 4 thẻ chỉ có logo + 3 thẻ chỉ có chữ, nhìn như ô trống (G5).
- **TB** — Nội dung lặp 3 lần: "Mô tả sản phẩm" → "Sản phẩm lựa chọn" → bảng "Thông tin chi tiết" cùng 3 nhóm Gói tài khoản / Sản phẩm / Margin. BA gộp lại.
- **TB** — 3 thẻ đầu có ảnh thu nhỏ 80px chứa chữ không đọc được; nhãn link in hoa màu cam tương phản 2,8.

### `/dsip/`

- **Cao** — Bảng "Thông tin chi tiết" 3 cột trên mobile (G6), 7 link "TẠI ĐÂY" trong bảng.
- **TB** — Các thẻ DBOND, VBOND, VNDAF, ETF, VNDBF, Single Stock Saving không link sang trang sản phẩm → ngõ cụt. ND/FE gắn link tiêu đề thẻ.
- **TB** — Hero mobile: ảnh tháp mờ bị đẩy ra mép, chỉ còn logo + đoạn văn.

### `/trai-phieu-d-bond/`

- **Cao** — Hero chữ đè ảnh (G4).
- **TB** — Trang dài nhất (10.700px desktop, 17.000px mobile), không có mục lục. Thêm mục lục/neo nhảy (Lãi suất · Danh mục · Cách mua · FAQ) — `WpSections` đã có heading, sinh mục lục tự động.
- **TB** — Bảng lãi suất: con số quan trọng nhất cùng cỡ/màu với nhãn xám 13px; không có nút mua cạnh bảng. Tô đậm cột lãi suất, thêm CTA ngay dưới bảng.
- **Thấp** — Ghi chú in nghiêng đậm lặp lại sau mỗi bảng.

### `/trai-phieu-v-bond/`

- **TB** — "Tại sao nên chọn" 3 + 1 thẻ mồ côi (G16); ô form "Đăng ký tư vấn" trắng khi đang tải (G8).
- **TB** — Ảnh ví dụ dòng tiền coupon chữ 9–10px (G10).

### `/quy-etf-ipaam-vn100/`

- **TB** — Widget iNAV nhét trong khung 400px, có thanh cuộn trong, nửa phải khung viền trống. Cho widget rộng hết khung hoặc bỏ khung viền.
- **TB** — Cặp nút cuối: "Đăng ký tư vấn" (đậm) cạnh "ĐẦU TƯ NGAY" (nhạt) → hành động chính (đầu tư) lại yếu hơn; chữ hoa/thường lệch nhau.

### `/quy-dau-tu-trai-phieu-linh-hoat-vndcf/`

- **TB** — Hero gãy: tiêu đề nằm trên nền trắng, ảnh nền bắt đầu giữa chừng, dải logo đối tác nằm vắt ngang mép dưới ảnh.
- **Thấp** — Tiêu đề "PHÂN BỔ TÀI SẢN" tách khỏi ảnh của nó bởi nút "Đăng ký tư vấn ngay".

### `/dba-goi-chuyen-gia-moi-gioi/` và `/dwa-goi-chuyen-gia-tu-van-dau-tu-tai-chinh/`

- **Cao** — Đoạn văn trắng trên nền cam (G3), tiêu đề dạng thanh cam (G9).
- **TB** — Hero DBA: tiêu đề nhỏ (~22px), không mô tả, không nút, ảnh tháp tràn ra mép phải. DWA: không có hero.
- **TB** — Iframe mở tài khoản trắng 550×550 (G8).

### `/dang-ky-tim-chuyen-gia/`

- **TB** — Form HubSpot lệch ds-one (G7): radio nhỏ, nút cam viên thuốc 100px.
- Bố cục còn lại ổn.

### Trang sản phẩm `/san-pham/…`

- **VNDAF** — **Cao**: hero chữ đè ảnh (G4). Nút xanh lá HubSpot.
- **VNDBF** và **VNDBF doanh nghiệp** — **TB**: hai trang **giống hệt nhau** (cùng chiều cao 5.177px, cùng nội dung), trang "doanh nghiệp" không có nội dung riêng cho doanh nghiệp (xem mục 5). Biểu đồ tròn là ảnh chụp Excel chữ nhỏ.
- **Tích sản hưu trí** — **TB**: 4 lý do "Vì sao cần tích luỹ", thẻ đầu nền cam, 3 thẻ sau chữ trơn → trông như lỗi trạng thái. 3 thẻ kế hoạch: con số lợi nhuận (8,8%, 9,2%) chìm trong đoạn văn, không có nút. Tab VNDAF/VNDBF nhỏ 14px.
- **Tích sản mục tiêu** — **TB**: hero là ảnh có chữ in sẵn, không có chữ thật hay nút; thẻ "Bạn đang ấp ủ…" icon nhỏ, chữ căn giữa, nhiều khoảng trống.

### `/blog/`

- **Cao** — Trang chủ blog chỉ có 4 bài nổi bật + 4 thẻ chuyên mục trống (G5); không có danh sách bài mới, ô tìm kiếm, phân trang — 764 bài không có lối vào. Thêm "Bài mới nhất" (dùng `PostList` của chuyên mục) + ô tìm kiếm.
- **Thấp** — Tiêu đề thẻ bài nổi bật xuống dòng hẹp, lẫn in hoa và thường.

### Chuyên mục (5 trang) — một mẫu chung

- **TB** — Thanh bên 23 chuyên mục, gồm "Danh mục mẫu" (rác), "Support" (tiếng Anh); chuyên mục rỗng vẫn hiện. Ẩn chuyên mục rỗng/nội bộ, sắp theo số bài.
- **TB** — Ảnh đại diện bị cắt chữ (G18).
- **Thấp** — Badge chuyên mục trên từng thẻ lặp lại tên trang; tóm tắt dính chữ rác ("…Facebook Youtube" ở Đọc chậm). Lọc chữ của embed khi tạo excerpt.

### Bài viết (2 trang) — một mẫu chung

- **TB** — Bài "Hướng dẫn mở tài khoản" không có nút "Mở tài khoản" trong bài → thiếu CTA theo ngữ cảnh. Thêm khối CTA cuối bài theo chuyên mục (Support, Hướng dẫn).
- **TB** — Ảnh chụp màn hình hướng dẫn nhỏ trên mobile, không phóng to được (G10).
- **Thấp** — Không có "Bài liên quan" cuối bài; nội dung 2021 (URL `accounts.vndirect.com.vn` cũ) → ND rà lại.

---

## 5. Điểm chưa hợp lý về cấu trúc / nội dung (cần BA quyết)

1. **Hai trang VNDBF trùng nội dung**: menu "Tài chính an sinh → Quỹ đầu tư trái phiếu VNDBF" trỏ `/san-pham/quy-dau-tu-trai-phieu-vnd-vndbf-doanh-nghiep/`, menu "Sản phẩm đầu tư → Quỹ đầu tư trái phiếu VND – VNDBF" trỏ `/san-pham/quy-dau-tu-trai-phieu-vnd-vndbf/`. Cùng tên, khác URL, nội dung giống hệt → người dùng khó hiểu, SEO trùng lặp. Đề xuất: giữ 1 trang, trang kia 301 hoặc viết nội dung riêng cho doanh nghiệp.
2. **Sản phẩm lặp trong 2 menu**: VNDCF và D-Bond xuất hiện ở cả "Tài chính an sinh" và "Sản phẩm đầu tư" với nhãn khác nhau ("DBOND – Danh mục trái phiếu kỳ hạn ngắn" / "Trái phiếu D-Bond").
3. **Footer "Sản phẩm" dùng tên DGROW/DSIP/DLIFE** nhưng menu dùng "Tài chính an sinh", và trang DGROW nằm ở URL `/dstock/` → 3 tên cho cùng một thứ.
4. **Mục cha không có trang** ("Sản phẩm đầu tư", "Các gói dịch vụ chuyên gia") — chấp nhận được, nhưng nên có trang tổng hợp để người dùng mobile so sánh sản phẩm.
5. **DSTOCK lặp nội dung 3 lần** (xem mục 4).
6. **Thiếu thông tin pháp lý ở footer** (F3).
7. **Ảnh có chữ in sẵn** (banner trang chủ, hero Tích sản mục tiêu, infographic DGO) — không dịch, không đọc trên mobile, không SEO. Quy ước mới cho marketing: chữ quan trọng phải là chữ thật trong Elementor.

---

## 6. Kế hoạch thực hiện

| Đợt | Việc | Ước lượng | Kiểm tra |
|---|---|---|---|
| **1 — Lỗi Cao, template** | G1, G2, G3 (đoạn văn), G4, G5, G6, G7, H1, H2, thẻ "Cần hỗ trợ tư vấn" trang chủ | 3–4 ngày FE | Chạy lại đo tương phản (0 link < 3:1), chụp lại 17 landing ở 1440/390 |
| **2 — Lỗi TB, template** | G8, G9, G10 (lightbox), G11–G13 phần FE, G14 (thanh CTA mobile), F1, F2, F5, H3, mục lục D-Bond, blog "Bài mới nhất", lọc chuyên mục | 4–5 ngày FE | `pnpm lint && pnpm typecheck && pnpm build`; checklist `docs/design-system/ai-rules.md` |
| **3 — Nội dung WP** | Alt ảnh, đổi "TẠI ĐÂY", nút hero, chữ in hoa, nhãn HubSpot tiếng Anh, ảnh banner mobile | Marketing, song song đợt 1–2 | Đo lại số ảnh thiếu alt, link chung chung |
| **4 — Quyết định BA** | Mục 5, H4, F3, F4 | — | — |
| **5 — Đánh bóng** | G15–G18, các mục Thấp ở mục 4 | 1–2 ngày | — |

### Trạng thái đợt 1 (16/11/2026)

Đã sửa: G1, G2, G3, G4, G5, G6, G7, H1, H2, H3, G9 (một phần), thẻ "Cần hỗ trợ tư vấn" trang chủ. Đo lại trên 7 landing: 0 link dưới 3:1, 0 đoạn chữ dưới 4,5:1.

- G1–G3: khối nền cam của Elementor (`tone` brand/accent) đổi sang nền cam nhạt `brand-secondary` + chữ đậm; link nội dung và `TextLink` dùng token mới `text-link` (cam 800, ~6,9:1) + gạch chân. Nút primary trắng-trên-cam (3:1) **chưa đổi** — chờ nhóm ds-one.
- G4: hero một cột có ảnh nền giới hạn cột chữ 560px.
- G5: thẻ lật hiện cả hai mặt trong một Card, nút "Tìm hiểu thêm" luôn thấy.
- G6: bảng ≥ 3 cột, không gộp ô → dưới 768px thành thẻ theo cột.
- G7: CSS theo token ds-one chèn vào iframe HubSpot (`lib/hubspot-theme.ts`), iframe tự co giãn theo nội dung.
- G9: tiêu đề đứng một mình trong khối màu hiển thị như tiêu đề thường.
- H1: nút "Mở tài khoản" cỡ nhỏ cạnh nút menu dưới 1280px. H2/H3: "Support" → "Hỗ trợ", cả 6 mục menu hiện từ 1280px (bỏ nút "…").

### Trạng thái đợt 2 (16/11/2026)

Đã sửa phần FE: G8, G11 (ảnh-link), G12, G13, G14, blog "Bài viết mới nhất", ẩn chuyên mục nội bộ.

Đã bỏ theo yêu cầu: G10 (nút phóng to ảnh — làm vỡ bố cục), F1/F2/F5 (footer giữ nguyên như cũ). Thay F1: nội dung trang đổi sang full width cùng khung với header/footer (`Container`: tối đa 1920px, lề 16/24px).

- G8: iframe nhúng có nền + chữ "Đang tải nội dung…" bên dưới, link "Mở trong tab mới"; iframe `account-v2` trỏ thẳng `mydgo.vndirect.com.vn/mo-tai-khoan/`.
- G11: ảnh-link thiếu alt lấy tên miền đích làm tên link. Alt ảnh vẫn cần marketing bổ sung trên WP.
- G12: link nhãn ngắn ("Xem thêm", "Tìm hiểu thêm"…) trong thẻ có tên đầy đủ "nhãn: tiêu đề thẻ".
- G13: số 1900/1800 trong nội dung tự thành link `tel:`.
- G14: landing (trừ `/blog/`) có thanh "Gọi tổng đài / Đăng ký tư vấn" dính đáy dưới 768px; "Đăng ký tư vấn" nhảy tới form HubSpot của trang nếu có.
- Mục lục "Nội dung trang" tự sinh cho landing dài: đã làm rồi gỡ theo yêu cầu (lỗi "Trang dài, không có mục lục" của D-Bond còn để ngỏ).
- Blog: `/blog/` thêm 9 bài mới nhất + ô tìm kiếm; thanh chuyên mục ẩn "Danh mục mẫu".

Còn lại của đợt 2: G9 đã xong ở đợt 1; G14 phần nút hero là việc của marketing.

Chưa kiểm tra trong đợt này (đưa vào đợt sau):

- Bản production (`pnpm build && pnpm start`) — đợt này chạy dev server, tốc độ tải và hiệu ứng có thể khác.
- Trạng thái hover/mở của mega menu desktop, bàn phím (Tab qua menu, thẻ, form), trình đọc màn hình.
- Gửi thử form HubSpot.
- Video YouTube: máy kiểm tra có Kaspersky chặn YouTube nên khung video hiện trang lỗi — không phải lỗi site.
- Khổ tablet (768–1024px).
