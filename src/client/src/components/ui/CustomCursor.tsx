import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * CustomCursor: A spring-physics cursor overlay that replaces the native pointer.
 *
 * Performance considerations:
 * - Position updates bypass React state entirely via Framer Motion `useMotionValue`.
 * - Visibility (`isVisible`) uses a ref guard so `setState` fires only once on first movement,
 *   not on every mousemove frame (~60 Hz).
 * - Hover detection avoids `getComputedStyle()` (which forces a synchronous layout recalculation)
 *   and uses pure DOM traversal (`closest()`) instead.
 * - `isHovering` state is guarded by a ref so re-renders only occur on actual state transitions.
 */
export const CustomCursor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  /** Ref guards prevent redundant setState calls during high-frequency events. */
  const isVisibleRef = useRef(false);
  const isHoveringRef = useRef(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  /** "Liquid" feel: high stiffness for snap, but enough damping to look organic. */
  const springConfig = { damping: 28, stiffness: 500, mass: 0.8 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      /** Only trigger the React render for visibility on the very first movement. */
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }
    };

    /**
     * Determines interactive-element hover without `getComputedStyle`.
     *
     * `getComputedStyle()` forces a synchronous style recalculation on every
     * `mouseover` event, causing layout thrash. Instead we use `closest()`
     * with a selector covering standard interactive elements and
     * `cursor-pointer` via the `role` attribute.
     */
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const shouldHover = !!(
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[role='button']") ||
        target.closest("[data-cursor='pointer']")
      );

      /** Guard: only call setState when the hover state genuinely changes. */
      if (isHoveringRef.current !== shouldHover) {
        isHoveringRef.current = shouldHover;
        setIsHovering(shouldHover);
      }
    };

    const handleMouseEnter = () => {
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [cursorX, cursorY]);

  /** Globally suppresses the native cursor so the custom overlay is the sole pointer. */
  useEffect(() => {
    document.body.style.cursor = "none";
    const style = document.createElement("style");
    style.innerHTML = `* { cursor: none !important; }`;
    style.id = "cursor-style";
    document.head.appendChild(style);

    return () => {
      document.body.style.cursor = "auto";
      const existingStyle = document.getElementById("cursor-style");
      if (existingStyle) existingStyle.remove();
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <div
          className={`relative flex items-center justify-center rounded-full bg-white transition-all duration-300 ease-out ${
            isHovering ? "h-6 w-6 opacity-80" : "h-3 w-3 opacity-100"
          }`}
        >
          {/* Subtle glow/blur for liquid feel */}
          <div className="absolute inset-0 rounded-full bg-white blur-[2px]" />
        </div>
      </motion.div>
    </>
  );
};
