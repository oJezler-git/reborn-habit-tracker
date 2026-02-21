import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TextAnimate } from "@/components/ui/text-animate";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Core FAQ data for key product features and philosophy.
 * These entries include key features (Constraint Solver, PCS, SM-2)
 * and address common user concerns like privacy and vendor lock-in.
 */
const faqs: FAQItem[] = [
  {
    question: "How does the Constraint Solver work?",
    answer:
      "Our constraint solver treats your schedule like a mathematical problem. It analyses your habits, available time slots, then searches for a plan for your day that fits your goals and avoids clashes before they happen.",
  },
  {
    question: "Is my data private?",
    answer:
      "Yes. REBORN follows a 'Local-First' design. Your behavioural data and habits stay encrypted on your own machine. We never see any of it unless you clearly choose to sync for backup.",
  },
  {
    question: "What is Predictive Modeling?",
    answer:
      "We use a logistic regression model (PCS) that learns from your completion history. It estimates the chance that you will miss a habit on a given day. If that risk looks high, the system suggests specific interventions to help keep you on track.",
  },
  {
    question: "Can I export my data?",
    answer:
      "Yes. Your data is yours. You can export your history and logs, along with your configurations, to JSON or CSV whenever you like for your own analysis or backup.",
  },
  {
    question: "What if I miss a habit?",
    answer:
      "Missing a habit is normal. Our Adaptive Control system (based on SM-2 algorithms) notices when you are struggling and adjusts the difficulty or frequency of your habits so you can regain momentum without burning out.",
  },
];

/**
 * FAQAccordion: A collapsible component for individual FAQ items.
 *
 * Uses Framer Motion's AnimatePresence for smooth entry/exit of the answer text.
 *
 * @param item - The FAQ item containing question and answer strings.
 * @param isOpen - Boolean state determining if the answer is visible.
 * @param toggle - Handler to update the parent's focused index.
 */
const FAQAccordion = ({
  item,
  isOpen,
  toggle,
  index,
}: {
  item: FAQItem;
  isOpen: boolean;
  toggle: () => void;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      className="border-b border-white/5 last:border-0"
    >
      {/* Toggle button for the accordion: Applies hover effects and handles the click event */}
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between py-6 text-left transition-all hover:text-white group"
      >
        <span
          className={`text-lg font-medium transition-colors duration-300 ${
            isOpen
              ? "text-[var(--primary)]"
              : "text-zinc-400 group-hover:text-zinc-200"
          }`}
        >
          {item.question}
        </span>
        {/* Animated icon container: Rotates 180deg and changes color when active */}
        <div
          className={`relative ml-4 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
            isOpen
              ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] rotate-180"
              : "border-white/10 bg-white/5 text-zinc-400 group-hover:border-white/20 group-hover:bg-white/10"
          }`}
        >
          {isOpen ? (
            <Minus className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: {
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                },
                opacity: { duration: 0.2 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.3, ease: "easeInOut" },
                opacity: { duration: 0.2 },
              },
            }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              className="pb-6 text-zinc-400 leading-relaxed max-w-[90%] text-[15px]"
            >
              {item.answer}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * FAQ: The main landing page section for frequently asked questions.
 *
 * Features:
 * - Interactive spotlight effect that follows the user's mouse.
 * - Staggered text animations for section headers.
 * - Single-select accordion logic (only one item open at a time).
 */
export function FAQ() {
  // Track which FAQ item is expanded. Null means all are closed.
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  /** Reference for the spotlight container — also the injection target for CSS custom properties. */
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Updates the spotlight position via CSS custom properties instead of React state.
   *
   * Setting `--mx` / `--my` directly on the container element means every
   * mousemove frame updates the DOM through `style.setProperty` — bypassing
   * React's reconciliation entirely. The radial gradients consume the values
   * via `var(--mx)` / `var(--my)`.
   */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    }
  }, []);

  return (
    <section id="faq" className="container py-24 sm:py-32 relative z-10">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-16">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl text-white">
          <TextAnimate text="Frequently Asked Questions." />
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          <TextAnimate
            text="Everything you need to know about how REBORN optimises your life."
            variant="soft"
            delay={500}
          />
        </p>
      </div>

      <motion.div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        whileHover={{ scale: 1.01 }}
        className="group relative mx-auto max-w-3xl rounded-3xl border border-white/5 bg-zinc-950/50 backdrop-blur-xl overflow-hidden shadow-2xl transition-all duration-500"
      >
        {/* 
          Spotlight Effect: 
          Subtle inner highlight that follows the mouse position.
        */}
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at var(--mx, 0px) var(--my, 0px), rgba(255,255,255,0.06), transparent 40%)`,
          }}
        />

        {/* 
          Animated Border Glow: 
          Uses a high-contrast radial gradient masked to the 1px border area.
          'inset-0' so it's not clipped by the container's overflow-hidden.
        */}
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition duration-500 group-hover:opacity-100"
          style={{
            padding: "1px",
            background: `radial-gradient(400px circle at var(--mx, 0px) var(--my, 0px), rgba(255,255,255,0.4), transparent 40%)`,
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />

        <div className="relative p-8 sm:p-12 z-10">
          <div className="flex flex-col">
            {faqs.map((faq, index) => (
              <FAQAccordion
                key={index}
                index={index}
                item={faq}
                isOpen={openIndex === index}
                toggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
