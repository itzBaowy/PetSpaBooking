export function ProviderRegistrationReviewStep({
  reviewItems,
  previews,
}: {
  reviewItems: string[][];
  previews: Record<string, string[]>;
}) {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border-subtle bg-surface-muted p-5">
        <h3 className="text-lg font-bold">Kiểm tra thông tin</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {reviewItems.map(([label, value]) => (
            <div key={label}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                {label}
              </p>
              <p className="mt-1 break-all text-sm font-bold text-foreground">
                {value || "Chưa cung cấp"}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border-subtle bg-surface p-5">
        <h3 className="text-lg font-bold">Kiểm tra hình ảnh</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(previews).flatMap(([group, urls]) =>
            urls.map((url, index) => (
              <figure key={url} className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`${group} ${index + 1}`}
                  className="h-44 w-full rounded-xl border border-border-subtle bg-surface-muted object-cover"
                />
              </figure>
            )),
          )}
        </div>
      </div>
      <label className="flex items-start gap-3 text-sm leading-6 text-muted">
        <input required type="checkbox" className="mt-1 h-4 w-4 accent-brand" />
        Tôi xác nhận thông tin cung cấp là chính xác và đồng ý với điều khoản
        dành cho nhà cung cấp.
      </label>
    </section>
  );
}
