"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { useLayoutEffect, useState } from "react";

type HoverLiftProps = {
  children: ReactNode;
  className?: string;
} & Omit<HTMLMotionProps<"div">, "children">;

/**
 * Subtle lift on hover — engineered, calm micro-interaction for cards and panels.
 */
export function HoverLift({ children, className, ...rest }: HoverLiftProps) {
  const [reduce, setReduce] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <motion.div
      className={className}
      whileHover={reduce ? undefined : { y: -3, transition: { duration: 0.28, ease: [0.22, 0.61, 0.36, 1] } }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
