import { query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";

type EscalationSource =
  | "baseline"
  | "rule"
  | "guidance"
  | "offer_accepted";

const WINDOWS_MS = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

const WINDOW_VALUES = v.union(
  v.literal("24h"),
  v.literal("7d"),
  v.literal("30d"),
  v.literal("all"),
);

function inWindow(
  conversation: Doc<"conversations">,
  window: keyof typeof WINDOWS_MS | "all",
): boolean {
  if (window === "all") return true;
  const cutoff = Date.now() - WINDOWS_MS[window];
  return conversation._creationTime >= cutoff;
}

export const getEscalationMetrics = query({
  args: {
    window: v.optional(WINDOW_VALUES),
  },
  handler: async (ctx, args) => {
    const window = args.window ?? "7d";
    const conversations = await ctx.db.query("conversations").collect();
    const inScope = conversations.filter((c) => inWindow(c, window));

    const total = inScope.length;
    const escalatedConversations = inScope.filter(
      (c) => c.lastAssistantAction === "escalated",
    );
    const escalated = escalatedConversations.length;
    const resolved = Math.max(total - escalated, 0);
    const escalationRate = total > 0 ? escalated / total : 0;

    const reasonBreakdown: Record<EscalationSource, number> = {
      baseline: 0,
      rule: 0,
      guidance: 0,
      offer_accepted: 0,
    };
    for (const c of escalatedConversations) {
      const src = c.escalationSource;
      if (src && src in reasonBreakdown) {
        reasonBreakdown[src] += 1;
      }
    }

    const ruleAgg = new Map<
      string,
      { ruleId: Id<"escalationRules">; title: string; matched: number; escalated: number }
    >();
    const rules = await ctx.db.query("escalationRules").collect();
    for (const r of rules) {
      ruleAgg.set(r._id, {
        ruleId: r._id,
        title: r.title || "Untitled rule",
        matched: r.stats.matched ?? 0,
        escalated: r.stats.escalated ?? 0,
      });
    }

    const windowRuleEscalated = new Map<string, number>();
    const windowGuidanceEscalated = new Map<string, number>();
    for (const c of escalatedConversations) {
      for (const rid of c.matchedRuleIds ?? []) {
        windowRuleEscalated.set(rid, (windowRuleEscalated.get(rid) ?? 0) + 1);
      }
      for (const gid of c.appliedGuidanceIds ?? []) {
        windowGuidanceEscalated.set(
          gid,
          (windowGuidanceEscalated.get(gid) ?? 0) + 1,
        );
      }
    }

    const topRules = Array.from(ruleAgg.values())
      .map((r) => ({
        ...r,
        windowEscalated: windowRuleEscalated.get(r.ruleId) ?? 0,
      }))
      .sort((a, b) => b.windowEscalated - a.windowEscalated || b.escalated - a.escalated)
      .slice(0, 5)
      .filter((r) => r.matched > 0 || r.windowEscalated > 0);

    const guidance = await ctx.db.query("escalationGuidance").collect();
    const topGuidance = guidance
      .map((g) => ({
        guidanceId: g._id,
        title: g.title || "Untitled guidance",
        mode: g.mode ?? "immediate",
        used: g.stats.used ?? 0,
        escalated: g.stats.escalated ?? 0,
        windowEscalated: windowGuidanceEscalated.get(g._id) ?? 0,
      }))
      .sort(
        (a, b) =>
          b.windowEscalated - a.windowEscalated ||
          b.escalated - a.escalated ||
          b.used - a.used,
      )
      .slice(0, 5)
      .filter((g) => g.used > 0 || g.windowEscalated > 0);

    const baselineTriggerCounts: Record<string, number> = {};
    for (const c of escalatedConversations) {
      const t = c.baselineTrigger;
      if (typeof t === "string" && t.length > 0) {
        baselineTriggerCounts[t] = (baselineTriggerCounts[t] ?? 0) + 1;
      }
    }

    const offerAccepted = inScope.filter(
      (c) => c.offerState === "accepted",
    ).length;
    const offerDeclined = inScope.filter(
      (c) => c.offerState === "declined",
    ).length;
    const offerOffered = inScope.filter(
      (c) => c.offerState != null && c.offerState !== "none",
    ).length;

    return {
      window,
      totalConversations: total,
      endedConversations: total,
      resolvedCount: resolved,
      escalatedCount: escalated,
      escalationRate,
      reasonBreakdown,
      topRules,
      topGuidance,
      baselineTriggerCounts,
      offerStats: {
        offered: offerOffered,
        accepted: offerAccepted,
        declined: offerDeclined,
      },
    };
  },
});
