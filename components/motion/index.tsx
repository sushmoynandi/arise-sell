"use client";

/**
 * Motion primitives.
 * One spring vocabulary for the whole product so nothing feels borrowed:
 * everything overshoots slightly, settles fast, and never linear-fades.
 */

import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  type Variants,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/format";

/* --- the house springs --------------------------------------------------- */
export const SPRING = {
  type: "spring",
  stiffness: 260,
  damping: 26,
  mass: 0.9,
} as const;
export const SPRING_SOFT = {
  type: "spring",
  stiffness: 140,
  damping: 22,
  mass: 1,
} as const;
export const SPRING_POP = {
  type: "spring",
  stiffness: 420,
  damping: 18,
  mass: 0.6,
} as const;
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/* --- Reveal: scroll-triggered entrance ----------------------------------- */
type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
  as?: "div" | "section" | "li" | "span";
};

export function Reveal({
  children,
  className,
  delay = 0,
  y = 22,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-12% 0px -8% 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ ...SPRING_SOFT, delay }}
    >
      {children}
    </motion.div>
  );
}

/* --- Stagger: parent/child choreography ---------------------------------- */
export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(5px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: SPRING_SOFT },
};

export function Stagger({
  children,
  className,
  amount = 0.15,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={staggerParent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerChild} className={className}>
      {children}
    </motion.div>
  );
}

/* --- Magnetic: cursor-attracted control ---------------------------------- */
export function Magnetic({
  children,
  className,
  strength = 0.32,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), SPRING_POP);
  const y = useSpring(useMotionValue(0), SPRING_POP);

  return (
    <motion.div
      ref={ref}
      className={cx("inline-block", className)}
      style={{ x, y }}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </motion.div>
  );
}

/* --- Tilt: subtle 3D response -------------------------------------------- */
export function Tilt({
  children,
  className,
  max = 7,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [max, -max]), SPRING);
  const ry = useSpring(useTransform(mx, [0, 1], [-max, max]), SPRING);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
    >
      {children}
    </motion.div>
  );
}

/* --- Counter: springy number roll ---------------------------------------- */
export function Counter({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
  duration = 1.5,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      // easeOutExpo — fast arrival, long settle
      const e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setN(to * e);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {n.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/* --- SplitWords: per-word entrance for headlines -------------------------- */
export function SplitWords({
  text,
  className,
  delay = 0,
  highlight = [],
}: {
  text: string;
  className?: string;
  delay?: number;
  highlight?: string[];
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          className={cx(
            "inline-block whitespace-pre",
            highlight.includes(w.replace(/[.,]/g, "")) && "text-signal",
          )}
          initial={{ opacity: 0, y: "0.5em", filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ ...SPRING_SOFT, delay: delay + i * 0.045 }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}

/* --- Marquee: seamless infinite rail -------------------------------------- */
export function Marquee({
  children,
  reverse = false,
  className,
}: {
  children: ReactNode;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div className={cx("mask-fade-x overflow-hidden", className)}>
      <div
        className={cx(
          "flex w-max gap-3",
          reverse ? "anim-marquee-rev" : "anim-marquee",
        )}
      >
        {children}
        {children}
      </div>
    </div>
  );
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    restDelta: 0.001,
  });
  return (
    <motion.div
      style={{ scaleX, transformOrigin: "0%" }}
      className="fixed inset-x-0 top-0 z-100 h-1 bg-signal shadow-[0_1px_8px_rgba(10,110,80,0.5)] pointer-events-none"
    />
  );
}

export function RightScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 30,
    restDelta: 0.001,
  });
  return (
    <div className="fixed right-0 top-0 bottom-0 z-50 w-0.75 bg-black/3 pointer-events-none">
      <motion.div
        style={{ scaleY, transformOrigin: "0% 0%" }}
        className="w-full h-full bg-signal shadow-[0_0_8px_rgba(10,110,80,0.6)]"
      />
    </div>
  );
}

export { motion };
