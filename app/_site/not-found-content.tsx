import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { notFoundPage } from "@/content/pages/not-found";

export const notFoundMetadata: Metadata = {
  title: notFoundPage.title,
  robots: { index: false, follow: true },
};

export function NotFoundContent() {
  return (
    <Container className="flex flex-col items-center gap-16 py-64 text-center md:py-96">
      <div className="relative mb-16 flex size-200 items-center justify-center">
        <span
          aria-hidden="true"
          className="absolute size-140 rotate-45 border-6 border-dashed border-text-primary bg-brand-primary"
        />
        <p className="relative text-hero-sm font-semibold text-text-primary">{notFoundPage.code}</p>
      </div>
      <h1 className="max-w-460 text-large-md font-semibold tracking-widest text-text-primary uppercase md:text-large-lg">
        {notFoundPage.title}
      </h1>
      <p className="max-w-460 text-normal-lg text-text-secondary">{notFoundPage.description}</p>
      <ButtonLink href={notFoundPage.cta.href} variant={notFoundPage.cta.variant} className="mt-8">
        {notFoundPage.cta.label}
      </ButtonLink>
    </Container>
  );
}
