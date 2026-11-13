# Design Tokens

> Nguồn: ds-one chép trong **`vendor/ds-one/tokens/`** (`@import "../vendor/ds-one/tokens/index.css"` trong `app/globals.css`) — sinh từ Figma New One, đổi theo `data-brand` / `data-theme` trên `<html>`.
> `app/globals.css` chỉ bổ sung token ds-one chưa có. File này mô tả — khi cần giá trị chính xác, xem `vendor/ds-one/tokens/`.

ds-one **xoá** thang mặc định của Tailwind cho: màu, spacing, radius, độ dày viền, cỡ chữ, line-height, font, font-weight, shadow. Class mặc định như `p-4` (×4), `text-sm`, `rounded-md`, `bg-white`, `font-bold` **không còn đúng / không còn tồn tại**.

## Màu (brand `vnds`, theme `light`)

| Nhóm | Token | Class ví dụ |
|---|---|---|
| Thương hiệu | `brand-primary` #e77500 · `brand-primary-hover` · `brand-secondary` #fff0e7 · `brand-secondary-hover` | `bg-brand-primary`, `text-brand-primary` |
| Nền | `background-base` #fff · `canvas` #f7f7f7 · `surface` #efefef · `hover` #ddd · `elevated` · `overlay` · `inverse` · `disabled` | `bg-background-surface` |
| Chữ | `text-primary` #0d0d0d · `secondary` #5d5d5d · `tertiary` #7d7d7d · `disabled` · `inverse` #fff | `text-text-secondary` |
| Viền | `border-subtle` · `border-default` #d6d6d6 · `border-strong` · `border-focus` | `border-border-default` |
| Hệ thống | `system-{red,green,orange,blue,cyan,purple}-{primary,secondary}[-hover]` | `bg-system-red-secondary` |

Độ mờ: dùng modifier trên token, ví dụ `bg-text-primary/40` (scrim), `bg-text-inverse/10`.

## Spacing — px

`p-8` = 8px, `gap-24` = 24px. ds-one có token 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 30, 32, 36, 40, 44, 48, 56, 64, 72, 80, 96, 120. Dự án đặt `--spacing: 1px` nên giá trị khác (`size-200`, `max-w-1440`, `w-400`) cũng tính theo px — ưu tiên dùng giá trị có trong danh sách token.

## Chữ

- Cỡ (kèm line-height): `text-normal-sm` 10 · `normal-md` 12 · `normal-l` 14/18 · `normal-lg` 16/22 · `normal-xl` 20/28 · `large-sm` 24/32 · `large-md` 28 · `large-lg` 32 · `large-xl` 40 · `hero-sm/md/lg` 48/56/64.
- Vai trò Figma (cỡ + line-height + độ đậm): `text-website-body-2-medium`, `text-mobile-title`, `text-webtrading-body-3-highlight`…
- Độ đậm: `font-regular` 400 · `font-medium` 500 · `font-semibold` 600.
- Font: **IBM Plex Sans** (next/font, subset latin + vietnamese) qua `font-sans`; `font-plain` của ds-one cũng trỏ IBM Plex Sans với brand `vnds`.

## Radius & viền

`rounded-0/2/4/6/8/10/12/14/16/20`, `rounded-1000` (pill). Nút VNDS = `rounded-4`, card/panel = `rounded-8`. Độ dày viền: `border` (1px), `border-2` … `border-10`.

## Shadow

`shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-illustration-glass` (ds-one) · `shadow-soft` (dự án — VNDS Shadow/soft cho mega menu).

## Motion

`--duration: 200ms`, `--easing: cubic-bezier(0.4, 0, 0.2, 1)` (dự án). Xem `motion-guidelines.md`.

## Utility của dự án (`app/globals.css`)

- `bg-hero-scrim` — gradient tối phủ ảnh hero.
- `icon-mask` + `icon-<tên>` — icon đơn sắc từ `public/icons/*.svg`, tô bằng màu chữ (`components/ui/icon.tsx`).
- `interactive-lift`, `link-text` — hiệu ứng cho phần tử tự viết; nút/link dạng nút dùng trạng thái của Button ds-one thay vì lift.
