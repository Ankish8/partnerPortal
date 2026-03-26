"use client";

import { Button, Card, Chip, Switch } from "@heroui/react";
import {
  Tags,
  Plus,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Pencil,
  Trash2,
} from "lucide-react";

interface Tag {
  id: string;
  name: string;
  description: string;
  sensitive: boolean;
  itemCount: number;
  requiresApproval: boolean;
}

const mockTags: Tag[] = [
  {
    id: "1",
    name: "pricing",
    description: "All pricing-related content including plans, discounts, and offers",
    sensitive: true,
    itemCount: 12,
    requiresApproval: true,
  },
  {
    id: "2",
    name: "general",
    description: "General business information like hours, location, and contact details",
    sensitive: false,
    itemCount: 34,
    requiresApproval: false,
  },
  {
    id: "3",
    name: "policy",
    description: "Company policies including returns, refunds, and terms",
    sensitive: false,
    itemCount: 8,
    requiresApproval: false,
  },
  {
    id: "4",
    name: "escalation",
    description: "Content related to complaint handling and escalation procedures",
    sensitive: true,
    itemCount: 5,
    requiresApproval: true,
  },
  {
    id: "5",
    name: "product",
    description: "Product features, specifications, and setup guides",
    sensitive: false,
    itemCount: 28,
    requiresApproval: false,
  },
  {
    id: "6",
    name: "internal",
    description: "Internal processes and employee-only information",
    sensitive: true,
    itemCount: 3,
    requiresApproval: true,
  },
  {
    id: "7",
    name: "enterprise",
    description: "Enterprise-specific pricing and features",
    sensitive: true,
    itemCount: 6,
    requiresApproval: true,
  },
  {
    id: "8",
    name: "setup",
    description: "Setup and onboarding guides for customers",
    sensitive: false,
    itemCount: 15,
    requiresApproval: false,
  },
];

export default function TagsPage() {
  const sensitiveTags = mockTags.filter((t) => t.sensitive);
  const normalTags = mockTags.filter((t) => !t.sensitive);

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tags className="h-5 w-5 text-red-600" />
            <h1 className="text-xl font-bold text-foreground">Tags & Sensitivity</h1>
          </div>
          <p className="text-sm text-muted">
            Manage content tags. Sensitive tags require human approval before the agent can use that content.
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5" />
          Create Tag
        </Button>
      </div>

      {/* Info card */}
      <Card className="mb-6 p-4 border-l-4 border-l-warning bg-warning/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">How sensitivity works</p>
            <p className="text-xs text-muted mt-1">
              Content tagged as &quot;sensitive&quot; won&apos;t be shared by the agent until a human reviews and approves it.
              This prevents accidental disclosure of pricing, internal processes, or confidential data.
            </p>
          </div>
        </div>
      </Card>

      {/* Sensitive tags */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-danger" />
          <h2 className="text-sm font-semibold text-foreground">Sensitive Tags</h2>
          <Chip size="sm" variant="soft" color="danger">{sensitiveTags.length}</Chip>
        </div>
        <div className="space-y-2">
          {sensitiveTags.map((tag) => (
            <Card key={tag.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 shrink-0">
                  <Shield className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-semibold text-foreground">{tag.name}</code>
                    <Chip size="sm" variant="soft">{tag.itemCount} items</Chip>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{tag.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">Requires approval</span>
                    <Switch defaultSelected size="sm" />
                  </div>
                  <Button size="sm" variant="ghost" isIconOnly>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Normal tags */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-success" />
          <h2 className="text-sm font-semibold text-foreground">Non-sensitive Tags</h2>
          <Chip size="sm" variant="soft" color="success">{normalTags.length}</Chip>
        </div>
        <div className="space-y-2">
          {normalTags.map((tag) => (
            <Card key={tag.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 shrink-0">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-semibold text-foreground">{tag.name}</code>
                    <Chip size="sm" variant="soft">{tag.itemCount} items</Chip>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{tag.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">Mark sensitive</span>
                    <Switch size="sm" />
                  </div>
                  <Button size="sm" variant="ghost" isIconOnly>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
