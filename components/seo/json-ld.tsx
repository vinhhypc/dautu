import type { JsonLdObject } from "@/lib/structured-data";

type JsonLdProps = {
  data: JsonLdObject | JsonLdObject[];
};

export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
