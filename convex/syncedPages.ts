import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listBySource = query({
  args: { websiteSourceId: v.id("websiteSources") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("syncedPages")
      .withIndex("by_websiteSource", (q) =>
        q.eq("websiteSourceId", args.websiteSourceId)
      )
      .collect();
  },
});

export const get = query({
  args: { id: v.id("syncedPages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("syncedPages"),
    status: v.union(v.literal("live"), v.literal("excluded")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const bulkUpdateStatus = mutation({
  args: {
    ids: v.array(v.id("syncedPages")),
    status: v.union(v.literal("live"), v.literal("excluded")),
  },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.patch(id, { status: args.status });
    }
  },
});
