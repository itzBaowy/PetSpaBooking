"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

export function AnimatedReveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}) {
  const reduce = useReducedMotion();
  const offsets = { up: { y: 24 }, down: { y: -18 }, left: { x: 24 }, right: { x: -24 }, none: {} };

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, ...offsets[direction] }}
      whileInView={reduce ? undefined : { opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedStagger({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduce ? 0 : 0.09 } },
  };
  return (
    <motion.div className={className} variants={variants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.12 }}>
      {children}
    </motion.div>
  );
}

export function AnimatedCard({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y: reduce ? 0 : 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }}
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
