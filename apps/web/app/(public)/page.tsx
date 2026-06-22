import { AdminSection } from "./_components/AdminSection";
import { ContactSection } from "./_components/ContactSection";
import { FeatureSection } from "./_components/FeatureSection";
import { HeroSection } from "./_components/HeroSection";
import { LandingNavbar } from "./_components/LandingNavbar";
import { ProcessSection } from "./_components/ProcessSection";
import { ProviderSection } from "./_components/ProviderSection";

export default function Home() {
  return (
    <main className="public-landing min-h-screen overflow-x-hidden bg-white text-[#10251a]">
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
