"use client";

import { motion, useReducedMotion } from "motion/react";

const bars = [38, 54, 68, 51, 82, 70];

export function DashboardMockup() {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={reduce ? false : { opacity: 0, x: 28, scale: 0.96 }} whileInView={{ opacity: 1, x: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }} className="relative mx-auto w-full max-w-[570px]">
      <div className="absolute -inset-10 -z-10 rounded-full bg-[#9df1c2]/45 blur-3xl" />
      <div className="rounded-[28px] border border-[#dce9e1] bg-white p-4 shadow-[0_28px_70px_rgba(16,50,30,.14)] sm:p-6">
        <div className="mb-5 flex items-center justify-between"><div><p className="text-xs text-[#718078]">PetLink Provider OS</p><p className="font-bold">Green Paws Spa</p></div><span className="rounded-full bg-[#e9fbf1] px-3 py-1 text-xs font-bold text-[#149653]">● Đang hoạt động</span></div>
        <motion.div className="grid grid-cols-2 gap-3 sm:grid-cols-4" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: reduce ? 0 : 0.1 } } }}>
          {[['18','Lịch hẹn hôm nay'],['12/18','Đã check-in'],['42,8tr','Doanh thu'],['128tr','Doanh thu tháng']].map(([value,label], index) => <motion.div key={label} variants={{hidden:{opacity:0,y:reduce?0:12},visible:{opacity:1,y:0}}} className={index === 3 ? "rounded-2xl bg-[#0c2919] p-3 text-white" : "rounded-2xl bg-[#f4f8f5] p-3"}><p className="text-xl font-black">{value}</p><p className="mt-1 text-[10px] opacity-65">{label}</p></motion.div>)}
        </motion.div>
        <div className="mt-4 rounded-2xl bg-[#f5faf7] p-4"><div className="flex items-center justify-between"><p className="text-xs font-bold">Trạng thái booking</p><p className="text-xs font-bold text-[#18ad5e]">+18%</p></div><div className="mt-5 flex h-28 items-end gap-3">{bars.map((height, index) => <motion.div key={index} initial={reduce ? { scaleY: 1 } : { scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.08, duration: 0.55 }} style={{ height: `${height}%`, transformOrigin: "bottom" }} className={`flex-1 rounded-t-xl ${index > 3 ? "bg-[#19b765]" : "bg-[#a7e9c4]"}`} />)}</div></div>
      </div>
      <div className="absolute -bottom-5 -left-3 rounded-2xl bg-[#102b1c] px-4 py-3 text-xs font-semibold text-white shadow-xl sm:-left-8">✓ 6 hồ sơ chờ duyệt</div>
    </motion.div>
  );
}
