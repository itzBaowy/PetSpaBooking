import Link from "next/link";
import { AnimatedReveal } from "./AnimatedReveal";

export function ContactSection() {
  return (
    <>
      <section id="contact" className="scroll-mt-18 px-5 py-10 lg:px-8">
        <AnimatedReveal className="mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-[linear-gradient(120deg,#0d3320,#1cb765)] px-6 py-16 text-center text-white sm:px-12 lg:py-20">
          <h2 className="mx-auto max-w-3xl text-4xl font-black tracking-[-.04em] sm:text-5xl">
            Sẵn sàng quản lý dịch vụ thú cưng thông minh hơn?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-white/70">
            Bắt đầu với PetLink để quản lý lịch hẹn, dịch vụ, doanh thu và giao tiếp với khách hàng dễ dàng hơn.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register-provider"
              className="rounded-full bg-white px-6 py-3.5 text-sm font-extrabold text-[#158c4e] transition hover:-translate-y-0.5"
            >
              Đăng ký nhà cung cấp
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/20"
            >
              Đăng nhập
            </Link>
          </div>
        </AnimatedReveal>
      </section>

      <footer className="px-5 py-10 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 border-t border-[#e5eee8] pt-8 sm:flex-row">
          <div>
            <p className="font-extrabold">PetLink</p>
            <p className="mt-2 max-w-sm text-sm text-[#708077]">
              Nền tảng quản lý dành cho nhà cung cấp dịch vụ chăm sóc thú cưng và đội ngũ vận hành.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-[#617168]">
            <a href="#home">Trang chủ</a>
            <a href="#features">Tính năng</a>
            <a href="#process">Quy trình</a>
            <a href="mailto:hello@petlink.vn">hello@petlink.vn</a>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-7xl text-xs text-[#91a098]">
          © 2026 PetLink. Thiết kế cho vận hành dịch vụ chuyên nghiệp.
        </p>
      </footer>
    </>
  );
}
