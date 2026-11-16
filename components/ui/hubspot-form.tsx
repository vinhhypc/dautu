"use client";

import { useId } from "react";

import { useHubspotForm } from "@/hooks/use-hubspot-form";
import { cn } from "@/lib/cn";

import { FormSkeleton } from "./skeleton";

export type HubspotFormLabels = {
  loading: string;
  error: string;
};

type HubspotFormProps = {
  portalId: string;
  formId: string;
  region: string;
  labels: HubspotFormLabels;
};

export function HubspotForm({ portalId, formId, region, labels }: HubspotFormProps) {
  const targetId = `hs-${useId().replace(/[^\w-]/g, "")}`;
  const { containerRef, status } = useHubspotForm({ portalId, formId, region, targetId });

  const isPending = status === "idle" || status === "loading";

  return (
    <div ref={containerRef} aria-busy={isPending} className="hubspot-form relative min-h-320 w-full">
      {/* Form HubSpot chưa có CSS ds-one cho đến onFormReady: dựng ẩn (vẫn chiếm layout để đo được chiều cao), skeleton hiện thay. */}
      <div id={targetId} className={cn(isPending && "invisible absolute inset-x-0 top-0")} />
      {isPending && (
        <>
          <FormSkeleton />
          <p className="sr-only">{labels.loading}</p>
        </>
      )}
      {status === "error" && (
        <p role="alert" className="text-normal-md text-system-red-primary">
          {labels.error}
        </p>
      )}
    </div>
  );
}
