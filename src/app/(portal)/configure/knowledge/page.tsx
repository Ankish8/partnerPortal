"use client";

import { Button, Card, Chip, Input, Tabs } from "@heroui/react";
import {
  BookOpen,
  Search,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Shield,
  Globe,
  FileText,
  Phone,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  source: "website" | "document" | "call" | "whatsapp";
  sensitive: boolean;
  approved: boolean;
  tags: string[];
}

const mockItems: KnowledgeItem[] = [
  {
    id: "1",
    title: "Business Hours",
    content: "Our office is open Monday to Friday, 9 AM to 6 PM IST. Weekend support is available via email only.",
    source: "website",
    sensitive: false,
    approved: true,
    tags: ["hours", "general"],
  },
  {
    id: "2",
    title: "Pricing - Enterprise Plan",
    content: "Enterprise plan starts at $499/month with custom features, dedicated support, and SLA guarantees.",
    source: "document",
    sensitive: true,
    approved: false,
    tags: ["pricing", "enterprise"],
  },
  {
    id: "3",
    title: "Return Policy",
    content: "30-day return policy for all products. Refunds processed within 5-7 business days after receiving the return.",
    source: "website",
    sensitive: false,
    approved: true,
    tags: ["returns", "policy"],
  },
  {
    id: "4",
    title: "Customer Complaint Resolution",
    content: "When a customer escalates, transfer to human agent. Offer 10% discount for inconvenience if appropriate.",
    source: "call",
    sensitive: true,
    approved: false,
    tags: ["escalation", "complaints"],
  },
  {
    id: "5",
    title: "Product Setup Steps",
    content: "1. Download the app  2. Create account  3. Enter license key  4. Complete setup wizard.",
    source: "whatsapp",
    sensitive: false,
    approved: true,
    tags: ["setup", "product"],
  },
];

const sourceIcons = {
  website: Globe,
  document: FileText,
  call: Phone,
  whatsapp: MessageSquare,
};

export default function KnowledgePage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = mockItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase());
    if (filter === "sensitive") return matchesSearch && item.sensitive;
    if (filter === "approved") return matchesSearch && item.approved;
    if (filter === "pending") return matchesSearch && !item.approved;
    return matchesSearch;
  });

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="h-5 w-5 text-amber-600" />
            <h1 className="text-xl font-bold text-foreground">Knowledge Base</h1>
          </div>
          <p className="text-sm text-muted">
            Review extracted knowledge. Approve or flag sensitive items that require human review.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Chip size="sm" variant="soft" color="success">{mockItems.filter((i) => i.approved).length} Approved</Chip>
          <Chip size="sm" variant="soft" color="warning">{mockItems.filter((i) => !i.approved).length} Pending</Chip>
          <Chip size="sm" variant="soft" color="danger">{mockItems.filter((i) => i.sensitive).length} Sensitive</Chip>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-3">
        <Input
          placeholder="Search knowledge base..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Tabs
          selectedKey={filter}
          onSelectionChange={(key) => setFilter(key as string)}
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label="Filter">
              <Tabs.Tab id="all">All<Tabs.Indicator /></Tabs.Tab>
              <Tabs.Tab id="approved">Approved<Tabs.Indicator /></Tabs.Tab>
              <Tabs.Tab id="pending">Pending Review<Tabs.Indicator /></Tabs.Tab>
              <Tabs.Tab id="sensitive">Sensitive<Tabs.Indicator /></Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </div>

      {/* Knowledge items */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const SourceIcon = sourceIcons[item.source];
          return (
            <Card key={item.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 shrink-0">
                  <BookOpen className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    {item.sensitive && (
                      <Chip size="sm" variant="soft" color="danger">
                        <Shield className="h-3 w-3" /> Sensitive
                      </Chip>
                    )}
                    {item.approved ? (
                      <Chip size="sm" variant="soft" color="success">
                        <CheckCircle2 className="h-3 w-3" /> Approved
                      </Chip>
                    ) : (
                      <Chip size="sm" variant="soft" color="warning">
                        <AlertTriangle className="h-3 w-3" /> Pending
                      </Chip>
                    )}
                  </div>
                  <p className="text-xs text-muted mb-2 line-clamp-2">{item.content}</p>
                  <div className="flex items-center gap-2">
                    <Chip size="sm" variant="soft">
                      <SourceIcon className="h-3 w-3" /> {item.source}
                    </Chip>
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded bg-default px-1.5 py-0.5 text-xs text-muted">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!item.approved && (
                    <Button size="sm" variant="ghost" className="text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Approve
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" isIconOnly>
                    <Eye className="h-4 w-4" />
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
