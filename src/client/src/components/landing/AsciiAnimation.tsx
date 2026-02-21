import { useEffect, useRef } from "react";
import { FALLBACK_FRAME } from "./ascii_fallback";

// Load appropriate JSON file based on device tier (L/M/H quality levels)
const loadFrames = async (tier: "L" | "M" | "H") => {
  switch (tier) {
    case "L":
      return import("@/assets/grok_ascii_L_frames.json").then((m) => m.default);
    case "M":
      return import("@/assets/grok_ascii_M_frames.json").then((m) => m.default);
    case "H":
      return import("@/assets/grok_ascii_H_frames.json").then((m) => m.default);
  }
};

// Determine device performance tier based on CPU cores
const getDeviceTier = (): "L" | "M" | "H" => {
  if (typeof navigator === "undefined") return "M";

  const concurrency = navigator.hardwareConcurrency || 4;

  if (concurrency <= 4) return "L";
  if (concurrency <= 8) return "M";
  return "H";
};

export function AsciiAnimation() {
  const START_INDEX = 0;
  const containerRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const ghostRef = useRef<HTMLPreElement>(null);

  const framesRef = useRef<string[]>([FALLBACK_FRAME]);
  const frameIndexRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Typewriter effect state - reveals animation character by character on initial load
  const isTypingRef = useRef(true);
  const typeIndexRef = useRef(START_INDEX);

  const FPS = 12;
  const interval = 1000 / FPS;

  useEffect(() => {
    const tier = getDeviceTier();
    loadFrames(tier).then((data) => {
      // Ensure data is array of strings
      if (Array.isArray(data) && data.every((i) => typeof i === "string")) {
        framesRef.current = data;
        // Reset metrics on new data load
        isTypingRef.current = true;
        typeIndexRef.current = START_INDEX;
        frameIndexRef.current = 0;

        // Update ghost ref for sizing immediately
        if (ghostRef.current) {
          ghostRef.current.innerText = data[0];
        }
      }
    });

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const renderLoop = (time: number) => {
      let shouldUpdate = false;

      // Update frame at 12 FPS is good enough for ASCII
      if (time - lastTimeRef.current >= interval) {
        lastTimeRef.current = time;
        if (framesRef.current.length > 0) {
          frameIndexRef.current =
            (frameIndexRef.current + 1) % framesRef.current.length;
          shouldUpdate = true;
        }
      }

      const currentFrame = framesRef.current[frameIndexRef.current];

      // Typewriter reveal runs at 60 FPS
      if (isTypingRef.current && currentFrame) {
        const speed = 3; // visible chars per frame @ 60fps = ~300 visible chars/sec
        if (typeIndexRef.current < currentFrame.length) {
          // Skip whitespace so it looks like it's actually typing characters
          let newIndex = typeIndexRef.current;
          let charsAdded = 0;

          while (newIndex < currentFrame.length && charsAdded < speed) {
            newIndex++;
            // Only count visible characters toward speed limit
            if (
              currentFrame[newIndex - 1] !== " " &&
              currentFrame[newIndex - 1] !== "\n"
            ) {
              charsAdded++;
            }
          }

          typeIndexRef.current = newIndex;
          shouldUpdate = true;
        } else {
          isTypingRef.current = false;
          shouldUpdate = true;
        }
      }

      // Direct DOM manipulation for better performance than React state updates
      if (shouldUpdate && preRef.current && currentFrame) {
        if (isTypingRef.current) {
          preRef.current.innerText =
            currentFrame.substring(0, typeIndexRef.current) + "█";
        } else {
          preRef.current.innerText = currentFrame;
        }
      }

      if (isTypingRef.current) {
        // During typewriter: run at full 60fps for smooth character reveal
        animationRef.current = requestAnimationFrame(renderLoop);
      } else {
        // Post-typewriter: sleep until the next 12fps tick, then wake for a single
        // RAF frame. This drops main-thread usage from continuous 60fps polling to
        // ~12 brief wake-ups per second.
        timerRef.current = setTimeout(() => {
          animationRef.current = requestAnimationFrame(renderLoop);
        }, interval);
      }
    };

    animationRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [interval]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollY = window.scrollY;
      const startOpacity = 0.3;
      const fadeDistance = 600;
      // Fade out animation as user scrolls to keep focus on content
      const newOpacity = Math.max(
        0,
        startOpacity - (scrollY / fadeDistance) * startOpacity,
      );
      containerRef.current.style.opacity = newOpacity.toString();
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial set
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden select-none"
      style={{
        opacity: 0.3,
        animation: "none !important",
        visibility: "visible",
        animationDelay: "0s !important",
      }}
    >
      <div className="animate-pulse-slow relative scale-[1.8] origin-center">
        {/* Hidden element prevents layout shift during typewriter reveal */}
        <pre
          ref={ghostRef}
          className="text-[10px] leading-[10px] font-mono whitespace-pre opacity-0"
        >
          {FALLBACK_FRAME}
        </pre>

        {/* Visible element with gradient mask for depth effect */}
        <pre
          ref={preRef}
          className="absolute inset-0 text-[10px] leading-[10px] font-mono whitespace-pre bg-gradient-to-b from-white via-white/50 to-transparent bg-clip-text text-transparent [mask-image:radial-gradient(circle,black_40%,transparent_100%)]"
        >
          {FALLBACK_FRAME}
        </pre>
      </div>
    </div>
  );
}
