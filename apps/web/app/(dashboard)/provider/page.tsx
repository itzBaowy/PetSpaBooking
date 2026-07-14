"use client";

import { useProfile } from "@/apis/auth/queries";
import Link from "next/link";

const quickLinks = [
  { label: "Đặt lịch", href: "/provider/bookings" },
  { label: "Dịch vụ", href: "/provider/services" },
  { label: "Lịch làm việc", href: "/provider/availability" },
  { label: "Ví provider", href: "/provider/wallet" },
];

export default function ProviderDashboard() {
  const profileQuery = useProfile();
  const providerStatus = profileQuery.data?.providerStatus;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand">Trung tâm vận hành</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">Tổng quan nhà cung cấp</h1>
          </div>
          {providerStatus === "VERIFIED" && (
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-success/20 bg-success-soft px-3 py-1.5 text-xs font-bold text-success">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-success text-[10px] text-white" aria-hidden="true">✓</span>
              Doanh nghiệp đã xác minh
            </span>
          )}
        </div>
        {profileQuery.isLoading ? (
          <div className="h-28 animate-pulse rounded-2xl border border-border-subtle bg-surface-muted" />
        ) : providerStatus !== "VERIFIED" ? (
          <div className="flex flex-col gap-5 rounded-2xl border border-warning/25 bg-warning-soft p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface text-warning shadow-sm">
              !
            </span>
            <div>
              <h2 className="font-bold text-foreground">Hoàn tất xác minh doanh nghiệp</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
                Tài khoản cần được xác minh để đăng dịch vụ và nhận lịch đặt.
              </p>
            </div>
          </div>
          <Link
            href="/provider/verification"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-brand px-6 text-sm font-bold text-white shadow-sm hover:bg-brand-hover"
          >
            Xác minh ngay
          </Link>
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {quickLinks.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              className="rounded-2xl border border-border-subtle bg-surface p-5 font-semibold shadow-sm transition hover:border-brand hover:bg-brand-soft"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
