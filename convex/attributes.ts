import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { listAllDesc } from "./lib";

const valueValidator = v.object({
  id: v.string(),
  name: v.string(),
  description: v.string(),
});

const conditionValidator = v.object({
  id: v.string(),
  ifAttributeId: v.id("attributes"),
  ifValueId: v.string(),
  useValueIds: v.array(v.string()),
});

const categoryValidator = v.union(
  v.literal("escalation"),
  v.literal("routing"),
  v.literal("filtering"),
  v.literal("custom"),
);

export const list = listAllDesc("attributes");

export const listEnabled = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("attributes")
      .withIndex("by_enabled", (q) => q.eq("enabled", true))
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: categoryValidator,
    audience: v.string(),
    values: v.array(valueValidator),
    conditions: v.array(conditionValidator),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("attributes", {
      title: args.title,
      description: args.description,
      category: args.category,
      enabled: false,
      audience: args.audience,
      redetectOnClose: false,
      values: args.values,
      conditions: args.conditions,
      stats: { detected: 0 },
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("attributes"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(categoryValidator),
    enabled: v.optional(v.boolean()),
    audience: v.optional(v.string()),
    redetectOnClose: v.optional(v.boolean()),
    values: v.optional(v.array(valueValidator)),
    conditions: v.optional(v.array(conditionValidator)),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, unknown> = {};
    if (fields.title !== undefined) updates.title = fields.title;
    if (fields.description !== undefined) updates.description = fields.description;
    if (fields.category !== undefined) updates.category = fields.category;
    if (fields.enabled !== undefined) updates.enabled = fields.enabled;
    if (fields.audience !== undefined) updates.audience = fields.audience;
    if (fields.redetectOnClose !== undefined) updates.redetectOnClose = fields.redetectOnClose;
    if (fields.values !== undefined) updates.values = fields.values;
    if (fields.conditions !== undefined) updates.conditions = fields.conditions;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("attributes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
