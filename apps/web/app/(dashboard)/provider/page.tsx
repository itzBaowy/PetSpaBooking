import Link from "next/link";

export default function ProviderDashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-3xl font-bold">Tổng quan nhà cung cấp</h1>
        <div className="mb-6 flex flex-col gap-5 rounded-2xl border border-warning/25 bg-warning-soft p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface text-warning shadow-sm">!</span>
            <div>
              <h2 className="font-bold text-foreground">Hoàn tất xác minh doanh nghiệp</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">Tài khoản của bạn chưa được xác minh. Hãy bổ sung hồ sơ doanh nghiệp để có thể đăng dịch vụ và nhận lịch đặt.</p>
            </div>
          </div>
          <Link href="/provider-verification" className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-brand px-6 text-sm font-bold text-white shadow-sm hover:bg-brand-hover">Xác minh ngay →</Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {['Lịch đặt', 'Doanh thu', 'Dịch vụ', 'Khách hàng'].map((item) => <div key={item} className="rounded-2xl border border-border-subtle bg-surface p-5 font-semibold shadow-sm">{item}</div>)}
        </div>
      </div>
    </div>
  );
}
