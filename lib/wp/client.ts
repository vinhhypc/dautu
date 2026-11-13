import "server-only";

import { WP_ORIGIN, isInternalOrigin } from "./origin";

export { WP_ORIGIN, WP_SITE_ORIGIN } from "./origin";

const REVALIDATE_SECONDS = 60 * 30;
const TIMEOUT_MS = 20_000;

export class WpNotFoundError extends Error {}

export class WpUnavailableError extends Error {}

/* Tường lửa trước WordPress trả trang HTML "Request Rejected" (HTTP 200) cho một số query, vd. ?slug= quá dài. */
export class WpRejectedError extends WpUnavailableError {}

/* Cloudflare trước dautu.vndirect.com.vn có thể chặn IP datacenter: header bí mật để rule WAF "Skip" bỏ qua thử thách. */
function bypassHeaders(): Record<string, string> {
  const name = process.env.WP_BYPASS_HEADER_NAME;
  const value = process.env.WP_BYPASS_HEADER_VALUE;
  return name && value ? { [name]: value } : {};
}

function isCloudflareChallenge(response: Response, body: string): boolean {
  return (
    response.headers.has("cf-mitigated") ||
    ((response.status === 403 || response.status === 503) && /cf-chl|challenge-platform|Just a moment/i.test(body))
  );
}

async function wpFetch(path: string): Promise<{ text: string; headers: Headers }> {
  let response: Response;
  try {
    response = await fetch(`${WP_ORIGIN}${path}`, {
      headers: { Accept: "application/json, text/html", "User-Agent": "dautu-vndirect-next", ...bypassHeaders() },
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    const reason = error instanceof Error ? `${error.message}${error.cause ? ` (${String(error.cause)})` : ""}` : String(error);
    throw new WpUnavailableError(`Không kết nối được WordPress ${WP_ORIGIN}${path}: ${reason}`);
  }
  if (response.status === 404) throw new WpNotFoundError(path);
  const text = await response.text();
  if (isCloudflareChallenge(response, text)) {
    throw new WpUnavailableError(
      `Cloudflare chặn request tới ${WP_ORIGIN}${path} (HTTP ${response.status}, cf-ray ${response.headers.get("cf-ray") ?? "?"}). ` +
        "Cần rule WAF cho server Next (xem WP_BYPASS_HEADER_* trong .env.example) hoặc đặt WP_ORIGIN về origin không qua Cloudflare.",
    );
  }
  if (!response.ok) throw new WpUnavailableError(`WordPress ${response.status} for ${path}`);
  return { text, headers: response.headers };
}

export async function wpJson<T>(path: string): Promise<T> {
  const { text } = await wpFetch(path);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new WpRejectedError(`WordPress không trả JSON cho ${path}: ${text.slice(0, 120).replace(/\s+/g, " ")}`);
  }
}

export async function wpJsonPage<T>(path: string): Promise<{ items: T[]; total: number; totalPages: number }> {
  const { text, headers } = await wpFetch(path);
  try {
    return { items: JSON.parse(text) as T[], total: Number(headers.get("x-wp-total") ?? 0), totalPages: Number(headers.get("x-wp-totalpages") ?? 0) };
  } catch {
    throw new WpRejectedError(`WordPress không trả JSON cho ${path}: ${text.slice(0, 120).replace(/\s+/g, " ")}`);
  }
}

/* URL cũ được WordPress chuyển hướng (đổi slug, plugin Redirection) — trả path đích để site chuyển 301 theo. */
export async function wpRedirectPath(path: string): Promise<string | undefined> {
  try {
    const response = await fetch(`${WP_ORIGIN}${encodeURI(path)}`, {
      headers: { "User-Agent": "dautu-vndirect-next", ...bypassHeaders() },
      redirect: "manual",
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const location = response.headers.get("location");
    if (response.status !== 301 || !location) return undefined;
    const target = new URL(location, WP_ORIGIN);
    return isInternalOrigin(target.origin) && target.pathname !== path ? `${target.pathname}${target.search}` : undefined;
  } catch {
    return undefined;
  }
}

export async function wpHtml(path: string): Promise<string> {
  return (await wpFetch(path)).text;
}

export async function wpOrFallback<T>(task: Promise<T>, fallback: T, context: string): Promise<T> {
  try {
    return await task;
  } catch (error) {
    console.warn(`[wp] ${context}: ${error instanceof Error ? error.message : error}`);
    return fallback;
  }
}
