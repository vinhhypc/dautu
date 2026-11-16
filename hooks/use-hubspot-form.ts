"use client";

import { useEffect, useRef, useState } from "react";

import { hubspotFormCss, readThemeTokens } from "@/lib/hubspot-theme";

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

function fontFaceRules(): string {
  return [...document.styleSheets]
    .flatMap((sheet) => {
      try {
        return [...sheet.cssRules];
      } catch {
        return [];
      }
    })
    .filter((rule) => rule instanceof CSSFontFaceRule)
    .map((rule) => rule.cssText)
    .join("\n");
}

/* Đổi giao diện form trong iframe theo ds-one; CSS mới làm form cao hơn nên iframe phải tự co giãn theo nội dung. */
function themeFrame(frame: HTMLIFrameElement): (() => void) | undefined {
  const doc = frame.contentDocument;
  if (!doc?.body) return undefined;
  const style = doc.createElement("style");
  style.textContent = fontFaceRules() + hubspotFormCss(readThemeTokens(getComputedStyle(document.documentElement)), getComputedStyle(document.body).fontFamily);
  doc.head.append(style);
  const fit = () => {
    frame.style.height = `${doc.documentElement.scrollHeight}px`;
  };
  const resize = new ResizeObserver(fit);
  resize.observe(doc.body);
  fit();
  return () => resize.disconnect();
}

/* Nạp script HubSpot khi form gần vào màn hình để không làm chậm LCP. */
export function useHubspotForm({ portalId, formId, region, targetId }: HubspotOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let stopResize: (() => void) | undefined;
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
              onFormReady: () => {
                if (cancelled) return;
                const frame = container.querySelector("iframe");
                if (frame) stopResize = themeFrame(frame);
                setStatus("ready");
              },
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
      stopResize?.();
    };
  }, [portalId, formId, region, targetId]);

  return { containerRef, status };
}
