/** Premium easing — snappy, tech-forward (Framer Motion built-ins). */
export const easeCircOut = "circOut" as const;
export const easeAnticipate = "anticipate" as const;

export const heroEntrance = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easeCircOut },
  },
} as const;

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
} as const;

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: easeCircOut },
  },
} as const;

export const slideInRight = {
  hidden: { opacity: 0, x: 16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: easeCircOut },
  },
} as const;
