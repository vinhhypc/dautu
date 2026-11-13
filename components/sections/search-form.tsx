import type { SearchFormContent } from "@/types/content";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function SearchForm({ action, label, placeholder, submitLabel, query }: SearchFormContent) {
  return (
    <form action={action} method="get" role="search" aria-label={label} className="flex items-center gap-12">
      <Input
        type="search"
        name="q"
        required
        defaultValue={query}
        placeholder={placeholder}
        aria-label={label}
        wrapperClassName="h-40 rounded-8 border border-border-default bg-background-base px-12 py-0 focus-within:border-text-primary"
        className="text-normal-lg"
      />
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
