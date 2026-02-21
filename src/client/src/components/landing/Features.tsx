import { useEffect, useRef, useState, type ComponentType } from "react";
import { TextAnimate } from "@/components/ui/text-animate";
import { usePauseOffscreen } from "@/hooks/usePauseOffscreen";
import {
  Brain,
  Calendar,
  Zap,
  TrendingUp,
  Shield,
  Command,
} from "lucide-react";
import VanillaTilt from "vanilla-tilt";

/**
 * Interface for individual feature items.
 * Each feature includes a visual icon, a descriptive title,
 * detailed explanation, and a theme colour.
 */
interface FeatureCardProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
}

/**
 * FeatureCard: A 3D-interactive card for a system capability.
 *
 * Implements:
 * - 3D Tilt effect via VanillaTilt.
 * - Dynamic glare colourisation based on the feature's theme colour.
 * - CSS Variable injection for synchronised hover states.
 */
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  color,
}: FeatureCardProps) => {
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = tiltRef.current;
    if (element) {
      /**
       * Initialise the 3D tilt effect of the card.
       * 'glare' is enabled to create a glass-like reflection.
       * 'max-glare' prevents washing out the content.
       */
      VanillaTilt.init(element, {
        scale: 1.04,
        speed: 200, // Lower = snappier tilt response
        glare: true,
        "max-glare": 0.15,
        perspective: 900,
      });

      /**
       * Per-card Glare Colourisation:
       * By default, VanillaTilt uses a white glare.
       * Here we retrieve the inner glare element and apply a custom gradient
       * derived from the card's specific theme colour.
       */
      const glare = element.querySelector<HTMLElement>(".js-tilt-glare-inner");
      if (glare) {
        glare.style.backgroundImage = `linear-gradient(0deg, transparent 0%, ${color} 100%)`;
      }
    }
    // Cleanup tilt instance on unmount to prevent memory leaks and ghost event listeners
    return () => (element as any)?.vanillaTilt?.destroy();
  }, [color]);

  // Controls whether the colour theme is active. Starts neutral (white) and switches on hover.
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="h-full feature-float"
      style={{ "--theme-color": color } as React.CSSProperties}
    >
      <div
        ref={tiltRef}
        className="feature-card group relative h-full rounded-xl glass-liquid"
        data-tilt
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          transformStyle: "preserve-3d",
          // Border and shadow transition from neutral white to theme colour on hover
          boxShadow: isHovered
            ? `0 0 0 1px ${color}22, 0 8px 32px ${color}15`
            : "0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.36)",
          borderColor: isHovered ? `${color}33` : "rgba(255,255,255,0.08)",
          transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        }}
      >
        {/*
          Hover ambient glow overlay:
          A faint radial fill using the theme colour that fades in on hover.
          Starts fully transparent so the card looks clean/neutral at rest.
        */}
        <div
          className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-200"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(ellipse at 50% 0%, ${color}18 0%, transparent 70%)`,
          }}
        />

        <div
          className="relative z-10 flex flex-col h-full p-8"
          style={{ transform: "translateZ(20px)" }}
        >
          {/* Icon container: neutral white at rest, theme colour tint on hover */}
          <div
            className="w-14 h-14 rounded-lg flex items-center justify-center mb-6 transition-all duration-200"
            style={
              isHovered
                ? {
                    background: `${color}12`,
                    border: `1px solid ${color}40`,
                    boxShadow: `0 0 12px ${color}20`,
                  }
                : {
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "none",
                  }
            }
          >
            {/* Span inherits colour: white at rest, theme colour on hover */}
            <span
              style={{
                color: isHovered ? color : "rgba(255,255,255,0.85)",
                transition: "color 0.2s ease",
              }}
            >
              <Icon className="w-7 h-7" />
            </span>
          </div>

          <h3 className="text-xl font-display font-bold text-white mb-3">
            {title}
          </h3>

          <p className="text-zinc-300 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Features: The main section showcasing the algorithmic core of REBORN.
 *
 * Displays a grid of FeatureCards, each for a technical differentiator
 * like CSP solving, PCS forecasting, and the SM-2 adaptive algorithm.
 */
export function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  usePauseOffscreen(sectionRef);

  /**
   * Feature definitions.
   * These reflect the system's focus on technical optimisation (and privacy ig).
   * Icons are sourced from 'lucide-react'.
   */
  const features = [
    {
      icon: Calendar,
      title: "Constraint Solver",
      description:
        "We treat your schedule as a CSP (Constraint Satisfaction Problem). The engine finds the perfect slot for every habit, preventing conflicts before they happen.",
      color: "#00f3ff", // Cyan
    },
    {
      icon: Brain,
      title: "Predictive Modeling",
      description:
        "Using Logistic Regression (PCS), we forecast failure probability daily and trigger interventions when risk is high.",
      color: "#bc13fe", // Purple
    },
    {
      icon: Zap,
      title: "Adaptive Control",
      description:
        "Leveraging the SM-2 algorithm, habit difficulty scales dynamically. Struggling? We reduce the load. Crushing it? We ramp up.",
      color: "#10b981", // Emerald/Green
    },
    {
      icon: TrendingUp,
      title: "Habit Simulation",
      description:
        "Visualize your habit stability as an accretion disk. Maintain velocity to avoid falling into the event horizon of failure.",
      color: "#f43f5e", // Rose/Pink
    },
    {
      icon: Shield,
      title: "Privacy by Design",
      description:
        "Your behavioral data is sensitive. That's why REBORN runs locally. Your data never leaves your machine unless you explicitly sync it.",
      color: "#f59e0b", // Amber
    },
    {
      icon: Command,
      title: "Command Palette",
      description:
        "Efficiency at your fingertips. Manage your schedule, run solvers, and track habits without ever leaving your keyboard.",
      color: "#3b82f6", // Blue
    },
  ];

  return (
    <section
      id="features"
      ref={sectionRef}
      className="container space-y-12 py-8 md:py-12 lg:py-24"
    >
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-8">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          <TextAnimate text="Algorithmically Driven." />
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          <TextAnimate
            text="REBORN isn't just a tracker. It's an intelligent agent that optimises your behavior using control theory and predictive modeling."
            variant="soft"
            delay={500}
            stagger={5}
          />
        </p>
      </div>

      {/* 
          Feature Grid:
          Responsive layout scaling from 1 to 3 columns.
          Constrainted to 80rem (1280px) for readability.
      */}
      <div className="mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:max-w-[80rem]">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </section>
  );
}
