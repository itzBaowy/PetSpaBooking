import Link from "next/link";

export function ProviderAccessDenied({ reason }: { reason: string }) {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10 sm:px-6">
      <section
        role="alert"
        className="w-full max-w-xl rounded-3xl border border-warning/25 bg-surface p-6 text-center shadow-xl shadow-slate-900/5 sm:p-10"
      >
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-warning-soft text-xl font-black text-warning">
          !
        </span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-warning">
          Access Denied
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-foreground">
          Bạn chưa thể truy cập trang này
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">{reason}</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/provider"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-brand px-6 text-sm font-bold text-brand-foreground hover:bg-brand-hover"
          >
            Về Dashboard
          </Link>
          <Link
            href="/provider/verification"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border-muted bg-surface px-6 text-sm font-bold text-foreground hover:bg-surface-muted"
          >
            Xem trạng thái xác minh
          </Link>
        </div>
      </section>
    </main>
  );
}
