import { type NextRequest, NextResponse } from "next/server";

import { WP_ORIGIN } from "./lib/wp/origin";

const LOOKUP_TIMEOUT_MS = 5000;
const SEARCH_PATH = "/tim-kiem/";

async function permalinkPath(type: "posts" | "pages", id: string): Promise<string | undefined> {
  try {
    const response = await fetch(`${WP_ORIGIN}/wp-json/wp/v2/${type}/${id}?_fields=link`, { signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS) });
    if (!response.ok) return undefined;
    const { link } = (await response.json()) as { link?: string };
    return link ? new URL(link).pathname : undefined;
  } catch {
    return undefined;
  }
}

/* URL kiểu WordPress còn nằm trong email, mạng xã hội, Google: /?p=<id>, /?page_id=<id> → permalink; /?s=<từ khoá> → trang tìm kiếm. */
export async function proxy(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const search = params.get("s")?.trim();
  if (search) {
    const target = new URL(SEARCH_PATH, request.url);
    target.searchParams.set("q", search);
    return NextResponse.redirect(target, 301);
  }
  const postId = params.get("p");
  const id = postId ?? params.get("page_id");
  if (!id || !/^\d+$/.test(id)) return NextResponse.next();
  const path = (postId ? await permalinkPath("posts", id) : undefined) ?? (await permalinkPath("pages", id));
  return path && path !== "/" ? NextResponse.redirect(new URL(path, request.url), 301) : NextResponse.next();
}

export const config = {
  matcher: [
    { source: "/", has: [{ type: "query", key: "p" }] },
    { source: "/", has: [{ type: "query", key: "page_id" }] },
    { source: "/", has: [{ type: "query", key: "s" }] },
  ],
};
