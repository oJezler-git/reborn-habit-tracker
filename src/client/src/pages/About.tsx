import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Terminal,
  Cpu,
  Shield,
  Activity,
  User,
  Github,
  Twitter,
} from "lucide-react";
import { TextAnimate } from "@/components/ui/text-animate";
import { useEffect, useState, useRef, type ReactNode } from "react";
import {
  useInView,
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { usePauseOffscreen } from "@/hooks/usePauseOffscreen";
import {
  APP_VERSION,
  APP_VERSION_LABEL,
  AUTHOR_NAME,
  AUTHOR_HANDLE,
  AUTHOR_ROLE,
  REPO_SSH,
} from "@/lib/constants";

const TV_SCREEN_VARIANTS = {
  open: {
    scaleY: 1,
    scaleX: 1,
    opacity: 1,
    filter: "brightness(1)",
    transition: { type: "spring" as const, stiffness: 200, damping: 20 },
  },
  closed: {
    scaleY: 0.005,
    scaleX: 0,
    opacity: 0,
    filter: "brightness(50)",
    transition: {
      duration: 0.4,
      times: [0, 0.6, 1],
      scaleY: { duration: 0.2 },
      scaleX: { delay: 0.2, duration: 0.2 },
    },
  },
};

/**
 * Magnetic: A spring-physics wrapper that pulls its children toward the cursor.
 *
 * Performance: Uses Framer Motion `useMotionValue` + `useSpring` so that
 * per-frame `mousemove` deltas update the DOM directly through the `style`
 * prop — bypassing React's render cycle entirely.
 *
 * The bounding rect is cached once on `mouseenter` (not recalculated every
 * frame) since the element doesn't move during the interaction.
 */
const Magnetic = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  /** Spring-damped outputs for the organic "pull" feel. */
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  /** Cache bounding rect once on entry to avoid per-frame layout recalculation. */
  const handleMouseEnter = () => {
    rectRef.current = ref.current!.getBoundingClientRect();
  };

  const handleMouse = (e: React.MouseEvent) => {
    const rect = rectRef.current!;
    x.set((e.clientX - rect.left - rect.width / 2) * 0.2);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.2);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
};

const SystemSpec = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: any;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center justify-between border-b border-primary/10 py-3 font-mono text-sm last:border-0 hover:bg-primary/5 px-2 transition-colors cursor-crosshair"
    >
      <div className="flex items-center text-muted-foreground">
        <Icon className="mr-3 h-4 w-4 text-primary" />
        <span>{label}</span>
      </div>
      <span className="text-primary font-bold tracking-wider">
        <ScrambleText text={value} trigger={isHovered} />
      </span>
    </motion.div>
  );
};

const Loader = () => {
  const [frame, setFrame] = useState(0);
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((prev) => (prev + 1) % frames.length);
    }, 80);
    return () => clearInterval(timer);
  }, []);
  return (
    <span className="text-primary mr-2 inline-block">{frames[frame]}</span>
  );
};

const Typewriter = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayText("");
    const interval = setInterval(() => {
      i++;
      setDisplayText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}</span>;
};

const ScrambleText = ({
  text,
  trigger,
}: {
  text: string;
  trigger: boolean;
}) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_!@#$%^&*()";

  useEffect(() => {
    if (!trigger) {
      setDisplayText(text);
      return;
    }

    let iterations = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((_, index) => {
            if (index < iterations) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join(""),
      );

      if (iterations >= text.length) {
        clearInterval(interval);
      }

      iterations += 1 / 2; // Speed of decoding
    }, 30);

    return () => clearInterval(interval);
  }, [trigger, text]);

  return <span>{displayText}</span>;
};

// Terminal Window Component
const TerminalWindow = () => {
  const [lines, setLines] = useState<
    {
      text: ReactNode;
      type: "command" | "output" | "warning" | "success";
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isRebooting, setIsRebooting] = useState(false);
  const [restartKey, setRestartKey] = useState(0); // Used to force re-run
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  usePauseOffscreen(containerRef);

  useEffect(() => {
    if (scrollRef.current && !isMinimized) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [lines, isLoading, isMinimized]);

  useEffect(() => {
    if (!isInView || isRebooting) return;

    const getTime = () => {
      return new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    };

    const bootSequence = [
      {
        text: `git clone ${REPO_SSH}`,
        type: "command",
        delay: 500,
      },
      { text: "whoami", type: "command", delay: 1500 },
      { text: `root (${AUTHOR_HANDLE})`, type: "output", delay: 300 },
      { text: "cd reborn", type: "command", delay: 200 },
      { text: "npm install", type: "command", delay: 500 },
      { cmd: "loader", delay: 2000 },
      {
        text: "up to date, audited 376 packages in 1s",
        type: "success",
        delay: 100,
      },
      { text: "73 packages are looking for funding", type: "output", delay: 0 },
      { text: "  run `npm fund` for details", type: "output", delay: 0 },
      {
        text: "3 vulnerabilities (1 moderate, 2 high)",
        type: "warning",
        delay: 200,
      },
      { text: "To address all issues, run:", type: "output", delay: 0 },
      { text: "  npm audit fix", type: "output", delay: 500 },
      { text: "npm audit fix", type: "command", delay: 300 },
      { cmd: "loader", delay: 1500 },
      {
        text: "changed 3 packages, and audited 376 packages in 3s",
        type: "success",
        delay: 100,
      },
      { text: "found 0 vulnerabilities", type: "success", delay: 100 },
      { text: "npm run dev", type: "command", delay: 500 },
      { text: `client@${APP_VERSION} dev`, type: "output", delay: 500 },
      { text: "vite", type: "output", delay: 100 },
      {
        text: "Port 5173 is in use, trying another one...",
        type: "warning",
        delay: 400,
      },
      { text: "VITE v7.3.0  ready in 370 ms", type: "success", delay: 200 },
      { text: "➜  Local:   http://localhost:5174/", type: "success", delay: 0 },
      { text: "➜  Network: use --host to expose", type: "output", delay: 0 },
      {
        text: (t: string) => (
          <>
            <span className="text-zinc-400">{t}</span>{" "}
            <span className="text-cyan-400 font-bold">[vite]</span>{" "}
            <span className="text-zinc-500">(client)</span>{" "}
            <span className="text-green-400 font-bold">hmr update</span>{" "}
            <span className="text-zinc-300">
              /src/index.css, /src/pages/About.tsx
            </span>{" "}
          </>
        ),
        type: "output",
        delay: 2000,
      },
      {
        text: (t: string) => (
          <>
            <span className="text-zinc-400">{t}</span>{" "}
            <span className="text-cyan-400 font-bold">[vite]</span>{" "}
            <span className="text-zinc-500">(client)</span>{" "}
            <span className="text-green-400 font-bold">hmr update</span>{" "}
            <span className="text-zinc-300">
              /src/index.css, /src/pages/About.tsx
            </span>{" "}
            <span className="text-yellow-400">(x2)</span>
          </>
        ),
        type: "output",
        delay: 3000,
      },
    ];

    setLines([]);
    setIsLoading(false);

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let cumulativeDelay = 0;

    bootSequence.forEach((step: any) => {
      cumulativeDelay += step.delay || 0;

      if (step.cmd === "loader") {
        const startTimeout = setTimeout(
          () => setIsLoading(true),
          cumulativeDelay,
        );
        timeouts.push(startTimeout);

        const stopTimeout = setTimeout(
          () => setIsLoading(false),
          cumulativeDelay + step.delay,
        );
        timeouts.push(stopTimeout);

        cumulativeDelay += step.delay;
      } else {
        const timeout = setTimeout(() => {
          setLines((prev) => [
            ...prev,
            {
              ...step,
              text:
                typeof step.text === "function"
                  ? step.text(getTime())
                  : step.text,
            },
          ]);
        }, cumulativeDelay);
        timeouts.push(timeout);
      }

      if (!step.cmd) {
        cumulativeDelay += Math.random() * 50 + 20;
      }
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [isInView, restartKey, isRebooting]);

  const handleReboot = () => {
    setIsRebooting(true);
    setLines([]);
    // Simulate BIOS boot
    setTimeout(() => {
      setIsRebooting(false);
      setRestartKey((prev) => prev + 1);
    }, 2500);
  };

  const handleClose = () => {
    setIsClosed(true);
  };

  const handleRestore = () => {
    setIsClosed(false);
    setRestartKey((prev) => prev + 1);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div ref={containerRef} className="relative w-full h-96">
      {/* EASTER EGG LAYER - Revealed when minimized or closed */}
      <div className="absolute inset-0 rounded-xl border border-white/5 bg-black/20 flex flex-col items-center justify-center z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50" />
        <div className="grid grid-cols-8 gap-1 opacity-10 rotate-12 scale-150">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 border border-primary/40 rounded-sm"
            />
          ))}
        </div>
        <div className="absolute z-10 text-center space-y-2">
          <Terminal className="w-12 h-12 text-primary/20 mx-auto animate-pulse" />
          <div className="font-mono text-xs text-primary/30 tracking-[0.2em] animate-pulse">
            SYSTEM DORMANT
          </div>
          <div className="font-mono text-[10px] text-primary/20">
            BACKGROUND PROCESSES ACTIVE
          </div>
        </div>
      </div>

      {/* TERMINAL CONTAINER */}
      <AnimatePresence mode="wait">
        {!isClosed ? (
          <motion.div
            key="terminal"
            initial="open"
            animate={isMinimized ? { height: 48 } : "open"}
            exit="closed"
            variants={{
              open: {
                height: 384, // h-96
                ...TV_SCREEN_VARIANTS.open,
              },
              closed: TV_SCREEN_VARIANTS.closed,
            }}
            className="absolute inset-x-0 bottom-0 z-20 w-full overflow-hidden rounded-xl border border-primary/20 bg-black/90 font-mono shadow-[0_0_40px_-10px_rgba(var(--primary),0.3)] backdrop-blur-md flex flex-col transition-shadow duration-500 hover:shadow-[0_0_60px_-10px_rgba(var(--primary),0.5)] hover:border-primary/40 selection:bg-primary/30 selection:text-green-200"
            style={{
              backgroundImage:
                "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
              backgroundSize: "100% 2px, 3px 100%",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-primary/20 bg-primary/5 px-4 py-2 shrink-0 z-10 h-12">
              <div className="flex space-x-2">
                <div
                  onClick={handleClose}
                  className="h-3 w-3 rounded-full bg-red-500/50 hover:bg-red-500 transition-colors cursor-pointer hover:shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                  title="Terminate Session"
                />
                <div
                  onClick={handleMinimize}
                  className="h-3 w-3 rounded-full bg-yellow-500/50 hover:bg-yellow-500 transition-colors cursor-pointer hover:shadow-[0_0_8px_rgba(234,179,8,0.6)]"
                  title={isMinimized ? "Restore" : "Minimize"}
                />
                <div
                  onClick={handleReboot}
                  className="h-3 w-3 rounded-full bg-green-500/50 hover:bg-green-500 transition-colors cursor-pointer hover:shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                  title="Reboot System"
                />
              </div>
              <div className="text-xs text-primary/70 flex items-center gap-2">
                {APP_VERSION_LABEL}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </div>
            </div>

            {/* Content */}
            <div
              ref={scrollRef}
              className={`p-6 space-y-2 text-sm flex-1 overflow-y-auto min-h-0 relative [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary/40 transition-opacity duration-300 ${
                isMinimized ? "opacity-0 invisible" : "opacity-100 visible"
              }`}
            >
              <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-black/20 to-transparent pointer-events-none sticky z-10" />

              <AnimatePresence mode="wait">
                {isRebooting ? (
                  <motion.div
                    key="rebooting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full text-primary/70 mb-12 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                    {/* Scanline effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent h-full w-full translate-y-[-100%] animate-[scanline_2s_linear_infinite]" />
                    <Loader />
                    <span className="mt-4 tracking-widest text-xs font-bold text-primary">
                      SYSTEM_REBOOT_INITIATED
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      CLEARING CACHE...
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      RESETTING ENVIRONMENT...
                    </span>
                  </motion.div>
                ) : (
                  <motion.div key="lines">
                    {lines.map((line, i) => (
                      <div
                        key={i}
                        className={`animate-in fade-in slide-in-from-left-2 duration-300 break-words hover:bg-white/5 px-2 -mx-2 rounded py-0.5 transition-colors ${
                          line.type === "command"
                            ? "text-white font-bold"
                            : line.type === "warning"
                              ? "text-yellow-400"
                              : line.type === "success"
                                ? "text-green-400"
                                : "text-muted-foreground"
                        }`}
                      >
                        {line.type === "command" && (
                          <span className="text-primary mr-2">➜</span>
                        )}
                        {line.type === "command" &&
                        typeof line.text === "string" ? (
                          <Typewriter text={line.text} />
                        ) : (
                          line.text
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="text-muted-foreground animate-in fade-in duration-300">
                        <Loader /> running task...
                      </div>
                    )}
                    {!isLoading && isInView && (
                      <div className="animate-pulse text-primary">_</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          /* Terminated State Overlay */
          <motion.div
            key="terminated"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex items-center justify-center rounded-xl border border-red-900/50 bg-black/95 font-mono text-red-500 z-30 backdrop-blur-sm"
          >
            <div className="text-center space-y-4 relative z-10">
              <div className="inline-block relative">
                <Terminal className="w-16 h-16 mx-auto mb-4 text-red-600 opacity-50" />
                <div className="absolute inset-0 blur-lg bg-red-500/20" />
              </div>
              <h3 className="text-xl font-bold tracking-wider">
                SESSION_TERMINATED
              </h3>
              <p className="text-xs text-red-400/60 max-w-[200px] mx-auto">
                Connection to host lost. Manual restart required.
              </p>
              <button
                onClick={handleRestore}
                className="mt-6 text-xs bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 px-6 py-2 rounded text-red-400 transition-all hover:scale-105 active:scale-95"
              >
                REBOOT
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function About() {
  const [hoverManifesto, setHoverManifesto] = useState(false);

  return (
    <PageTransition className="relative z-10 flex flex-col w-full">
      {/* SECTION 1: THE MANIFESTO */}
      <section className="container relative flex min-h-screen flex-col justify-center py-24 md:py-32">
        <div className="absolute top-1/4 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

        <div className="max-w-4xl space-y-12">
          <div className="space-y-6">
            <h1 className="text-5xl font-black tracking-tighter md:text-7xl lg:text-8xl lg:leading-[0.9]">
              <span
                className="block text-muted-foreground/40 text-4xl mb-4 font-mono font-normal tracking-normal cursor-default"
                onMouseEnter={() => setHoverManifesto(true)}
                onMouseLeave={() => setHoverManifesto(false)}
              >
                &gt;{" "}
                <ScrambleText text="THE MANIFESTO" trigger={hoverManifesto} />
              </span>
              <TextAnimate text="WE DO NOT" className="text-foreground" />
              <span className="text-primary block">
                <TextAnimate text="DRIFT." delay={400} />
              </span>
            </h1>
            <p className="max-w-2xl text-xl text-muted-foreground md:text-2xl leading-relaxed border-l-2 border-primary/30 pl-6 py-2">
              Use the force of gravity to your advantage. Most trackers are
              passive observers.
              <span className="text-foreground font-medium">
                {" "}
                Reborn is an active propulsion system{" "}
              </span>
              for your life's trajectory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="space-y-4 p-4 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
            >
              <h3 className="text-2xl font-bold font-mono text-foreground flex items-center">
                <Activity className="mr-3 h-5 w-5 text-primary" />
                ENTROPY_REDUCTION
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                The universe tends toward disorder. Your habits are the only
                structural integrity holding back the chaos. We built a tool
                that fights entropy with you.
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="space-y-4 p-4 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
            >
              <h3 className="text-2xl font-bold font-mono text-foreground flex items-center">
                <Shield className="mr-3 h-5 w-5 text-primary" />
                DATA_SOVEREIGNTY
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                In an age of surveillance, privacy is the ultimate luxury.
                Reborn operates in a vacuum—gapped from the data brokers. Your
                habits are yours alone.
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="space-y-4 p-4 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 md:col-span-2"
            >
              <h3 className="text-2xl font-bold font-mono text-foreground flex items-center">
                <Cpu className="mr-3 h-5 w-5 text-primary" />
                PREDICTIVE_INTELLIGENCE
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Most trackers are reactive. Reborn uses logistic regression to
                predict failure before it happens, adapting to your schedule in
                real-time.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: SYSTEM ARCHITECTURE */}
      <section className="w-full border-y border-white/5 bg-black/40 backdrop-blur-sm py-24">
        <div className="container grid gap-16 lg:grid-cols-2 items-stretch">
          <div className="space-y-8 order-2 lg:order-1 flex flex-col">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-mono text-primary mb-4 border border-primary/20 w-fit">
              <Terminal className="mr-2 h-3 w-3" />
              SYSTEM_SPECS
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Engineered for <span className="text-primary">Velocity.</span>
            </h2>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
              }}
              className="rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm h-full flex flex-col justify-center"
            >
              <SystemSpec label="CORE_ENGINE" value="REACT_19" icon={Cpu} />
              <SystemSpec
                label="RENDER_PIPELINE"
                value="WEBGL_2.0"
                icon={Activity}
              />
              <SystemSpec label="STYLING" value="TAILWIND_V4" icon={Shield} />
              <SystemSpec
                label="ANIMATION"
                value="FRAMER_MOTION"
                icon={Activity}
              />
              <SystemSpec
                label="TYPE_SAFETY"
                value="TYPESCRIPT_5"
                icon={Shield}
              />
            </motion.div>
          </div>

          <div className="flex justify-center order-1 lg:order-2 h-full">
            <TerminalWindow />
          </div>
        </div>
      </section>

      {/* SECTION 3: THE PILOT */}
      <section className="container py-32 flex flex-col items-center text-center">
        <div className="relative group mb-8">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-cyan-400 opacity-75 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-background border border-white/10">
            <User className="h-10 w-10 text-primary" />
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight mb-2">
          {AUTHOR_NAME}
        </h2>
        <p className="text-primary font-mono text-sm tracking-widest uppercase mb-6">
          {AUTHOR_ROLE}
        </p>

        <p className="max-w-[600px] text-muted-foreground mb-8 leading-relaxed">
          "I built Reborn because I was tired of habit trackers that felt like
          spreadsheets. I wanted something intelligent — something that learns
          from me and improves my habits. It also happens to be 20% of my
          Computer Science grade."
        </p>

        <div className="flex space-x-4">
          <Magnetic>
            <Button
              variant="outline"
              size="sm"
              className="space-x-2 rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </Button>
          </Magnetic>

          <Magnetic>
            <Button
              variant="outline"
              size="sm"
              className="space-x-2 rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Twitter className="h-4 w-4" />
              <span>Twitter</span>
            </Button>
          </Magnetic>
        </div>

        <div className="mt-24 pt-12 border-t border-white/5 w-full flex flex-col items-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tighter md:text-5xl">
            <TextAnimate text="Initiate Sequence." delay={200} />
          </h2>
          <Button
            size="lg"
            className="group rounded-full px-12 py-6 text-lg shadow-[0_0_40px_-5px_rgba(var(--primary),0.4)] hover:shadow-[0_0_60px_-5px_rgba(var(--primary),0.6)] transition-all duration-300"
          >
            Start Tracking{" "}
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </section>
    </PageTransition>
  );
}
