// Badge catalog shared by the Convex backend and the UI.
// `icon` is a key into components/badge-icon.tsx.

import type { CategoryId } from "./categories";

export type BadgeStats = {
  totalDone: number;
  perCategory: Record<CategoryId, number>;
  perfectDays: number;
  bestPerfectStreak: number;
  journalEntries: number;
  inSyncDays: number;
  bestInSyncStreak: number;
};

export type BadgeDef = {
  id: string;
  name: string;
  description: string;
  icon: string;
  couple?: boolean;
  target: number;
  progress: (s: BadgeStats) => number;
};

export const BADGES: BadgeDef[] = [
  {
    id: "first-step",
    name: "First Step",
    description: "Complete your first activity",
    icon: "sprout",
    target: 1,
    progress: (s) => s.totalDone,
  },
  {
    id: "perfect-day",
    name: "Perfect Day",
    description: "Complete all five in one day",
    icon: "sun",
    target: 1,
    progress: (s) => s.perfectDays,
  },
  {
    id: "on-a-roll",
    name: "On a Roll",
    description: "3 perfect days in a row",
    icon: "flame",
    target: 3,
    progress: (s) => s.bestPerfectStreak,
  },
  {
    id: "week-strong",
    name: "Week Strong",
    description: "7 perfect days in a row",
    icon: "calendar-check",
    target: 7,
    progress: (s) => s.bestPerfectStreak,
  },
  {
    id: "unstoppable",
    name: "Unstoppable",
    description: "30 perfect days in a row",
    icon: "mountain",
    target: 30,
    progress: (s) => s.bestPerfectStreak,
  },
  {
    id: "mover",
    name: "Mover",
    description: "25 physical activities",
    icon: "footprints",
    target: 25,
    progress: (s) => s.perCategory.physical,
  },
  {
    id: "connector",
    name: "Connector",
    description: "25 social activities",
    icon: "users",
    target: 25,
    progress: (s) => s.perCategory.social,
  },
  {
    id: "thinker",
    name: "Thinker",
    description: "25 mental activities",
    icon: "brain",
    target: 25,
    progress: (s) => s.perCategory.mental,
  },
  {
    id: "nester",
    name: "Nester",
    description: "25 home activities",
    icon: "home",
    target: 25,
    progress: (s) => s.perCategory.home,
  },
  {
    id: "builder",
    name: "Builder",
    description: "25 growth activities",
    icon: "trending-up",
    target: 25,
    progress: (s) => s.perCategory.growth,
  },
  {
    id: "century",
    name: "Century",
    description: "100 activities in total",
    icon: "award",
    target: 100,
    progress: (s) => s.totalDone,
  },
  {
    id: "journaler",
    name: "Journaler",
    description: "Write 7 journal entries",
    icon: "notebook-pen",
    target: 7,
    progress: (s) => s.journalEntries,
  },
  {
    id: "storyteller",
    name: "Storyteller",
    description: "Write 30 journal entries",
    icon: "book-open",
    target: 30,
    progress: (s) => s.journalEntries,
  },
  {
    id: "in-sync",
    name: "In Sync",
    description: "Both of you have a perfect day on the same day",
    icon: "heart",
    couple: true,
    target: 1,
    progress: (s) => s.inSyncDays,
  },
  {
    id: "power-couple",
    name: "Power Couple",
    description: "7 in-sync days in a row",
    icon: "sparkles",
    couple: true,
    target: 7,
    progress: (s) => s.bestInSyncStreak,
  },
];

export const BADGE_BY_ID = Object.fromEntries(BADGES.map((b) => [b.id, b]));
