"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useEffect, useState } from "react";

const links = [
  ["Trang chủ", "#home"],
  ["Dành cho nhà cung cấp", "#providers"],
  ["Quản trị hệ thống", "#admin"],
  ["Tính năng", "#features"],
  ["Quy trình", "#process"],
  ["Liên hệ", "#contact"],
];

export function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  const updateActiveSection = () => {
    const marker = window.scrollY + Math.min(220, window.innerHeight * 0.35);
    let current = "home";

    for (const [, href] of links) {
      const id = href.slice(1);
      const section = document.getElementById(id);
      if (section && section.offsetTop <= marker) current = id;
    }

    setActiveSection(current);
  };

  useMotionValueEvent(scrollY, "change", updateActiveSection);

  useEffect(() => {
    const frame = window.requestAnimationFrame(updateActiveSection);
    window.addEventListener("resize", updateActiveSection);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  return (
    <motion.header initial={reduce ? false : { opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        <a href="#home" className="flex items-center" aria-label="PetLink - Trang chủ">
          <Image src="/brand/petlink-logo.png" alt="PetLink" width={58} height={58} priority className="size-14 object-contain" />
        </a>
        <nav className="hidden items-center gap-5 text-sm font-medium text-[#4e6257] xl:flex">
          {links.map(([label, href]) => {
            const active = activeSection === href.slice(1);
            return <a key={href} className={`relative py-2 transition-colors hover:text-[#13a85a] ${active ? "font-bold text-[#13a85a]" : ""}`} href={href} aria-current={active ? "location" : undefined}>{label}{active && <motion.span layoutId="landing-nav-active" className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-[#20c66e]" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }} />}</a>;
          })}
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          <Link href="/login" className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-[#f0faf5]">Đăng nhập</Link>
          <Link href="/register-provider" className="rounded-full bg-[#25c66f] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#16a85a]">Đăng ký nhà cung cấp</Link>
        </div>
        <button className="grid size-10 place-items-center rounded-xl bg-[#effaf4] text-xl sm:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Mở menu">{open ? "×" : "☰"}</button>
      </div>
      {open && <nav className="border-t border-black/5 bg-white px-5 py-4 sm:hidden">{links.map(([label, href]) => { const active = activeSection === href.slice(1); return <a key={href} href={href} onClick={() => setOpen(false)} aria-current={active ? "location" : undefined} className={`block rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-[#effaf4] ${active ? "bg-[#effaf4] text-[#13a85a]" : ""}`}>{label}</a>; })}<div className="mt-3 grid grid-cols-2 gap-2"><Link href="/login" className="rounded-full border px-3 py-2 text-center text-sm font-semibold">Đăng nhập</Link><Link href="/register-provider" className="rounded-full bg-[#25c66f] px-3 py-2 text-center text-sm font-bold text-white">Đăng ký</Link></div></nav>}
    </motion.header>
  );
}
