import { CATEGORY_IDS, type Activities } from "@/lib/categories";
import { CATEGORY_STYLES } from "@/components/category-dot";
import { cn } from "@/lib/utils";

/** Five arc segments, one per category, filled in that category's color when done. */
export function ProgressRing({
  activities,
  size = 64,
  className,
}: {
  activities: Activities | null;
  size?: number;
  className?: string;
}) {
  const stroke = size / 14;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const gap = circumference * 0.035;
  const segment = circumference / CATEGORY_IDS.length - gap;
  const done = activities ? CATEGORY_IDS.filter((c) => activities[c].done).length : 0;

  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        {CATEGORY_IDS.map((c, i) => (
          <circle
            key={c}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${segment} ${circumference - segment}`}
            strokeDashoffset={-(i * (segment + gap)) - gap / 2}
            className={cn(
              "transition-[stroke] duration-500",
              activities?.[c].done ? CATEGORY_STYLES[c].stroke : "stroke-border",
            )}
          />
        ))}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-serif text-xl tabular-nums">
        {done}
        <span className="text-muted-foreground">/5</span>
      </span>
      <span className="sr-only">{done} of 5 done</span>
    </div>
  );
}
