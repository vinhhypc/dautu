# dautu-vndirect

Site `dautu.vndirect.com.vn` (Nếp sống đầu tư, tiếng Việt) thuộc nhóm `ipas-fe/corp-sites`, dựng lại từ WordPress theo khung vnd-invest (quy trình clone theo [ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template)) — Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Motion.

## Bắt đầu

```bash
pnpm install
cp .env.example .env.local   # đặt NEXT_PUBLIC_SITE_URL
pnpm dev
```

| Lệnh | Mô tả |
|---|---|
| `pnpm dev` | Chạy dev server |
| `pnpm build` / `pnpm start` | Build và chạy production |
| `pnpm lint` | ESLint (gồm rule design system) + kiểm tra ảnh |
| `pnpm check:images` | Kiểm tra ảnh trong `public/images` là WebP và đủ độ phân giải |
| `pnpm check:site --base <URL> [--legacy <URL cũ>] [--expect-noindex] [--all]` | Kiểm tra một môi trường đang chạy: robots, canonical, chuyển hướng, mọi URL sitemap, và URL WordPress cũ còn truy cập được |
| `pnpm typecheck` | Kiểm tra TypeScript |

> **Design System:** giao diện dùng ds-one (token + component) chép vào `vendor/ds-one/`, bọc qua `components/ui/` (xem `AGENTS.md`).

## Cấu trúc

```
content/      Nội dung site & từng trang (chữ, link, ảnh, SEO) — chỉ dữ liệu
components/   Khung giao diện (ui / layout / sections / seo) — nhận nội dung qua props
app/          Route: ghép content vào component, metadata, sitemap (/sitemap.xml)
lib/ hooks/   Helper (SEO, JSON-LD) và logic client
types/        Kiểu dữ liệu content
docs/design-system/   Rule, guideline, token, component pattern
```

Sửa nội dung → chỉ sửa trong `content/`. Thêm trang → xem `.claude/skills/add-page`. Clone một trang của site gốc → `/clone-website <url>` (`.claude/skills/clone-website`).

## SEO & hiệu năng

- Metadata đầy đủ cho từng trang: title, description, canonical, Open Graph, Twitter.
- `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/icon.svg` do Next sinh tự động (`app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`, `app/icon.svg`).
- JSON-LD: Organization, WebSite, BreadcrumbList, FAQPage.
- Ảnh nguồn `.webp` chất lượng cao (`pnpm check:images`); `next/image` phục vụ AVIF/WebP ở quality 85–90, blur placeholder, `sizes` theo layout, preload ảnh LCP.
- Font IBM Plex Sans tự host (có subset tiếng Việt), không gọi Google Fonts.
- Toàn bộ trang render tĩnh (SSG).

## Triển khai

Site chạy độc lập trên toàn bộ domain, đọc nội dung từ WordPress ở domain CMS. Biến môi trường, staging, cutover, rollback và danh sách URL cũ cần quyết định: [docs/deploy/cutover.md](docs/deploy/cutover.md).

## Animation

Thư viện [`motion`](https://motion.dev) chạy qua `LazyMotion` để bundle nhỏ, tôn trọng `prefers-reduced-motion`, và vẫn hiện nội dung khi tắt JS. Quy tắc nằm ở [docs/design-system/motion-guidelines.md](docs/design-system/motion-guidelines.md).

Bộ AI cho Motion (skill `/motion` + MCP) cài bằng:

```bash
npx motion-ai
```

## Quy tắc code

Xem [AGENTS.md](AGENTS.md) và [docs/design-system/](docs/design-system/). ESLint chặn: mã hex, giá trị px tuỳ ý, inline style, chữ cứng trong component, component import `content/`.
