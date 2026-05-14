"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { useLayoutEffect, useState } from "react";

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
} & Omit<HTMLMotionProps<"div">, "children">;

/**
 * `useReducedMotion()` is false on the server but can be true on the client, which breaks
 * hydration (SSR HTML uses full-motion `initial`). We read `prefers-reduced-motion` only
 * after mount so the first client render matches the server.
 */
export function FadeIn({
  children,
  className,
  delay = 0,
  ...rest
}: FadeInProps) {
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
      initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: reduce ? 0.01 : 0.55,
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
