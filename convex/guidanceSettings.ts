import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const toneValidator = v.union(
  v.literal("friendly"),
  v.literal("neutral"),
  v.literal("matter-of-fact"),
  v.literal("professional"),
  v.literal("humorous")
);

const lengthValidator = v.union(
  v.literal("concise"),
  v.literal("standard"),
  v.literal("thorough")
);

export const get = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db.query("guidanceSettings").first();
    return row ?? null;
  },
});

export const save = mutation({
  args: {
    tone: toneValidator,
    length: lengthValidator,
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("guidanceSettings").first();
    if (existing) {
      await ctx.db.patch(existing._id, { tone: args.tone, length: args.length });
      return existing._id;
    }
    return await ctx.db.insert("guidanceSettings", {
      tone: args.tone,
      length: args.length,
    });
  },
});
