"use client";

import { useEffect, useRef, useState } from "react";

type HubspotOptions = {
  portalId: string;
  formId: string;
  region: string;
  targetId: string;
};

type Hubspot = { forms: { create: (options: Record<string, unknown>) => void } };

declare global {
  interface Window {
    hbspt?: Hubspot;
  }
}

const SCRIPT_SRC = "https://js.hsforms.net/forms/embed/v2.js";
let scriptPromise: Promise<Hubspot> | undefined;

function loadHubspot(): Promise<Hubspot> {
  scriptPromise ??= new Promise<Hubspot>((resolve, reject) => {
    if (window.hbspt) return resolve(window.hbspt);
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => (window.hbspt ? resolve(window.hbspt) : reject(new Error("hbspt missing")));
    script.onerror = () => {
      scriptPromise = undefined;
      reject(new Error("HubSpot script failed"));
    };
    document.head.append(script);
  });
  return scriptPromise;
}

/* Nạp script HubSpot khi form gần vào màn hình để không làm chậm LCP. */
export function useHubspotForm({ portalId, formId, region, targetId }: HubspotOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        setStatus("loading");
        loadHubspot()
          .then((hubspot) => {
            if (cancelled) return;
            hubspot.forms.create({
              portalId,
              formId,
              region,
              target: `#${targetId}`,
              onFormReady: () => !cancelled && setStatus("ready"),
            });
          })
          .catch(() => !cancelled && setStatus("error"));
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(container);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [portalId, formId, region, targetId]);

  return { containerRef, status };
}
