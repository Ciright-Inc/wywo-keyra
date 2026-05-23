"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { easeCircOut } from "@/lib/keyraMotion";
import { cn } from "@/components/ui/cn";

/** One tween for lift, shadow, and border — avoids CSS/JS fighting on hover. */
const hoverTransition = {
  type: "tween" as const,
  duration: 0.45,
  ease: easeCircOut,
};

const homeCardShadow = {
  rest: "0 2px 8px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.06)",
  hover:
    "0 10px 32px rgba(59, 130, 246, 0.12), 0 18px 44px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.14)",
};

const panelShadow = {
  rest: "0 2px 8px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.06)",
  hover:
    "0 10px 28px rgba(59, 130, 246, 0.1), 0 16px 40px rgba(0, 0, 0, 0.09), 0 0 0 1px rgba(59, 130, 246, 0.12)",
};

type HoverLiftCardProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "article";
  /** `panel` for hero bento panels; default matches `.keyra-home-card` */
  surface?: "card" | "panel";
} & Omit<HTMLMotionProps<"div">, "children">;

/**
 * Bento / feature card — lift + glow driven entirely by Framer Motion (no CSS :hover).
 */
export function HoverLiftCard({
  children,
  className,
  as = "div",
  surface = "card",
  ...rest
}: HoverLiftCardProps) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as];
  const shadows = surface === "panel" ? panelShadow : homeCardShadow;

  return (
    <Component
      className={cn("keyra-hover-lift", className)}
      initial={false}
      animate={reduceMotion ? undefined : "rest"}
      whileHover={reduceMotion ? undefined : "hover"}
      variants={{
        rest: {
          y: 0,
          boxShadow: shadows.rest,
          borderColor: "var(--color-hairline-strong)",
        },
        hover: {
          y: -4,
          boxShadow: shadows.hover,
          borderColor: "rgba(59, 130, 246, 0.32)",
        },
      }}
      transition={hoverTransition}
      {...rest}
    >
      {children}
    </Component>
  );
}
