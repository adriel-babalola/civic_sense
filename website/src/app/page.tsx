import { AboutSection } from "@/components/about-section";
import { CallToAction } from "@/components/call-to-action";
import { HeroSection } from "@/components/hero-section";
import { HowItWorks } from "@/components/how-it-works";
import { SampleVerdicts } from "@/components/sample-verdicts";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { SourcesTicker } from "@/components/sources-ticker";
import { TeamSection } from "@/components/team-section";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <HeroSection />
      <AboutSection />
      <SourcesTicker />
      <HowItWorks />
      <SampleVerdicts />
      <TeamSection />
      <CallToAction />
      <SiteFooter />
    </>
  );
}
