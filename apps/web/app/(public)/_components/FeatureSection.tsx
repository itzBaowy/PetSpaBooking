import { AnimatedCard, AnimatedReveal, AnimatedStagger } from "./AnimatedReveal";

const features = ["Xác thực nhà cung cấp", "Quản lý dịch vụ", "Quản lý lịch hẹn", "QR check-in / check-out", "Chat realtime", "Thông báo hệ thống", "Theo dõi thanh toán", "Ví nhà cung cấp", "Quản lý rút tiền", "Báo cáo & thống kê", "Quản lý khiếu nại", "Phân quyền theo vai trò"];

export function FeatureSection() {
  return <section id="features" className="scroll-mt-18 bg-[#f1f9f4] px-5 py-24 lg:px-8"><div className="mx-auto max-w-7xl"><AnimatedReveal className="mx-auto max-w-3xl text-center"><span className="text-sm font-extrabold uppercase tracking-[.18em] text-[#1eac61]">Tính năng</span><h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl">Tất cả công cụ cần thiết để vận hành nền tảng dịch vụ thú cưng</h2></AnimatedReveal><AnimatedStagger className="mt-12 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">{features.map((feature,index)=><AnimatedCard key={feature} className={`rounded-2xl border p-5 text-sm font-bold shadow-sm ${index === features.length-1 ? "border-[#133021] bg-[#123020] text-white" : "border-[#e1ece5] bg-white"}`}><span className={`mr-3 inline-grid size-8 place-items-center rounded-lg ${index === features.length-1 ? "bg-white/10 text-[#55dc91]" : "bg-[#e9f9f0] text-[#17a65a]"}`}>◇</span>{feature}</AnimatedCard>)}</AnimatedStagger></div></section>;
}
