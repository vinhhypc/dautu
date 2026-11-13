# Motion Guidelines

> Thư viện: [`motion`](https://motion.dev) (Motion for React). Preset của design system: **smooth**, 200ms, `cubic-bezier(0.4, 0, 0.2, 1)`.

## Nguồn token

| Ở đâu | Giá trị |
|---|---|
| `app/globals.css` | `--duration: 200ms`, `--easing: cubic-bezier(0.4, 0, 0.2, 1)` — cho CSS transition |
| `lib/motion.ts` | `MOTION_DURATION`, `MOTION_EASING`, variants dùng chung — mirror của token CSS |

Đổi token → sửa cả hai nơi. **Không** khai báo `duration`/`ease` tuỳ ý trong component.

## Chọn công cụ

| Trường hợp | Dùng |
|---|---|
| Hover / active / focus / disabled | CSS: utility `interactive-lift`, `link-text` — **không** dùng `whileHover`/`whileTap` |
| Xuất hiện khi cuộn tới (section tự dựng) | `<Reveal>`, `<RevealGroup>` + `<RevealItem>` (`components/motion/reveal.tsx`) |
| Xuất hiện khi cuộn tới (nội dung WordPress, trang chủ, blog) | `<RevealChildren>` (`components/motion/reveal-children.tsx`, hook `useRevealChildren`): mỗi phần tử con trực tiếp hiện dần, **không thêm thẻ bọc** nên layout không đổi. Chỉ ẩn phần tử nằm dưới màn hình lúc tải trang (nội dung LCP và khi tắt JS luôn hiển thị) |
| Hover thẻ | `hover-rise` (`app/globals.css`): nâng 4px + bóng `shadow-md`, tắt khi reduced-motion |
| Mount / unmount (menu, modal, toast) | `AnimatePresence` + `m.*` + variants trong `lib/motion.ts` (ví dụ `fade`) |
| Animation phức tạp (layout, gesture, scroll-linked) | `m.*` + variant mới trong `lib/motion.ts` |

## Quy tắc

- **Chỉ import `m` từ `motion/react-m`**, không dùng `motion.div`. `MotionProvider` (layout) chạy `LazyMotion strict` với `domAnimation` để bundle nhỏ; dùng `motion.*` sẽ báo lỗi.
- **Không reveal nội dung LCP**: hero `<h1>`, ảnh hero, logo phải hiện ngay — không bọc `Reveal`.
- **Chỉ animate `opacity` và `transform`** (x, y, scale). Không animate width/height/top/left/màu nền trên phần tử lớn.
- **Reduced motion**: `MotionConfig reducedMotion="user"` đã bật toàn cục; CSS transition có `@media (prefers-reduced-motion: reduce)`.
- **Không JS**: phần tử reveal có `data-reveal`; `<RevealFallback />` trong `<noscript>` hiện chúng ngay — nội dung vẫn đọc được và crawl được.
- **SEO**: animation không được ẩn/đổi nội dung chữ, không render nội dung chỉ ở client.
- Offset trượt dùng token spacing (`REVEAL_OFFSET` = 16 = `spacing-16`), không số tuỳ ý.
- Component motion là client component (`"use client"`); giữ chúng nhỏ, section bên ngoài vẫn là server component.
- `viewport={{ once: true }}` cho reveal — không lặp lại animation khi cuộn lên/xuống.
