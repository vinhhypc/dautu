const DEFAULT_WP_ORIGIN = "https://dautu.vndirect.com.vn";
/* Nội dung WordPress còn link/ảnh ghi cứng domain cũ (trước khi WordPress chuyển sang domain CMS). */
const LEGACY_WP_ORIGIN = "https://dautu.vndirect.com.vn";

function originOf(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
}

/* Nơi server Next gọi REST/HTML — có thể là địa chỉ mạng nội bộ. */
export const WP_ORIGIN = originOf(process.env.WP_ORIGIN) ?? DEFAULT_WP_ORIGIN;

/* Địa chỉ WordPress tự nhận (Site Address): dùng trong link nó trả về, URL ảnh/file và tham số của Yoast. */
export const WP_SITE_ORIGIN = originOf(process.env.WP_SITE_ORIGIN) ?? WP_ORIGIN;

const SITE_ORIGIN = originOf(process.env.NEXT_PUBLIC_SITE_URL);

const INTERNAL_ORIGINS = new Set([WP_SITE_ORIGIN, WP_ORIGIN, LEGACY_WP_ORIGIN, ...(SITE_ORIGIN ? [SITE_ORIGIN] : [])]);

export const WP_UPLOADS_PATH = "/wp-content/uploads/";

/* Link trỏ về WordPress (domain cũ, domain CMS) hoặc chính site đều là link nội bộ của site. */
export function isInternalOrigin(origin: string): boolean {
  return INTERNAL_ORIGINS.has(origin);
}

export function wpMediaHosts(): string[] {
  return [...new Set([WP_SITE_ORIGIN, LEGACY_WP_ORIGIN].map((origin) => new URL(origin).hostname))];
}

/* Proxy /wp-content/uploads/ về WordPress để URL file cũ không chết; bỏ qua khi WordPress còn nằm ngay trên domain của site (tránh tự gọi vòng). */
export function wpUploadsProxyTarget(): string | undefined {
  return SITE_ORIGIN === WP_ORIGIN ? undefined : `${WP_ORIGIN}${WP_UPLOADS_PATH}`;
}

/* Ảnh chia sẻ (og:image, JSON-LD) lấy theo domain của site thay vì domain CMS — path /wp-content/uploads/ được phục vụ/proxy ngay trên site. */
export function siteUploadPath(url: string): string {
  try {
    const { origin, pathname } = new URL(url);
    return isInternalOrigin(origin) && pathname.startsWith(WP_UPLOADS_PATH) ? pathname : url;
  } catch {
    return url;
  }
}
