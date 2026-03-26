"use client";

import { Card, Chip } from "@heroui/react";
import {
  Settings2,
  Brain,
  GitBranch,
  BookOpen,
  Tags,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const configSections = [
  {
    label: "Intents",
    description: "Define what your agent can understand and respond to. Intents are detected from your ingested data.",
    icon: Brain,
    href: "/configure/intents",
    count: 5,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    label: "Conversation Flows",
    description: "Build step-by-step conversation flows with inform, collect, and action steps.",
    icon: GitBranch,
    href: "/configure/flows",
    count: 3,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    label: "Knowledge Base",
    description: "Review and manage the extracted knowledge your agent uses to answer questions.",
    icon: BookOpen,
    href: "/configure/knowledge",
    count: 142,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    label: "Tags & Sensitivity",
    description: "Manage content tags and mark sensitive information that requires human review.",
    icon: Tags,
    href: "/configure/tags",
    count: 8,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
];

export default function ConfigurePage() {
  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Settings2 className="h-5 w-5 text-accent" />
          <h1 className="text-xl font-bold text-foreground">Configure Agent</h1>
        </div>
        <p className="text-sm text-muted">
          Set up your agent&apos;s behavior, conversation flows, and knowledge base.
        </p>
      </div>

      <div className="grid gap-4">
        {configSections.map((section) => (
          <Link key={section.label} href={section.href}>
            <Card className="p-5 transition-shadow hover:shadow-lg cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${section.bgColor}`}>
                  <section.icon className={`h-5 w-5 ${section.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{section.label}</p>
                    <Chip size="sm" variant="soft">{section.count}</Chip>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{section.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
