import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireUser } from "./model";

/** Creates or refreshes the user record from the Clerk identity. Called once per session. */
export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not signed in");
    const name =
      identity.givenName ??
      identity.name ??
      identity.nickname ??
      identity.email?.split("@")[0] ??
      "Friend";
    const imageUrl = identity.pictureUrl;

    const existing = await getCurrentUser(ctx);
    if (existing) {
      if (existing.name !== name || existing.imageUrl !== imageUrl) {
        await ctx.db.patch(existing._id, { name, imageUrl });
      }
      return existing._id;
    }
    return await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name,
      imageUrl,
    });
  },
});

export const me = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    return {
      _id: user._id,
      name: user.name,
      imageUrl: user.imageUrl,
      hasCouple: !!user.coupleId,
      shareChecklist: user.shareChecklist ?? false,
    };
  },
});

export const setShareChecklist = mutation({
  args: { share: v.boolean() },
  handler: async (ctx, { share }) => {
    const user = await requireUser(ctx);
    await ctx.db.patch(user._id, { shareChecklist: share });
  },
});
