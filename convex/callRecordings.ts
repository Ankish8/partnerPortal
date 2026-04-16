import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("callRecordings").order("desc").collect();
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    size: v.number(),
    duration: v.optional(v.string()),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("callRecordings", {
      name: args.name,
      size: args.size,
      duration: args.duration,
      status: "ready",
      storageId: args.storageId,
      uploadedAt: new Date().toISOString(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("callRecordings") },
  handler: async (ctx, args) => {
    const rec = await ctx.db.get(args.id);
    if (rec?.storageId) {
      await ctx.storage.delete(rec.storageId);
    }
    await ctx.db.delete(args.id);
  },
});
