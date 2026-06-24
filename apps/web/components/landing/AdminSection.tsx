import { AnimatedCard, AnimatedReveal, AnimatedStagger } from "./AnimatedReveal";

export function AdminSection() {
  return (
    <section id="admin" className="scroll-mt-18 bg-white px-5 py-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <AnimatedReveal>
          <span className="text-sm font-extrabold uppercase tracking-[.18em] text-[#1eac61]">Quản trị hệ thống</span>
          <h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl">Trung tâm điều hành toàn bộ PetLink</h2>
          <p className="mt-5 max-w-xl leading-7 text-[#64746b]">
            Admin theo dõi provider chờ duyệt, booking, thanh toán, khiếu nại và các tín hiệu vận hành quan trọng mà không phải nhảy qua nhiều công cụ.
          </p>
          <div className="mt-8 rounded-[28px] bg-[#0d2b1b] p-7 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Tổng GMV tháng này</p>
                <p className="mt-2 text-3xl font-black">428.000.000đ</p>
              </div>
              <span className="rounded-full bg-[#37d581]/15 px-3 py-1 text-xs font-bold text-[#62e59d]">+18.4%</span>
            </div>
            <div className="mt-7 flex h-24 items-end gap-3">
              {[35, 52, 44, 72, 88].map((h, i) => (
                <div key={i} style={{ height: `${h}%` }} className="flex-1 rounded-t-xl bg-[#42d686]" />
              ))}
            </div>
          </div>
        </AnimatedReveal>
        <AnimatedStagger className="grid gap-4 sm:grid-cols-2">
          {[
            ["✓", "Duyệt nhà cung cấp", "Kiểm tra hồ sơ, giấy phép và trạng thái xác thực."],
            ["◎", "Giám sát booking", "Theo dõi hoạt động và phát hiện bất thường nhanh chóng."],
            ["₫", "Quản lý tài chính", "Đối soát doanh thu, hoa hồng và yêu cầu rút tiền."],
            ["◈", "An toàn hệ thống", "Phân quyền, audit log và kiểm soát khiếu nại tập trung."],
          ].map(([icon, title, text]) => (
            <AnimatedCard key={title} className="rounded-[24px] border border-[#e3eee7] bg-[#f8fcf9] p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-[#dcf7e7] font-black text-[#149b55]">{icon}</span>
              <h3 className="mt-5 text-lg font-extrabold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#66776d]">{text}</p>
            </AnimatedCard>
          ))}
        </AnimatedStagger>
      </div>
    </section>
  );
}
