import { v } from "convex/values";
import { query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { getCurrentUser, getPartner } from "./model";
import { BADGES, type BadgeStats } from "../lib/badges";
import { CATEGORY_IDS } from "../lib/categories";
import { currentRun, longestRun } from "../lib/dates";

function perfectDates(days: Doc<"days">[]) {
  return days.filter((d) => d.doneCount === CATEGORY_IDS.length).map((d) => d.date);
}

async function loadDays(ctx: QueryCtx, userId: Doc<"users">["_id"]) {
  // Days come back sorted by date thanks to the index.
  return await ctx.db
    .query("days")
    .withIndex("by_user_date", (q) => q.eq("userId", userId))
    .collect();
}

export async function computeStats(ctx: QueryCtx, user: Doc<"users">) {
  const days = await loadDays(ctx, user._id);
  const perCategory = Object.fromEntries(
    CATEGORY_IDS.map((c) => [c, 0]),
  ) as BadgeStats["perCategory"];
  let totalDone = 0;
  let journalEntries = 0;
  for (const day of days) {
    totalDone += day.doneCount;
    if (day.journal.trim()) journalEntries++;
    for (const c of CATEGORY_IDS) if (day.activities[c].done) perCategory[c]++;
  }
  const perfect = perfectDates(days);

  let inSync: string[] = [];
  const partner = await getPartner(ctx, user);
  if (partner) {
    const partnerPerfect = new Set(
      perfectDates(await loadDays(ctx, partner._id)),
    );
    inSync = perfect.filter((d) => partnerPerfect.has(d));
  }

  const stats: BadgeStats = {
    totalDone,
    perCategory,
    perfectDays: perfect.length,
    bestPerfectStreak: longestRun(perfect),
    journalEntries,
    inSyncDays: inSync.length,
    bestInSyncStreak: longestRun(inSync),
  };
  return { stats, perfect, inSync, partner };
}

async function awardFor(ctx: MutationCtx, user: Doc<"users">) {
  const { stats } = await computeStats(ctx, user);
  const owned = new Set(
    (
      await ctx.db
        .query("userBadges")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect()
    ).map((b) => b.badgeId),
  );
  const earned: string[] = [];
  for (const badge of BADGES) {
    if (owned.has(badge.id)) continue;
    if (badge.progress(stats) >= badge.target) {
      await ctx.db.insert("userBadges", {
        userId: user._id,
        badgeId: badge.id,
        earnedAt: Date.now(),
      });
      earned.push(badge.id);
    }
  }
  return earned;
}

/**
 * Awards any newly reached badges to the user (and their partner, since couple
 * badges depend on both). Returns the ids newly earned by `user`.
 */
export async function evaluateBadges(ctx: MutationCtx, user: Doc<"users">) {
  const earned = await awardFor(ctx, user);
  const partner = await getPartner(ctx, user);
  if (partner) await awardFor(ctx, partner);
  return earned;
}

export const list = query({
  args: { today: v.string() },
  handler: async (ctx, { today }) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const { stats, perfect, inSync, partner } = await computeStats(ctx, user);
    const owned = new Map(
      (
        await ctx.db
          .query("userBadges")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect()
      ).map((b) => [b.badgeId, b.earnedAt]),
    );
    return {
      hasPartner: partner !== null,
      stats: {
        totalDone: stats.totalDone,
        perfectDays: stats.perfectDays,
        currentStreak: currentRun(new Set(perfect), today),
        bestStreak: stats.bestPerfectStreak,
        inSyncDays: stats.inSyncDays,
        currentInSyncStreak: currentRun(new Set(inSync), today),
      },
      badges: BADGES.map((b) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        icon: b.icon,
        couple: b.couple ?? false,
        target: b.target,
        current: Math.min(b.progress(stats), b.target),
        earnedAt: owned.get(b.id) ?? null,
      })),
    };
  },
});
