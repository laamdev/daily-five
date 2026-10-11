import type { CategoryId } from "@/lib/categories";
import { cn } from "@/lib/utils";

// Literal class names so Tailwind picks them up.
export const CATEGORY_STYLES: Record<
  CategoryId,
  { bg: string; border: string; text: string; stroke: string; hover: string }
> = {
  physical: {
    bg: "bg-cat-physical",
    border: "border-cat-physical",
    text: "text-cat-physical",
    stroke: "stroke-cat-physical",
    hover: "hover:bg-cat-physical/10",
  },
  social: {
    bg: "bg-cat-social",
    border: "border-cat-social",
    text: "text-cat-social",
    stroke: "stroke-cat-social",
    hover: "hover:bg-cat-social/10",
  },
  mental: {
    bg: "bg-cat-mental",
    border: "border-cat-mental",
    text: "text-cat-mental",
    stroke: "stroke-cat-mental",
    hover: "hover:bg-cat-mental/10",
  },
  home: {
    bg: "bg-cat-home",
    border: "border-cat-home",
    text: "text-cat-home",
    stroke: "stroke-cat-home",
    hover: "hover:bg-cat-home/10",
  },
  growth: {
    bg: "bg-cat-growth",
    border: "border-cat-growth",
    text: "text-cat-growth",
    stroke: "stroke-cat-growth",
    hover: "hover:bg-cat-growth/10",
  },
};

export function CategoryDot({ category, className }: { category: CategoryId; className?: string }) {
  return (
    <span
      className={cn("inline-block size-2 shrink-0 rounded-full", CATEGORY_STYLES[category].bg, className)}
    />
  );
}
