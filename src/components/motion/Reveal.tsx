import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { DURATION, EASE_OUT, REVEAL_HIDDEN, REVEAL_VISIBLE } from "@/lib/motion";

export interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay in seconds, for revealing a group of siblings in sequence. */
  delay?: number;
}

/**
 * Fades + gently rises a section/card into view once, as it enters the
 * viewport. Group related elements under one Reveal (or stagger with
 * `delay`) rather than animating every paragraph independently.
 *
 * Respects prefers-reduced-motion: content renders immediately, with no
 * transform/opacity animation.
 */
function Reveal({ children, className, delay = 0 }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={REVEAL_HIDDEN}
      transition={{ duration: DURATION.large, delay, ease: EASE_OUT }}
      viewport={{ once: true, margin: "-10% 0px" }}
      whileInView={REVEAL_VISIBLE}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;
