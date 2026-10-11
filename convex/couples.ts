import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertDate, getCurrentUser, getDay, getPartner, requireUser } from "./model";

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomCode() {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user?.coupleId) return null;
    const couple = await ctx.db.get(user.coupleId);
    if (!couple) return null;
    const members = await Promise.all(couple.memberIds.map((id) => ctx.db.get(id)));
    return {
      inviteCode: couple.inviteCode,
      members: members
        .filter((m) => m !== null)
        .map((m) => ({ _id: m._id, name: m.name, imageUrl: m.imageUrl, isMe: m._id === user._id })),
    };
  },
});

export const create = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    if (user.coupleId) throw new ConvexError("You're already in a shared space");
    let inviteCode = randomCode();
    while (
      await ctx.db
        .query("couples")
        .withIndex("by_code", (q) => q.eq("inviteCode", inviteCode))
        .unique()
    ) {
      inviteCode = randomCode();
    }
    const coupleId = await ctx.db.insert("couples", {
      inviteCode,
      memberIds: [user._id],
      createdAt: Date.now(),
    });
    await ctx.db.patch(user._id, { coupleId });
    return inviteCode;
  },
});

export const join = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const user = await requireUser(ctx);
    if (user.coupleId) throw new ConvexError("You're already in a shared space");
    const couple = await ctx.db
      .query("couples")
      .withIndex("by_code", (q) => q.eq("inviteCode", code.trim().toUpperCase()))
      .unique();
    if (!couple) throw new ConvexError("No space found with that code");
    if (couple.memberIds.length >= 2) throw new ConvexError("That space is already full");
    await ctx.db.patch(couple._id, { memberIds: [...couple.memberIds, user._id] });
    await ctx.db.patch(user._id, { coupleId: couple._id });
  },
});

export const leave = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    if (!user.coupleId) return;
    const couple = await ctx.db.get(user.coupleId);
    await ctx.db.patch(user._id, { coupleId: undefined });
    if (!couple) return;
    const remaining = couple.memberIds.filter((id) => id !== user._id);
    if (remaining.length === 0) await ctx.db.delete(couple._id);
    else await ctx.db.patch(couple._id, { memberIds: remaining });
  },
});

/**
 * What the partner chose to share for a day. The checklist is only included when they turned on
 * checklist sharing, and the journal only when they shared that day's entry.
 */
export const partnerDay = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    assertDate(date);
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const partner = await getPartner(ctx, user);
    if (!partner) return null;
    const sharesChecklist = partner.shareChecklist ?? false;
    const day = await getDay(ctx, partner._id, date);
    return {
      partner: { _id: partner._id, name: partner.name, imageUrl: partner.imageUrl },
      sharesChecklist,
      checklist:
        sharesChecklist && day ? { activities: day.activities, doneCount: day.doneCount } : null,
      journal: day?.journalShared ? day.journal : null,
    };
  },
});

/** Badges the partner has earned. Always visible to the other member of the space. */
export const partnerBadges = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const partner = await getPartner(ctx, user);
    if (!partner) return null;
    const earned = await ctx.db
      .query("userBadges")
      .withIndex("by_user", (q) => q.eq("userId", partner._id))
      .collect();
    return earned
      .sort((a, b) => b.earnedAt - a.earnedAt)
      .map((b) => ({ badgeId: b.badgeId, earnedAt: b.earnedAt }));
  },
});
