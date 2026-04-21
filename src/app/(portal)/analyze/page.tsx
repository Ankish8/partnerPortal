"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3, TrendingUp, TrendingDown, Users, MessageSquare, Clock,
  CheckCircle2, AlertCircle, Bot, Brain, Phone,
} from "lucide-react";
import { ContentPanel } from "@/components/layout/content-panel";

const metrics = [
  { label: "Total Conversations", value: "1,247", change: "+12%", trend: "up" as const, icon: MessageSquare },
  { label: "Resolution Rate", value: "89%", change: "+3%", trend: "up" as const, icon: CheckCircle2 },
  { label: "Avg Response Time", value: "1.2s", change: "-0.3s", trend: "up" as const, icon: Clock },
  { label: "Human Handoffs", value: "138", change: "-8%", trend: "up" as const, icon: Users },
];

const recentConversations = [
  { id: "1", customer: "+91 98765 43210", intent: "Appointment Booking", status: "resolved" as const, messages: 8, duration: "2m 15s", time: "10 minutes ago" },
  { id: "2", customer: "+91 87654 32109", intent: "Pricing Inquiry", status: "resolved" as const, messages: 5, duration: "1m 30s", time: "25 minutes ago" },
  { id: "3", customer: "+91 76543 21098", intent: "Refund Request", status: "escalated" as const, messages: 12, duration: "5m 42s", time: "1 hour ago" },
  { id: "4", customer: "+91 65432 10987", intent: "Product Support", status: "ongoing" as const, messages: 3, duration: "45s", time: "Just now" },
];

const topIntents = [
  { name: "Appointment Booking", count: 342, percentage: 27 },
  { name: "Pricing Inquiry", count: 289, percentage: 23 },
  { name: "General FAQ", count: 256, percentage: 21 },
  { name: "Product Support", count: 198, percentage: 16 },
  { name: "Refund Request", count: 162, percentage: 13 },
];

const statusVariant = {
  resolved: "success",
  escalated: "outline",
  ongoing: "outline",
} as const;

export default function AnalyzePage() {
  return (
    <ContentPanel>
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h1 className="font-serif text-[28px] leading-[1.2] tracking-[-0.03em]">Analytics</h1>
          </div>
          <p className="text-sm text-muted-foreground">Monitor your agent&apos;s performance and review conversations.</p>
        </div>
        <Tabs defaultValue="7d">
          <TabsList>
            <TabsTrigger value="24h">24h</TabsTrigger>
            <TabsTrigger value="7d">7 days</TabsTrigger>
            <TabsTrigger value="30d">30 days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mb-8 grid grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className={`flex items-center gap-0.5 text-xs font-medium ${metric.trend === "up" ? "text-emerald-600" : "text-red-600"}`}>
                    {metric.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {metric.change}
                  </div>
                </div>
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent Conversations</h2>
            <Button size="sm" variant="ghost">View all</Button>
          </div>
          <Card>
            <div className="divide-y">
              {recentConversations.map((conv) => (
                <div key={conv.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted shrink-0">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{conv.customer}</p>
                      <Badge variant={statusVariant[conv.status]}>{conv.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {conv.intent} &middot; {conv.messages} messages &middot; {conv.duration}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{conv.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <div className="mb-3"><h2 className="text-sm font-semibold">Top Intents</h2></div>
          <Card>
            <CardContent className="p-4 space-y-4">
              {topIntents.map((intent) => (
                <div key={intent.name}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium">{intent.name}</p>
                    <span className="text-xs text-muted-foreground">{intent.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${intent.percentage}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardContent className="p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Agent Performance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Bot className="h-3.5 w-3.5 text-primary" /><span className="text-xs">Auto-resolved</span></div>
                  <span className="text-sm font-semibold">89%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Brain className="h-3.5 w-3.5 text-purple-600" /><span className="text-xs">Intent accuracy</span></div>
                  <span className="text-sm font-semibold">94%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><AlertCircle className="h-3.5 w-3.5 text-amber-600" /><span className="text-xs">Escalation rate</span></div>
                  <span className="text-sm font-semibold">11%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </ContentPanel>
  );
}
