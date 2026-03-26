"use client";

import { Button, Card, Chip } from "@heroui/react";
import {
  Globe,
  FileText,
  Phone,
  MessageSquare,
  Plus,
  ArrowRight,
  Database,
} from "lucide-react";
import Link from "next/link";

const sources = [
  {
    type: "website",
    label: "Websites",
    icon: Globe,
    description: "Crawl your website and extract content to build your agent's knowledge base.",
    count: 0,
    href: "/ingest/websites",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    type: "document",
    label: "Documents",
    icon: FileText,
    description: "Upload PDFs, Word docs, and spreadsheets for your agent to learn from.",
    count: 0,
    href: "/ingest/documents",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    type: "call",
    label: "Call Recordings",
    icon: Phone,
    description: "Import call recordings to extract intents and conversation patterns.",
    count: 0,
    href: "/ingest/calls",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    type: "whatsapp",
    label: "WhatsApp Conversations",
    icon: MessageSquare,
    description: "Import existing WhatsApp chats to train your agent on real interactions.",
    count: 0,
    href: "/ingest/whatsapp",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
];

export default function IngestPage() {
  const totalSources = sources.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="h-5 w-5 text-accent" />
            <h1 className="text-xl font-bold text-foreground">Knowledge Sources</h1>
          </div>
          <p className="text-sm text-muted">
            Add data sources for your agent to learn from. The more data you provide, the smarter your agent becomes.
          </p>
        </div>
        <Chip size="sm" variant="soft">
          {totalSources} sources
        </Chip>
      </div>

      <div className="grid gap-4">
        {sources.map((source) => (
          <Link key={source.type} href={source.href}>
            <Card className="p-5 transition-shadow hover:shadow-lg cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${source.bgColor}`}>
                  <source.icon className={`h-5 w-5 ${source.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{source.label}</p>
                    {source.count > 0 && (
                      <Chip size="sm" variant="soft" color="success">
                        {source.count} added
                      </Chip>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{source.description}</p>
                </div>
                <Button size="sm" variant="outline">
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
