import "server-only";

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";

const SNAPSHOT_DIR = join(process.cwd(), "data", "wp");
const KEY_LENGTH = 24;

export type WpEntry = {
  key: string;
  status: number;
  headers: Record<string, string>;
  body: string;
};

function fileOf(key: string): string {
  return join(SNAPSHOT_DIR, `${createHash("sha1").update(key).digest("hex").slice(0, KEY_LENGTH)}.json.gz`);
}

export function readSnapshot(key: string): WpEntry | undefined {
  const file = fileOf(key);
  if (!existsSync(file)) return undefined;
  return JSON.parse(gunzipSync(readFileSync(file)).toString("utf8")) as WpEntry;
}

export function writeSnapshot(entry: WpEntry): void {
  mkdirSync(SNAPSHOT_DIR, { recursive: true });
  writeFileSync(fileOf(entry.key), gzipSync(JSON.stringify(entry)));
}
