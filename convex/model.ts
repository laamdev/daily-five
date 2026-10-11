import { ConvexError } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { CATEGORY_IDS, emptyActivities, type CategoryId } from "../lib/categories";
import { isDateKey } from "../lib/dates";

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();
}

export async function requireUser(ctx: QueryCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) throw new ConvexError("Not signed in");
  return user;
}

export function assertDate(date: string) {
  if (!isDateKey(date)) throw new ConvexError("Invalid date");
}

export async function getPartner(ctx: QueryCtx, user: Doc<"users">) {
  if (!user.coupleId) return null;
  const couple = await ctx.db.get(user.coupleId);
  const partnerId = couple?.memberIds.find((id) => id !== user._id);
  return partnerId ? await ctx.db.get(partnerId) : null;
}

export async function getDay(ctx: QueryCtx, userId: Id<"users">, date: string) {
  return await ctx.db
    .query("days")
    .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", date))
    .unique();
}

export async function getOrCreateDay(
  ctx: MutationCtx,
  userId: Id<"users">,
  date: string,
) {
  const existing = await getDay(ctx, userId, date);
  if (existing) return existing;
  const id = await ctx.db.insert("days", {
    userId,
    date,
    activities: emptyActivities(),
    doneCount: 0,
    journal: "",
    journalShared: false,
  });
  return (await ctx.db.get(id))!;
}

export function countDone(activities: Doc<"days">["activities"]) {
  return CATEGORY_IDS.filter((c: CategoryId) => activities[c].done).length;
}
