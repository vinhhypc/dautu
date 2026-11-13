import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { WpSections } from "@/components/sections/wp-sections";
import { JsonLd } from "@/components/seo/json-ld";
import { wpBreadcrumbHome, wpSectionLabels } from "@/content/wp";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, wpFaqSchema } from "@/lib/structured-data";
import { getPost } from "@/lib/wp/archive";
import { wpRedirectPath } from "@/lib/wp/client";
import { getWpDocument } from "@/lib/wp/pages";

import { ArchivePage, archiveMetadata, getWpArchive, PostPage, postMetadata } from "../_site/blog-pages";

export const revalidate = 1800;

function decodeSlug(slug: string[]): string[] {
  return slug.map((segment) => decodeURIComponent(segment));
}

function pathFromSlug(slug: string[]): string {
  return `/${slug.join("/")}/`;
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/[...slug]">): Promise<Metadata> {
  const slug = decodeSlug((await params).slug);
  const archive = await getWpArchive(slug);
  if (archive) return archiveMetadata(archive);
  const path = pathFromSlug(slug);
  const document = await getWpDocument(path);
  if (document) {
    const metadata = buildMetadata(document.seo);
    return document.seo.fullTitle ? { ...metadata, title: { absolute: document.seo.fullTitle } } : metadata;
  }
  const post = await getPost(path);
  return post ? postMetadata(post) : {};
}

export default async function WpRoute({ params }: PageProps<"/[...slug]">) {
  const slug = decodeSlug((await params).slug);
  const archive = await getWpArchive(slug);
  if (archive) return <ArchivePage {...archive} />;

  const path = pathFromSlug(slug);
  const document = await getWpDocument(path);
  if (!document) {
    const post = await getPost(path);
    if (post) return <PostPage post={post} />;
    const target = await wpRedirectPath(path);
    if (target) permanentRedirect(target);
    notFound();
  }
  if (Object.keys(document.unsupported).length > 0) {
    console.warn(`[wp] ${document.path}: widget Elementor chưa hỗ trợ ${JSON.stringify(document.unsupported)}`);
  }

  return (
    <>
      <JsonLd data={[breadcrumbSchema([wpBreadcrumbHome, { label: document.title, href: document.path }]), ...wpFaqSchema(document.sections)]} />
      <WpSections title={document.title} sections={document.sections} labels={wpSectionLabels} />
    </>
  );
}
