import { readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import sharp from "sharp";

const IMAGES_DIR = "public/images";
const MIN_WIDTH = 1200;
const OG_IMAGE = /^og-[\w-]+\.jpe?g$/;
const LOW_RES_ALLOWLIST = new Set([]);
const RASTER = new Set([".webp", ".jpg", ".jpeg", ".png", ".gif", ".avif", ".bmp", ".tif", ".tiff"]);

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });
}

const problems = [];

for (const file of listFiles(IMAGES_DIR)) {
  const ext = extname(file).toLowerCase();
  const name = relative(IMAGES_DIR, file);
  if (!RASTER.has(ext)) continue;

  if (OG_IMAGE.test(name)) continue;
  if (ext !== ".webp") {
    problems.push(`${file}: phải là .webp (đang là ${ext})`);
    continue;
  }

  const { width = 0 } = await sharp(file).metadata();
  if (width < MIN_WIDTH && LOW_RES_ALLOWLIST.has(name.split("\\").join("/"))) {
    console.warn(`Cảnh báo: ${file} rộng ${width}px (< ${MIN_WIDTH}px) — đang dùng ảnh tạm.`);
    continue;
  }
  if (width < MIN_WIDTH) problems.push(`${file}: rộng ${width}px, tối thiểu ${MIN_WIDTH}px`);
}

if (problems.length > 0) {
  console.error(`Ảnh không đạt chuẩn:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  process.exit(1);
}
console.log("Ảnh trong public/images đạt chuẩn.");
