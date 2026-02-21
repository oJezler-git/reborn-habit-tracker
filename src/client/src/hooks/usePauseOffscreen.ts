import { useEffect, type RefObject } from "react";

/**
 * usePauseOffscreen
 *
 * Optimisation hook that uses IntersectionObserver to pause CSS animations
 * when the target element is outside the viewport. This reduces
 * GPU/CPU load from infinite animations running off-screen.
 *
 * @param ref - React RefObject to the container element
 * @param threshold - Interaction threshold before intersection triggers (default: 0.1)
 */
export function usePauseOffscreen(
  ref: RefObject<HTMLElement | null>,
  threshold = 0.1,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.remove("pause-animations");
        } else {
          el.classList.add("pause-animations");
        }
      },
      { threshold },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [ref, threshold]);
}
