import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  id: string;
  title: string;
  eyebrow?: string;
  description?: string;
  align?: "start" | "center";
  inverted?: boolean;
};

export function SectionHeading({ id, title, eyebrow, description, align = "start", inverted = false }: SectionHeadingProps) {
  return (
    <header className={cn("flex max-w-2xl flex-col gap-12", align === "center" && "mx-auto items-center text-center")}>
      {eyebrow && (
        <p className={cn("text-normal-l font-semibold tracking-wide uppercase", inverted ? "text-text-inverse" : "text-brand-primary")}>
          {eyebrow}
        </p>
      )}
      <h2 id={id} className={cn("text-large-sm font-semibold md:text-large-md", inverted ? "text-text-inverse" : "text-text-primary")}>
        {title}
      </h2>
      {description && (
        <p className={cn("text-normal-lg md:text-normal-xl", inverted ? "text-text-inverse" : "text-text-secondary")}>{description}</p>
      )}
    </header>
  );
}
