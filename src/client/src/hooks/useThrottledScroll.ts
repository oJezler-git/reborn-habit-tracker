import { useEffect, useRef } from "react";

type ScrollCallback = (scrollY: number) => void;

let ticking = false;
const listeners = new Set<ScrollCallback>();

const handleScroll = () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      listeners.forEach((callback) => callback(scrollY));
      ticking = false;
    });
    ticking = true;
  }
};

/**
 * A throttled scroll hook that uses a single global window.addEventListener
 * and requestAnimationFrame for optimal performance.
 *
 * Includes `{ passive: true }` to avoid blocking scroll.
 */
export function useThrottledScroll(callback: ScrollCallback) {
  // Store the latest callback to avoid changing the listener Set on every render
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const wrappedCallback = (scrollY: number) => {
      savedCallback.current(scrollY);
    };

    if (listeners.size === 0) {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    listeners.add(wrappedCallback);

    // Initial call to set state
    const rafId = requestAnimationFrame(() => wrappedCallback(window.scrollY));

    return () => {
      cancelAnimationFrame(rafId);
      listeners.delete(wrappedCallback);
      if (listeners.size === 0) {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);
}
