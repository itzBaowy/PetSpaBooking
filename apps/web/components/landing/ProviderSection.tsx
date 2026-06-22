import { AnimatedCard, AnimatedReveal, AnimatedStagger } from "./AnimatedReveal";

const benefits = [
  ["01", "Quản lý lịch hẹn", "Theo dõi lịch theo ngày, trạng thái booking và nhân sự phụ trách."],
  ["02", "QR check-in / check-out", "Rút ngắn thao tác tại quầy, lưu lại hành trình phục vụ minh bạch."],
  ["03", "Khách hàng thân thiết", "Lưu hồ sơ thú cưng, lịch sử dịch vụ và ghi chú chăm sóc."],
  ["04", "Doanh thu rõ ràng", "Theo dõi thanh toán, hoa hồng và số dư có thể rút theo thời gian thực."],
];

export function ProviderSection() {
  return (
    <section id="providers" className="scroll-mt-18 bg-[#f2faf5] px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <AnimatedReveal className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-extrabold uppercase tracking-[.18em] text-[#1eac61]">Dành cho nhà cung cấp</span>
          <h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl">
            Vận hành dịch vụ nhẹ nhàng, chuyên nghiệp hơn
          </h2>
          <p className="mt-5 text-[#64746b]">
            Thay bảng tính và tin nhắn rời rạc bằng một quy trình liền mạch từ lúc khách đặt lịch đến khi hoàn tất dịch vụ.
          </p>
        </AnimatedReveal>
        <AnimatedStagger className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map(([num, title, text]) => (
            <AnimatedCard key={num} className="rounded-[26px] border border-white bg-white p-6 shadow-[0_12px_35px_rgba(20,70,40,.06)]">
              <span className="text-xs font-black text-[#20b966]">{num}</span>
              <h3 className="mt-4 text-lg font-extrabold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#68776f]">{text}</p>
            </AnimatedCard>
          ))}
        </AnimatedStagger>
      </div>
    </section>
  );
}
