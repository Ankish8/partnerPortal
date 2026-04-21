import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getOfferContext = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) return null;
    return {
      _id: conv._id,
      offerState: conv.offerState ?? "none",
      lastAssistantAction: conv.lastAssistantAction ?? "normal",
      lastOfferAt: conv.lastOfferAt ?? null,
    };
  },
});

export const start = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.insert("conversations", {
      detections: [],
      offerState: "none",
      lastAssistantAction: "normal",
    });
  },
});

export const recordOffer = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) return;
    await ctx.db.patch(args.conversationId, {
      offerState: "offered",
      lastOfferAt: Date.now(),
      lastAssistantAction: "offer",
    });
  },
});

export const recordOfferResponse = mutation({
  args: {
    conversationId: v.id("conversations"),
    accepted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) return;
    await ctx.db.patch(args.conversationId, {
      offerState: args.accepted ? "accepted" : "declined",
    });
  },
});

export const recordAssistantAction = mutation({
  args: {
    conversationId: v.id("conversations"),
    action: v.union(
      v.literal("normal"),
      v.literal("offer"),
      v.literal("escalated"),
    ),
  },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) return;
    await ctx.db.patch(args.conversationId, {
      lastAssistantAction: args.action,
    });
  },
});

export const recordEscalationSource = mutation({
  args: {
    conversationId: v.id("conversations"),
    source: v.union(
      v.literal("baseline"),
      v.literal("rule"),
      v.literal("guidance"),
      v.literal("offer_accepted"),
    ),
    baselineTrigger: v.optional(
      v.union(
        v.literal("direct_human_request"),
        v.literal("anger_frustration"),
        v.literal("repetition_loop"),
        v.literal("first_turn_escalation"),
        v.literal("keyword_agent_support"),
        v.literal("how_to_contact"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) return;
    const patch: Record<string, unknown> = { escalationSource: args.source };
    if (args.baselineTrigger !== undefined) {
      patch.baselineTrigger = args.baselineTrigger;
    }
    await ctx.db.patch(args.conversationId, patch);
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

    const currentValueStats = attribute.valueStats ?? {};
    const existingEntry = currentValueStats[args.valueId] ?? {
      conversations: 0,
      resolved: 0,
      escalated: 0,
    };

    await ctx.db.patch(args.attributeId, {
      stats: {
        ...currentStats,
        detected: currentStats.detected + 1,
        conversations: hadPriorForAttribute
          ? (currentStats.conversations ?? 0)
          : (currentStats.conversations ?? 0) + 1,
      },
      valueStats: {
        ...currentValueStats,
        [args.valueId]: {
          ...existingEntry,
          conversations: existingEntry.conversations + 1,
        },
      },
    });
  },
});
