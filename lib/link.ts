/* URL tuyệt đối của chính site (nội dung WordPress hay ghi đủ domain) vẫn mở cùng tab. */
const SAME_TAB_HOSTS = new Set(["dautu.vndirect.com.vn"]);
/* File và trang quản trị WordPress (/wp-content/…, /wp-admin/…) không phải route của app — không prefetch, tải trang thường. */
const NON_APP_PATH = /^\/wp-/;

export function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

export function opensInSameTab(href: string) {
  try {
    return SAME_TAB_HOSTS.has(new URL(href).hostname);
  } catch {
    return false;
  }
}

export function linkTargetProps(href: string) {
  return isExternalHref(href) && !opensInSameTab(href)
    ? ({ target: "_blank", rel: "noopener noreferrer" } as const)
    : {};
}

export function isAppRoute(href: string) {
  return href.startsWith("/") && !href.startsWith("//") && !NON_APP_PATH.test(href);
}
