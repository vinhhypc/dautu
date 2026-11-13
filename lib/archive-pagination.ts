import type { PaginationContent } from "@/types/content";

import { fillTemplate } from "./format";

const WINDOW = 2;

export type ArchiveSearch = {
  from?: string;
  to?: string;
  query?: string;
};

/* URL phân trang giữ kiểu WordPress: <đường dẫn chuyên mục>/page/N/. */
export function archivePageHref(basePath: string, page: number, search: ArchiveSearch): string {
  const path = page > 1 ? `${basePath}page/${page}/` : basePath;
  const params = new URLSearchParams();
  if (search.from) params.set("from", search.from);
  if (search.to) params.set("to", search.to);
  if (search.query) params.set("q", search.query);
  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export function splitPageSegments(segments: string[]): { termSegments: string[]; page: number } | undefined {
  const pageIndex = segments.length - 2;
  if (segments[pageIndex] !== "page") return { termSegments: segments, page: 1 };
  const page = Number(segments[pageIndex + 1]);
  if (!Number.isInteger(page) || page < 1) return undefined;
  return { termSegments: segments.slice(0, pageIndex), page };
}

type PaginationLabels = {
  label: string;
  previous: string;
  next: string;
};

export function buildPagination(
  basePath: string,
  page: number,
  totalPages: number,
  search: ArchiveSearch,
  labels: PaginationLabels,
): PaginationContent {
  const numbers = new Set([1, totalPages]);
  for (let index = page - WINDOW; index <= page + WINDOW; index++) if (index >= 1 && index <= totalPages) numbers.add(index);
  return {
    label: labels.label,
    previous: page > 1 ? { label: labels.previous, href: archivePageHref(basePath, page - 1, search) } : undefined,
    next: page < totalPages ? { label: labels.next, href: archivePageHref(basePath, page + 1, search) } : undefined,
    pages: [...numbers]
      .filter((number) => number >= 1)
      .sort((a, b) => a - b)
      .map((number) => ({ label: fillTemplate("{n}", { n: number }), href: archivePageHref(basePath, number, search), current: number === page })),
  };
}
