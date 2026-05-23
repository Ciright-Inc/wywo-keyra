type GlyphName = "arrow_back" | "close";

type Props = {
  name: GlyphName;
  className?: string;
};

/** Inline nav glyphs — avoids Material Symbols FOUT showing ligature names as text. */
export function AdminNavGlyph({ name, className }: Props) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {name === "arrow_back" ? (
        <>
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </>
      ) : (
        <>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </>
      )}
    </svg>
  );
}
