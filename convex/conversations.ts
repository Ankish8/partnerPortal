import { v } from "convex/values";
import { mutation } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

export const start = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.insert("conversations", {
      detections: [],
    });
  },
});

export const recordDetection = mutation({
  args: {
    conversationId: v.id("conversations"),
    attributeId: v.id("attributes"),
    valueId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return;
    if (conversation.outcome) return;

    const attribute = await ctx.db.get(args.attributeId);
    if (!attribute) return;

    const currentStats = attribute.stats;
    const existingForPair = conversation.detections.find(
      (d) =>
        d.attributeId === args.attributeId && d.valueId === args.valueId,
    );

    if (existingForPair) {
      await ctx.db.patch(args.attributeId, {
        stats: {
          ...currentStats,
          detected: currentStats.detected + 1,
        },
      });
      return;
    }

    const hadPriorForAttribute = conversation.detections.some(
      (d) => d.attributeId === args.attributeId,
    );

    await ctx.db.patch(args.conversationId, {
      detections: [
        ...conversation.detections,
        { attributeId: args.attributeId, valueId: args.valueId },
      ],
    });

    await ctx.db.patch(args.attributeId, {
      stats: {
        ...currentStats,
        detected: currentStats.detected + 1,
        conversations: hadPriorForAttribute
          ? (currentStats.conversations ?? 0)
          : (currentStats.conversations ?? 0) + 1,
      },
    });
  },
});

export const end = mutation({
  args: {
    conversationId: v.id("conversations"),
    outcome: v.union(v.literal("resolved"), v.literal("escalated")),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return;
    if (conversation.outcome) return;

    await ctx.db.patch(args.conversationId, {
      outcome: args.outcome,
      endedAt: Date.now(),
    });

    const distinctAttributeIds = new Set(
      conversation.detections.map((d) => d.attributeId),
    );

    for (const attributeId of distinctAttributeIds) {
      const attribute = (await ctx.db.get(attributeId)) as
        | Doc<"attributes">
        | null;
      if (!attribute) continue;
      const currentStats = attribute.stats;
      await ctx.db.patch(attributeId, {
        stats: {
          ...currentStats,
          resolved:
            args.outcome === "resolved"
              ? (currentStats.resolved ?? 0) + 1
              : currentStats.resolved,
          escalated:
            args.outcome === "escalated"
              ? (currentStats.escalated ?? 0) + 1
              : currentStats.escalated,
        },
      });
    }
  },
});
