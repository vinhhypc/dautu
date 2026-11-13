import type { Metadata } from "next";

import { searchPosts } from "@/lib/wp/archive";

import { SearchPage, searchMetadata } from "../_site/blog-pages";

const MAX_QUERY_LENGTH = 100;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function single(value: string | string[] | undefined): string | undefined {
  const text = (Array.isArray(value) ? value[0] : value)?.trim();
  return text ? text.slice(0, MAX_QUERY_LENGTH) : undefined;
}

function pageNumber(value: string | string[] | undefined): number {
  const page = Number(single(value));
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  return searchMetadata(single((await searchParams).q));
}

export default async function SearchRoute({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = single(params.q);
  const page = pageNumber(params.page);
  const result = query ? await searchPosts(query, page) : undefined;
  return <SearchPage query={query} page={page} result={result} />;
}
