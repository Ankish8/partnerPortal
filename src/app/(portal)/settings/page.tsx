"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Workflow, Bot, Globe, Clock, Save } from "lucide-react";
import { ContentPanel } from "@/components/layout/content-panel";

export default function SettingsPage() {
  return (
    <ContentPanel>
    <div className="mx-auto max-w-3xl px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Workflow className="h-5 w-5 text-primary" />
          <h1 className="font-serif text-[28px] leading-[1.2] tracking-[-0.03em]">Bot Settings</h1>
        </div>
        <p className="text-sm text-muted-foreground">Configure your agent&apos;s personality, behavior, and default responses.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4"><Bot className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold">Agent Identity</h2></div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1 block">Agent Name</label>
                <Input placeholder="e.g., Support Assistant" defaultValue="Partner Bot" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Welcome Message</label>
                <Textarea placeholder="First message when a customer starts a conversation" defaultValue="Hello! I'm your support assistant. How can I help you today?" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Personality & Tone</label>
                <Textarea placeholder="Describe how your agent should communicate" defaultValue="Be friendly and professional. Use simple language. Always be helpful and patient." />
                <p className="mt-1 text-xs text-muted-foreground">This guides how your agent responds.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4"><Globe className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold">Language</h2></div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1 block">Primary Language</label>
                <Input defaultValue="English" />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm">Auto-detect language</p><p className="text-xs text-muted-foreground">Respond in the customer&apos;s language when possible</p></div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4"><Clock className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold">Operating Hours</h2></div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm">24/7 Availability</p><p className="text-xs text-muted-foreground">Agent responds at all times</p></div>
                <Switch defaultChecked />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">After-hours Message</label>
                <Textarea defaultValue="We're currently outside business hours. I'll do my best to help, but a human agent will follow up during business hours if needed." />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button><Save className="h-4 w-4 mr-1" /> Save Settings</Button>
        </div>
      </div>
    </div>
    </ContentPanel>
  );
}
