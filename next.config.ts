import type { NextConfig } from "next";

import { IMAGE_QUALITIES } from "./lib/image";
import { WP_UPLOADS_PATH, wpMediaHosts, wpUploadsProxyTarget } from "./lib/wp/origin";

const THIRTY_DAYS = 60 * 60 * 24 * 30;
const STATIC_ASSET_CACHE = `public, max-age=${THIRTY_DAYS}, stale-while-revalidate=${THIRTY_DAYS}`;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  /* URL của WordPress đều có "/" cuối — giữ nguyên để link cũ và canonical khớp. */
  trailingSlash: true,
  images: {
    /* Ảnh trong nội dung WordPress (đọc qua REST) vẫn nằm trên WordPress. */
    remotePatterns: wpMediaHosts().map((hostname) => ({ hostname, pathname: `${WP_UPLOADS_PATH}**` })),
    formats: ["image/avif", "image/webp"],
    qualities: IMAGE_QUALITIES,
    deviceSizes: [640, 828, 1080, 1280, 1920, 2560],
    imageSizes: [64, 128, 256, 384],
    minimumCacheTTL: THIRTY_DAYS,
  },
  async redirects() {
    /* Phân trang trang Blog, trang tác giả và lưu trữ theo tháng của WordPress không dựng lại — đưa về trang Blog. */
    return ["/blog/page/:page(\\d+)", "/author/:slug*", "/:year(\\d{4})/:month(\\d{2})"].map((source) => ({
      source,
      destination: "/blog/",
      permanent: true,
    }));
  },
  async rewrites() {
    const target = wpUploadsProxyTarget();
    return target ? [{ source: `${WP_UPLOADS_PATH}:path*`, destination: `${target}:path*` }] : [];
  },
  async headers() {
    /* Staging / bản xem trước: chặn công cụ tìm kiếm ở mọi response (kể cả file tĩnh, ảnh). */
    const noIndex =
      process.env.NEXT_PUBLIC_SITE_NOINDEX === "1" ? [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }] : [];
    /* File trong public/ không có hash nên không đặt immutable. */
    const staticAssets = ["/fonts/:path*", "/icons/:path*", "/brand/:path*", "/illustrations/:path*", "/images/:path*"].map((source) => ({
      source,
      headers: [{ key: "Cache-Control", value: STATIC_ASSET_CACHE }],
    }));
    return [...noIndex, ...staticAssets];
  },
};

export default nextConfig;
