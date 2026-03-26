"use client";

import { Button, Card, Chip, Input } from "@heroui/react";
import {
  Brain,
  Plus,
  MoreHorizontal,
  Phone,
  MessageSquare,
  FileText,
  Pencil,
  Trash2,
  Search,
} from "lucide-react";
import { useState } from "react";

interface Intent {
  id: string;
  name: string;
  description: string;
  source: "call" | "whatsapp" | "manual";
  flowLinked: boolean;
  sampleQueries: string[];
  confidence: number;
}

const mockIntents: Intent[] = [
  {
    id: "1",
    name: "Appointment Booking",
    description: "Customer wants to schedule, reschedule, or cancel an appointment.",
    source: "call",
    flowLinked: true,
    sampleQueries: ["I want to book an appointment", "Can I reschedule?", "Cancel my booking"],
    confidence: 92,
  },
  {
    id: "2",
    name: "Pricing Inquiry",
    description: "Customer asks about pricing, plans, or cost details.",
    source: "whatsapp",
    flowLinked: true,
    sampleQueries: ["How much does it cost?", "What are your plans?", "Is there a free trial?"],
    confidence: 88,
  },
  {
    id: "3",
    name: "Product Support",
    description: "Customer needs help with a product issue or question.",
    source: "call",
    flowLinked: false,
    sampleQueries: ["My product isn't working", "How do I set this up?", "I need help with..."],
    confidence: 85,
  },
  {
    id: "4",
    name: "Refund Request",
    description: "Customer wants to request a refund or return.",
    source: "whatsapp",
    flowLinked: false,
    sampleQueries: ["I want a refund", "Return policy?", "How to return my order"],
    confidence: 79,
  },
  {
    id: "5",
    name: "General FAQ",
    description: "Customer asks general questions about the business.",
    source: "manual",
    flowLinked: true,
    sampleQueries: ["What are your hours?", "Where are you located?", "Do you deliver?"],
    confidence: 95,
  },
];

const sourceIcons = {
  call: Phone,
  whatsapp: MessageSquare,
  manual: FileText,
};

const sourceLabels = {
  call: "Call Recording",
  whatsapp: "WhatsApp",
  manual: "Manual",
};

export default function IntentsPage() {
  const [search, setSearch] = useState("");

  const filtered = mockIntents.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="h-5 w-5 text-purple-600" />
            <h1 className="text-xl font-bold text-foreground">Intents</h1>
          </div>
          <p className="text-sm text-muted">
            Intents represent what your customers want. They&apos;re auto-detected from your data or created manually.
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5" />
          Add Intent
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Search intents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Intent list */}
      <div className="space-y-3">
        {filtered.map((intent) => {
          const SourceIcon = sourceIcons[intent.source];
          return (
            <Card key={intent.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 shrink-0">
                  <Brain className="h-4.5 w-4.5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">{intent.name}</p>
                    <Chip
                      size="sm"
                      variant="soft"
                      color={intent.flowLinked ? "success" : "default"}
                    >
                      {intent.flowLinked ? "Flow linked" : "No flow"}
                    </Chip>
                    <Chip size="sm" variant="soft">
                      <SourceIcon className="h-3 w-3" /> {sourceLabels[intent.source]}
                    </Chip>
                  </div>
                  <p className="text-xs text-muted mb-2">{intent.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {intent.sampleQueries.map((q) => (
                      <span
                        key={q}
                        className="inline-block rounded-md bg-default px-2 py-0.5 text-xs text-muted"
                      >
                        &quot;{q}&quot;
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-muted">Confidence</p>
                    <p className="text-sm font-semibold text-foreground">{intent.confidence}%</p>
                  </div>
                  <Button size="sm" variant="ghost" isIconOnly>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
