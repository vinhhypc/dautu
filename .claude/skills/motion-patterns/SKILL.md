---
name: motion-patterns
description: Thêm hoặc sửa animation trong dautu-vndirect bằng thư viện motion theo design system (preset smooth 200ms, LazyMotion, reduced-motion, không ảnh hưởng SEO/LCP). Dùng khi được yêu cầu thêm hiệu ứng, animation, transition, reveal khi cuộn, animate menu/modal. Dùng cùng skill /motion của Motion AI Kit để tra API.
---

# Motion trong dautu-vndirect

Đọc `docs/design-system/motion-guidelines.md` trước. Cần tra API/ví dụ của Motion → dùng skill `/motion` và MCP `motion` (Motion AI Kit), nhưng **quy tắc dự án dưới đây luôn thắng** ví dụ chung.

## Quyết định nhanh

1. **Hover/active/focus/disabled?** → CSS `interactive-lift` / `link-text`. Dừng, không dùng motion.
2. **Hiện dần khi cuộn tới?** → nội dung WordPress / trang chủ / blog: bọc vùng chứa bằng `<RevealChildren>` (không thêm thẻ bọc cho từng phần tử, không ẩn nội dung đang thấy lúc tải). Section tự dựng → dùng component có sẵn:
   ```tsx
   import { Reveal, RevealGroup, RevealItem } from "../motion/reveal";

   <Reveal><SectionHeading … /></Reveal>

   <RevealGroup as="ul" className="grid gap-6 md:grid-cols-3">
     {items.map((item) => (
       <RevealItem as="li" key={item.id}>…</RevealItem>
     ))}
   </RevealGroup>
   ```
3. **Mount/unmount?** →
   ```tsx
   "use client";
   import { AnimatePresence } from "motion/react";
   import * as m from "motion/react-m";
   import { fade } from "@/lib/motion";

   <AnimatePresence>
     {isOpen && <m.div variants={fade} initial="closed" animate="open" exit="closed">…</m.div>}
   </AnimatePresence>
   ```
4. **Kiểu animation mới?** → thêm variant vào `lib/motion.ts`, dựng từ `MOTION_DURATION`, `MOTION_EASING`, `baseTransition`, `revealTransition`. Không viết `duration`/`ease` trực tiếp trong component.

## Bắt buộc

- `import * as m from "motion/react-m"` — **không** `motion.div` (LazyMotion `strict` sẽ báo lỗi).
- Không bọc `Reveal` quanh hero/h1/ảnh LCP/logo.
- Chỉ animate `opacity`, `x`, `y`, `scale`.
- Phần tử reveal mới tự viết phải có `data-reveal` để fallback no-JS hoạt động.
- Logic (state, effect) đặt trong `hooks/`, component motion chỉ là khung — không chữ cứng, không import `@/content`.

## Kiểm tra

- `pnpm lint && pnpm typecheck && pnpm build` sạch.
- Bật "Reduce motion" trong OS → không có chuyển động trượt.
- Tắt JS → mọi nội dung vẫn hiển thị.
- Lighthouse: LCP không bị trễ bởi animation.
