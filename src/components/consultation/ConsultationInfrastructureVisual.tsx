"use client";

/**
 * Architectural diagram — trust network, calendar, video integration.
 * Contrast tuned for light bands (readable, still restrained).
 */
export function ConsultationInfrastructureVisual() {
  return (
    <div
      className="pointer-events-none relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-keyra-border/40 bg-gradient-to-b from-keyra-surface-2/80 to-keyra-bg px-6 py-10 sm:px-10"
      aria-hidden
    >
      <svg
        viewBox="0 0 800 300"
        className="mx-auto h-auto w-full max-w-3xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Keyra advisory infrastructure diagram"
      >
        <defs>
          <linearGradient id="consult-mesh" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#171717" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#171717" stopOpacity="0.02" />
          </linearGradient>
          <radialGradient id="consult-node-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#171717" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#171717" stopOpacity="0.08" />
          </radialGradient>
        </defs>

        <rect width="800" height="300" fill="url(#consult-mesh)" rx="12" />

        {/* Identity mesh — backbone */}
        <path
          d="M100 72 L188 128 L310 52 L398 108 L518 58 L638 118"
          stroke="#171717"
          strokeOpacity="0.22"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M188 128 L268 188 L478 198 L638 118"
          stroke="#171717"
          strokeOpacity="0.18"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          d="M398 108 L478 198 L698 188"
          stroke="#171717"
          strokeOpacity="0.14"
          strokeWidth="1.25"
          strokeDasharray="5 7"
          strokeLinecap="round"
        />

        {/* Nodes */}
        {[
          [100, 72, 7],
          [188, 128, 5],
          [310, 52, 6],
          [398, 108, 7],
          [518, 58, 5],
          [638, 118, 6],
          [698, 188, 5],
          [268, 188, 5],
          [478, 198, 6],
        ].map(([cx, cy, r], i) => (
          <g key={i}>
            <circle
              cx={cx}
              cy={cy}
              r={Number(r) + 4}
              fill="url(#consult-node-glow)"
            />
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="#ffffff"
              stroke="#171717"
              strokeOpacity="0.35"
              strokeWidth="1.5"
            />
            <circle
              cx={cx}
              cy={cy}
              r={2}
              fill="#171717"
              fillOpacity="0.5"
            />
          </g>
        ))}

        {/* Connectors between service blocks */}
        <path
          d="M200 218 H318 M482 218 H598"
          stroke="#171717"
          strokeOpacity="0.2"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <polygon
          points="318,218 312,215 312,221"
          fill="#171717"
          fillOpacity="0.25"
        />
        <polygon
          points="598,218 592,215 592,221"
          fill="#171717"
          fillOpacity="0.25"
        />

        {/* SIM-bound trust */}
        <g>
          <rect
            x="48"
            y="198"
            width="152"
            height="56"
            rx="10"
            fill="#ffffff"
            stroke="#171717"
            strokeOpacity="0.28"
            strokeWidth="1.25"
          />
          <text
            x="124"
            y="224"
            textAnchor="middle"
            fill="#171717"
            fillOpacity="0.72"
            fontSize="11"
            fontWeight="600"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            SIM-bound trust
          </text>
          <line
            x1="68"
            y1="236"
            x2="180"
            y2="236"
            stroke="#171717"
            strokeOpacity="0.12"
            strokeWidth="1"
          />
        </g>

        {/* Advisory calendar */}
        <g>
          <rect
            x="318"
            y="188"
            width="164"
            height="66"
            rx="10"
            fill="#ffffff"
            stroke="#171717"
            strokeOpacity="0.32"
            strokeWidth="1.25"
          />
          <text
            x="400"
            y="216"
            textAnchor="middle"
            fill="#171717"
            fillOpacity="0.72"
            fontSize="11"
            fontWeight="600"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            Advisory calendar
          </text>
          <rect
            x="338"
            y="228"
            width="28"
            height="8"
            rx="2"
            fill="#171717"
            fillOpacity="0.08"
          />
          <rect
            x="372"
            y="228"
            width="56"
            height="8"
            rx="2"
            fill="#171717"
            fillOpacity="0.14"
          />
          <rect
            x="434"
            y="228"
            width="28"
            height="8"
            rx="2"
            fill="#171717"
            fillOpacity="0.08"
          />
        </g>

        {/* Secure video (VE) */}
        <g>
          <rect
            x="600"
            y="193"
            width="152"
            height="56"
            rx="10"
            fill="#ffffff"
            stroke="#171717"
            strokeOpacity="0.32"
            strokeWidth="1.25"
          />
          <text
            x="676"
            y="219"
            textAnchor="middle"
            fill="#171717"
            fillOpacity="0.72"
            fontSize="11"
            fontWeight="600"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            Secure video (VE)
          </text>
          <circle
            cx="676"
            cy="236"
            r="10"
            stroke="#171717"
            strokeOpacity="0.2"
            strokeWidth="1"
          />
          <path
            d="M672 236 L676 232 L680 236 L676 240 Z"
            fill="#171717"
            fillOpacity="0.2"
          />
        </g>
      </svg>

      <p className="mt-5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-keyra-primary/70">
        Keyra advisory · Ciright infrastructure
      </p>
    </div>
  );
}
