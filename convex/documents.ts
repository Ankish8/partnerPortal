import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("documents").order("desc").collect();
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
    type: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", {
      name: args.name,
      size: args.size,
      type: args.type,
      status: "ready",
      storageId: args.storageId,
      uploadedAt: new Date().toISOString(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (doc?.storageId) {
      await ctx.storage.delete(doc.storageId);
    }
    await ctx.db.delete(args.id);
  },
});
