"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Plus, MessageCircle, ClipboardList, Zap, MoreHorizontal, Pencil } from "lucide-react";
import { ContentPanel } from "@/components/layout/content-panel";

interface FlowStep { id: string; type: "inform" | "collect" | "action"; label: string; detail: string }
interface Flow { id: string; name: string; intent: string; steps: FlowStep[]; status: "draft" | "active"; lastEdited: string }

const mockFlows: Flow[] = [
  { id: "1", name: "Appointment Booking Flow", intent: "Appointment Booking", status: "active", lastEdited: "2 hours ago", steps: [
    { id: "s1", type: "inform", label: "Greeting", detail: "Welcome! I can help you book an appointment." },
    { id: "s2", type: "collect", label: "Preferred Date", detail: "Ask for preferred date and time" },
    { id: "s3", type: "collect", label: "Service Type", detail: "Ask which service they need" },
    { id: "s4", type: "action", label: "Book in Calendar", detail: "Create event in Google Calendar via Composio" },
    { id: "s5", type: "inform", label: "Confirmation", detail: "Confirm booking details with customer" },
  ]},
  { id: "2", name: "Pricing Inquiry Flow", intent: "Pricing Inquiry", status: "active", lastEdited: "1 day ago", steps: [
    { id: "s1", type: "inform", label: "Pricing Overview", detail: "Share pricing tiers and plans" },
    { id: "s2", type: "collect", label: "Team Size", detail: "Ask how many users/seats needed" },
    { id: "s3", type: "inform", label: "Recommendation", detail: "Suggest best plan based on needs" },
  ]},
  { id: "3", name: "General FAQ Flow", intent: "General FAQ", status: "draft", lastEdited: "3 days ago", steps: [
    { id: "s1", type: "inform", label: "Answer", detail: "Look up answer from knowledge base" },
    { id: "s2", type: "collect", label: "Follow-up", detail: "Ask if they need anything else" },
  ]},
];

const stepTypeConfig = {
  inform: { icon: MessageCircle, label: "Inform", color: "text-blue-600", bg: "bg-blue-100" },
  collect: { icon: ClipboardList, label: "Collect", color: "text-amber-600", bg: "bg-amber-100" },
  action: { icon: Zap, label: "Action", color: "text-green-600", bg: "bg-green-100" },
};

export default function FlowsPage() {
  return (
    <ContentPanel>
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="h-5 w-5 text-blue-600" />
            <h1 className="font-serif text-[28px] leading-[1.2] tracking-[-0.03em]">Conversation Flows</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Design step-by-step conversation flows. Each flow handles one intent with inform, collect, and action steps.
          </p>
        </div>
        <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> Create Flow</Button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        {Object.entries(stepTypeConfig).map(([type, config]) => {
          const Icon = config.icon;
          return (
            <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className={`flex h-5 w-5 items-center justify-center rounded ${config.bg}`}><Icon className={`h-3 w-3 ${config.color}`} /></div>
              <span>{config.label}</span>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        {mockFlows.map((flow) => (
          <Card key={flow.id}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                    <GitBranch className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{flow.name}</p>
                    <p className="text-xs text-muted-foreground">Intent: {flow.intent} &middot; Edited {flow.lastEdited}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={flow.status === "active" ? "success" : "outline"}>{flow.status}</Badge>
                  <Button size="icon" variant="ghost"><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="ml-4 border-l-2 pl-4 space-y-0">
                {flow.steps.map((step) => {
                  const config = stepTypeConfig[step.type];
                  const Icon = config.icon;
                  return (
                    <div key={step.id} className="relative flex items-start gap-3 py-2">
                      <div className={`-ml-[23px] flex h-6 w-6 items-center justify-center rounded-full ${config.bg} shrink-0`}>
                        <Icon className={`h-3 w-3 ${config.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold">{step.label}</p>
                          <span className={`text-xs ${config.color}`}>{config.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{step.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </ContentPanel>
  );
}
