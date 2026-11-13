type SkipLinkProps = {
  targetId: string;
  label: string;
};

export function SkipLink({ targetId, label }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only rounded-8 bg-brand-primary px-16 py-8 font-semibold text-text-inverse focus-visible:not-sr-only focus-visible:fixed focus-visible:top-16 focus-visible:left-16 focus-visible:z-50"
    >
      {label}
    </a>
  );
}
