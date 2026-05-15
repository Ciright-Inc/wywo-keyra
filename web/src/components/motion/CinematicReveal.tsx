"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { useLayoutEffect, useState } from "react";

type Depth = "foreground" | "midground" | "background";

const depthDuration: Record<Depth, number> = {
  foreground: 0.3,
  midground: 0.5,
  background: 0.7,
};

type CinematicRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  depth?: Depth;
  y?: number;
} & Omit<HTMLMotionProps<"div">, "children">;

/**
 * Layered reveal aligned to Trust Layer motion doctrine (fg 300ms / mg 500ms / bg 700ms).
 */
export function CinematicReveal({
  children,
  className,
  delay = 0,
  depth = "midground",
  y = 20,
  ...rest
}: CinematicRevealProps) {
  const [reduce, setReduce] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const duration = reduce ? 0.01 : depthDuration[depth];

  return (
    <motion.div
      initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{
        duration,
        delay: reduce ? 0 : delay,
        ease: [0.22, 0.61, 0.36, 1],
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
