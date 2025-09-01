import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

/**
 * Shared helper: ensures we always return or create a user from Clerk identity
 */
async function getOrCreateUser(ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  let user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .first();

  if (!user) {
    const clerkUserId = identity.tokenIdentifier.split("|")[1];
    let clerkUser;
    try {
      clerkUser = await clerkClient.users.getUser(clerkUserId);
    } catch {
      clerkUser = null;
    }

    const userId = await ctx.db.insert("users", {
      name: clerkUser?.fullName || identity.name || "Anonymous",
      email: clerkUser?.primaryEmailAddress?.emailAddress || identity.email || "",
      imageUrl: clerkUser?.imageUrl || identity.pictureUrl || "",
      tokenIdentifier: identity.tokenIdentifier,
    });

    user = await ctx.db.get(userId);
  }

  return user;
}

/**
 * Store or update the current user in DB
 */
export const store = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    let user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) {
      const userId = await ctx.db.insert("users", {
        name: args.name || identity.name || "Anonymous",
        email: args.email || identity.email || "",
        imageUrl: args.imageUrl || identity.pictureUrl || "",
        tokenIdentifier: identity.tokenIdentifier,
      });
      user = await ctx.db.get(userId);
    } else {
      await ctx.db.patch(user._id, {
        name: args.name || user.name,
        email: args.email || user.email,
        imageUrl: args.imageUrl || user.imageUrl,
      });
    }
    return user._id;
  },
});

/**
 * Public query for frontend: get current user
 */
export const getCurrentUser = query({
  handler: async (ctx) => {
    return await getOrCreateUser(ctx);
  },
});

/**
 * Search users by name/email (excluding current user)
 */
export const searchUsers = query({
  args: {
    query: v.string(),
    excludeIds: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const currentUser = await getOrCreateUser(ctx);

    if (args.query.length < 2) {
      return [];
    }

    const nameResults = await ctx.db
      .query("users")
      .withSearchIndex("search_name", (q) => q.search("name", args.query))
      .collect();

    const emailResults = await ctx.db
      .query("users")
      .withSearchIndex("search_email", (q) => q.search("email", args.query))
      .collect();

    const users = [
      ...nameResults,
      ...emailResults.filter(
        (email) => !nameResults.some((name) => name._id === email._id),
      ),
    ];

    // Exclude self and any IDs in excludeIds
    const excludeSet = new Set([
      currentUser._id,
      ...(args.excludeIds || []),
    ]);

    return users
      .filter((user) => !excludeSet.has(user._id))
      .map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
      }));
  },
});
