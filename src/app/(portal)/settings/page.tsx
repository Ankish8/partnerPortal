"use client";

import { Button, Card, Input, Separator, Switch, TextArea } from "@heroui/react";
import {
  Workflow,
  Bot,
  MessageSquare,
  Globe,
  Clock,
  Shield,
  Save,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Workflow className="h-5 w-5 text-accent" />
          <h1 className="text-xl font-bold text-foreground">Bot Settings</h1>
        </div>
        <p className="text-sm text-muted">
          Configure your agent&apos;s personality, behavior, and default responses.
        </p>
      </div>

      <div className="space-y-6">
        {/* Bot identity */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground">Agent Identity</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Agent Name</label>
              <Input placeholder="e.g., Support Assistant" defaultValue="Partner Bot" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Welcome Message</label>
              <TextArea
                placeholder="First message when a customer starts a conversation"
                defaultValue="Hello! I'm your support assistant. How can I help you today?"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Personality & Tone</label>
              <TextArea
                placeholder="Describe how your agent should communicate"
                defaultValue="Be friendly and professional. Use simple language. Always be helpful and patient."
              />
              <p className="mt-1 text-xs text-muted">
                This guides how your agent responds — similar to Intercom&apos;s Guidance feature.
              </p>
            </div>
          </div>
        </Card>

        {/* Language */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground">Language</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Primary Language</label>
              <Input defaultValue="English" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Auto-detect language</p>
                <p className="text-xs text-muted">Respond in the customer&apos;s language when possible</p>
              </div>
              <Switch defaultSelected size="sm" />
            </div>
          </div>
        </Card>

        {/* Escalation */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground">Escalation Rules</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Auto-escalate on sensitive content</p>
                <p className="text-xs text-muted">Hand off to human when sensitive topics are detected</p>
              </div>
              <Switch defaultSelected size="sm" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Escalate after failed attempts</p>
                <p className="text-xs text-muted">Hand off if agent can&apos;t resolve after 3 attempts</p>
              </div>
              <Switch defaultSelected size="sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Escalation Message</label>
              <TextArea
                placeholder="Message shown when handing off to human"
                defaultValue="I'm connecting you with a human agent who can better assist you. Please hold on."
              />
            </div>
          </div>
        </Card>

        {/* Operating hours */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground">Operating Hours</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">24/7 Availability</p>
                <p className="text-xs text-muted">Agent responds at all times</p>
              </div>
              <Switch defaultSelected size="sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">After-hours Message</label>
              <TextArea
                placeholder="Message shown outside business hours"
                defaultValue="We're currently outside business hours. I'll do my best to help, but a human agent will follow up during business hours if needed."
              />
            </div>
          </div>
        </Card>

        {/* Save */}
        <div className="flex justify-end">
          <Button>
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
