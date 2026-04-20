"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Rocket, Copy, Phone, Key, AlertCircle } from "lucide-react";
import { ContentPanel } from "@/components/layout/content-panel";

const deploymentSteps = [
  { title: "Connect WhatsApp Business API", description: "Link your WhatsApp Business account.", fields: [
    { label: "Phone Number ID", placeholder: "Enter your Phone Number ID" },
    { label: "Access Token", placeholder: "Enter your permanent access token" },
  ]},
  { title: "Configure Webhook", description: "Set up the webhook URL in your WhatsApp Business settings.", webhookUrl: "https://api.partner-portal.com/webhook/whatsapp/abc123", verifyToken: "pp_verify_token_abc123" },
  { title: "Test Connection", description: "Send a test message to verify everything is working." },
  { title: "Go Live", description: "Deploy your agent and start handling real customer conversations." },
];

export default function DeployPage() {
  return (
    <ContentPanel>
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Rocket className="h-5 w-5 text-primary" />
          <h1 className="font-serif text-[28px] leading-[1.2] tracking-[-0.03em]">Deploy to WhatsApp</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Connect your WhatsApp Business account and deploy your AI agent.
        </p>
      </div>

      <Card className="mb-6 border-l-4 border-l-amber-400 bg-amber-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium">Agent not deployed</p>
              <p className="text-xs text-muted-foreground">Complete the steps below to deploy your agent.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {deploymentSteps.map((step, i) => (
          <Card key={step.title}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center shrink-0">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-muted-foreground/30">
                    <span className="text-xs font-semibold text-muted-foreground">{i + 1}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{step.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>

                  {step.fields && (
                    <div className="mt-4 space-y-3">
                      {step.fields.map((field) => (
                        <div key={field.label}>
                          <label className="text-xs font-medium mb-1 block">{field.label}</label>
                          <Input placeholder={field.placeholder} />
                        </div>
                      ))}
                      <Button size="sm"><Key className="h-3.5 w-3.5 mr-1" /> Connect Account</Button>
                    </div>
                  )}

                  {step.webhookUrl && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="text-xs font-medium mb-1 block">Webhook URL</label>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 rounded-lg bg-muted px-3 py-2 text-xs font-mono">{step.webhookUrl}</code>
                          <Button size="icon" variant="outline"><Copy className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block">Verify Token</label>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 rounded-lg bg-muted px-3 py-2 text-xs font-mono">{step.verifyToken}</code>
                          <Button size="icon" variant="outline"><Copy className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {step.title === "Test Connection" && (
                    <div className="mt-4">
                      <Button size="sm" variant="outline"><Phone className="h-3.5 w-3.5 mr-1" /> Send Test Message</Button>
                    </div>
                  )}

                  {step.title === "Go Live" && (
                    <div className="mt-4">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Rocket className="h-3.5 w-3.5 mr-1" /> Deploy Agent
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </ContentPanel>
  );
}
