"use client";

/**
 * Subtle architectural diagram — trust network, calendar, video integration.
 */
export function ConsultationInfrastructureVisual() {
  return (
    <div
      className="pointer-events-none relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-keyra-border/15 bg-gradient-to-b from-keyra-surface to-keyra-bg px-6 py-10"
      aria-hidden
    >
      <svg
        viewBox="0 0 800 280"
        className="mx-auto h-auto w-full max-w-3xl opacity-[0.42]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="consult-mesh" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.08" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <rect width="800" height="280" fill="url(#consult-mesh)" className="text-keyra-primary" />
        {/* Identity mesh nodes */}
        {[
          [120, 80],
          [200, 140],
          [320, 60],
          [400, 120],
          [520, 70],
          [640, 130],
          [680, 200],
          [280, 200],
          [480, 210],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle
              cx={cx}
              cy={cy}
              r={i % 3 === 0 ? 6 : 4}
              className="fill-keyra-primary/20 stroke-keyra-primary/30"
              strokeWidth="1"
            />
          </g>
        ))}
        {/* Mesh lines */}
        <path
          d="M120 80 L200 140 L320 60 L400 120 L520 70 L640 130"
          className="stroke-keyra-primary/15"
          strokeWidth="1"
        />
        <path
          d="M200 140 L280 200 L480 210 L640 130"
          className="stroke-keyra-primary/12"
          strokeWidth="1"
        />
        <path
          d="M400 120 L480 210 L680 200"
          className="stroke-keyra-primary/10"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        {/* SIM trust layer */}
        <rect
          x="60"
          y="180"
          width="140"
          height="48"
          rx="8"
          className="stroke-keyra-primary/20 fill-keyra-surface"
        />
        <text
          x="130"
          y="208"
          textAnchor="middle"
          className="fill-keyra-muted text-[10px] font-medium"
          style={{ fontFamily: "system-ui" }}
        >
          SIM-bound trust
        </text>
        {/* Calendar */}
        <rect
          x="330"
          y="170"
          width="140"
          height="58"
          rx="8"
          className="stroke-keyra-primary/25 fill-keyra-surface"
        />
        <text
          x="400"
          y="198"
          textAnchor="middle"
          className="fill-keyra-muted text-[10px] font-medium"
          style={{ fontFamily: "system-ui" }}
        >
          Advisory calendar
        </text>
        <line x1="350" y1="215" x2="450" y2="215" className="stroke-keyra-primary/15" strokeWidth="1" />
        {/* Video */}
        <rect
          x="600"
          y="175"
          width="140"
          height="52"
          rx="8"
          className="stroke-keyra-primary/25 fill-keyra-surface"
        />
        <text
          x="670"
          y="205"
          textAnchor="middle"
          className="fill-keyra-muted text-[10px] font-medium"
          style={{ fontFamily: "system-ui" }}
        >
          Secure video (VE)
        </text>
        {/* Connector */}
        <path
          d="M200 204 L330 199 M470 199 L600 201"
          className="stroke-keyra-primary/18"
          strokeWidth="1"
          markerEnd="url(#none)"
        />
      </svg>
      <p className="mt-4 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-keyra-muted/80">
        Keyra advisory · Ciright infrastructure
      </p>
    </div>
  );
}
