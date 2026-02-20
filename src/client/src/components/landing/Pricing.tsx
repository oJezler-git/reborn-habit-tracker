import { useRef, useEffect, useState } from "react";
import { TextAnimate } from "@/components/ui/text-animate";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import VanillaTilt from "vanilla-tilt";

type BillingCycle = "monthly" | "yearly" | "lifetime";

/**
 * PricingTier: Defines the commercial and technical structure of a subscription plan.
 *
 * Includes pricing for different billing cycles, feature availability,
 * and visual styling properties used to differentiate the tiers.
 */
interface PricingTier {
  name: string;
  price: {
    monthly: string;
    yearly: string;
    lifetime: string;
  };
  description: string;
  features: string[];
  notIncluded?: string[];
  color: string;
  recommended?: boolean;
}

const CYCLES: BillingCycle[] = ["monthly", "yearly", "lifetime"];

/**
 * PricingCard: An interactive display unit for a subscription tier.
 *
 * Implements:
 * - 3D tilt with glare effects.
 * - Directional billing cycle price roll (slot-machine style).
 * - Visual "Recommended" status with ambient glow and borders.
 */
const PricingCard = ({
  tier,
  billingCycle,
  direction,
}: {
  tier: PricingTier;
  billingCycle: BillingCycle;
  direction: number; // +1 = advancing (monthly→yearly→lifetime), -1 = reversing
}) => {
  const tiltRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const element = tiltRef.current;
    if (element) {
      /**
       * Initialises the 3D effect.
       * We use a slower speed (800ms) to provide a more premium, "heavy"
       * feel to the pricing units.
       */
      VanillaTilt.init(element, {
        scale: 1.01,
        speed: 800,
        glare: true,
        "max-glare": 0.05,
        perspective: 1200,
      });

      // Injects the tier's theme colour into the reflection for an ambient shine.
      const glare = element.querySelector<HTMLElement>(".js-tilt-glare-inner");
      if (glare) {
        glare.style.backgroundImage = `linear-gradient(0deg, transparent 0%, ${tier.color}30 100%)`;
      }
    }
    return () => (element as any)?.vanillaTilt?.destroy();
  }, [tier.color]);

  return (
    <div
      className="h-full relative group"
      style={{ "--theme-color": tier.color } as React.CSSProperties}
    >
      {/* 
          High-Visibility Anchor (Recommended only): 
          Improves visual hierarchy by projecting a soft radial glow 
          derived from the tier's theme colour.
      */}
      {tier.recommended && (
        <div className="absolute inset-0 bg-[var(--theme-color)]/10 blur-[100px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
      )}

      <div
        ref={tiltRef}
        className="relative h-full flex flex-col justify-between rounded-3xl p-8 z-10 backdrop-blur-xl overflow-hidden"
        data-tilt
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          transformStyle: "preserve-3d",
          background: "rgba(9, 9, 11, 0.4)", // A very deep, premium glass look
          boxShadow:
            isHovered || tier.recommended
              ? `0 0 0 1px ${tier.color}40, 0 8px 40px ${tier.color}15`
              : "0 0 0 1px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.4)",
          transition: "box-shadow 0.4s ease",
        }}
      >
        {/*
          Hover ambient glow overlay:
          A faint radial fill using the theme colour that fades in on hover.
          Starts fully transparent so the card looks clean/neutral at rest.
        */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(circle at 50% 0%, ${tier.color}15 0%, transparent 70%)`,
          }}
        />

        <div
          className="relative z-10 flex flex-col"
          style={{ transform: "translateZ(20px)" }}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3
                className="text-sm font-bold font-mono tracking-widest uppercase mb-2"
                style={{
                  color: isHovered || tier.recommended ? tier.color : "#a1a1aa",
                  transition: "color 0.4s ease",
                }}
              >
                {tier.name}
              </h3>
              {/*
                Smooth Layout Interpolation:
                To prevent vertical jumping during crossfades, the price container uses
                a fixed minimum height. The width tweens organically when the characters change.
              */}
              <div className="h-[60px] relative w-full flex items-end mb-3">
                <motion.div
                  layout
                  className="flex items-baseline gap-[0.35rem] leading-none overflow-visible absolute left-0 bottom-0"
                >
                  <AnimatePresence
                    mode="wait"
                    initial={false}
                    custom={direction}
                  >
                    <motion.span
                      layout
                      key={tier.name === "Free" ? "free-price" : billingCycle}
                      custom={direction}
                      className="text-5xl font-bold text-white tracking-tight leading-none inline-block origin-left"
                      variants={{
                        enter: (dir: number) => ({
                          y: dir > 0 ? 40 : -40,
                          opacity: 0,
                          filter: "blur(4px)",
                        }),
                        center: {
                          y: 0,
                          opacity: 1,
                          filter: "blur(0px)",
                        },
                        exit: (dir: number) => ({
                          y: dir > 0 ? -40 : 40,
                          opacity: 0,
                          filter: "blur(4px)",
                        }),
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        opacity: { duration: 0.2, ease: "linear" },
                        filter: { duration: 0.2, ease: "linear" },
                        layout: { type: "spring", bounce: 0, duration: 0.4 },
                      }}
                    >
                      {tier.price[billingCycle]}
                    </motion.span>
                  </AnimatePresence>

                  <AnimatePresence
                    mode="wait"
                    initial={false}
                    custom={direction}
                  >
                    {tier.name !== "Free" && billingCycle !== "lifetime" ? (
                      <motion.span
                        layout
                        key="per-month"
                        custom={direction}
                        className="text-zinc-500 font-medium text-sm whitespace-nowrap mb-1 inline-block origin-left"
                        variants={{
                          enter: (dir: number) => ({
                            y: dir > 0 ? 20 : -20,
                            opacity: 0,
                          }),
                          center: { y: 0, opacity: 1 },
                          exit: (dir: number) => ({
                            y: dir > 0 ? -20 : 20,
                            opacity: 0,
                          }),
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                          opacity: { duration: 0.15, ease: "linear" },
                          layout: { type: "spring", bounce: 0, duration: 0.4 },
                        }}
                      >
                        /mo
                      </motion.span>
                    ) : billingCycle === "lifetime" && tier.name !== "Free" ? (
                      <motion.span
                        layout
                        key="one-time"
                        custom={direction}
                        className="text-zinc-500 font-medium text-sm whitespace-nowrap mb-1 inline-block origin-left"
                        variants={{
                          enter: (dir: number) => ({
                            y: dir > 0 ? 20 : -20,
                            opacity: 0,
                          }),
                          center: { y: 0, opacity: 1 },
                          exit: (dir: number) => ({
                            y: dir > 0 ? -20 : 20,
                            opacity: 0,
                          }),
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                          opacity: { duration: 0.15, ease: "linear" },
                          layout: { type: "spring", bounce: 0, duration: 0.4 },
                        }}
                      >
                        /life
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Subtext Row */}
              <div className="min-h-[1.5rem] relative flex items-start">
                <AnimatePresence
                  mode="popLayout"
                  initial={false}
                  custom={direction}
                >
                  <motion.span
                    layout
                    key={tier.name === "Free" ? "free-subtext" : billingCycle}
                    custom={direction}
                    className="text-xs font-mono tracking-wide whitespace-nowrap inline-block"
                    style={{
                      color:
                        billingCycle === "yearly" && tier.name !== "Free"
                          ? tier.color
                          : "rgba(161, 161, 170, 0.6)",
                    }}
                    variants={{
                      enter: (dir: number) => ({
                        opacity: 0,
                        y: dir > 0 ? 15 : -15,
                        scale: 0.95,
                      }),
                      center: { opacity: 1, y: 0, scale: 1 },
                      exit: (dir: number) => ({
                        opacity: 0,
                        y: dir > 0 ? -15 : 15,
                        scale: 0.95,
                      }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      scale: { type: "spring", bounce: 0, duration: 0.4 },
                      opacity: { duration: 0.25, ease: "linear" },
                      layout: { type: "spring", bounce: 0, duration: 0.5 },
                    }}
                  >
                    {tier.name === "Free"
                      ? "always free"
                      : billingCycle === "monthly"
                        ? "billed monthly"
                        : billingCycle === "yearly"
                          ? "BILLED YEARLY"
                          : "one-time payment"}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
            {tier.recommended && (
              <Badge
                variant="secondary"
                className="bg-[var(--theme-color)]/10 text-[var(--theme-color)] border border-[var(--theme-color)]/30 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-md transition-all duration-500 origin-right"
                style={{
                  transform: isHovered ? "scale(1.05)" : "scale(1)",
                  boxShadow: isHovered
                    ? `0 0 25px ${tier.color}40`
                    : `0 0 15px ${tier.color}15`,
                }}
              >
                Popular
              </Badge>
            )}
          </div>

          <p className="text-zinc-400 text-sm leading-relaxed mb-8 h-10 font-medium">
            {tier.description}
          </p>

          <div className="space-y-4 mb-8">
            {tier.features.map((feature, i) => (
              <div
                key={i}
                className="flex items-start gap-3 text-sm text-zinc-300 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]"
                style={{
                  transform: isHovered ? "translateX(4px)" : "translateX(0)",
                  /*
                   * Reverse stagger on exit:
                   * On hover-in, features cascade from top (i=0 first).
                   * On hover-out, they cascade from bottom (last item first),
                   * giving a choreographed unwinding rather than an abrupt snap-back.
                   */
                  transitionDelay: isHovered
                    ? `${i * 30}ms`
                    : `${(tier.features.length - 1 - i) * 18}ms`,
                }}
              >
                <div
                  className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]"
                  style={{
                    background: isHovered
                      ? `${tier.color}20`
                      : `${tier.color}10`,
                    borderColor: isHovered
                      ? `${tier.color}50`
                      : `${tier.color}20`,
                    boxShadow: isHovered ? `0 0 10px ${tier.color}25` : "none",
                    transform: isHovered ? "scale(1.05)" : "scale(1)",
                    transitionDelay: isHovered ? `${i * 30}ms` : "0ms",
                  }}
                >
                  <Check
                    className="w-3 h-3 transition-transform duration-500"
                    style={{
                      color: tier.color,
                      transform: isHovered ? "scale(1.1)" : "scale(1)",
                      transitionDelay: isHovered ? `${i * 30}ms` : "0ms",
                    }}
                  />
                </div>
                <span
                  className="font-medium transition-colors duration-500"
                  style={{
                    color: isHovered ? "white" : "rgba(255, 255, 255, 0.7)",
                    transitionDelay: isHovered ? `${i * 30}ms` : "0ms",
                  }}
                >
                  {feature}
                </span>
              </div>
            ))}
            {tier.notIncluded?.map((feature, i) => (
              <div
                key={i}
                className="flex items-start gap-3 text-sm text-zinc-600 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]"
                style={{
                  transform: isHovered ? "translateX(3px)" : "translateX(0)",
                  transitionDelay: isHovered
                    ? `${(tier.features.length + i) * 30}ms`
                    : "0ms",
                }}
              >
                <div
                  className="mt-0.5 w-5 h-5 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0 transition-transform duration-500"
                  style={{
                    transform: isHovered ? "scale(1.05)" : "scale(1)",
                    transitionDelay: isHovered
                      ? `${(tier.features.length + i) * 30}ms`
                      : "0ms",
                  }}
                >
                  <X className="w-3 h-3 text-zinc-600" />
                </div>
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{ transform: "translateZ(30px)" }} // Ensures CTA is prominent in Z-space
          className="relative z-10 mt-auto"
        >
          {/*
            Plain <button> is used here instead of the shadcn Button component.
            The shadcn Button hardcodes inline-flex + whitespace-nowrap + gap-2
            on the root element, which conflicts with any internal span structure
            we add for animations. A plain button gives us full DOM control.
          */}
          <button
            className="w-full h-12 rounded-xl text-sm font-bold tracking-wide relative overflow-hidden group/btn transition-all duration-300 active:scale-[0.98]"
            style={{
              background:
                tier.recommended || isHovered
                  ? tier.color
                  : "rgba(255,255,255,0.05)",
              color: tier.recommended || isHovered ? "black" : "white",
              border:
                tier.recommended || isHovered
                  ? "none"
                  : "1px solid rgba(255,255,255,0.08)",
              boxShadow:
                tier.recommended || isHovered
                  ? `0 0 25px -5px ${tier.color}70, inset 0 -3px 0 rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.35)`
                  : "none",
            }}
          >
            {/*
              Background sweep layer:
              Scales from 0 to full width on hover, creating a clean fill reveal
              applied entirely to the background — no text layout disruption whatsoever.
            */}
            {!(tier.recommended || isHovered) && (
              <span
                className="absolute inset-0 origin-left scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] pointer-events-none rounded-xl"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />
            )}
            <span className="relative z-10">Get Started</span>
          </button>
        </div>
      </div>
    </div>
  );
};

type Currency =
  | "USD"
  | "EUR"
  | "GBP"
  | "AUD"
  | "CAD"
  | "JPY"
  | "BRL"
  | "INR"
  | "CHF"
  | "CNY"
  | "MXN"
  | "TRY";

const REGIONAL_PRICING: Record<
  Currency,
  {
    symbol: string;
    rates: {
      Pro: { monthly: number; yearly: number; lifetime: number };
      Ultra: { monthly: number; yearly: number; lifetime: number };
    };
  }
> = {
  USD: {
    symbol: "$",
    rates: {
      Pro: { monthly: 9, yearly: 7, lifetime: 199 },
      Ultra: { monthly: 19, yearly: 15, lifetime: 399 },
    },
  },
  EUR: {
    symbol: "€",
    rates: {
      Pro: { monthly: 9, yearly: 7, lifetime: 199 },
      Ultra: { monthly: 19, yearly: 15, lifetime: 399 },
    },
  },
  GBP: {
    symbol: "£",
    rates: {
      Pro: { monthly: 8, yearly: 6, lifetime: 179 },
      Ultra: { monthly: 16, yearly: 12, lifetime: 349 },
    },
  },
  AUD: {
    symbol: "A$",
    rates: {
      Pro: { monthly: 14, yearly: 11, lifetime: 299 },
      Ultra: { monthly: 29, yearly: 22, lifetime: 599 },
    },
  },
  CAD: {
    symbol: "C$",
    rates: {
      Pro: { monthly: 12, yearly: 9, lifetime: 249 },
      Ultra: { monthly: 24, yearly: 19, lifetime: 499 },
    },
  },
  JPY: {
    symbol: "¥",
    rates: {
      Pro: { monthly: 1200, yearly: 900, lifetime: 25000 },
      Ultra: { monthly: 2500, yearly: 2000, lifetime: 50000 },
    },
  },
  BRL: {
    symbol: "R$",
    rates: {
      Pro: { monthly: 45, yearly: 35, lifetime: 999 },
      Ultra: { monthly: 95, yearly: 75, lifetime: 1999 },
    },
  },
  INR: {
    symbol: "₹",
    rates: {
      Pro: { monthly: 699, yearly: 499, lifetime: 14999 },
      Ultra: { monthly: 1499, yearly: 1199, lifetime: 29999 },
    },
  },
  CHF: {
    symbol: "CHF",
    rates: {
      Pro: { monthly: 9, yearly: 7, lifetime: 199 },
      Ultra: { monthly: 19, yearly: 15, lifetime: 399 },
    },
  },
  CNY: {
    symbol: "¥",
    rates: {
      Pro: { monthly: 59, yearly: 49, lifetime: 1299 },
      Ultra: { monthly: 129, yearly: 99, lifetime: 2599 },
    },
  },
  MXN: {
    symbol: "$",
    rates: {
      Pro: { monthly: 169, yearly: 129, lifetime: 3499 },
      Ultra: { monthly: 349, yearly: 279, lifetime: 6999 },
    },
  },
  TRY: {
    symbol: "₺",
    rates: {
      Pro: { monthly: 299, yearly: 229, lifetime: 5999 },
      Ultra: { monthly: 599, yearly: 449, lifetime: 11999 },
    },
  },
};

/**
 * Heuristic fallback for currency detection using browser native APIs.
 *
 * Ensures a functional "Local-First" pricing display entirely offline,
 * preventing any rate-limiting or privacy shield blocking issues.
 */
const guessCurrencyLocally = (): Currency => {
  try {
    // Check timezone first as it's highly indicative of physical location
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === "Europe/London") return "GBP";
    if (tz.startsWith("Europe/")) return "EUR";
    if (tz.startsWith("Australia/")) return "AUD";
    if (tz.startsWith("Asia/Tokyo")) return "JPY";
    if (tz.startsWith("Asia/Kolkata")) return "INR";
    if (tz.startsWith("Asia/Shanghai") || tz.startsWith("Asia/Hong_Kong"))
      return "CNY";
    if (tz.startsWith("America/Sao_Paulo")) return "BRL";
    if (tz.startsWith("America/Mexico_City")) return "MXN";
    if (tz.startsWith("America/Toronto") || tz.startsWith("America/Vancouver"))
      return "CAD";
    if (tz.startsWith("Europe/Zurich")) return "CHF";
    if (tz.startsWith("Europe/Istanbul")) return "TRY";

    // Fallback to locale if timezone doesn't give a clear match
    const locale = navigator.language || (navigator as any).userLanguage;
    if (locale) {
      if (locale === "en-GB") return "GBP";
      if (locale === "en-AU") return "AUD";
      if (locale === "en-CA" || locale === "fr-CA") return "CAD";
      if (locale === "ja-JP") return "JPY";
      if (locale === "hi-IN" || locale === "en-IN") return "INR";
      if (locale === "pt-BR") return "BRL";
      if (locale === "zh-CN") return "CNY";
      if (locale === "es-MX") return "MXN";
      if (locale === "tr-TR") return "TRY";
      if (
        locale === "en-IE" ||
        locale.startsWith("de") ||
        locale.startsWith("fr") ||
        locale.startsWith("es") ||
        locale.startsWith("it")
      ) {
        return "EUR";
      }
    }
  } catch (error) {
    // Silently handle format exceptions to ensure stability
  }
  return "USD";
};

/**
 * Determines the optimal display currency purely using local browser signals.
 *
 * Avoids external IP services to eliminate API rate limits, latency,
 * and friction during checkout, while respecting the user's data sovereignty.
 */
const useRegionalPricing = () => {
  const [currency, setCurrency] = useState<Currency>("USD");

  useEffect(() => {
    // Execute local-first heuristic on mount
    setCurrency(guessCurrencyLocally());
  }, []);

  return currency;
};

/**
 * Pricing: The main commercial overview section.
 *
 * Features a toggle for billing cycles and a responsive 3-tier grid
 * that scales the value proposition from "Manual Tracking" to "Total Adaptive Control".
 */
export function Pricing() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  /*
   * Direction tracking for the slot-machine price roll:
   * +1 = user is advancing (monthly → yearly → lifetime), price exits upward.
   * -1 = user is reversing (lifetime → yearly → monthly), price exits downward.
   */
  const [direction, setDirection] = useState<number>(1);
  const currency = useRegionalPricing();
  const pricing = REGIONAL_PRICING[currency];

  const handleCycleChange = (cycle: BillingCycle) => {
    const prev = CYCLES.indexOf(billingCycle);
    const next = CYCLES.indexOf(cycle);
    setDirection(next > prev ? 1 : -1);
    setBillingCycle(cycle);
  };

  /**
   * Plan Definitions.
   * We use a "Good/Better/Best" architecture.
   * 'Pro' is marked as recommended to guide users toward the AI features.
   */
  const tiers: PricingTier[] = [
    {
      name: "Free",
      price: {
        monthly: `${pricing.symbol}0`,
        yearly: `${pricing.symbol}0`,
        lifetime: `${pricing.symbol}0`,
      },
      description: "Perfect for getting started with habit tracking.",
      color: "#00f3ff", // Cyan
      features: [
        "Track up to 5 habits",
        "Basic stats and history",
        "Manual completion logging",
        "Mobile-responsive dashboard",
      ],
      notIncluded: [
        "AI Constraint Solver",
        "Predictive Modelling",
        "Habit Simulation",
        "Unlimited History",
      ],
    },
    {
      name: "Pro",
      price: {
        monthly: `${pricing.symbol}${pricing.rates.Pro.monthly}`,
        yearly: `${pricing.symbol}${pricing.rates.Pro.yearly}`,
        lifetime: `${pricing.symbol}${pricing.rates.Pro.lifetime}`,
      },
      description: "Unlock the power of AI to optimise your routine.",
      color: "#bc13fe", // Purple
      recommended: true,
      features: [
        "Unlimited habits",
        "AI Constraint Solver",
        "Predictive Modelling",
        "Smart Notifications",
        "Advanced Analytics",
        "Data Export",
      ],
    },
    {
      name: "Ultra",
      price: {
        monthly: `${pricing.symbol}${pricing.rates.Ultra.monthly}`,
        yearly: `${pricing.symbol}${pricing.rates.Ultra.yearly}`,
        lifetime: `${pricing.symbol}${pricing.rates.Ultra.lifetime}`,
      },
      description: "For peak performers who need absolute control.",
      color: "#f59e0b", // Amber
      features: [
        "Everything in Pro",
        "Priority AI Processing",
        "Habit Simulation (Beta)",
        "API Access",
        "1-on-1 Onboarding",
        "Lifetime History Retention",
      ],
    },
  ];

  return (
    <section id="pricing" className="container py-24 sm:py-32 relative z-10">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl text-white">
          <TextAnimate text="Simple Pricing." />
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          <TextAnimate
            text="Start for free, upgrade when you're ready to get serious about your potential."
            variant="soft"
            delay={500}
          />
        </p>

        {/* 
            Billing Cycle Toggle: 
            Uses a shared layout ID for smooth pill-style transitions between options.
            Styled with an inner shadow and glassmorphism to look like a premium segmented control.
        */}
        <div
          className="flex items-center justify-center mt-8 p-1.5 rounded-full backdrop-blur-md transition-all duration-300"
          style={{
            background: "rgba(9, 9, 11, 0.5)",
            boxShadow:
              "inset 0 2px 10px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
          }}
        >
          {(["monthly", "yearly", "lifetime"] as BillingCycle[]).map(
            (cycle) => (
              <button
                key={cycle}
                onClick={() => handleCycleChange(cycle)}
                className={`relative px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 ${
                  billingCycle === cycle
                    ? "text-white"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                }`}
              >
                {billingCycle === cycle && (
                  <motion.div
                    layoutId="billing-tab"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      boxShadow:
                        "0 2px 10px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative capitalize z-10">{cycle}</span>
              </button>
            ),
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        {tiers.map((tier, index) => (
          <PricingCard
            key={index}
            tier={tier}
            billingCycle={billingCycle}
            direction={direction}
          />
        ))}
      </div>
    </section>
  );
}
