import { Navbar } from "@/components/landing/Navbar";
import {
  AUTHOR_NAME,
  AUTHOR_GITHUB_URL,
  AUTHOR_DISCORD_URL,
} from "@/lib/constants";
import { Landing } from "@/pages/Landing";
import { About } from "@/pages/About";
import { AsciiAnimation } from "@/components/landing/AsciiAnimation";
import Galaxy from "@/components/landing/Galaxy";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CustomCursor } from "@/components/ui/CustomCursor";
import "./App.css";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  const [showGalaxy, setShowGalaxy] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGalaxy(true);
    }, 2500); // Defer expensive WebGL rendering to improve initial page load
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background font-sans antialiased text-foreground selection:bg-cyan-500/30">
      <CustomCursor />
      <SmoothScroll />

      {/* Background layer: ASCII black hole animation */}
      <AsciiAnimation />

      {/* Deferred Galaxy WebGL layer for performance */}
      <div
        className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000"
        style={{ opacity: showGalaxy ? 1 : 0 }}
      >
        {showGalaxy && (
          <Galaxy
            mouseRepulsion={true}
            mouseInteraction={true}
            density={0.5}
            glowIntensity={0.3}
            saturation={0}
            hueShift={140}
            twinkleIntensity={0.3}
            rotationSpeed={0.1}
            repulsionStrength={2}
            autoCenterRepulsion={0}
            starSpeed={0.5}
            speed={1}
            transparent={true}
          />
        )}
      </div>

      {/* Grid overlay and ambient gradients */}
      <div className="fixed inset-0 h-full w-full pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(circle_800px_at_50%_-100px,var(--primary),transparent)] opacity-20 blur-[100px]"></div>
      </div>

      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </AnimatePresence>
      </main>

      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by{" "}
            <a
              href={AUTHOR_DISCORD_URL}
              className="font-medium underline underline-offset-4"
            >
              {AUTHOR_NAME}
            </a>
            . The source code is available on{" "}
            <a
              href={AUTHOR_GITHUB_URL}
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
