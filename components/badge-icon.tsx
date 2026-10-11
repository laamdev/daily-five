import {
  Award,
  BookOpen,
  Brain,
  CalendarCheck,
  Flame,
  Footprints,
  Heart,
  House,
  Mountain,
  NotebookPen,
  Sparkles,
  Sprout,
  Sun,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { BADGE_BY_ID } from "@/lib/badges";

const ICONS: Record<string, LucideIcon> = {
  award: Award,
  "book-open": BookOpen,
  brain: Brain,
  "calendar-check": CalendarCheck,
  flame: Flame,
  footprints: Footprints,
  heart: Heart,
  home: House,
  mountain: Mountain,
  "notebook-pen": NotebookPen,
  sparkles: Sparkles,
  sprout: Sprout,
  sun: Sun,
  "trending-up": TrendingUp,
  users: Users,
};

export function BadgeIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = ICONS[icon] ?? Award;
  return <Icon className={className} strokeWidth={1.5} />;
}

/** Toast for each newly earned badge. */
export function celebrate(badgeIds: string[]) {
  for (const id of badgeIds) {
    const badge = BADGE_BY_ID[id];
    if (!badge) continue;
    toast(`New badge · ${badge.name}`, {
      description: badge.description,
      icon: <BadgeIcon icon={badge.icon} className="size-5 animate-pop" />,
    });
  }
}
