import "server-only";

import type { WpSection } from "@/types/content";

const REVALIDATE_SECONDS = 60 * 30;
const TIMEOUT_MS = 10_000;

async function fetchText(url: string): Promise<string | undefined> {
  try {
    const response = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS }, signal: AbortSignal.timeout(TIMEOUT_MS) });
    return response.ok ? await response.text() : undefined;
  } catch {
    return undefined;
  }
}

/* Bảng tính xuất bản (pubhtml) hiển thị sheet đầu tiên trong khung cố định, biểu đồ bên trong không co giãn.
   Biểu đồ trong sheet mang id embed_<oid>; pubchart?oid=<oid>&format=image xuất bản ảnh luôn theo số liệu mới nhất. */
async function publishedSheetChart(src: string): Promise<string | undefined> {
  const url = new URL(src);
  if (url.hostname !== "docs.google.com" || !url.pathname.endsWith("/pubhtml")) return undefined;
  const base = `${url.origin}${url.pathname.slice(0, -"/pubhtml".length)}`;
  const gid = url.searchParams.get("gid") ?? (await fetchText(src))?.match(/gid:\s*"(\d+)"/)?.[1];
  if (!gid) return undefined;
  const oid = (await fetchText(`${base}/pubhtml/sheet?headers=false&gid=${gid}`))?.match(/id=['"]embed_(\d+)['"]/)?.[1];
  return oid ? `${base}/pubchart?oid=${oid}&format=image` : undefined;
}

type EmbedNode = { type: "embed"; src: string; chart?: string };

function collectEmbeds(value: unknown, found: EmbedNode[]): void {
  if (Array.isArray(value)) value.forEach((item) => collectEmbeds(item, found));
  else if (value && typeof value === "object") {
    const node = value as Partial<EmbedNode>;
    if (node.type === "embed" && typeof node.src === "string") found.push(node as EmbedNode);
    else Object.values(value).forEach((child) => collectEmbeds(child, found));
  }
}

export async function withSheetCharts(sections: WpSection[]): Promise<WpSection[]> {
  const embeds: EmbedNode[] = [];
  collectEmbeds(sections, embeds);
  await Promise.all(
    embeds.map(async (embed) => {
      embed.chart = await publishedSheetChart(embed.src);
    }),
  );
  return sections;
}
