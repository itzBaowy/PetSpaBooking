import type { Metadata } from "next";
import {
  AdminSection,
  AuthRedirect,
  ContactSection,
  FeatureSection,
  HeroSection,
  LandingNavbar,
  ProcessSection,
  ProviderSection,
} from "@/components/landing";


export const metadata: Metadata = {
  title: "PetLink — Nền tảng quản lý dịch vụ chăm sóc thú cưng",
  description:
    "PetLink giúp nhà cung cấp dịch vụ spa thú cưng quản lý lịch hẹn, khách hàng và doanh thu. Đăng ký ngay để trải nghiệm nền tảng quản trị toàn diện.",
  keywords: [
    "pet spa",
    "quản lý thú cưng",
    "spa thú cưng",
    "PetLink",
    "lịch hẹn thú cưng",
    "chăm sóc thú cưng",
  ],
  openGraph: {
    title: "PetLink — Nền tảng quản lý dịch vụ chăm sóc thú cưng",
    description:
      "Quản lý lịch hẹn, khách hàng và doanh thu spa thú cưng dễ dàng hơn với PetLink.",
    type: "website",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: "PetLink — Nền tảng quản lý spa thú cưng",
    description:
      "Quản lý lịch hẹn, khách hàng và doanh thu spa thú cưng dễ dàng hơn với PetLink.",
  },
};

export default function Home() {
  return (
    <main className="public-landing min-h-screen overflow-x-hidden bg-white text-[#10251a]">
      <AuthRedirect />
      <LandingNavbar />
      <HeroSection />
      <ProviderSection />
      <AdminSection />
      <FeatureSection />
      <ProcessSection />
      <ContactSection />
    </main>
  );
}
