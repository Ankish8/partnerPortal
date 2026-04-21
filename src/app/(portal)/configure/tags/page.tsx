"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tags, Plus, Shield, ShieldCheck, AlertTriangle, Pencil } from "lucide-react";
import { ContentPanel } from "@/components/layout/content-panel";

interface Tag { id: string; name: string; description: string; sensitive: boolean; itemCount: number }

const mockTags: Tag[] = [
  { id: "1", name: "pricing", description: "All pricing-related content including plans, discounts, and offers", sensitive: true, itemCount: 12 },
  { id: "2", name: "general", description: "General business information like hours, location, and contact details", sensitive: false, itemCount: 34 },
  { id: "3", name: "policy", description: "Company policies including returns, refunds, and terms", sensitive: false, itemCount: 8 },
  { id: "4", name: "escalation", description: "Content related to complaint handling and escalation procedures", sensitive: true, itemCount: 5 },
  { id: "5", name: "product", description: "Product features, specifications, and setup guides", sensitive: false, itemCount: 28 },
  { id: "6", name: "internal", description: "Internal processes and employee-only information", sensitive: true, itemCount: 3 },
  { id: "7", name: "enterprise", description: "Enterprise-specific pricing and features", sensitive: true, itemCount: 6 },
  { id: "8", name: "setup", description: "Setup and onboarding guides for customers", sensitive: false, itemCount: 15 },
];

export default function TagsPage() {
  const sensitiveTags = mockTags.filter((t) => t.sensitive);
  const normalTags = mockTags.filter((t) => !t.sensitive);

  const TagCard = ({ tag, isSensitive }: { tag: Tag; isSensitive: boolean }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${isSensitive ? "bg-red-50" : "bg-green-50"}`}>
            {isSensitive ? <Shield className="h-4 w-4 text-red-600" /> : <ShieldCheck className="h-4 w-4 text-green-600" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <code className="text-sm font-semibold">{tag.name}</code>
              <Badge variant="secondary">{tag.itemCount} items</Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{tag.description}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{isSensitive ? "Requires approval" : "Mark sensitive"}</span>
              <Switch defaultChecked={isSensitive} />
            </div>
            <Button size="icon" variant="ghost"><Pencil className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ContentPanel>
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tags className="h-5 w-5 text-red-600" />
            <h1 className="font-serif text-[28px] leading-[1.2] tracking-[-0.03em]">Tags & Sensitivity</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage content tags. Sensitive tags require human approval before the agent can use that content.
          </p>
        </div>
        <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> Create Tag</Button>
      </div>

      <Card className="mb-6 border-l-4 border-l-amber-400 bg-amber-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">How sensitivity works</p>
              <p className="text-xs text-muted-foreground mt-1">
                Content tagged as &quot;sensitive&quot; won&apos;t be shared by the agent until a human reviews and approves it.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-red-600" />
          <h2 className="text-sm font-semibold">Sensitive Tags</h2>
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{sensitiveTags.length}</Badge>
        </div>
        <div className="space-y-2">
          {sensitiveTags.map((tag) => <TagCard key={tag.id} tag={tag} isSensitive />)}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          <h2 className="text-sm font-semibold">Non-sensitive Tags</h2>
          <Badge variant="success">{normalTags.length}</Badge>
        </div>
        <div className="space-y-2">
          {normalTags.map((tag) => <TagCard key={tag.id} tag={tag} isSensitive={false} />)}
        </div>
      </div>
    </div>
    </ContentPanel>
  );
}
