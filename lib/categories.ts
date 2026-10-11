// Shared by the Convex backend and the UI, so keep this file free of React imports.

export const CATEGORY_IDS = [
  "physical",
  "social",
  "mental",
  "home",
  "growth",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export type CategoryMeta = {
  id: CategoryId;
  label: string;
  prompt: string;
  ideas: string[];
};

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "physical",
    label: "Physical",
    prompt: "How will you move today?",
    ideas: ["Morning walk", "Gym session", "Yoga", "Bike ride"],
  },
  {
    id: "social",
    label: "Social",
    prompt: "Who will you connect with?",
    ideas: ["Call mom", "Coffee with a friend", "Work from a café"],
  },
  {
    id: "mental",
    label: "Mental",
    prompt: "What will keep your mind sharp?",
    ideas: ["Read 20 pages", "Crossword", "Meditate"],
  },
  {
    id: "home",
    label: "Home",
    prompt: "What corner gets some love?",
    ideas: ["Tidy the bedroom", "Organize the closet", "Vacuum the kitchen"],
  },
  {
    id: "growth",
    label: "Growth",
    prompt: "What moves you forward?",
    ideas: ["Practice guitar", "Learn Spanish", "Side project"],
  },
];

export const CATEGORY_BY_ID = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, CategoryMeta>;

export type Activity = {
  title: string;
  description: string;
  done: boolean;
  completedAt?: number;
};

export type Activities = Record<CategoryId, Activity>;

export function emptyActivities(): Activities {
  return Object.fromEntries(
    CATEGORY_IDS.map((c) => [c, { title: "", description: "", done: false }]),
  ) as Activities;
}
