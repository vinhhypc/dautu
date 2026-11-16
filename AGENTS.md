# AGENTS.md — dautu-vndirect

Site `dautu.vndirect.com.vn` (Nếp sống đầu tư, tiếng Việt), dựng lại từ WordPress theo khung và bộ thư viện của vnd-invest; quy trình clone lấy từ [ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template).

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · pnpm.

## Design System ds-one (chép trong `vendor/ds-one/`)

Toàn bộ giao diện dùng **ds-one** — mã nguồn component, util, icon và token chép từ `@vnd/ds-one@0.0.2` vào **`vendor/ds-one/`** (không cài gói từ registry GitLab nữa). Nguồn gốc và cách chép thêm component: `vendor/ds-one/README.md`.

**Token** — `@import "../vendor/ds-one/tokens/index.css"` trong `app/globals.css`, đổi theo `data-brand="vnds"` / `data-theme` trên `<html>`. ds-one thay hẳn thang mặc định của Tailwind:

| Nhóm | Dùng | Không dùng (đã bị ds-one xoá) |
|---|---|---|
| Spacing | **px**: `p-8` = 8px, `gap-24`, `mt-80`, `size-200` (`--spacing: 1px`) | thang ×4 (`p-2` = 8px) |
| Màu | `brand-*`, `background-*`, `text-*`, `border-*`, `system-{red,green,orange,blue,cyan,purple}-*` | `primary-600`, `neutral-700`, `white`… |
| Chữ | `text-normal-{sm,md,l,lg,xl}`, `text-large-*`, `text-hero-*` hoặc class vai trò `text-website-body-2-medium` | `text-sm`, `text-base`, `text-2xl`… |
| Font-weight | `font-regular`, `font-medium`, `font-semibold` | `font-normal`, `font-bold` |
| Radius | `rounded-4`, `rounded-8`, `rounded-12`, `rounded-16`, `rounded-1000` | `rounded-md`, `rounded-full`… |
| Shadow | `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-soft` (dự án bổ sung) | `shadow-1`… |

**Component** — `components/ui/*` là lớp adapter mỏng bọc ds-one, giữ API của dự án:

| `components/ui` | ds-one |
|---|---|
| `Button` | `Button` (variant primary/secondary/subtle/link…, size compact/regular/prominent) |
| `ButtonLink`, `TextLink` | class `buttonVariants` / `buttonTextboxVariants` của ds-one trên `next/link` (ds-one chưa hỗ trợ `asChild` với Link) |
| `IconButton`, `IconLink` | class `iconButtonVariants` (size `xs` 20px chưa có trong ds-one) |
| `Badge` | `Badge` (appearance Soft) |
| `Card` | `Card` (type default) |
| `DropdownMenu*` | `DropdownMenuRoot` / `Trigger` / `Content` (mặc định `align="end"`) / `Item` |
| `Input` | chưa có biến thể gạch chân trong ds-one → giữ bản tự viết |
| `SlideDots` | ds-one chưa có Carousel (`Slider` là thanh kéo giá trị) → tự viết |
| `Breadcrumbs` | `Breadcrumbs` (link bên trong dùng `RouteLink`) |
| `Disclosure` | thẻ `<details>` tự viết — Accordion ds-one (Radix) gỡ nội dung khi đóng, mất SEO/no-JS |
| `DateField` | `DatePicker` (bảng lịch) + ô bấm, popup, input ẩn cho form GET — ds-one chưa có ô chọn ngày hoàn chỉnh |
| `Pagination` | tự viết bằng link — Pagination ds-one là bản mô phỏng Figma (rộng cố định 1076px, nút + onPageChange) |
| `Tabs` | `Tabs` (chép từ `system-ui-26`, rút gọn) — `forceMount` + ẩn bằng CSS để nội dung mọi tab có trong HTML |
| `StepSlider` | theo slider của vnd-20 — tự chạy (`useStepAutoplay`, `--step-progress`), thanh bước `01 02 03` có vạch tiến trình (`StepTrack`), chuyển cảnh mờ dần, mobile là dải cuộn ngang (`useStepStrip`); dùng cho mọi slider (banner, slide, ảnh, cảm nhận khách hàng) |
| `Skeleton`, `FormSkeleton`, `EmbedSkeleton` | tự viết — bản ds-one chép về chưa có Skeleton; dùng khi chờ form HubSpot, iframe nhúng |
| `HubspotForm` | tự viết — nhúng form HubSpot (portal `8030318`) của trang WordPress, nạp script khi form gần vào màn hình |
| `WpImage` | `next/image` khi ảnh WP có width/height, không thì `<img>` giữ link gốc |

Quy tắc:

- `components/sections/`, `components/layout/`, `app/` **chỉ dùng `components/ui/`** — không import `@/vendor/ds-one` trực tiếp, không tự dựng nút/card/badge bằng HTML + class.
- Cần component mới (Modal, Tabs, Select, Accordion, Tooltip…) → **chép component từ repo ds-one vào `vendor/ds-one/`** (kèm icon/util và dependency `@radix-ui/*` nó cần), bọc trong `components/ui/`. Chỉ tự viết khi ds-one chưa có, và ghi rõ trong bảng trên.
- Hàm style của ds-one (`buttonVariants`…) nằm trong module `'use client'` → file gọi chúng phải là client component.
- `cn()` dùng bản của ds-one (`@/lib/cn` → `@/vendor/ds-one/utils/cn`, có tailwind-merge theo token).
- Không cài thư viện UI khác (shadcn, antd, MUI…).

## Bắt buộc đọc trước khi viết code

1. [docs/design-system/ai-rules.md](docs/design-system/ai-rules.md) — ràng buộc bắt buộc (token, state, a11y, bảo mật).
2. [docs/design-system/design-guidelines.md](docs/design-system/design-guidelines.md) — cách dùng màu, chữ, spacing, motion.
3. [docs/design-system/design-tokens.md](docs/design-system/design-tokens.md) — danh sách token (nguồn: `vendor/ds-one/tokens/` + `app/globals.css`).
4. [docs/design-system/component-patterns.md](docs/design-system/component-patterns.md) — pattern Button/Input/Card/Badge/Modal/Table.
   Snippet trong file viết cho antd; dự án này **không dùng antd** — dùng component ds-one (`vendor/ds-one/`) qua `components/ui/`. Các file 1–4 sinh từ bộ Theme config cũ: khi mâu thuẫn với ds-one (token, hover lift, Inter…), **ds-one thắng**.
5. [docs/design-system/motion-guidelines.md](docs/design-system/motion-guidelines.md) — animation với thư viện `motion`.

## Kiến trúc: tách nội dung khỏi giao diện

```
content/            ← TOÀN BỘ chữ, link, ảnh, SEO của site (chỉ dữ liệu, không JSX)
  site.ts           ← tên site, URL, menu, footer, thông tin tổ chức (tiếng Việt)
  links.ts          ← URL ngoài site (mydgo, accounts, YouTube…)
  pages/<page>.ts   ← nội dung + SEO từng trang
  pages/index.ts    ← danh sách trang public (dùng cho sitemap)
  wp.ts             ← path WordPress không dựng sang Next, nhãn cho khối nội dung WP
types/content.ts    ← kiểu dữ liệu cho content
vendor/ds-one/      ← mã nguồn design system ds-one (component, icon, util, token) — chỉ components/ui/ dùng
components/
  ui/               ← primitive: Button, Card, Badge, Container, Section, SectionHeading
  layout/           ← Header, Footer, SkipLink
  sections/         ← khối trang: Hero, FeatureGrid, Stats, Faq, CtaBanner, ContentSplit, Timeline
  motion/           ← MotionProvider, Reveal/RevealGroup/RevealItem, RevealFallback
  seo/              ← JsonLd
lib/                ← helper thuần (seo, structured-data, motion variants, cn, wp-layout)
lib/wp/             ← đọc WordPress qua REST (client, pages, html → RichBlock, elementor → WpSection, seo Yoast)
hooks/              ← logic client (use-disclosure…)
app/                ← root layout (một ngôn ngữ, lang="vi") + route + icon/manifest/robots/sitemap; path giữ nguyên như WordPress
  [...slug]/        ← mọi nội dung WordPress (trang, /san-pham/*, chuyên mục, tag, bài viết): đọc từ WP REST (ISR 30 phút)
app/_site/          ← khung html/header/footer dùng chung, trang blog (chuyên mục, bài viết)
```

Quy tắc (ESLint kiểm tra tự động):

- **Component chỉ là khung giao diện.** Không có chữ cứng trong JSX (`react/jsx-no-literals`), không import từ `@/content` (chỉ được `import type`). Mọi chữ — kể cả aria-label, "Đang tải…" — truyền qua props.
- **Route (`app/**/page.tsx`) là nơi duy nhất ghép content vào component.**
- Không hex, không `[13px]`, không `style={}` trong `app/` và `components/`.
- Logic tách khỏi markup: hook trong `hooks/`, helper trong `lib/`.

## Comment

Chỉ comment khi thực sự cần — code và tên biến/hàm/prop phải tự nói nó làm gì.

- **Được comment**: lý do không hiển nhiên (workaround lỗi trình duyệt/thư viện, ràng buộc ngoài code như Nginx/WordPress, quyết định của BA kèm nguồn), cảnh báo bẫy dễ sửa sai, `TODO` có việc cụ thể, `eslint-disable` kèm lý do.
- **Không comment**: diễn giải lại code, mô tả giao diện ("Figma: nút xám…"), banner chia mục (`// ----- X -----`, `/* ===== X ===== */`), trỏ file liên quan ("CSS ở globals.css"), JSDoc lặp lại tên prop, code bị comment out, nhật ký thay đổi.
- **Không giải thích ý nghĩa giá trị/field/tham số** (`0 = chưa vào, 1 = đã vào`, `Thời gian (ms)`, `Thứ tự từ đáy lên`…) — đặt tên rõ thay vì comment.
- **Không viết block comment đầu file/đầu hàm** mô tả module làm gì, cơ chế chạy ra sao, markup cần data-attribute nào — đọc code là biết.
- Mỗi comment **một dòng**, ngắn.
- Sửa code thì sửa/xoá luôn comment liên quan — comment sai tệ hơn không có.

## SEO

- Mỗi trang export `metadata = buildMetadata(page.seo)` (`lib/seo.ts`) → title, description, canonical, Open Graph, Twitter.
- Đúng **một `<h1>` mỗi trang**, không nhảy cấp heading.
- JSON-LD: `Organization` + `WebSite` ở layout; `BreadcrumbList`, `FAQPage` ở trang (`lib/structured-data.ts`).
- Trang tự dựng phải được thêm vào `content/pages/index.ts` để vào `/sitemap.xml` (`app/sitemap.ts`); bài viết và chuyên mục WordPress tự vào sitemap. `robots.txt` do `app/robots.ts` sinh, đã trỏ tới sitemap.
- Sitemap còn gồm trang WordPress, `/san-pham/*`, chuyên mục, bài viết (bỏ `wpExcludedPaths` và trang Yoast `noindex`). Link ngắn `/?p=<id>`, `/?page_id=<id>` được `proxy.ts` chuyển 301 về permalink. Accordion Elementor tự sinh JSON-LD `FAQPage`; bài viết có `Article`.
- Tìm kiếm: `/tim-kiem/?q=` (`app/tim-kiem/page.tsx`, REST `posts?search=`), `noindex` và chặn trong `robots.ts`. `proxy.ts` đổi `/?s=` sang đó. URL cũ không có trong Next được hỏi lại WordPress: nếu WordPress trả 301 nội bộ thì site chuyển 301 theo (`wpRedirectPath`); trang Blog phân trang, tác giả, lưu trữ theo tháng chuyển về `/blog/` (`redirects` trong `next.config.ts`).
- `NEXT_PUBLIC_SITE_URL` phải là domain thật khi deploy: **`https://dautu.vndirect.com.vn`**. Biến được nhúng lúc **build** — đặt trước `pnpm build` (xem `.env.example`).

## Link: dùng `RouteLink`, không dùng `next/link` trực tiếp

Site là một ứng dụng Next.js độc lập phục vụ toàn bộ domain (không còn phân luồng Nginx với WordPress; WordPress chỉ là nguồn nội dung qua REST).

- Mọi link dùng `RouteLink` (`components/ui/route-link.tsx`): path nội bộ (`/…`) → `next/link`; link ngoài → `<a>` mở tab mới; `#`, `mailto:`, `tel:` và path `/wp-…` (file, trang quản trị WordPress) → `<a>` thường. `ButtonLink`, footer, header, menu đã dùng sẵn. ESLint chặn import `next/link` ở nơi khác.
- Điều hướng bằng code: `useOpenHref` (`hooks/use-open-href.ts`) theo cùng quy tắc.

## Asset tĩnh và file metadata

- File tĩnh đặt trong `public/` theo nhóm: `/fonts/`, `/icons/`, `/brand/`, `/illustrations/`, `/images/`. Ảnh import tĩnh (`@/public/images/...`) tự ra `/_next/static/media`.
- Metadata dùng file convention chuẩn của Next ở gốc `app/`: `app/icon.svg`, `app/manifest.ts`, `app/robots.ts`, `app/sitemap.ts`.

## Ảnh

- **Ảnh nguồn phải là `.webp` chất lượng cao**: export WebP quality ≥ 90 (hoặc lossless), rộng tối thiểu **1200px** (ảnh hero/full-width nên ≥ 1920px). Không commit JPG/PNG/GIF.
  Ngoại lệ duy nhất: ảnh Open Graph `public/images/og-*.jpg` (1200×630) giữ JPG cho mạng xã hội.
- **Chất lượng khi phục vụ**: mọi `<Image>` phải có `quality` lấy từ `IMAGE_QUALITY` (`lib/image.ts`):
  `IMAGE_QUALITY.high` (90) cho hero/LCP/ảnh lớn, `IMAGE_QUALITY.standard` (85) cho ảnh còn lại. Không ghi số trực tiếp; thêm mức mới thì sửa `lib/image.ts` (tự đồng bộ vào `images.qualities`).
- Next tự xuất **AVIF**, fallback **WebP** theo trình duyệt (`next.config.ts`).
- Luôn dùng `next/image` (không `<img>`). Ảnh tĩnh import trong content (`import hero from "@/public/images/hero.webp"`) → có sẵn width/height + blur placeholder, không CLS.
- Luôn có `alt` có nghĩa (đặt trong content) và `sizes` khớp layout.
- Chỉ ảnh LCP (hero) dùng `preload`; còn lại lazy mặc định.
- Kiểm tra tự động: ESLint (import ảnh không phải WebP, thiếu/ghi cứng `quality`, `<img>`) và `pnpm check:images` (định dạng + độ rộng tối thiểu trong `public/images`), cả hai chạy trong `pnpm lint`.
- Logo thương hiệu: dùng file được cung cấp trong `public/brand/`, không lấy từ CDN ngoài. `public/brand/logo.svg` hiện là **placeholder** — thay bằng logo chính thức.

## Nội dung từ WordPress (headless)

WordPress vẫn là nơi marketing sửa nội dung; Next chỉ đổi giao diện. Kế hoạch: `docs/research/site/migration-plan.md`.

- Trang Elementor: `lib/wp/elementor.ts` đọc HTML đã render (nhãn `data-widget_type`), bỏ toàn bộ bố cục/style, trả `WpSection[]` có kiểu; `components/sections/wp-sections.tsx` hiển thị bằng component ds-one. Widget chưa hỗ trợ không làm vỡ trang — log `[wp] … widget Elementor chưa hỗ trợ` ở server.
- Thêm widget mới: extractor trong `EXTRACTORS` (`lib/wp/elementor.ts`) + kiểu trong `WpWidget` (`types/content.ts`) + nhánh render trong `wp-sections.tsx`. Sửa cách hiển thị thì sửa chung, không sửa theo từng trang.
- **Giữ bố cục Elementor, đổi giao diện sang ds-one.** `lib/wp/elementor.ts` giữ cấu trúc section → cột (tỉ lệ cột từ `elementor-col-*` / CSS), `lib/wp/elementor-styles.ts` đọc CSS Elementor (`post-<id>.css` + màu toàn cục của Kit `elementorKitId` trong `content/wp.ts`) để lấy căn lề, độ rộng ảnh, cỡ tiêu đề lớn/nhỏ, nền/viền màu, chiều cao hero. Màu không dùng mã hex mà map sang nhóm token (`brand`, `muted`, `inverse`). Font, khoảng cách, bóng đổ cũ không chép.
- Section chỉ có tiêu đề gộp vào section sau; thẻ/ảnh liền nhau trong một cột thành lưới (số cột theo độ rộng cột); trang thiếu `h1` thì thêm `h1` ẩn (`sr-only`). Ảnh so sánh với trang gốc: `docs/research/compare/`.
- Trang chủ (`app/page.tsx`) giữ bố cục trang gốc bằng section riêng (`components/sections/home.tsx`); `lib/wp/home.ts` tách nội dung trang `/` trên WP theo tiêu đề vào từng khối, khối lạ rơi về `WpSections`.
- Iframe trong nội dung WP: chỉ YouTube, domain `*.vndirect.com.vn` và Google Sheets đã xuất bản (`docs.google.com/spreadsheets/…/pubhtml|pubchart` — biểu đồ NAV, phân bổ tài sản của quỹ) được nhúng (`lib/wp/html.ts`).
- **Ba địa chỉ tách riêng** (`lib/wp/origin.ts`, `.env.example`): `NEXT_PUBLIC_SITE_URL` là domain public của site; `WP_ORIGIN` là nơi server gọi REST (có thể là mạng nội bộ); `WP_SITE_ORIGIN` là địa chỉ WordPress tự nhận (domain CMS), dùng cho URL ảnh/file. Cả ba được đọc lúc **build**.
- Link trong nội dung trỏ về domain cũ, domain CMS hoặc chính site đều đổi thành path nội bộ. Ảnh lấy từ domain CMS (`images.remotePatterns` sinh từ `wpMediaHosts()`); `og:image` và ảnh JSON-LD dùng path `/wp-content/uploads/…` trên domain site.
- `/wp-content/uploads/*` được proxy về WordPress (`rewrites` trong `next.config.ts`) để URL file cũ không chết; proxy tự tắt khi `WP_ORIGIN` trùng `NEXT_PUBLIC_SITE_URL` (WordPress còn nằm trên domain site) để tránh gọi vòng — **sau cutover phải đặt `WP_ORIGIN` khác domain site**.
- Triển khai và cutover: `docs/deploy/cutover.md`. Staging build với `NEXT_PUBLIC_SITE_NOINDEX=1`; kiểm tra môi trường đang chạy bằng `pnpm check:site`.
- Máy dev có Kaspersky/proxy chặn TLS: Node báo `SELF_SIGNED_CERT_IN_CHAIN`. Xuất CA gốc ra `.certs/local-ca.pem` (đã gitignore); `pnpm dev/build/start` tự nạp qua `scripts/with-local-ca.mjs`.

## Kiểm tra trước khi xong việc

```bash
pnpm lint && pnpm typecheck && pnpm build
```

Rồi đi qua checklist cuối `docs/design-system/ai-rules.md`.

## Skill

- `.claude/skills/add-page` — thêm trang mới (content + route + SEO + sitemap).
- `.claude/skills/add-section` — thêm khối giao diện mới (type + component + content).
- `.claude/skills/motion-patterns` — thêm animation theo quy tắc dự án.
- `.claude/skills/clone-website` — dựng lại một trang của dautu.vndirect.com.vn (khảo sát → content → section ds-one → so sánh ảnh); tài liệu khảo sát chi tiết ở `references/` (từ ai-website-cloner-template).
- `/motion` + MCP `motion` (Motion AI Kit, cài bằng `npx motion-ai`) — tra cứu API và ví dụ Motion. Quy tắc dự án luôn ưu tiên hơn ví dụ chung.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
