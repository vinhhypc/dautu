import "server-only";

import { WP_ORIGIN, WP_SITE_ORIGIN, isInternalOrigin } from "./origin";
import { type WpEntry, readSnapshot, writeSnapshot } from "./snapshot";

export { WP_ORIGIN, WP_SITE_ORIGIN } from "./origin";

const REVALIDATE_SECONDS = 60 * 30;
const TIMEOUT_MS = 20_000;
const MAX_ATTEMPTS = 5;
const MAX_BACKOFF_MS = 30_000;
const RECORD_INTERVAL_MS = 250;
const REDIRECT_KEY_PREFIX = "redirect:";

/* live: gọi WordPress, khi WordPress không trả lời được thì dùng bản chụp (nếu có). snapshot: chỉ đọc bản chụp trong data/wp, không gọi mạng. record: như live nhưng lưu mọi phản hồi vào data/wp (pnpm snapshot:wp). */
const SOURCE = process.env.WP_SOURCE === "snapshot" || process.env.WP_SOURCE === "record" ? process.env.WP_SOURCE : "live";

export class WpNotFoundError extends Error {}

export class WpUnavailableError extends Error {}

/* Tường lửa trước WordPress trả trang HTML "Request Rejected" (HTTP 200) cho một số query, vd. ?slug= quá dài. */
export class WpRejectedError extends WpUnavailableError {}

/* Bản chụp không có phản hồi này: coi như WordPress trả 404. */
export class WpSnapshotMissError extends WpNotFoundError {}

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let lastRecordRequest = 0;

async function throttleWhenRecording(): Promise<void> {
  if (SOURCE !== "record") return;
  const now = Date.now();
  const slot = Math.max(now, lastRecordRequest + RECORD_INTERVAL_MS);
  lastRecordRequest = slot;
  if (slot > now) await sleep(slot - now);
}

function retryDelay(response: Response, attempt: number): number {
  const retryAfter = Number(response.headers.get("retry-after"));
  const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1000 * 2 ** attempt;
  return Math.min(delay, MAX_BACKOFF_MS);
}

/* 429 (giới hạn tốc độ) và 5xx tạm thời: đợi rồi thử lại thay vì làm hỏng cả lần build. */
async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    await throttleWhenRecording();
    let response: Response;
    try {
      response = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
    } catch (error) {
      if (attempt < MAX_ATTEMPTS - 1) {
        await sleep(1000 * 2 ** attempt);
        continue;
      }
      const reason = error instanceof Error ? `${error.message}${error.cause ? ` (${String(error.cause)})` : ""}` : String(error);
      throw new WpUnavailableError(`Không kết nối được WordPress ${url}: ${reason}`);
    }
    const retryable = response.status === 429 || response.status === 502 || response.status === 503 || response.status === 504;
    if (!retryable || attempt >= MAX_ATTEMPTS - 1) return response;
    await response.body?.cancel();
    await sleep(retryDelay(response, attempt));
  }
}

async function fetchLive(path: string): Promise<WpEntry> {
  const response = await fetchWithRetry(`${WP_ORIGIN}${path}`, {
    headers: { Accept: "application/json, text/html", "User-Agent": "dautu-vndirect-next", ...bypassHeaders() },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (response.status === 404) return { key: path, status: 404, headers: {}, body: "" };
  const body = await response.text();
  if (isCloudflareChallenge(response, body) || response.status === 429) {
    throw new WpUnavailableError(
      `Cloudflare chặn request tới ${WP_ORIGIN}${path} (HTTP ${response.status}, cf-ray ${response.headers.get("cf-ray") ?? "?"}). ` +
        "Dùng bản chụp nội dung (WP_SOURCE=snapshot, xem docs/deploy/cutover.md), hoặc rule WAF cho server Next (WP_BYPASS_HEADER_*), hoặc đặt WP_ORIGIN về origin không qua Cloudflare.",
    );
  }
  if (!response.ok) throw new WpUnavailableError(`WordPress ${response.status} for ${path}`);
  return {
    key: path,
    status: 200,
    headers: { "x-wp-total": response.headers.get("x-wp-total") ?? "", "x-wp-totalpages": response.headers.get("x-wp-totalpages") ?? "" },
    body,
  };
}

async function fetchRedirectLive(path: string): Promise<WpEntry> {
  const key = `${REDIRECT_KEY_PREFIX}${path}`;
  const response = await fetchWithRetry(`${WP_ORIGIN}${encodeURI(path)}`, {
    headers: { "User-Agent": "dautu-vndirect-next", ...bypassHeaders() },
    redirect: "manual",
    next: { revalidate: REVALIDATE_SECONDS },
  });
  await response.body?.cancel();
  if (response.status === 429) throw new WpUnavailableError(`Cloudflare giới hạn tốc độ khi kiểm tra chuyển hướng ${path}`);
  return { key, status: response.status, headers: { location: response.headers.get("location") ?? "" }, body: "" };
}

/* Địa chỉ WordPress tự nhận nằm trong query của Yoast get_head — thay bằng chỗ giữ chỗ để bản chụp dùng được khi domain CMS đổi. */
function snapshotKey(key: string): string {
  return key.replaceAll(encodeURIComponent(WP_SITE_ORIGIN), "%7Bsite%7D");
}

async function load(key: string, live: () => Promise<WpEntry>): Promise<WpEntry> {
  if (SOURCE !== "live") {
    const recorded = readSnapshot(snapshotKey(key));
    if (recorded) return recorded;
    if (SOURCE === "snapshot") return { key, status: 404, headers: {}, body: "" };
  }
  let entry: WpEntry;
  try {
    entry = await live();
  } catch (error) {
    const recorded = error instanceof WpUnavailableError ? readSnapshot(snapshotKey(key)) : undefined;
    if (!recorded) throw error;
    console.warn(`[wp] dùng bản chụp cho ${key}: ${error instanceof Error ? error.message : error}`);
    return recorded;
  }
  if (SOURCE === "record") writeSnapshot({ ...entry, key: snapshotKey(key) });
  return entry;
}

async function wpFetch(path: string): Promise<WpEntry> {
  const entry = await load(path, () => fetchLive(path));
  if (entry.status === 404) throw SOURCE === "snapshot" ? new WpSnapshotMissError(path) : new WpNotFoundError(path);
  return entry;
}

function parseJson<T>(entry: WpEntry): T {
  try {
    return JSON.parse(entry.body) as T;
  } catch {
    throw new WpRejectedError(`WordPress không trả JSON cho ${entry.key}: ${entry.body.slice(0, 120).replace(/\s+/g, " ")}`);
  }
}

export async function wpJson<T>(path: string): Promise<T> {
  return parseJson<T>(await wpFetch(path));
}

export async function wpJsonPage<T>(path: string): Promise<{ items: T[]; total: number; totalPages: number }> {
  const entry = await wpFetch(path);
  return { items: parseJson<T[]>(entry), total: Number(entry.headers["x-wp-total"] ?? 0), totalPages: Number(entry.headers["x-wp-totalpages"] ?? 0) };
}

/* URL cũ được WordPress chuyển hướng (đổi slug, plugin Redirection) — trả path đích để site chuyển 301 theo. */
export async function wpRedirectPath(path: string): Promise<string | undefined> {
  try {
    const entry = await load(`${REDIRECT_KEY_PREFIX}${path}`, () => fetchRedirectLive(path));
    const location = entry.headers.location;
    if (entry.status !== 301 || !location) return undefined;
    const target = new URL(location, WP_ORIGIN);
    return isInternalOrigin(target.origin) && target.pathname !== path ? `${target.pathname}${target.search}` : undefined;
  } catch {
    return undefined;
  }
}

export async function wpHtml(path: string): Promise<string> {
  return (await wpFetch(path)).body;
}

export async function wpOrFallback<T>(task: Promise<T>, fallback: T, context: string): Promise<T> {
  try {
    return await task;
  } catch (error) {
    console.warn(`[wp] ${context}: ${error instanceof Error ? error.message : error}`);
    return fallback;
  }
}
