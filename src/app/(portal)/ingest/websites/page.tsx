"use client";

import { Button, Card, Chip, Input } from "@heroui/react";
import {
  Globe,
  Plus,
  Search,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Clock,
  Trash2,
} from "lucide-react";
import { useState } from "react";

interface WebSource {
  id: string;
  url: string;
  status: "crawling" | "completed" | "pending";
  pages: number;
  addedAt: string;
}

const mockSources: WebSource[] = [
  {
    id: "1",
    url: "https://example.com",
    status: "completed",
    pages: 24,
    addedAt: "2 hours ago",
  },
  {
    id: "2",
    url: "https://docs.example.com",
    status: "crawling",
    pages: 8,
    addedAt: "10 minutes ago",
  },
];

export default function WebsitesPage() {
  const [url, setUrl] = useState("");
  const [sources, setSources] = useState<WebSource[]>(mockSources);

  const statusConfig = {
    completed: { label: "Completed", color: "success" as const, icon: CheckCircle2 },
    crawling: { label: "Crawling...", color: "warning" as const, icon: Loader2 },
    pending: { label: "Pending", color: "default" as const, icon: Clock },
  };

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="h-5 w-5 text-blue-600" />
          <h1 className="text-xl font-bold text-foreground">Website Sources</h1>
        </div>
        <p className="text-sm text-muted">
          Add website URLs to crawl. We&apos;ll extract and index all content for your agent.
        </p>
      </div>

      {/* Add URL Form */}
      <Card className="mb-6 p-4">
        <div className="flex gap-3">
          <Input
            placeholder="Enter website URL (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
          />
          <Button onPress={() => setUrl("")}>
            <Plus className="h-4 w-4" />
            Add & Crawl
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted">
          We&apos;ll crawl all pages on this domain and extract text content. Sitemaps are automatically detected.
        </p>
      </Card>

      {/* Sources list */}
      <div className="space-y-3">
        {sources.map((source) => {
          const status = statusConfig[source.status];
          const StatusIcon = status.icon;
          return (
            <Card key={source.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Globe className="h-4.5 w-4.5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{source.url}</p>
                    <ExternalLink className="h-3 w-3 text-muted shrink-0" />
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                    <span>{source.pages} pages indexed</span>
                    <span>Added {source.addedAt}</span>
                  </div>
                </div>
                <Chip
                  size="sm"
                  variant="soft"
                  color={status.color}
                >
                  <StatusIcon className={`h-3 w-3 ${source.status === "crawling" ? "animate-spin" : ""}`} /> {status.label}
                </Chip>
                <Button size="sm" variant="ghost" isIconOnly>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {sources.length === 0 && (
        <Card className="p-10 text-center">
          <Globe className="mx-auto mb-3 h-10 w-10 text-muted" />
          <p className="text-sm font-medium text-foreground">No websites added yet</p>
          <p className="mt-1 text-xs text-muted">Add a website URL above to start crawling.</p>
        </Card>
      )}
    </div>
  );
}
