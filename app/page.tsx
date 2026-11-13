import type { Metadata } from "next";

import { HomeBanner, HomeChallenges, HomeProducts, HomeVoices, HomeWhy } from "@/components/sections/home";
import { WpSections } from "@/components/sections/wp-sections";
import { homePage } from "@/content/pages/home";
import { wpSectionLabels } from "@/content/wp";
import { buildMetadata } from "@/lib/seo";
import { homeContentFromWp } from "@/lib/wp/home";
import { getWpDocument } from "@/lib/wp/pages";

export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
  const document = await getWpDocument("/");
  return buildMetadata(document ? { ...document.seo, title: document.seo.fullTitle ?? homePage.seo.title, path: "/" } : homePage.seo);
}

export default async function HomeRoute() {
  const document = await getWpDocument("/");
  const home = homeContentFromWp(document?.sections ?? []);

  return (
    <>
      <HomeBanner title={document?.seo.title ?? homePage.seo.title} banners={home.banners} />
      {home.challenges && <HomeChallenges content={home.challenges} labels={wpSectionLabels} />}
      {home.products && <HomeProducts content={home.products} labels={wpSectionLabels} />}
      {home.why && <HomeWhy content={home.why} labels={wpSectionLabels} />}
      {(home.testimonials || home.support) && (
        <HomeVoices testimonials={home.testimonials} support={home.support} labels={wpSectionLabels} />
      )}
      {home.rest.length > 0 && <WpSections title="" sections={home.rest} labels={wpSectionLabels} withPageTitle={false} />}
    </>
  );
}
