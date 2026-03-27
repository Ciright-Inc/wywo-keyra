"use client";

import { motion } from "framer-motion";

export function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-md sm:max-w-lg">
      <div
        className="animate-keyra-pulse-soft absolute inset-[12%] rounded-[40%] bg-keyra-glow/25 blur-3xl"
        aria-hidden
      />
      <motion.div
        className="animate-keyra-float absolute right-[8%] top-[10%] h-24 w-24 rounded-full bg-keyra-accent/20 blur-2xl"
        aria-hidden
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.2 }}
      />
      <motion.div
        className="animate-keyra-float-delayed absolute bottom-[18%] left-[5%] h-20 w-20 rounded-full bg-keyra-warm/25 blur-2xl"
        aria-hidden
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.35 }}
      />

      <svg
        viewBox="0 0 400 320"
        className="relative z-10 h-full w-full drop-shadow-sm"
        role="img"
        aria-label="Calm illustration of someone using a device within a gentle protective glow"
      >
        <defs>
          <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e6f4e9" />
            <stop offset="100%" stopColor="#f3f8f2" />
          </linearGradient>
          <radialGradient id="shieldGlow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#8fd2a0" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#8fd2a0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="200" cy="170" rx="140" ry="100" fill="url(#heroGrad)" />
        <ellipse cx="200" cy="155" rx="118" ry="88" fill="url(#shieldGlow)" />

        <motion.g
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <rect
            x="155"
            y="95"
            width="90"
            height="130"
            rx="12"
            fill="#ffffff"
            stroke="#d7e6d8"
            strokeWidth="2"
          />
          <rect x="170" y="108" width="60" height="88" rx="6" fill="#1f8a4c" />
          <circle cx="200" cy="208" r="4" fill="#d7e6d8" />
        </motion.g>

        <motion.path
          d="M200 48 L248 72 L248 118 Q248 150 200 178 Q152 150 152 118 L152 72 Z"
          fill="none"
          stroke="#1f8a4c"
          strokeWidth="2.5"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.1, delay: 0.4, ease: "easeOut" }}
        />
        <motion.path
          d="M180 108 L195 125 L225 88"
          fill="none"
          stroke="#1f8a4c"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        />
      </svg>
    </div>
  );
}
