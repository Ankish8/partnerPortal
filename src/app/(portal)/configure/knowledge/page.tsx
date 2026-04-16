"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Search,
  Pencil,
  Globe,
  FileText,
  Phone,
  MessageSquare,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";
import { ContentPanel } from "@/components/layout/content-panel";
import {
  KnowledgeDetailPanel,
  type KnowledgeEntry,
} from "@/components/configure/knowledge-detail-panel";
import { cn } from "@/lib/utils";

// ─── Mock Data ───────────────────────────────────────────────

const mockEntries: KnowledgeEntry[] = [
  {
    id: "1", shortId: "41fb4081",
    question: "How are WhatsApp broadcasts different from regular WhatsApp messaging?",
    answer: "Broadcasts sent through the official WhatsApp Business API allow you to reach large opted-in audiences instantly using approved message templates. Unlike the standard WhatsApp Business app, you get verified delivery, media support, segmentation, automation triggers, and detailed campaign analytics for performance tracking.",
    tag: "feature_explanation", version: 1, status: "active", confidence: 70, sourceType: "website",
    sourceId: "001f3a3b-d0dc-43df-ab81-c319ec27052c", intent: "Differentiate between WhatsApp broadcasts and regular messaging",
    scenarioType: "general_inquiry", activationPolicy: "auto_active", createdAt: "3/25/2026", updatedAt: "3/25/2026",
  },
  {
    id: "2", shortId: "fb457e43",
    question: "Can chatbots handle the entire conversation?",
    answer: "Chatbots handle FAQs, lead qualification, appointment scheduling, and structured workflows automatically. When a conversation requires human attention, the system transfers the chat to an agent with full context, including past messages, tags, and interaction history.",
    tag: "feature_explanation", version: 1, status: "active", confidence: 70, sourceType: "website",
    sourceId: "001f3a3b-d0dc-43df-ab81-c319ec27052c", intent: "Explain chatbot capabilities and handoff",
    scenarioType: "general_inquiry", activationPolicy: "auto_active", createdAt: "3/25/2026", updatedAt: "3/25/2026",
  },
  {
    id: "3", shortId: "83f33b93",
    question: "Is technical setup required?",
    answer: "No technical setup is required. The platform provides a guided onboarding flow where you can configure your AI agent, connect your WhatsApp Business account, and start handling conversations within minutes.",
    tag: "onboarding", version: 1, status: "active", confidence: 85, sourceType: "website",
    sourceId: "001f3a3b-d0dc-43df-ab81-c319ec27052c", intent: "Clarify technical requirements for setup",
    scenarioType: "general_inquiry", activationPolicy: "auto_active", createdAt: "3/25/2026", updatedAt: "3/25/2026",
  },
  {
    id: "4", shortId: "a2c81f09",
    question: "What are the pricing plans available?",
    answer: "We offer three pricing tiers: Starter at $49/month for small teams, Professional at $199/month with advanced analytics and custom flows, and Enterprise starting at $499/month with dedicated support and SLA guarantees.",
    tag: "pricing", version: 1, status: "active", confidence: 60, sourceType: "document",
    sourceId: "7e4b2a1c-9f83-4d21-b5e7-1a2b3c4d5e6f", intent: "Explain pricing and plan options",
    scenarioType: "sales_inquiry", activationPolicy: "auto_active", createdAt: "3/25/2026", updatedAt: "3/25/2026",
  },
  {
    id: "5", shortId: "d9e47b21",
    question: "How to transfer a conversation to a human agent?",
    answer: "Conversations can be transferred to human agents automatically based on escalation rules, or manually by the customer requesting to speak with a person. The agent receives the full conversation history for seamless handoff.",
    tag: "escalation", version: 1, status: "active", confidence: 90, sourceType: "call",
    sourceId: "3f8a9b2c-1d4e-5f6a-7b8c-9d0e1f2a3b4c", intent: "Explain conversation transfer process",
    scenarioType: "support_workflow", activationPolicy: "auto_active", createdAt: "3/25/2026", updatedAt: "3/25/2026",
  },
  {
    id: "6", shortId: "f1234abc",
    question: "What languages does the platform support?",
    answer: "The platform supports over 50 languages including English, Hindi, Spanish, French, Arabic, Portuguese, and Mandarin. AI responses are automatically generated in the customer's detected language.",
    tag: "features", version: 1, status: "active", confidence: 75, sourceType: "website",
    sourceId: "001f3a3b-d0dc-43df-ab81-c319ec27052c", intent: "List supported languages",
    scenarioType: "general_inquiry", activationPolicy: "auto_active", createdAt: "3/25/2026", updatedAt: "3/25/2026",
  },
  {
    id: "7", shortId: "b5678def",
    question: "Can I see conversation analytics?",
    answer: "You get detailed analytics on conversations handled, containment rates, drop-offs, and lead conversions so you can improve flows over time.",
    tag: "analytics", version: 1, status: "active", confidence: 65, sourceType: "document",
    sourceId: "7e4b2a1c-9f83-4d21-b5e7-1a2b3c4d5e6f", intent: "Describe analytics capabilities",
    scenarioType: "general_inquiry", activationPolicy: "auto_active", createdAt: "3/25/2026", updatedAt: "3/25/2026",
  },
  {
    id: "8", shortId: "c9012ghi",
    question: "How to set up WhatsApp Business API?",
    answer: "Connect your WhatsApp Business API by navigating to Deploy > WhatsApp, entering your phone number, and following the verification steps. You'll need a Facebook Business Manager account.",
    tag: "setup", version: 1, status: "active", confidence: 55, sourceType: "whatsapp",
    sourceId: "5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d", intent: "Guide WhatsApp Business API setup",
    scenarioType: "onboarding", activationPolicy: "auto_active", createdAt: "3/25/2026", updatedAt: "3/25/2026",
  },
  {
    id: "9", shortId: "e3456jkl",
    question: "What is the refund policy?",
    answer: "We offer a 14-day money-back guarantee on all plans. If you're not satisfied, contact support for a full refund. Annual subscriptions can be cancelled with a prorated refund.",
    tag: "policy", version: 1, status: "inactive", confidence: 45, sourceType: "document",
    sourceId: "7e4b2a1c-9f83-4d21-b5e7-1a2b3c4d5e6f", intent: "Explain refund and cancellation policy",
    scenarioType: "support_workflow", activationPolicy: "manual_review", createdAt: "3/24/2026", updatedAt: "3/24/2026",
  },
  {
    id: "10", shortId: "g7890mno",
    question: "Does it support call recordings and compliance?",
    answer: "Yes, all calls can be recorded automatically and stored securely within the platform. Access can be restricted through role-based permissions to maintain compliance and data control.",
    tag: "compliance", version: 1, status: "active", confidence: 80, sourceType: "call",
    sourceId: "3f8a9b2c-1d4e-5f6a-7b8c-9d0e1f2a3b4c", intent: "Explain call recording and compliance features",
    scenarioType: "general_inquiry", activationPolicy: "auto_active", createdAt: "3/25/2026", updatedAt: "3/25/2026",
  },
];

interface ReviewItem {
  id: string;
  question: string;
  answer: string;
  priority: "P0" | "P1" | "P2";
  tags: string[];
  status: "pending" | "rejected";
  createdAt: string;
  similarFaqs: { question: string; answer: string }[];
}

const mockReviewItems: ReviewItem[] = [
  {
    id: "r1",
    question: "How is data privacy handled when using LLMs?",
    answer: "Customer conversations are processed within controlled environments with role-based access and structured data handling. LLM interactions are governed by predefined business logic and guardrails to prevent uncontrolled responses and maintain operational compliance.",
    priority: "P0", tags: ["legal"], status: "pending", createdAt: "3/25/2026",
    similarFaqs: [
      { question: "Does it support call recordings and compliance?", answer: "Yes, all calls can be recorded automatically and stored securely within the platform. Access can be restricted through role-based permissions." },
      { question: "Can the bots qualify leads?", answer: "Yes. AI agents ask qualifying questions, tag customer responses, identify intent, and ensure only high-value leads reach your team." },
      { question: "How does MyOperator improve customer experience?", answer: "MyOperator enhances customer experience by providing AI-led first responses, intelligent routing, and context-rich conversations." },
    ],
  },
  {
    id: "r2",
    question: "What are the pricing details for enterprise plans?",
    answer: "Enterprise plans start at $499/month and include dedicated account management, custom API integrations, priority support with SLA guarantees, advanced analytics, and white-label options.",
    priority: "P1", tags: ["pricing", "enterprise"], status: "pending", createdAt: "3/25/2026",
    similarFaqs: [
      { question: "What are the pricing plans available?", answer: "We offer three pricing tiers: Starter at $49/month, Professional at $199/month, and Enterprise starting at $499/month." },
    ],
  },
  {
    id: "r3",
    question: "Can customers request deletion of their data?",
    answer: "Yes, customers can request complete deletion of their data in compliance with GDPR and other privacy regulations. Data deletion requests are processed within 30 days.",
    priority: "P0", tags: ["compliance", "legal"], status: "pending", createdAt: "3/25/2026",
    similarFaqs: [
      { question: "How is data privacy handled when using LLMs?", answer: "Customer conversations are processed within controlled environments with role-based access and structured data handling." },
    ],
  },
];

// ─── Source section config ────────────────────────────────────

const sourceConfig: Record<KnowledgeEntry["sourceType"], { icon: typeof Globe; label: string; description: string }> = {
  website: { icon: Globe, label: "Website", description: "FAQs extracted from synced website pages" },
  document: { icon: FileText, label: "Documents", description: "FAQs extracted from uploaded documents" },
  call: { icon: Phone, label: "Calls", description: "FAQs extracted from call transcriptions" },
  whatsapp: { icon: MessageSquare, label: "WhatsApp Chats", description: "FAQs extracted from WhatsApp conversations" },
};

const sourceOrder: KnowledgeEntry["sourceType"][] = ["website", "document", "call", "whatsapp"];

// ─── Component ───────────────────────────────────────────────

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState<"knowledge" | "review">("knowledge");

  // Knowledge filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");

  // Detail panel
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Review filters
  const [reviewStatusFilter, setReviewStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const allTags = useMemo(() => [...new Set(mockEntries.map((e) => e.tag))].sort(), []);

  const filteredEntries = useMemo(() => {
    return mockEntries.filter((entry) => {
      const q = search.toLowerCase();
      const matchesSearch = !search || entry.question.toLowerCase().includes(q) || entry.answer.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
      const matchesTag = tagFilter === "all" || entry.tag === tagFilter;
      return matchesSearch && matchesStatus && matchesTag;
    });
  }, [search, statusFilter, tagFilter]);

  // Group filtered entries by source type
  const groupedEntries = useMemo(() => {
    const groups: Record<string, KnowledgeEntry[]> = {};
    for (const entry of filteredEntries) {
      if (!groups[entry.sourceType]) groups[entry.sourceType] = [];
      groups[entry.sourceType].push(entry);
    }
    return groups;
  }, [filteredEntries]);

  const filteredReviewItems = useMemo(() => {
    return mockReviewItems.filter((item) => {
      const matchesStatus = reviewStatusFilter === "all" || item.status === reviewStatusFilter;
      const matchesPriority = priorityFilter === "all" || item.priority === priorityFilter;
      return matchesStatus && matchesPriority;
    });
  }, [reviewStatusFilter, priorityFilter]);

  const activeCount = mockEntries.filter((e) => e.status === "active").length;
  const inactiveCount = mockEntries.filter((e) => e.status === "inactive").length;
  const pendingReviewCount = mockReviewItems.filter((r) => r.status === "pending").length;

  return (
    <ContentPanel>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="border-b">
        <div className="px-6 pt-6 pb-0">
          {/* Title row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <BookOpen className="h-5 w-5" />
              <h1 className="text-[17px] font-semibold tracking-tight">
                Knowledge Base
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[12px] font-medium text-emerald-700">
                {activeCount} Active
              </span>
              <span className="rounded-full border border-border px-2.5 py-0.5 text-[12px] font-medium text-muted-foreground">
                {inactiveCount} Inactive
              </span>
            </div>
          </div>

          {/* Tabs — same pattern as website-sync-panel & train page */}
          <div className="flex">
            <button
              onClick={() => setActiveTab("knowledge")}
              className={`px-4 py-3 text-[14px] font-medium transition-colors cursor-pointer ${
                activeTab === "knowledge"
                  ? "border-b-[2.5px] border-[#e87537] text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Knowledge Base
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${
                activeTab === "knowledge"
                  ? "bg-foreground/10 text-foreground"
                  : "bg-muted text-muted-foreground"
              }`}>
                {mockEntries.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("review")}
              className={`px-4 py-3 text-[14px] font-medium transition-colors cursor-pointer ${
                activeTab === "review"
                  ? "border-b-[2.5px] border-[#e87537] text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Human Review
              {pendingReviewCount > 0 && (
                <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${
                  activeTab === "review"
                    ? "bg-red-100 text-red-700"
                    : "bg-red-50 text-red-600"
                }`}>
                  {pendingReviewCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Knowledge Base Tab ──────────────────────────────── */}
      {activeTab === "knowledge" && (
        <>
          {/* Filters */}
          <div className="flex items-center gap-3 border-b px-6 py-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search questions or answers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-[13px]"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={<button type="button" />}
                className="flex items-center gap-1.5 rounded-lg border px-3 h-9 text-[13px] hover:bg-muted/50 transition-colors cursor-pointer"
              >
                {statusFilter === "all" ? "All Statuses" : statusFilter === "active" ? "Active" : "Inactive"}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuItem onClick={() => setStatusFilter("all")} className="text-[13px] cursor-pointer">All Statuses</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("active")} className="text-[13px] cursor-pointer">Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("inactive")} className="text-[13px] cursor-pointer">Inactive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={<button type="button" />}
                className="flex items-center gap-1.5 rounded-lg border px-3 h-9 text-[13px] hover:bg-muted/50 transition-colors cursor-pointer"
              >
                {tagFilter === "all" ? "All Tags" : tagFilter}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => setTagFilter("all")} className="text-[13px] cursor-pointer">All Tags</DropdownMenuItem>
                <DropdownMenuSeparator />
                {allTags.map((tag) => (
                  <DropdownMenuItem key={tag} onClick={() => setTagFilter(tag)} className="text-[13px] cursor-pointer">{tag}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Grouped sections by source type */}
          <div className="px-6 py-5 space-y-5">
            {sourceOrder
              .filter((type) => groupedEntries[type]?.length)
              .map((type) => {
                const config = sourceConfig[type];
                const SectionIcon = config.icon;
                const entries = groupedEntries[type];

                return (
                  <div key={type} className="rounded-xl border">
                    {/* Section header */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b bg-muted/30 rounded-t-xl">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border">
                        <SectionIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-semibold">{config.label}</p>
                        <p className="text-[12px] text-muted-foreground">{config.description}</p>
                      </div>
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[12px] font-medium text-muted-foreground">
                        {entries.length} {entries.length === 1 ? "entry" : "entries"}
                      </span>
                    </div>

                    {/* Entries */}
                    <div>
                      {entries.map((entry, idx) => (
                        <div
                          key={entry.id}
                          className={cn(
                            "group flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors cursor-pointer",
                            idx < entries.length - 1 && "border-b border-border/50"
                          )}
                          onClick={() => { setSelectedEntry(entry); setDetailOpen(true); }}
                        >
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-[15px] font-medium leading-snug">
                                {entry.question}
                              </h3>
                              <span className={cn(
                                "inline-flex items-center shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                                entry.status === "active"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-gray-100 text-gray-500"
                              )}>
                                {entry.status}
                              </span>
                            </div>
                            <p className="text-[14px] text-muted-foreground leading-relaxed line-clamp-2 mb-2">
                              {entry.answer}
                            </p>
                            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                              <span className="rounded-full border px-2 py-0.5 font-medium text-foreground/70">
                                {entry.tag}
                              </span>
                              <span>Updated {entry.updatedAt}</span>
                            </div>
                          </div>

                          {/* Hover actions */}
                          <div
                            className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pt-0.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors cursor-pointer">
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                            <button className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors cursor-pointer">
                              <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

            {filteredEntries.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-[14px] text-muted-foreground">No knowledge entries match your filters.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Human Review Tab ────────────────────────────────── */}
      {activeTab === "review" && (
        <>
          {/* Filters */}
          <div className="flex items-center gap-3 border-b px-6 py-3">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<button type="button" />}
                className="flex items-center gap-1.5 rounded-lg border px-3 h-9 text-[13px] hover:bg-muted/50 transition-colors cursor-pointer"
              >
                Status: {reviewStatusFilter === "all" ? "All" : reviewStatusFilter}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-36">
                <DropdownMenuItem onClick={() => setReviewStatusFilter("all")} className="text-[13px] cursor-pointer">All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setReviewStatusFilter("pending")} className="text-[13px] cursor-pointer">Pending</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setReviewStatusFilter("rejected")} className="text-[13px] cursor-pointer">Rejected</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={<button type="button" />}
                className="flex items-center gap-1.5 rounded-lg border px-3 h-9 text-[13px] hover:bg-muted/50 transition-colors cursor-pointer"
              >
                Priority: {priorityFilter === "all" ? "All" : priorityFilter}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuItem onClick={() => setPriorityFilter("all")} className="text-[13px] cursor-pointer">All Priorities</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setPriorityFilter("P0")} className="text-[13px] cursor-pointer">P0 (Critical)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("P1")} className="text-[13px] cursor-pointer">P1 (High)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("P2")} className="text-[13px] cursor-pointer">P2 (Normal)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Review items */}
          <div className="px-6 py-5 space-y-4">
            {filteredReviewItems.map((item) => (
              <div key={item.id} className="rounded-xl border">
                <div className="px-5 pt-4 pb-5">
                  {/* Header: priority + tags */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="rounded-md border px-2 py-0.5 text-[11px] font-semibold">
                      {item.priority}
                    </span>
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-md border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{tag}</span>
                    ))}
                  </div>

                  {/* Proposed Question */}
                  <div className="mb-4">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                      Proposed Question
                    </p>
                    <h3 className="text-[16px] font-semibold leading-snug">{item.question}</h3>
                  </div>

                  {/* Suggested Answer */}
                  <div className="mb-5">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                      Suggested Answer
                    </p>
                    <p className="text-[14px] text-foreground/75 leading-[1.7]">{item.answer}</p>
                  </div>

                  {/* Similar FAQs — compact cards */}
                  {item.similarFaqs.length > 0 && (
                    <div className="border-t pt-4 mb-5">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        {item.similarFaqs.length} Similar Existing {item.similarFaqs.length === 1 ? "FAQ" : "FAQs"}
                      </p>
                      <div className="space-y-2">
                        {item.similarFaqs.map((faq, i) => (
                          <div key={i} className="rounded-lg bg-muted/30 px-3.5 py-2.5">
                            <p className="text-[13px] font-medium leading-snug mb-0.5">{faq.question}</p>
                            <p className="text-[12px] text-muted-foreground line-clamp-1">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer: date + actions */}
                  <div className="border-t pt-4 flex items-center justify-between">
                    <p className="text-[12px] text-muted-foreground">
                      Submitted {item.createdAt}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="rounded-lg cursor-pointer">
                        Reject
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-lg cursor-pointer">
                        <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit & Approve
                      </Button>
                      <Button size="sm" className="bg-foreground hover:bg-foreground/90 text-background rounded-lg cursor-pointer">
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredReviewItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-[14px] text-muted-foreground">No review items match your filters.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Detail panel */}
      <KnowledgeDetailPanel
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedEntry(null); }}
        entry={selectedEntry}
      />
    </ContentPanel>
  );
}
