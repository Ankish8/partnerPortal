"use client";

import { Button, Card, Chip, Input, Separator } from "@heroui/react";
import {
  Rocket,
  MessageSquare,
  CheckCircle2,
  Circle,
  ExternalLink,
  Copy,
  Phone,
  Key,
  Globe,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

const deploymentSteps = [
  {
    title: "Connect WhatsApp Business API",
    description: "Link your WhatsApp Business account to enable agent messaging.",
    completed: false,
    fields: [
      { label: "Phone Number ID", placeholder: "Enter your Phone Number ID" },
      { label: "Access Token", placeholder: "Enter your permanent access token" },
    ],
  },
  {
    title: "Configure Webhook",
    description: "Set up the webhook URL in your WhatsApp Business settings.",
    completed: false,
    webhookUrl: "https://api.partner-portal.com/webhook/whatsapp/abc123",
    verifyToken: "pp_verify_token_abc123",
  },
  {
    title: "Test Connection",
    description: "Send a test message to verify everything is working.",
    completed: false,
  },
  {
    title: "Go Live",
    description: "Deploy your agent and start handling real customer conversations.",
    completed: false,
  },
];

export default function DeployPage() {
  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Rocket className="h-5 w-5 text-accent" />
          <h1 className="text-xl font-bold text-foreground">Deploy to WhatsApp</h1>
        </div>
        <p className="text-sm text-muted">
          Connect your WhatsApp Business account and deploy your AI agent to start handling customer conversations.
        </p>
      </div>

      {/* Status card */}
      <Card className="mb-6 p-4 bg-warning/5 border-l-4 border-l-warning">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-warning" />
          <div>
            <p className="text-sm font-medium text-foreground">Agent not deployed</p>
            <p className="text-xs text-muted">Complete the steps below to deploy your agent to WhatsApp.</p>
          </div>
        </div>
      </Card>

      {/* Deployment steps */}
      <div className="space-y-4">
        {deploymentSteps.map((step, i) => (
          <Card key={step.title} className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center shrink-0">
                {step.completed ? (
                  <CheckCircle2 className="h-6 w-6 text-success" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-default">
                    <span className="text-xs font-semibold text-muted">{i + 1}</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <p className="mt-0.5 text-xs text-muted">{step.description}</p>

                {step.fields && (
                  <div className="mt-4 space-y-3">
                    {step.fields.map((field) => (
                      <div key={field.label}>
                        <label className="text-xs font-medium text-foreground mb-1 block">
                          {field.label}
                        </label>
                        <Input placeholder={field.placeholder} />
                      </div>
                    ))}
                    <Button size="sm">
                      <Key className="h-3.5 w-3.5" />
                      Connect Account
                    </Button>
                  </div>
                )}

                {step.webhookUrl && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Webhook URL
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 rounded-lg bg-default px-3 py-2 text-xs font-mono text-foreground">
                          {step.webhookUrl}
                        </code>
                        <Button size="sm" variant="outline" isIconOnly>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Verify Token
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 rounded-lg bg-default px-3 py-2 text-xs font-mono text-foreground">
                          {step.verifyToken}
                        </code>
                        <Button size="sm" variant="outline" isIconOnly>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {step.title === "Test Connection" && (
                  <div className="mt-4">
                    <Button size="sm" variant="outline">
                      <Phone className="h-3.5 w-3.5" />
                      Send Test Message
                    </Button>
                  </div>
                )}

                {step.title === "Go Live" && (
                  <div className="mt-4">
                    <Button size="sm" className="bg-success text-success-foreground">
                      <Rocket className="h-3.5 w-3.5" />
                      Deploy Agent
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
