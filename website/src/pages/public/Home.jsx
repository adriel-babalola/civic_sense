import { Hero, HowItWorks, SourceTicker } from "../../components/sections/Hero";
import {
  CallToAction,
  Features,
  Mission,
  SampleVerdicts,
  TrustSection,
  VerdictExplainerSection,
} from "../../components/sections/Features";

/**
 * Home.
 *
 * Ordered by the questions a first-time visitor actually has: what is this, who
 * says so, how does it work, what can I do, what does the output look like, and
 * can I trust it. The promise is the hero, the proof is the source band directly
 * under it, and the ask is last.
 */
export function Home() {
  return (
    <>
      <Hero />
      <SourceTicker />
      <HowItWorks />
      <Features />
      <SampleVerdicts />
      <VerdictExplainerSection />
      <Mission />
      <TrustSection />
      <CallToAction />
    </>
  );
}

export default Home;
