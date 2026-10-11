import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { categoryValidator } from "./schema";
import { evaluateBadges } from "./badges";
import {
  assertDate,
  countDone,
  getCurrentUser,
  getDay,
  getOrCreateDay,
  requireUser,
} from "./model";
import { CATEGORY_IDS, type CategoryId } from "../lib/categories";

const MAX_TITLE = 80;
const MAX_DESCRIPTION = 280;
const MAX_JOURNAL = 10_000;

export const get = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    assertDate(date);
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const day = await getDay(ctx, user._id, date);

    // Most recent earlier titles, used as gentle placeholders.
    const recent = await ctx.db
      .query("days")
      .withIndex("by_user_date", (q) => q.eq("userId", user._id).lt("date", date))
      .order("desc")
      .take(14);
    const lastTitles: Partial<Record<CategoryId, string>> = {};
    for (const d of recent) {
      for (const c of CATEGORY_IDS) {
        if (!lastTitles[c] && d.activities[c].title) lastTitles[c] = d.activities[c].title;
      }
    }

    return {
      day: day
        ? {
            activities: day.activities,
            doneCount: day.doneCount,
            journal: day.journal,
            journalShared: day.journalShared,
          }
        : null,
      lastTitles,
      hasPartner: !!user.coupleId,
    };
  },
});

/** Done counts for a date range, for the history calendar. */
export const range = query({
  args: { from: v.string(), to: v.string() },
  handler: async (ctx, { from, to }) => {
    assertDate(from);
    assertDate(to);
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const days = await ctx.db
      .query("days")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id).gte("date", from).lte("date", to),
      )
      .collect();
    return days.map((d) => ({
      date: d.date,
      doneCount: d.doneCount,
      hasJournal: d.journal.trim().length > 0,
    }));
  },
});

export const setActivity = mutation({
  args: {
    date: v.string(),
    category: categoryValidator,
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, { date, category, title, description }) => {
    assertDate(date);
    const user = await requireUser(ctx);
    const day = await getOrCreateDay(ctx, user._id, date);
    const activities = {
      ...day.activities,
      [category]: {
        ...day.activities[category],
        title: title.trim().slice(0, MAX_TITLE),
        description: description.trim().slice(0, MAX_DESCRIPTION),
      },
    };
    await ctx.db.patch(day._id, { activities });
  },
});

export const toggleActivity = mutation({
  args: { date: v.string(), category: categoryValidator },
  handler: async (ctx, { date, category }) => {
    assertDate(date);
    const user = await requireUser(ctx);
    const day = await getOrCreateDay(ctx, user._id, date);
    const current = day.activities[category];
    const done = !current.done;
    const activities = {
      ...day.activities,
      [category]: { ...current, done, completedAt: done ? Date.now() : undefined },
    };
    await ctx.db.patch(day._id, { activities, doneCount: countDone(activities) });
    return { done, newBadges: done ? await evaluateBadges(ctx, user) : [] };
  },
});

export const saveJournal = mutation({
  args: { date: v.string(), journal: v.string(), journalShared: v.boolean() },
  handler: async (ctx, { date, journal, journalShared }) => {
    assertDate(date);
    const user = await requireUser(ctx);
    const day = await getOrCreateDay(ctx, user._id, date);
    await ctx.db.patch(day._id, {
      journal: journal.slice(0, MAX_JOURNAL),
      journalShared,
    });
    return { newBadges: await evaluateBadges(ctx, user) };
  },
});
