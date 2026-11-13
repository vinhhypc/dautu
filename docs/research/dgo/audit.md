# Khảo sát giao diện /dgo/ — trang gốc và bản Next

Khảo sát ngày 12/11/2026, Chrome 1440×900. Cùng một phép đo cho cả hai bản: chụp toàn trang, cắt theo từng section, và đo từng khối chữ (font, cỡ, chiều cao dòng, độ đậm, căn lề, vị trí, độ rộng), ảnh (kích thước hiển thị), section (chiều cao, padding, nền).

- Gốc: https://dautu.vndirect.com.vn/dgo/ — cao **9.020px**, 15 section.
- Mới: http://localhost:3041/dgo/ — cao **10.429px** (+1.409px), 14 section.
- Ảnh so sánh từng khối (trái gốc, phải mới): [`audit/`](audit/).

## 1. Tổng hợp theo mức độ

| # | Vấn đề | Ảnh hưởng | Nguyên nhân | Cách khắc phục | Loại |
|---|---|---|---|---|---|
| 1 | Icon mạng xã hội (SoundCloud/YouTube/Facebook) phóng to hết cột | **Rất nặng** — khối "Gieo hạt" cao 2.042px (gốc 556px) | Icon chèn trong đoạn văn bằng `<img width="10%">`; bộ chuyển HTML đọc `width` như số px nên bỏ qua giá trị `%` → ảnh hiện kích thước gốc (~260px), mỗi ảnh một dòng | Hiểu `width="NN%"` (và `px`) trên `<img>` trong nội dung WP → bậc độ rộng; nhiều ảnh trong cùng một đoạn văn hiển thị **cùng một hàng** như gốc | Template |
| 2 | Thiếu khung + bóng đổ của thẻ ở 5 khối ("Hệ thống công cụ", "Cung cấp thông tin", "VNDIRECT DGO", "Gieo hạt", "Cộng đồng") | Nặng — mất cảm giác "thẻ", nội dung trôi trên nền | Gốc đặt `box-shadow` (và nền trắng) trên **cột**; bộ đọc chưa đọc `box-shadow` | Đọc `box-shadow` của cột/section → cột hiển thị bằng `Card` ds-one (`shadow-md`, nền trắng, bo góc) | Template |
| 3 | Mất 2 khung viền tím quanh "DBOARD" và "VNDSTOCK" | Nặng | Viền đặt trên **inner section** (không phải cột / top section) — chưa đọc | Inner section có viền/nền → bọc nhóm cột trong khung; viền tím map token `border-system-purple-primary` | Template |
| 4 | Chữ dính khi tiêu đề xuống dòng: "CẢNH BÁO**BIẾN** ĐỘNG", "GIAO DỊCH**CHỨNG** KHOÁN", "VNDIRECT DGO**TRÍ TUỆ**", "CÔNG CỤ**CĂN** BÁN" | Nặng — sai chữ | Lấy chữ tiêu đề bằng `textContent`, thẻ `<br>` bị bỏ không thay bằng khoảng trắng | Giữ `<br>` thành xuống dòng (`whitespace-pre-line`) cho tiêu đề, tiêu đề thẻ, slide | Template |
| 5 | Font khác: gốc **Montserrat** (tiêu đề, thân bài) + Roboto/Verdana; mới **IBM Plex Sans** | Nặng về cảm nhận — cùng 16px nhưng Montserrat rộng/to hơn rõ, nên "cỡ chữ trông nhỏ" | Dự án dùng font của ds-one (IBM Plex Sans tự host) | **Cần chốt**: (a) giữ IBM Plex Sans theo ds-one và tăng cỡ thân bài 16→18 cho tương đương; (b) đổi brand font của dautu sang Montserrat (tự host trong `public/nx/fonts`, đặt qua token `--ds-brand-typography-family`) | Quyết định |
| 6 | Khoảng cách dòng hẹp: thân bài 22px (gốc 24,6px ≈ 1.54), h2 32px (gốc 37,5px) | Trung bình — chữ đặc, khác nhịp | Dùng line-height mặc định của token cỡ chữ ds-one | Nội dung WP dùng `leading-relaxed` (~1.5) cho đoạn văn/danh sách; tiêu đề `leading-snug` | Template |
| 7 | Mỗi section có padding 64px trên/dưới (gốc 0, khoảng cách đến từ margin widget) → trang dài +1.409px | Trung bình | Padding cố định `py-48 md:py-64` cho mọi section | Đọc `padding` của section trong CSS Elementor → bậc `py-0/16/32/48/64`; mặc định giảm còn `py-32 md:py-40` | Template |
| 8 | Nút "Trải nghiệm ngay" màu **tím** (`#47236C`) ở gốc, mới là cam | Trung bình | Màu nút bị bỏ có chủ ý (dùng nút ds-one) | **Cần chốt**: giữ nút cam (brand ds-one) hay thêm biến thể nút tím (token `system-purple`) cho khối VNDSTOCK | Quyết định |
| 9 | Ảnh nền hero bị cắt mất vòng tròn "Tăng trưởng bền vững" bên phải | Trung bình | Chưa đọc `background-position`/`background-size` của section; ảnh `object-cover` canh giữa | Đọc `background-position` → `object-left/center/right`, `background-size: contain` → `object-contain` | Template |
| 10 | Cột "ĐƯỜNG ĐỜI" màu vàng `#FFB600` ở gốc, mới cam `#E77500` | Nhẹ–trung bình | Mọi màu cam/vàng đều map về `brand` | Map vàng → token `system-orange-*` (hoặc màu vàng nếu ds-one có); cam đậm giữ `brand` | Template |
| 11 | Form "Bạn cần hỗ trợ?" bị đóng khung trắng có viền, hẹp hơn (gốc trải 1.120px trên nền section) | Nhẹ | Component `HubspotForm` luôn có khung + padding | Thêm biến thể `plain` (không khung) khi form nằm trực tiếp trong section | Template |
| 12 | Slider "Giải pháp dịch vụ toàn diện": gốc là slider Elementor có mũi tên, chữ trên nền trong suốt, tiêu đề 35px; mới là StepSlider (thanh bước 01/02/03) trên khung xám, tiêu đề 28px | Nhẹ — **khác biệt có chủ ý** (yêu cầu dùng slider vnd-20) | — | Giữ StepSlider; bỏ khung nền xám của slide chữ, tiêu đề slide `text-large-lg` (32px) | Template |
| 13 | Icon Font Awesome (người ở "Đường đời", chấm tròn đầu dòng danh sách) không hiện; danh sách dùng icon ✓ | Nhẹ | Font Awesome không được nạp (không thêm thư viện icon ngoài) | Map vài icon FA hay dùng (`fa-dot-circle`, `fa-check`, `fa-user`…) sang icon ds-one; icon lạ thì bỏ | Template |
| 14 | Tiêu đề 2 dòng của gốc ("VNDSTOCK / TRÍ TUỆ CỔ PHIẾU…", "CUNG CẤP THÔNG TIN TOÀN DIỆN / VỀ THỊ TRƯỜNG…") thành 1 dòng | Nhẹ | Cùng nguyên nhân #4 | Như #4 | Template |
| 15 | Header/footer khác hẳn (gốc: logo VNDGO, hotline, nút cam "Mở tài khoản", menu chữ in hoa hàng 2; footer nền đen) | Nặng về tổng thể | Header/footer dùng chung khung vnd-invest | Làm riêng header/footer theo gốc bằng component ds-one (một lần cho cả site) | Site |

## 2. Chi tiết từng khối

| Khối | Cao gốc → mới | Khác biệt chính (ngoài mục chung ở bảng 1) | Ảnh |
|---|---|---|---|
| Hero | 512 → 480 | #9 ảnh nền bị cắt; đoạn mô tả 18px/27px (mới 16/22) | [01-hero](audit/01-hero.jpg) |
| Thiết lập la bàn đầu tư trọn đời | 181 → 236 | #7 padding; h2 25px/37,5 (mới 24/32) | [02](audit/02-thiet-lap.jpg) |
| Đường đời / Thách thức / Giải pháp | 300 → 418 | #10 vàng→cam; #13 icon người, chấm đầu dòng; tiêu đề cột 18px/18px (mới 20/28); danh sách 18px (mới 16) | [03](audit/03-duong-doi.jpg) |
| Những nguyên nhân dẫn đến thất bại | 739 → 863 | Tiêu đề trong dải nền xám nhạt riêng (gốc), mới nằm chung; ảnh hơi to hơn (60% → bậc `w-2/3`) | [04](audit/04-bai-hoc.jpg) |
| Hành trình đầu tư | 534 → 546 | Gần khớp | [05](audit/05-hanh-trinh.jpg) |
| Giải pháp dịch vụ toàn diện | 638 → 628 | #12 slider | [06](audit/06-giai-phap.jpg) |
| Tháp thịnh vượng | 650 → 740 | Ảnh khớp; dư padding | [07](audit/07-thap-thinh-vuong.jpg) |
| VNDSTOCK – DBOARD / VNDSTOCK | 991 → 911 | #3 khung tím; #8 nút tím; #4 "GIAO DỊCH**CHỨNG**"; tiêu đề 2 dòng | [08](audit/08-vndstock.jpg) |
| Hệ thống công cụ quản trị rủi ro | 631 → 625 | #2 thẻ bóng đổ; #4 chữ dính; #8 nút tím | [09](audit/09-quan-tri-rui-ro.jpg) |
| Cung cấp thông tin + VNDIRECT DGO | 1.194 → 984 | #2 thẻ; #4 "DGO**TRÍ TUỆ**"; tiêu đề 2 dòng | [10](audit/10-thong-tin-thi-truong.jpg) |
| Gieo hạt tri thức đầu tư | **556 → 2.042** | #1 icon phóng to; #2 thẻ | [11](audit/11-gieo-hat.jpg) |
| Cộng đồng xây dựng nếp đầu tư | 479 → 479 | #2 thẻ bóng đổ | [12](audit/12-cong-dong.jpg) |
| Bạn cần hỗ trợ? | 627 → 760 | #11 form bị đóng khung | [13](audit/13-ban-can-ho-tro.jpg) |
| Hỗ trợ tư vấn | 213 → 274 | Nền cam gần khớp; chữ 18px (mới 16); dư padding | [14](audit/14-ho-tro-tu-van.jpg) |

## 3. Kế hoạch khắc phục

Mọi sửa ở **template chung** (`lib/wp/elementor*.ts`, `components/sections/wp-sections.tsx`) để 41 trang khác cũng được hưởng; không sửa riêng /dgo/.

| Bước | Việc | Mục | Ước lượng |
|---|---|---|---|
| 1 | Giữ `<br>` trong tiêu đề/thẻ/slide | #4, #14 | 0,5 giờ |
| 2 | Hiểu `width="%"`/`px` của `<img>` trong nội dung WP; ảnh trong cùng đoạn văn xếp hàng ngang | #1 | 1 giờ |
| 3 | Đọc `box-shadow`, viền/nền của cột **và inner section** → thẻ ds-one / khung | #2, #3 | 2 giờ |
| 4 | Đọc `padding` section, giảm padding mặc định; line-height `relaxed` cho nội dung WP | #6, #7 | 1 giờ |
| 5 | `background-position/size` ảnh nền; map vàng/tím sang token | #9, #10 | 1 giờ |
| 6 | Form HubSpot biến thể không khung; slide chữ bỏ khung xám, tiêu đề 32px; map icon FA thường dùng | #11, #12, #13 | 1,5 giờ |
| 7 | Đo lại bằng cùng script (chiều cao từng khối lệch ≤ 10%, không còn chữ dính, cỡ/khoảng dòng khớp ±2px), chụp lại `audit/`; chạy lại 42 trang | — | 1 giờ |
| 8 | Header/footer theo gốc (sau khi chốt #5, #8) | #15 | 0,5–1 ngày |

**Cần chốt trước bước 4–8:**
1. **Font** (#5): giữ IBM Plex Sans của ds-one (tăng cỡ thân bài) hay dùng Montserrat như trang gốc?
2. **Nút tím** (#8): giữ nút cam ds-one cho cả trang, hay thêm biến thể tím cho khối VNDSTOCK?
3. **Màu vàng** (#10): dùng token cam/vàng hệ thống của ds-one hay giữ một màu brand?

## 4. Kết quả sau khi sửa (12/11/2026)

Đã chốt: **giữ font IBM Plex Sans của ds-one**; nút giữ màu cam ds-one; vàng `#FFB600` → token `system-orange`. Đo lại bằng cùng script, ảnh trong [`audit/`](audit/) đã cập nhật.

| Khối | Gốc | Trước | Sau |
|---|---:|---:|---:|
| Hero | 512 | 480 | 480 |
| Thiết lập la bàn | 181 | 236 | 188 |
| Đường đời | 300 | 418 | 338 |
| Bài học | 739 | 863 | 747 |
| Hành trình | 534 | 546 | 498 |
| Giải pháp dịch vụ | 638 | 628 | 580 |
| Tháp thịnh vượng | 650 | 740 | 692 |
| VNDSTOCK | 991 | 911 | 984 |
| Quản trị rủi ro | 631 | 625 | 621 |
| Thông tin thị trường | 1.194 | 984 | 1.119 |
| **Gieo hạt** | 556 | **2.042** | 533 |
| Cộng đồng | 479 | 479 | 458 |
| Bạn cần hỗ trợ? | 627 | 760 | 646 |
| Hỗ trợ tư vấn | 213 | 274 | 226 |
| **Cả trang** (không tính header) | 8.863 | 10.349 | 8.473 |

Đã xử lý: #1 icon (ảnh `width="%"`, ảnh cùng đoạn xếp hàng), #2 thẻ bóng đổ (đọc `box-shadow` của cột, thẻ cùng hàng cao bằng nhau), #3 khung tím của inner section, #4/#14 giữ `<br>`, #6 khoảng dòng `leading-relaxed`/`leading-normal`, #7 padding section theo CSS (mặc định 32/40px), #9 `background-position` (ưu tiên trái/phải), #10 vàng → `system-orange`, #11 form HubSpot không khung, #12 slide chữ bỏ khung xám, tiêu đề 32px. 13/14 khối lệch chiều cao ≤ 10% so với gốc (Đường đời +13%).

Còn lại (có chủ ý hoặc chờ việc khác):
- #5 font: IBM Plex Sans hẹp hơn Montserrat nên chữ trông nhỏ hơn ở cùng cỡ px; thân bài giữ 16px (ds-one không có 18px). Đoạn hero gốc 18px.
- #8 nút cam thay nút tím (UI ds-one).
- #13 icon Font Awesome (người ở "Đường đời", chấm đầu dòng) chưa có — danh sách dùng icon ✓.
- Bóng đổ thẻ dùng `shadow-md` của ds-one (nhạt hơn bóng đen 50% của gốc).
- #15 header/footer.

### Sửa thêm: thẻ ngang hàng (12/11/2026)

Phản hồi: hai thẻ cùng hàng không tương đồng. Nguyên nhân: ảnh trong thẻ bị căn trái (mặc định sai — Elementor căn giữa ảnh), căn giữa đặt trên `<div>` bao ngoài không được đọc, và các phần trong thẻ (ảnh/tiêu đề/mô tả/nút) không thẳng hàng giữa các thẻ vì ảnh cao khác nhau.

Cách sửa (template chung): ảnh mặc định căn giữa; căn lề của khối bao áp xuống đoạn/ảnh bên trong; thẻ cùng hàng dùng **CSS subgrid** (`grid-rows-subgrid`) — các thẻ chia chung hàng lưới nên ảnh giữ kích thước gốc mà tiêu đề, mô tả, nút vẫn cùng một dòng; nút giữ chiều cao tự nhiên.

Đo lại: mọi hàng thẻ trên /dgo/ cao bằng nhau, tiêu đề cùng vị trí trong từng hàng (207 / 207 / 207px, 107 / 107px, 191 / 191px, 138 / 138px tính từ đỉnh thẻ), nút cách đáy thẻ 24px; ảnh căn giữa (lệch tâm 0px).
