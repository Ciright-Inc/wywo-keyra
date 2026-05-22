"use client";

import { motion, type Variants } from "framer-motion";
import { Children, type ReactNode, useLayoutEffect, useState } from "react";

const easeTrust = [0.22, 0.61, 0.36, 1] as const;

type StaggerRevealProps = {
  children: ReactNode;
  className?: string;
  /** Delay between each child reveal (seconds). */
  stagger?: number;
  /** Delay before the first child animates. */
  delay?: number;
};

/**
 * Staggers direct children on scroll — cards, panels, and grid items reveal in sequence.
 */
export function StaggerReveal({
  children,
  className,
  stagger = 0.07,
  delay = 0,
}: StaggerRevealProps) {
  const [reduce, setReduce] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : stagger,
        delayChildren: reduce ? 0 : delay,
      },
    },
  };

  const item: Variants = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduce ? 0.01 : 0.48,
        ease: easeTrust,
      },
    },
  };

  const items = Children.toArray(children);

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-6%" }}
    >
      {items.map((child, i) => (
        <motion.div key={i} variants={item} className="h-full min-h-0">
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
