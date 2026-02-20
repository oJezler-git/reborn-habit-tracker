import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { PageTransition } from "@/components/PageTransition";

export function Landing() {
  return (
    <PageTransition className="w-full">
      <Hero />
      <Features />
      <Pricing />
      <FAQ />
    </PageTransition>
  );
}
