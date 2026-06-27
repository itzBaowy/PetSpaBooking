export function ProviderRegistrationInfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-muted p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-2 break-all text-base font-bold text-foreground">
        {value}
      </p>
    </div>
  );
}
