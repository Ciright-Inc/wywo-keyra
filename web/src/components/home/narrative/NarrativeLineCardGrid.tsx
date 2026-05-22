import { Card } from "@/components/ui/Card";
import {
  narrativeCardGridClass,
  narrativeEqualCard,
  narrativeLineTextCompactClass,
  narrativeLineTextDefaultClass,
} from "@/components/home/narrative/narrativeGrid";

type NarrativeLineCardGridProps = {
  lines: string[];
  cardClassName: string;
  columns?: 2 | 3;
  density?: "default" | "compact";
  className?: string;
};

/**
 * Wrapped equal-height line card grid — use inside NarrativeSection without stagger.
 * For staggered sections, map cards directly and set `childrenClassName` via `narrativeCardGridClass`.
 */
export function NarrativeLineCardGrid({
  lines,
  cardClassName,
  columns = 3,
  density = "default",
  className,
}: NarrativeLineCardGridProps) {
  const textClass =
    density === "compact" ? narrativeLineTextCompactClass : narrativeLineTextDefaultClass;

  return (
    <div className={narrativeCardGridClass(columns, className)}>
      {lines.map((line) => (
        <Card key={line} className={narrativeEqualCard(cardClassName)}>
          <p className={textClass}>{line}</p>
        </Card>
      ))}
    </div>
  );
}
