---
name: add-section
description: Tạo khối giao diện (section/component) mới cho dautu-vndirect theo design system — định nghĩa type content, component chỉ chứa khung giao diện dùng token, và dữ liệu trong content/. Dùng khi cần thêm section, card, block UI mới.
---

# Thêm section / component mới

Đọc `docs/design-system/ai-rules.md`, `design-guidelines.md`, `design-tokens.md`, `component-patterns.md` trước.

## Nguyên tắc

- **Design System ds-one (`vendor/ds-one/`):** `components/ui/` bọc component ds-one. Section chỉ dùng `components/ui/`, không import `@/vendor/ds-one` trực tiếp, không tự dựng nút/card/badge bằng HTML + class. Thiếu component → lấy component ds-one tương ứng (Modal, Tabs, Accordion, Select…) và bọc trong `components/ui/`.
- **Tái sử dụng trước:** kiểm tra `components/ui/` (Button, Card, Badge, Container, Section, SectionHeading) và `components/sections/`. Mở rộng variant có sẵn thay vì tạo bản gần giống.
- **Component = khung.** Không chữ cứng trong JSX, không import `@/content` (trừ `import type`). Mọi chữ kể cả `aria-label` đến từ props.
- **Chỉ dùng token ds-one:** `bg-brand-primary`, `text-text-secondary`, `p-24` (px), `rounded-8`, `shadow-md`, `text-normal-lg`. Không hex, không `[13px]`, không `style={}`. Không có token phù hợp → dùng token gần nhất, không tự tạo.
- **Phần tử tương tác:** nút/link dạng nút dùng `Button`/`ButtonLink`/`TextLink` (trạng thái của ds-one); phần tử tự viết dùng `interactive-lift` hoặc `link-text`.
- **Semantic HTML, mobile-first**, heading đúng cấp (section dùng `h2`, item dùng `h3`).

## Các bước

1. **Type** — thêm vào `types/content.ts`:
   ```ts
   export type <Name>Content = {
     id: string;           // dùng làm id section + aria-labelledby
     title: string;
     description?: string;
     items: { … }[];
   };
   ```
2. **Component** — `components/sections/<name>.tsx`, server component nếu không cần state:
   ```tsx
   import { Section } from "@/components/ui/section";
   import { SectionHeading } from "@/components/ui/section-heading";
   import type { <Name>Content } from "@/types/content";

   export function <Name>({ id, title, description, items }: <Name>Content) {
     const headingId = `${id}-title`;
     return (
       <Section id={id} labelledBy={headingId}>
         <SectionHeading id={headingId} title={title} description={description} />
         {/* khung giao diện, chỉ dùng token */}
       </Section>
     );
   }
   ```
   Cần state → tách logic vào `hooks/use-<x>.ts`, component chỉ gọi hook.
3. **Content** — thêm dữ liệu vào `content/pages/<page>.ts`.
4. **Route** — render `<Name {...page.<name>} />` trong `app/**/page.tsx`.
5. **Ảnh** — `next/image` (không `<img>`), `alt` từ content, `sizes` khớp grid, `quality={IMAGE_QUALITY.standard}` (hoặc `.high` cho ảnh LCP/lớn) từ `@/lib/image`. File nguồn `.webp` chất lượng cao trong `public/images/`.

## Kiểm tra

Chạy `pnpm lint && pnpm typecheck`, rồi đi qua checklist cuối `ai-rules.md` (focus ring, contrast AA, reduced-motion, responsive).
