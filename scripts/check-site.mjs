const args = process.argv.slice(2);

function option(name) {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
}

const base = (option("base") ?? "http://localhost:3040").replace(/\/$/, "");
const legacy = option("legacy")?.replace(/\/$/, "");
const expectNoIndex = args.includes("--expect-noindex");
const CONCURRENCY = 8;
const SAMPLE_PATHS = ["/", "/dlife/", "/dgo/", "/trai-phieu-d-bond/", "/san-pham/tich-san-huu-tri/", "/blog/", "/category/nep-song-dau-tu/"];
const failures = [];

function fail(message) {
  failures.push(message);
  console.log(`  LỖI  ${message}`);
}

function ok(message) {
  console.log(`  ok   ${message}`);
}

function report(passed, okMessage, failMessage) {
  if (passed) ok(okMessage);
  else fail(failMessage);
}

async function get(url, init) {
  const response = await fetch(url, { redirect: "manual", ...init });
  return { status: response.status, headers: response.headers, text: await response.text() };
}

async function pool(items, task) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length > 0) await task(queue.shift());
    }),
  );
}

function pathOf(location) {
  return new URL(location, "http://placeholder").pathname;
}

console.log(`\nKiểm tra ${base}${expectNoIndex ? " (mong đợi chặn index)" : ""}`);

console.log("\n1. robots.txt và chặn index");
const robots = await get(`${base}/robots.txt`);
const blocksAll = /Disallow:\s*\/\s*$/m.test(robots.text);
if (robots.status !== 200) fail(`robots.txt trả ${robots.status}`);
else if (expectNoIndex) report(blocksAll, "robots.txt chặn toàn bộ", "robots.txt không chặn toàn bộ");
else if (blocksAll) fail("robots.txt đang chặn toàn bộ — site sẽ không được index");
else ok("robots.txt cho phép index");
const sitemapLine = robots.text.match(/^Sitemap:\s*(\S+)/m)?.[1];
if (!expectNoIndex) report(sitemapLine, `khai báo sitemap: ${sitemapLine}`, "robots.txt thiếu dòng Sitemap");
const home = await get(`${base}/`);
const xRobots = home.headers.get("x-robots-tag") ?? "";
if (expectNoIndex) report(/noindex/.test(xRobots), "có header X-Robots-Tag: noindex", "thiếu header X-Robots-Tag: noindex");
else if (/noindex/.test(xRobots)) fail(`trang chủ có X-Robots-Tag: ${xRobots}`);

console.log("\n2. Trang mẫu (200, một h1, canonical, JSON-LD)");
for (const path of SAMPLE_PATHS) {
  const page = await get(`${base}${path}`);
  const h1 = (page.text.match(/<h1[\s>]/g) ?? []).length;
  const canonical = page.text.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const problems = [];
  if (page.status !== 200) problems.push(`status ${page.status}`);
  if (h1 !== 1) problems.push(`${h1} thẻ h1`);
  if (!canonical) problems.push("thiếu canonical");
  else if (pathOf(canonical) !== path) problems.push(`canonical trỏ ${canonical}`);
  if (!page.text.includes("application/ld+json")) problems.push("thiếu JSON-LD");
  report(problems.length === 0, `${path} → canonical ${canonical}`, `${path}: ${problems.join(", ")}`);
}

console.log("\n3. Chuyển hướng và file");
const redirects = [
  ["/dlife", 308, "/dlife/"],
  ["/?s=trai+phieu", 301, "/tim-kiem/"],
  ["/blog/page/2/", 308, "/blog/"],
];
for (const [path, status, target] of redirects) {
  const result = await get(`${base}${path}`);
  const location = result.headers.get("location");
  report(result.status === status && location && pathOf(location).startsWith(target), `${path} → ${status} ${location}`, `${path}: ${result.status} ${location ?? ""} (mong đợi ${status} ${target})`);
}
const missing = await get(`${base}/khong-co-trang-nay/`);
report(missing.status === 404 && /noindex/.test(missing.text), "trang không tồn tại → 404 + noindex", `404 sai: status ${missing.status}`);
const sitemap = await get(`${base}/sitemap.xml`);
const urls = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (sitemap.status !== 200 || urls.length === 0) fail(`sitemap.xml: status ${sitemap.status}, ${urls.length} URL`);
else ok(`sitemap.xml có ${urls.length} URL`);
const uploadSample = (await get(`${base}/`)).text.match(/\/wp-content\/uploads\/[^"'\s)]+/)?.[0] ?? "/wp-content/uploads/2022/12/soundcloud.png";
const upload = await get(`${base}${uploadSample.split("&")[0]}`);
report(upload.status === 200, `${uploadSample.slice(0, 60)} → 200 (proxy file WordPress)`, `${uploadSample}: ${upload.status}`);

console.log("\n4. Toàn bộ URL trong sitemap mới");
const siteHost = sitemapLine ? new URL(sitemapLine).origin : undefined;
const badSitemap = [];
await pool(urls, async (url) => {
  const path = new URL(url).pathname;
  if (siteHost && new URL(url).origin !== siteHost) badSitemap.push(`${url}: khác domain ${siteHost}`);
  const page = await get(`${base}${path}`);
  if (page.status !== 200) badSitemap.push(`${path}: ${page.status}`);
});
for (const line of badSitemap.slice(0, 15)) fail(`sitemap ${line}`);
if (badSitemap.length === 0) ok(`${urls.length}/${urls.length} URL trả 200`);

if (legacy) {
  console.log(`\n5. URL của WordPress cũ (${legacy}) còn truy cập được trên site mới`);
  const index = await get(`${legacy}/sitemap_index.xml`);
  const children = [...index.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const lost = [];
  const redirected = [];
  let total = 0;
  for (const child of children) {
    const sitemapXml = await get(child);
    const legacyUrls = [...sitemapXml.text.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
    total += legacyUrls.length;
    await pool(legacyUrls, async (path) => {
      const page = await get(`${base}${path}`);
      if (page.status === 200) return;
      if ([301, 308].includes(page.status)) return redirected.push(path);
      lost.push(`${path} (${page.status}) — ${child.split("/").pop()}`);
    });
  }
  ok(`${total} URL trong ${children.length} sitemap con; ${redirected.length} chuyển hướng`);
  const groups = new Map();
  for (const entry of lost) {
    const key = entry.split(" — ")[1];
    groups.set(key, [...(groups.get(key) ?? []), entry.split(" — ")[0]]);
  }
  for (const [name, list] of groups) fail(`${name}: ${list.length} URL mất — ${args.includes("--all") ? "gồm" : "ví dụ"} ${list.slice(0, args.includes("--all") ? list.length : 3).join(", ")}`);
  if (groups.size === 0) ok("không mất URL nào");
}

console.log(failures.length > 0 ? `\n${failures.length} mục lỗi.` : "\nĐạt toàn bộ.");
process.exit(failures.length > 0 ? 1 : 0);
