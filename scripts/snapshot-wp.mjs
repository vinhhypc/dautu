import { spawn, spawnSync } from "node:child_process";
import { existsSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

const PORT = 3055;
const BASE = `http://localhost:${PORT}`;
const WP_ORIGIN = (process.env.WP_ORIGIN ?? "https://dautu.vndirect.com.vn").replace(/\/$/, "");
const SNAPSHOT_DIR = join(process.cwd(), "data", "wp");
const CRAWL_CONCURRENCY = 3;
const READY_TIMEOUT_MS = 120_000;
const fresh = process.argv.includes("--fresh");
const skipBuild = process.argv.includes("--skip-build");
const env = { ...process.env, WP_SOURCE: "record", NEXT_PUBLIC_SITE_URL: BASE };
const next = ["node", "node_modules/next/dist/bin/next"];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("node", ["scripts/with-local-ca.mjs", ...args], { stdio: "inherit", env, shell: process.platform === "win32" });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${args.join(" ")} thoát với mã ${code}`))));
  });
}

async function getText(url, attempts = 6) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const response = await fetch(url, { headers: { "User-Agent": "dautu-vndirect-snapshot" } }).catch(() => undefined);
    if (response?.ok) return response.text();
    await sleep(Math.min(1000 * 2 ** attempt, 30_000));
  }
  throw new Error(`Không tải được ${url}`);
}

function locs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
}

async function pool(items, task) {
  const queue = [...items];
  let done = 0;
  await Promise.all(
    Array.from({ length: CRAWL_CONCURRENCY }, async () => {
      while (queue.length > 0) {
        await task(queue.shift());
        if (++done % 50 === 0) console.log(`  ${done}/${items.length}`);
      }
    }),
  );
}

function stats() {
  if (!existsSync(SNAPSHOT_DIR)) return { files: 0, megabytes: 0 };
  const files = readdirSync(SNAPSHOT_DIR);
  const bytes = files.reduce((sum, name) => sum + statSync(join(SNAPSHOT_DIR, name)).size, 0);
  return { files: files.length, megabytes: (bytes / 1024 / 1024).toFixed(1) };
}

if (fresh && existsSync(SNAPSHOT_DIR)) rmSync(SNAPSHOT_DIR, { recursive: true });

if (!skipBuild) {
  console.log("1/3 Build (ghi lại mọi phản hồi WordPress mà build cần)");
  await run([...next, "build"]);
}

console.log("\n2/3 Chạy server và duyệt toàn bộ URL");
const server = spawn("node", ["scripts/with-local-ca.mjs", ...next, "start", "-p", String(PORT)], { stdio: "inherit", env, shell: process.platform === "win32" });
try {
  const started = Date.now();
  while (!(await fetch(`${BASE}/robots.txt`).then((response) => response.ok).catch(() => false))) {
    if (Date.now() - started > READY_TIMEOUT_MS) throw new Error("Server không khởi động được");
    await sleep(500);
  }

  const sitemapPaths = locs(await getText(`${BASE}/sitemap.xml`));
  const archivePages = [];
  for (const path of sitemapPaths.filter((item) => item.startsWith("/category/"))) {
    for (let page = 2; ; page++) {
      const response = await fetch(`${BASE}${path}page/${page}/`);
      await response.arrayBuffer();
      if (response.status !== 200) break;
      archivePages.push(`${path}page/${page}/`);
    }
  }

  const legacyPaths = [];
  try {
    for (const sitemap of locs(await getText(`${WP_ORIGIN}/sitemap_index.xml`))) legacyPaths.push(...locs(await getText(`${WP_ORIGIN}${sitemap}`)));
  } catch (error) {
    console.warn(`Bỏ qua sitemap WordPress cũ: ${error.message}`);
  }

  const targets = [...new Set(["/", "/blog/", ...sitemapPaths, ...archivePages, ...legacyPaths])];
  console.log(`  ${targets.length} URL (${sitemapPaths.length} trong sitemap, ${archivePages.length} trang phân trang, ${legacyPaths.length} URL WordPress cũ)`);
  const failed = [];
  await pool(targets, async (path) => {
    const response = await fetch(`${BASE}${encodeURI(decodeURI(path))}`, { redirect: "manual" }).catch(() => undefined);
    await response?.arrayBuffer();
    if (!response || response.status >= 500) failed.push(`${path} (${response?.status ?? "lỗi mạng"})`);
  });
  if (failed.length > 0) console.warn(`\n${failed.length} URL lỗi 5xx:\n  ${failed.slice(0, 20).join("\n  ")}`);
} finally {
  if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  else server.kill();
}

const { files, megabytes } = stats();
console.log(`\n3/3 Xong: ${files} phản hồi, ${megabytes} MB trong data/wp. Build lại bằng WP_SOURCE=snapshot để không gọi WordPress.`);
