import Link from "next/link";
import { AnimatedReveal, AnimatedStagger, AnimatedCard } from "./AnimatedReveal";
import { DashboardMockup } from "./DashboardMockup";

export function HeroSection() {
  return (
    <section id="home" className="scroll-mt-20 bg-[radial-gradient(circle_at_70%_30%,#dff8e9_0,transparent_35%)] px-5 pb-20 pt-32 lg:px-8 lg:pb-28 lg:pt-40">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_.98fr]">
        <div>
          <AnimatedReveal>
            <span className="inline-flex rounded-full border border-[#bdebd0] bg-[#effbf4] px-3 py-1 text-xs font-bold text-[#159756]">
              ✦ Nền tảng quản lý cho Provider và Admin
            </span>
          </AnimatedReveal>
          <AnimatedReveal delay={0.08}>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[.98] tracking-[-.055em] sm:text-6xl lg:text-7xl">
              Quản lý dịch vụ chăm sóc thú cưng dễ dàng hơn với{" "}
              <span className="text-[#20b966]">PetLink</span>
            </h1>
          </AnimatedReveal>
          <AnimatedReveal delay={0.16}>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#607168] sm:text-lg">
              Một nền tảng giúp nhà cung cấp dịch vụ vận hành lịch hẹn, khách hàng, doanh thu và giúp admin kiểm soát toàn hệ thống trong một màn hình rõ ràng.
            </p>
          </AnimatedReveal>
          <AnimatedReveal delay={0.24} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register-provider"
              className="rounded-full bg-[#25c66f] px-6 py-3.5 text-center text-sm font-extrabold text-white shadow-[0_10px_30px_rgba(37,198,111,.25)] transition hover:-translate-y-0.5 hover:bg-[#16a85a]"
            >
              Đăng ký nhà cung cấp →
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-[#dce8e0] bg-white px-6 py-3.5 text-center text-sm font-bold transition hover:-translate-y-0.5 hover:bg-[#f3faf6]"
            >
              Đăng nhập chà cung cấp
            </Link>
          </AnimatedReveal>
          <AnimatedStagger className="mt-9 grid grid-cols-3 gap-3">
            {[
              ["+48%", "tốc độ xử lý booking"],
              ["24/7", "theo dõi và thanh toán"],
              ["1 màn hình", "nắm toàn bộ vận hành"],
            ].map(([value, label]) => (
              <AnimatedCard key={value} className="rounded-2xl border border-[#e4eee8] bg-white p-4 shadow-sm">
                <p className="text-lg font-black text-[#13a85a]">{value}</p>
                <p className="mt-1 text-[11px] text-[#718078]">{label}</p>
              </AnimatedCard>
            ))}
          </AnimatedStagger>
        </div>
        <DashboardMockup />
      </div>
    </section>
  );
}
