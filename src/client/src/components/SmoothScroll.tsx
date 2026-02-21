import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Provides smooth, inertia-based scrolling across the entire application.
 *
 * Uses the Lenis library with its built-in `autoRaf` mode, which manages
 * its own requestAnimationFrame loop internally. This avoids spawning an
 * untracked manual RAF loop that would leak on every re-mount and compound
 * CPU usage over time.
 */
export const SmoothScroll = () => {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.5,
      touchMultiplier: 2,
    });

    // Expose globally so other components (e.g. Navbar scroll-to-section)
    // can access the Lenis instance for synchronised programmatic scrolling.
    (window as any).lenis = lenis;

    return () => {
      lenis.destroy();
      (window as any).lenis = null;
    };
  }, []);

  return null;
};
