"use client";

import { Button, Card, Chip, Tabs } from "@heroui/react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Bot,
  Brain,
  Phone,
} from "lucide-react";

interface MetricCard {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ElementType;
}

const metrics: MetricCard[] = [
  { label: "Total Conversations", value: "1,247", change: "+12%", trend: "up", icon: MessageSquare },
  { label: "Resolution Rate", value: "89%", change: "+3%", trend: "up", icon: CheckCircle2 },
  { label: "Avg Response Time", value: "1.2s", change: "-0.3s", trend: "up", icon: Clock },
  { label: "Human Handoffs", value: "138", change: "-8%", trend: "up", icon: Users },
];

interface ConversationLog {
  id: string;
  customer: string;
  intent: string;
  status: "resolved" | "escalated" | "ongoing";
  messages: number;
  duration: string;
  time: string;
}

const recentConversations: ConversationLog[] = [
  {
    id: "1",
    customer: "+91 98765 43210",
    intent: "Appointment Booking",
    status: "resolved",
    messages: 8,
    duration: "2m 15s",
    time: "10 minutes ago",
  },
  {
    id: "2",
    customer: "+91 87654 32109",
    intent: "Pricing Inquiry",
    status: "resolved",
    messages: 5,
    duration: "1m 30s",
    time: "25 minutes ago",
  },
  {
    id: "3",
    customer: "+91 76543 21098",
    intent: "Refund Request",
    status: "escalated",
    messages: 12,
    duration: "5m 42s",
    time: "1 hour ago",
  },
  {
    id: "4",
    customer: "+91 65432 10987",
    intent: "Product Support",
    status: "ongoing",
    messages: 3,
    duration: "45s",
    time: "Just now",
  },
];

const topIntents = [
  { name: "Appointment Booking", count: 342, percentage: 27 },
  { name: "Pricing Inquiry", count: 289, percentage: 23 },
  { name: "General FAQ", count: 256, percentage: 21 },
  { name: "Product Support", count: 198, percentage: 16 },
  { name: "Refund Request", count: 162, percentage: 13 },
];

const statusConfig = {
  resolved: { label: "Resolved", color: "success" as const },
  escalated: { label: "Escalated", color: "warning" as const },
  ongoing: { label: "Ongoing", color: "default" as const },
};

export default function AnalyzePage() {
  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-5 w-5 text-accent" />
            <h1 className="text-xl font-bold text-foreground">Analytics</h1>
          </div>
          <p className="text-sm text-muted">
            Monitor your agent&apos;s performance and review conversation logs.
          </p>
        </div>
        <Tabs defaultSelectedKey="7d">
          <Tabs.ListContainer>
            <Tabs.List aria-label="Time range">
              <Tabs.Tab id="24h">24h<Tabs.Indicator /></Tabs.Tab>
              <Tabs.Tab id="7d">7 days<Tabs.Indicator /></Tabs.Tab>
              <Tabs.Tab id="30d">30 days<Tabs.Indicator /></Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </div>

      {/* Metric cards */}
      <div className="mb-8 grid grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-4 w-4 text-muted" />
                <div className={`flex items-center gap-0.5 text-xs font-medium ${
                  metric.trend === "up" ? "text-success" : "text-danger"
                }`}>
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {metric.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{metric.value}</p>
              <p className="text-xs text-muted">{metric.label}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent conversations */}
        <div className="col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Conversations</h2>
            <Button size="sm" variant="ghost">View all</Button>
          </div>
          <Card className="divide-y divide-separator">
            {recentConversations.map((conv) => {
              const status = statusConfig[conv.status];
              return (
                <div key={conv.id} className="flex items-center gap-4 p-4 hover:bg-default/50 transition-colors cursor-pointer">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-default shrink-0">
                    <Phone className="h-4 w-4 text-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{conv.customer}</p>
                      <Chip size="sm" variant="soft" color={status.color}>{status.label}</Chip>
                    </div>
                    <p className="text-xs text-muted">
                      {conv.intent} &middot; {conv.messages} messages &middot; {conv.duration}
                    </p>
                  </div>
                  <span className="text-xs text-muted shrink-0">{conv.time}</span>
                </div>
              );
            })}
          </Card>
        </div>

        {/* Top intents */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Top Intents</h2>
          </div>
          <Card className="p-4">
            <div className="space-y-4">
              {topIntents.map((intent) => (
                <div key={intent.name}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-foreground">{intent.name}</p>
                    <span className="text-xs text-muted">{intent.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-default overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${intent.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick stats */}
          <Card className="mt-4 p-4">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Agent Performance</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-3.5 w-3.5 text-accent" />
                  <span className="text-xs text-foreground">Auto-resolved</span>
                </div>
                <span className="text-sm font-semibold text-foreground">89%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-3.5 w-3.5 text-purple-600" />
                  <span className="text-xs text-foreground">Intent accuracy</span>
                </div>
                <span className="text-sm font-semibold text-foreground">94%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-warning" />
                  <span className="text-xs text-foreground">Escalation rate</span>
                </div>
                <span className="text-sm font-semibold text-foreground">11%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
