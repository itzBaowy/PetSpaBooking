"use client";

import type { ReactNode, SVGProps } from "react";
import Link from "next/link";
import { useProfile } from "@/apis/auth/queries";

const quickLinks: Array<{
  label: string;
  description: string;
  href: string;
  icon: ReactNode;
  accent: string;
}> = [
  {
    label: "Đặt lịch",
    description: "Theo dõi và xử lý lịch hẹn mới",
    href: "/provider/bookings",
    icon: <CalendarIcon />,
    accent: "bg-emerald-100 text-emerald-700",
  },
  {
    label: "Dịch vụ",
    description: "Cập nhật dịch vụ và bảng giá",
    href: "/provider/services",
    icon: <ServiceIcon />,
    accent: "bg-sky-100 text-sky-700",
  },
  {
    label: "Lịch làm việc",
    description: "Thiết lập giờ mở cửa và ngày nghỉ",
    href: "/provider/availability",
    icon: <ClockIcon />,
    accent: "bg-amber-100 text-amber-700",
  },
  {
    label: "Ví provider",
    description: "Quản lý số dư và giao dịch",
    href: "/provider/wallet",
    icon: <WalletIcon />,
    accent: "bg-violet-100 text-violet-700",
  },
];

const dailyActions = [
  { label: "Kiểm tra lịch hẹn hôm nay", href: "/provider/bookings" },
  { label: "Cập nhật thời gian có thể nhận khách", href: "/provider/availability" },
  { label: "Xem tin nhắn mới từ khách hàng", href: "/provider/communication/chat" },
];

export default function ProviderDashboard() {
  const profileQuery = useProfile();
  const providerStatus = profileQuery.data?.providerStatus;
  const displayName = profileQuery.data?.fullName?.trim() || profileQuery.data?.userName || "Nhà cung cấp";

  return (
    <div className="min-h-full bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-500 px-6 py-8 text-white shadow-xl shadow-emerald-900/10 sm:px-8 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <span className="absolute -right-8 -top-14 h-52 w-52 rounded-full border-[30px] border-white/10" />
            <span className="absolute bottom-3 right-[24%] rotate-12 text-5xl opacity-10">🐾</span>
            <span className="absolute right-[8%] top-8 -rotate-12 text-7xl opacity-10">🐾</span>
          </div>

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-100">Trung tâm vận hành</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Chào {displayName}, chúc bạn một ngày làm việc hiệu quả!
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50 sm:text-base">
                Quản lý lịch hẹn, dịch vụ và hoạt động kinh doanh của bạn tại một nơi.
              </p>
            </div>

            {providerStatus === "VERIFIED" ? (
              <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-white bg-white/95 px-4 py-3 text-emerald-950 shadow-lg shadow-emerald-950/20 backdrop-blur-sm">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-lg font-black text-emerald-700 ring-1 ring-emerald-200">✓</span>
                <div>
                  <p className="text-xs font-semibold text-emerald-700">Trạng thái tài khoản</p>
                  <p className="text-sm font-extrabold text-emerald-950">Doanh nghiệp đã xác minh</p>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {profileQuery.isLoading ? (
          <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        ) : providerStatus !== "VERIFIED" ? (
          <section className="flex flex-col gap-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white font-black text-amber-600 shadow-sm">!</span>
              <div>
                <h2 className="font-bold text-slate-900">Hoàn tất xác minh doanh nghiệp</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                  Tài khoản cần được xác minh để đăng dịch vụ và nhận lịch đặt.
                </p>
              </div>
            </div>
            <Link href="/provider/verification" className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-amber-600 px-6 text-sm font-bold text-white hover:bg-amber-700">
              Xác minh ngay
            </Link>
          </section>
        ) : null}

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">Truy cập nhanh</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">Quản lý hoạt động</h2>
            </div>
            <span className="hidden text-sm text-slate-500 sm:block">Mọi công cụ bạn cần mỗi ngày</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickLinks.map((item) => (
              <Link href={item.href} key={item.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/5">
                <div className={`grid h-11 w-11 place-items-center rounded-xl ${item.accent}`}>{item.icon}</div>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <h3 className="font-black text-slate-900">{item.label}</h3>
                  <span className="text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600">→</span>
                </div>
                <p className="mt-1.5 text-sm leading-5 text-slate-500">{item.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.5fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><CheckIcon /></span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600">Gợi ý vận hành</p>
                <h2 className="text-xl font-black text-slate-900">Bắt đầu ngày mới</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {dailyActions.map((action, index) => (
                <Link href={action.href} key={action.href} className="group flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-xs font-black text-emerald-600 shadow-sm">{index + 1}</span>
                  <span className="text-sm font-bold leading-5 text-slate-700 group-hover:text-emerald-800">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <Link href="/provider/communication/chat" className="group relative overflow-hidden rounded-2xl bg-emerald-100 p-6 transition hover:bg-emerald-200">
            <span className="absolute -bottom-5 -right-3 rotate-[-18deg] text-7xl opacity-10" aria-hidden="true">🐾</span>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Kết nối khách hàng</p>
            <h2 className="mt-2 text-xl font-black text-emerald-950">Tin nhắn & hỗ trợ</h2>
            <p className="mt-2 max-w-xs text-sm leading-6 text-emerald-800/80">Phản hồi khách nhanh chóng để mang lại trải nghiệm tốt hơn.</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-emerald-800">Mở hộp thư <span className="transition group-hover:translate-x-1">→</span></span>
          </Link>
        </section>
      </div>
    </div>
  );
}

function IconBase(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true" {...props} />;
}

function CalendarIcon() {
  return <IconBase><path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" /><path d="m9 15 2 2 4-4" /></IconBase>;
}

function ServiceIcon() {
  return <IconBase><path d="M8 5h8M9 3h6v4H9zM6 5H5a1 1 0 0 0-1 1v14h16V6a1 1 0 0 0-1-1h-1" /><path d="M8 12h8M8 16h5" /></IconBase>;
}

function ClockIcon() {
  return <IconBase><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></IconBase>;
}

function WalletIcon() {
  return <IconBase><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H18v4H6.5a2.5 2.5 0 0 0 0 5H20v7H6a2 2 0 0 1-2-2Z" /><path d="M17 10h3v3h-3a1.5 1.5 0 0 1 0-3Z" /></IconBase>;
}

function CheckIcon() {
  return <IconBase><path d="m7 12 3 3 7-7" /><circle cx="12" cy="12" r="9" /></IconBase>;
}
