"use client";

import { Button, Card, Chip, ProgressBar } from "@heroui/react";
import {
  Database,
  Settings2,
  FlaskConical,
  Rocket,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Bot,
  Globe,
  FileText,
  Phone,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const steps = [
  {
    title: "Add Knowledge Sources",
    description: "Import websites, documents, call recordings, or WhatsApp conversations to train your agent.",
    href: "/ingest",
    icon: Database,
    completed: false,
  },
  {
    title: "Configure Intents & Flows",
    description: "Define what your agent can handle and build conversation flows with actions.",
    href: "/configure",
    icon: Settings2,
    completed: false,
  },
  {
    title: "Test Your Agent",
    description: "Preview your agent in a WhatsApp-style simulator before going live.",
    href: "/test",
    icon: FlaskConical,
    completed: false,
  },
  {
    title: "Deploy to WhatsApp",
    description: "Connect your WhatsApp Business account and deploy your agent.",
    href: "/deploy",
    icon: Rocket,
    completed: false,
  },
  {
    title: "Monitor & Optimize",
    description: "Track performance, review conversations, and improve your agent over time.",
    href: "/analyze",
    icon: BarChart3,
    completed: false,
  },
];

const sourceTypes = [
  { label: "Website", icon: Globe, description: "Crawl and index your website pages", href: "/ingest/websites" },
  { label: "Documents", icon: FileText, description: "Upload PDFs, docs, and spreadsheets", href: "/ingest/documents" },
  { label: "Call Recordings", icon: Phone, description: "Import and transcribe call recordings", href: "/ingest/calls" },
  { label: "WhatsApp Chats", icon: MessageSquare, description: "Import existing WhatsApp conversations", href: "/ingest/whatsapp" },
];

export default function GetStartedPage() {
  const completedSteps = steps.filter((s) => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      {/* Hero */}
      <div className="mb-10">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
            <Bot className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Build your AI WhatsApp Agent
            </h1>
            <p className="text-sm text-muted">
              Create intelligent agents from your business data in minutes.
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <Card className="mb-8 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold text-foreground">Setup Progress</span>
          </div>
          <Chip size="sm" variant="soft">
            {completedSteps} of {steps.length} complete
          </Chip>
        </div>
        <ProgressBar
          value={progress}
          aria-label="Setup progress"
          className="mb-4"
        />
        <div className="space-y-1">
          {steps.map((step, i) => (
            <Link
              key={step.title}
              href={step.href}
              className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-default"
            >
              <div className="flex h-6 w-6 items-center justify-center">
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-default">
                    <span className="text-xs font-medium text-muted">{i + 1}</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${step.completed ? "text-muted line-through" : "text-foreground"}`}>
                  {step.title}
                </p>
                <p className="text-xs text-muted">{step.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted" />
            </Link>
          ))}
        </div>
      </Card>

      {/* Quick add sources */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Quick Add Knowledge Source</h2>
        <Link href="/ingest" className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {sourceTypes.map((source) => (
          <Link key={source.label} href={source.href}>
            <Card className="p-4 transition-shadow hover:shadow-lg cursor-pointer h-full">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-default">
                <source.icon className="h-4.5 w-4.5 text-accent" />
              </div>
              <p className="text-sm font-semibold text-foreground">{source.label}</p>
              <p className="mt-1 text-xs text-muted">{source.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
