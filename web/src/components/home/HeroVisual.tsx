"use client";

import { motion } from "framer-motion";

export function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-md sm:max-w-lg">
      <div
        className="animate-keyra-pulse-soft absolute inset-[12%] rounded-[40%] bg-kerya-bg"
        aria-hidden
      />
      <motion.div
        className="animate-keyra-float absolute right-[8%] top-[10%] h-24 w-24 rounded-full bg-kerya-bg"
        aria-hidden
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.2 }}
      />
      <motion.div
        className="animate-keyra-float-delayed absolute bottom-[18%] left-[5%] h-20 w-20 rounded-full bg-kerya-bg"
        aria-hidden
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.35 }}
      />

      <svg
        viewBox="0 0 400 320"
        className="relative z-10 h-full w-full"
        role="img"
        aria-label="Calm illustration of a person and family protected"
      >
        <defs>
          <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
        </defs>
        <ellipse cx="200" cy="170" rx="148" ry="106" fill="url(#heroGrad)" />
        <ellipse
          cx="200"
          cy="170"
          rx="148"
          ry="106"
          fill="none"
          stroke="#2FBF9F"
          strokeWidth="2"
        />

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
            fill="#FFFFFF"
            stroke="#5A6B7A"
            strokeWidth="2"
          />
          <rect x="170" y="108" width="60" height="88" rx="6" fill="#0B1F2A" />
          <circle cx="200" cy="208" r="4" fill="#5A6B7A" />
        </motion.g>

        {/* Simple family marks */}
        <motion.g
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          <circle cx="110" cy="210" r="14" fill="#FFFFFF" stroke="#5A6B7A" strokeWidth="2" />
          <path
            d="M86 254c4-20 14-30 24-30s20 10 24 30"
            fill="none"
            stroke="#5A6B7A"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <circle cx="290" cy="212" r="10" fill="#FFFFFF" stroke="#5A6B7A" strokeWidth="2" />
          <path
            d="M272 244c3-14 10-21 18-21s15 7 18 21"
            fill="none"
            stroke="#5A6B7A"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </motion.g>

        <motion.path
          d="M200 48 L248 72 L248 118 Q248 150 200 178 Q152 150 152 118 L152 72 Z"
          fill="none"
          stroke="#2FBF9F"
          strokeWidth="2.5"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.1, delay: 0.4, ease: "easeOut" }}
        />
        <motion.path
          d="M180 108 L195 125 L225 88"
          fill="none"
          stroke="#2FBF9F"
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
