import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { APP_RELEASE_LABEL, APP_TAGLINE } from "@/lib/constants";

import { TextAnimate } from "@/components/ui/text-animate";

/**
 * Hero: The primary entry point and value proposition section of the landing page.
 *
 * This component is designed to capture user attention immediately using
 * high-impact typography, staggered text animations, and a clear call-to-action.
 * It serves as the visual anchor for the top of the site.
 */
export function Hero() {
  return (
    <section className="container flex flex-col items-center justify-center gap-6 pb-8 pt-6 md:min-h-screen relative z-10">
      <div className="flex max-w-[980px] flex-col items-center gap-4 text-center relative z-10">
        {/* Current release label badge with subtle entrance animation */}
        <Badge
          variant="outline"
          className="mb-4 bg-primary/10 backdrop-blur-md border-primary/20 px-4 py-1.5 text-xs font-mono tracking-widest rounded-full text-primary animate-in fade-in slide-in-from-bottom-4 duration-1000 uppercase"
        >
          {/* Populated by package.json */}
          {APP_RELEASE_LABEL}
        </Badge>

        {/* Main headline structure with staggered text reveals for a premium feel */}
        <h1 className="text-4xl font-extrabold leading-tight tracking-tighter md:text-6xl lg:text-7xl lg:leading-[1.1] font-[family-name:var(--font-heading)]">
          <TextAnimate
            text="Stop Guessing."
            className="text-foreground block mb-2"
            startVisible={true}
          />
          <TextAnimate
            text="Start Improving."
            delay={500}
            className="pb-2 block"
            segmentClassName="py-2 text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-primary animate-gradient-x"
          />
        </h1>

        {/* Dynamic tagline displaying the product's core philosophy */}
        <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl md:text-2xl leading-relaxed mt-4">
          <TextAnimate
            text={APP_TAGLINE}
            variant="soft"
            delay={1000}
            className="inline"
            stagger={10}
          />
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-8 z-10 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
        {/* Primary CTA button with custom glow physics and hover transitions */}
        <Button
          size="lg"
          className="h-12 px-8 text-base rounded-full shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all duration-300"
        >
          Improve your life <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* 
        Ambient Background Light: 
        A non-interactive, low-opacity radial pulse that provides depth and 
        visual warmth behind the main content without impacting readability.
      */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none -z-0 animate-pulse-slow"></div>
    </section>
  );
}
