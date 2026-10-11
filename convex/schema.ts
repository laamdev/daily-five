import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const activityValidator = v.object({
  title: v.string(),
  description: v.string(),
  done: v.boolean(),
  completedAt: v.optional(v.number()),
});

export const activitiesValidator = v.object({
  physical: activityValidator,
  social: activityValidator,
  mental: activityValidator,
  home: activityValidator,
  growth: activityValidator,
});

export const categoryValidator = v.union(
  v.literal("physical"),
  v.literal("social"),
  v.literal("mental"),
  v.literal("home"),
  v.literal("growth"),
);

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    coupleId: v.optional(v.id("couples")),
    // Off unless the user opts in: the partner only sees earned badges by default.
    shareChecklist: v.optional(v.boolean()),
  }).index("by_token", ["tokenIdentifier"]),

  couples: defineTable({
    inviteCode: v.string(),
    memberIds: v.array(v.id("users")),
    createdAt: v.number(),
  }).index("by_code", ["inviteCode"]),

  days: defineTable({
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD, user's local time
    activities: activitiesValidator,
    doneCount: v.number(),
    journal: v.string(),
    journalShared: v.boolean(),
  }).index("by_user_date", ["userId", "date"]),

  userBadges: defineTable({
    userId: v.id("users"),
    badgeId: v.string(),
    earnedAt: v.number(),
  }).index("by_user", ["userId"]),
});
