"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { errorPage } from "@/content/pages/error";

export default function RouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="flex flex-col items-center gap-16 py-64 text-center md:py-96">
      <h1 className="max-w-560 text-large-sm font-semibold text-text-primary md:text-large-md">{errorPage.title}</h1>
      <p className="max-w-460 text-normal-lg text-text-secondary">{errorPage.description}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-12">
        <Button onClick={reset}>{errorPage.retry}</Button>
        <ButtonLink href="/" variant="neutral">
          {errorPage.home}
        </ButtonLink>
      </div>
    </Container>
  );
}
