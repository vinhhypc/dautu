---
name: add-page
description: Thêm một trang mới vào site dautu-vndirect — tạo file content, route App Router, metadata SEO, JSON-LD breadcrumb và đưa vào sitemap. Dùng khi được yêu cầu tạo/thêm trang, landing page, route mới.
---

# Thêm trang mới

Đọc `AGENTS.md` và `docs/design-system/ai-rules.md` trước.

## Các bước

1. **Content** — tạo `content/pages/<slug>.ts`:
   ```ts
   import type { PageContent } from "@/types/content";
   import coverImage from "@/public/images/<slug>.webp";

   export const <name>Page = {
     seo: {
       title: "…",            // 50–60 ký tự, không lặp tên site (layout tự thêm)
       description: "…",      // 120–160 ký tự
       path: "/<slug>",
       changeFrequency: "monthly",
       priority: 0.7,
     },
     breadcrumb: [{ label: "Trang chủ", href: "/" }, { label: "…", href: "/<slug>" }],
     hero: { … },
     // các section khác, kiểu lấy từ types/content.ts
   } satisfies PageContent & { … };
   ```
   Mọi chữ, alt ảnh, link đều nằm ở đây — không đặt trong component.

2. **Sitemap** — thêm `<name>Page` vào mảng `publicPages` trong `content/pages/index.ts`.

3. **Menu** (nếu cần) — thêm vào `siteContent.header.nav` (`content/site.ts`).

4. **Route** — tạo `app/<slug>/page.tsx` (site chỉ có tiếng Việt, giữ nguyên path WordPress kể cả `/` cuối):
   ```tsx
   import { JsonLd } from "@/components/seo/json-ld";
   import { Hero } from "@/components/sections/hero";
   import { <name>Page } from "@/content/pages/<slug>";
   import { buildMetadata } from "@/lib/seo";
   import { breadcrumbSchema } from "@/lib/structured-data";

   export const metadata = buildMetadata(<name>Page.seo);

   export default function <Name>Route() {
     return (
       <>
         <JsonLd data={breadcrumbSchema(<name>Page.breadcrumb)} />
         <Hero {...<name>Page.hero} />
       </>
     );
   }
   ```
   Chỉ ghép content vào section có sẵn trong `components/sections/`. Thiếu khối nào → dùng skill `add-section`.

5. **Ảnh** — `.webp` chất lượng cao (quality ≥ 90, rộng ≥ 1200px; hero ≥ 1920px) đặt vào `public/images/`, import tĩnh trong content. Section có sẵn đã đặt `quality` (`IMAGE_QUALITY.high` cho hero). Hero dùng `preload`, ảnh khác lazy.

## Kiểm tra

- Đúng một `<h1>` (thường do `Hero`), heading không nhảy cấp.
- `pnpm lint && pnpm typecheck && pnpm build` sạch.
- Mở `/sitemap.xml` thấy trang mới; view-source thấy `<link rel="canonical">` và `og:*`.
