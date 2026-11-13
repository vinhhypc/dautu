export function padStep(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export function formatTierLabel(index: number, name: string): string {
  return `${padStep(index)}  ${name.toUpperCase()}`;
}

export function formatStepCounter(index: number, total: number): string {
  return `${padStep(index)} / ${String(total).padStart(2, "0")}`;
}

export function formatSlideTemplate(template: string, index: number, total: number): string {
  return template.replace("{current}", String(index + 1)).replace("{total}", String(total));
}

export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

export function formatDate(iso: string, language: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(language, { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(date);
}
