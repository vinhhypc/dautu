"use client";

import { useId } from "react";

import { useHubspotForm } from "@/hooks/use-hubspot-form";

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

  return (
    <div ref={containerRef} className="hubspot-form min-h-320 w-full">
      <div id={targetId} />
      {status === "loading" && <p className="text-normal-md text-text-tertiary">{labels.loading}</p>}
      {status === "error" && (
        <p role="alert" className="text-normal-md text-system-red-primary">
          {labels.error}
        </p>
      )}
    </div>
  );
}
