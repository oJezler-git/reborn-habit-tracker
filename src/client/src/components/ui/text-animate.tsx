import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface TextAnimateProps {
  text: string;
  className?: string; // Container class
  segmentClassName?: string; // Class for each character
  delay?: number; // Base delay in ms
  stagger?: number; // Delay per letter in ms
  responsive?: boolean; // Whether to stack on mobile
  variant?: "default" | "soft";
  startVisible?: boolean; // Whether to start visible (skip intersection observer)
}

export function TextAnimate({
  text,
  className,
  segmentClassName,
  delay = 0,
  stagger = 35,
  variant = "default",
  startVisible = false,
}: TextAnimateProps) {
  const [isVisible, setIsVisible] = useState(startVisible);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (startVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [startVisible]);

  const animationClass = isVisible
    ? variant === "soft"
      ? "animate-character-reveal-soft"
      : "animate-character-reveal"
    : "opacity-0";

  let charCount = 0;

  return (
    <span ref={ref} className={cn("inline-block", className)}>
      {text.split(" ").map((word, i, arr) => {
        const wordEl = (
          <span key={i} className="inline-block whitespace-nowrap">
            {word.split("").map((char, j) => (
              <span
                key={j}
                className={cn("inline-block", animationClass, segmentClassName)}
                style={{
                  animationDelay: `${delay + (charCount + j) * stagger}ms`,
                }}
              >
                {char}
              </span>
            ))}
          </span>
        );

        // Update the global character count: word length
        const currentWordLength = word.length;
        const currentStartIndex = charCount;
        charCount += currentWordLength;

        // If not the last word, add a space and increment count
        let spaceEl = null;
        if (i < arr.length - 1) {
          spaceEl = (
            <span key={`space-${i}`} className="inline">
              {" "}
            </span>
          );
          charCount += 1;
        }

        return (
          <span key={`wrapper-${i}`}>
            {wordEl}
            {spaceEl}
          </span>
        );
      })}
    </span>
  );
}
