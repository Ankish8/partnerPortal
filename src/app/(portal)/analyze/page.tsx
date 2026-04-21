"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  UserCog,
  HandHelping,
  Bot,
  Shield,
  Sparkles,
} from "lucide-react";
import { ContentPanel } from "@/components/layout/content-panel";
import { cn } from "@/lib/utils";
import { baselineReasonLabel, isBaselineTrigger } from "@/lib/escalation-decision";
import { modeLabel, type GuidanceMode } from "@/components/train/escalation-meta-selects";
import { api } from "../../../../convex/_generated/api";

type Window = "24h" | "7d" | "30d" | "all";

const WINDOW_LABELS: Record<Window, string> = {
  "24h": "24h",
  "7d": "7 days",
  "30d": "30 days",
  all: "All time",
};

const SOURCE_META = {
  baseline: {
    label: "Baseline signal",
    icon: Shield,
    color: "bg-sky-500",
    tint: "bg-sky-500/15",
    accent: "text-sky-700",
  },
  rule: {
    label: "Rule match",
    icon: AlertCircle,
    color: "bg-amber-500",
    tint: "bg-amber-500/15",
    accent: "text-amber-700",
  },
  guidance: {
    label: "Guidance match",
    icon: Sparkles,
    color: "bg-violet-500",
    tint: "bg-violet-500/15",
    accent: "text-violet-700",
  },
  offer_accepted: {
    label: "Offer accepted",
    icon: HandHelping,
    color: "bg-emerald-500",
    tint: "bg-emerald-500/15",
    accent: "text-emerald-700",
  },
} as const;

const SOURCE_META_KEYS = Object.keys(SOURCE_META) as Array<
  keyof typeof SOURCE_META
>;

function formatPercent(n: number): string {
  if (!Number.isFinite(n)) return "0%";
  return `${Math.round(n * 100)}%`;
}

export default function AnalyzePage() {
  const [window, setWindow] = useState<Window>("7d");
  const metrics = useQuery(api.analytics.getEscalationMetrics, { window });
  const loading = metrics === undefined;

  const reasonTotal = metrics
    ? metrics.reasonBreakdown.baseline +
      metrics.reasonBreakdown.rule +
      metrics.reasonBreakdown.guidance +
      metrics.reasonBreakdown.offer_accepted
    : 0;

  return (
    <ContentPanel>
      <div className="mx-auto max-w-6xl px-8 py-10">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h1 className="font-serif text-[28px] leading-[1.2] tracking-[-0.03em]">
                Analytics
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Monitor escalation outcomes and where handoffs are coming from.
            </p>
          </div>
          <Tabs
            value={window}
            onValueChange={(v) => setWindow((v as Window) ?? "7d")}
          >
            <TabsList>
              <TabsTrigger value="24h">24h</TabsTrigger>
              <TabsTrigger value="7d">7 days</TabsTrigger>
              <TabsTrigger value="30d">30 days</TabsTrigger>
              <TabsTrigger value="all">All time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="mb-8 grid grid-cols-4 gap-4">
          <KpiTile
            icon={MessageSquare}
            label="Total conversations"
            value={
              loading ? "—" : metrics.totalConversations.toLocaleString()
            }
            hint={
              loading
                ? undefined
                : `${metrics.endedConversations} ended`
            }
          />
          <KpiTile
            icon={CheckCircle2}
            label="Resolved"
            value={loading ? "—" : metrics.resolvedCount.toLocaleString()}
            hint={
              loading || metrics.endedConversations === 0
                ? undefined
                : `${formatPercent(
                    metrics.resolvedCount / metrics.endedConversations,
                  )} of ended`
            }
            accent="text-emerald-600"
          />
          <KpiTile
            icon={UserCog}
            label="Escalated"
            value={loading ? "—" : metrics.escalatedCount.toLocaleString()}
            hint={
              loading || metrics.endedConversations === 0
                ? undefined
                : `${formatPercent(metrics.escalationRate)} escalation rate`
            }
            accent="text-amber-600"
          />
          <KpiTile
            icon={HandHelping}
            label="Offers extended"
            value={
              loading ? "—" : metrics.offerStats.offered.toLocaleString()
            }
            hint={
              loading
                ? undefined
                : metrics.offerStats.offered > 0
                  ? `${metrics.offerStats.accepted} accepted · ${metrics.offerStats.declined} declined`
                  : "No offers yet"
            }
          />
        </div>

        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              Escalation source breakdown
            </h2>
            <span className="text-xs text-muted-foreground">
              {WINDOW_LABELS[window]}
            </span>
          </div>
          <Card>
            <CardContent className="p-5">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : reasonTotal === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No escalations in this window yet.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                    {SOURCE_META_KEYS.map((key) => {
                      const value = metrics.reasonBreakdown[key];
                      if (value === 0) return null;
                      const pct = (value / reasonTotal) * 100;
                      return (
                        <div
                          key={key}
                          className={cn("h-full", SOURCE_META[key].color)}
                          style={{ width: `${pct}%` }}
                          title={`${SOURCE_META[key].label}: ${value}`}
                        />
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {SOURCE_META_KEYS.map((key) => {
                      const meta = SOURCE_META[key];
                      const Icon = meta.icon;
                      const value = metrics.reasonBreakdown[key];
                      const pct =
                        reasonTotal > 0 ? value / reasonTotal : 0;
                      return (
                        <div
                          key={key}
                          className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-background p-3"
                        >
                          <div
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                              meta.tint,
                            )}
                          >
                            <Icon className={cn("h-3.5 w-3.5", meta.accent)} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-muted-foreground">
                              {meta.label}
                            </p>
                            <p className="text-lg font-semibold leading-tight">
                              {value}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {formatPercent(pct)} of escalations
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Top triggering rules</h2>
              <span className="text-xs text-muted-foreground">
                {WINDOW_LABELS[window]}
              </span>
            </div>
            <Card>
              {loading ? (
                <CardContent className="p-5 text-sm text-muted-foreground">
                  Loading…
                </CardContent>
              ) : metrics.topRules.length === 0 ? (
                <CardContent className="p-5 text-sm text-muted-foreground">
                  No rule matches in this window.
                </CardContent>
              ) : (
                <div className="divide-y">
                  {metrics.topRules.map((rule) => (
                    <div
                      key={rule.ruleId}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="truncate text-sm font-medium">
                          {rule.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {rule.matched} match
                          {rule.matched === 1 ? "" : "es"} lifetime ·{" "}
                          {rule.windowEscalated} escalated in window
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {rule.windowEscalated}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Top guidance matches</h2>
              <span className="text-xs text-muted-foreground">
                {WINDOW_LABELS[window]}
              </span>
            </div>
            <Card>
              {loading ? (
                <CardContent className="p-5 text-sm text-muted-foreground">
                  Loading…
                </CardContent>
              ) : metrics.topGuidance.length === 0 ? (
                <CardContent className="p-5 text-sm text-muted-foreground">
                  No guidance activity in this window.
                </CardContent>
              ) : (
                <div className="divide-y">
                  {metrics.topGuidance.map((g) => (
                    <div
                      key={g.guidanceId}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium">
                            {g.title}
                          </p>
                          <Badge
                            variant="outline"
                            className="shrink-0 !text-[10.5px] !py-0 !px-1.5 !h-[18px]"
                          >
                            {modeLabel(g.mode as GuidanceMode)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {g.used} use{g.used === 1 ? "" : "s"} lifetime ·{" "}
                          {g.windowEscalated} escalated in window
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {g.windowEscalated}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Baseline trigger mix</h2>
            <span className="text-xs text-muted-foreground">
              {WINDOW_LABELS[window]}
            </span>
          </div>
          <Card>
            <CardContent className="p-5">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : Object.keys(metrics.baselineTriggerCounts).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No baseline-driven escalations in this window.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {Object.entries(metrics.baselineTriggerCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([trigger, count]) => {
                      const label = isBaselineTrigger(trigger)
                        ? baselineReasonLabel(trigger)
                        : trigger;
                      return (
                        <div
                          key={trigger}
                          className="flex items-center justify-between rounded-lg border border-border/50 bg-background px-3 py-2.5"
                        >
                          <div className="flex items-center gap-2.5">
                            <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                            <p className="text-sm">{label}</p>
                          </div>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ContentPanel>
  );
}

function KpiTile({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <Icon className={cn("h-4 w-4", accent ?? "text-muted-foreground")} />
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {hint && (
          <p className="mt-1 text-[11px] text-muted-foreground/80">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
}

