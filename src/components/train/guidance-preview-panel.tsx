"use client";

import { useRef, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useMutation } from "convex/react";
import {
  RotateCcw,
  X,
  Bot,
  Paperclip,
  Smile,
  Image,
  Mic,
  Send,
  Eye,
  EyeOff,
  Code,
  Languages,
  Sparkles,
  AlertCircle,
  BookOpen,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  detectLanguage,
  type EscalationRuleInput,
} from "@/lib/escalation-evaluator";

export interface GuidanceRule {
  title: string;
  content: string;
}

export interface AttributeValueSpec {
  id: string;
  name: string;
  description: string;
}

export interface AttributeConditionSpec {
  id: string;
  ifAttributeId: string;
  ifValueId: string;
  useValueIds: string[];
}

export interface AttributeSpec {
  id: string;
  title: string;
  description: string;
  values: AttributeValueSpec[];
  conditions?: AttributeConditionSpec[];
}

interface AttributeDetection {
  attributeId: string;
  attributeTitle: string;
  valueId: string | null;
  valueName: string | null;
}

type EventType =
  | "attribute"
  | "language"
  | "personality"
  | "guidance_rule"
  | "escalation"
  | "message"
  | "response"
  | "error";

export type EscalationRuleSpec = EscalationRuleInput;

export interface EscalationGuidanceSpec {
  _id?: Id<"escalationGuidance">;
  title: string;
  content: string;
}

export interface Citation {
  id: number;
  title: string;
  url: string;
  snippet: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  error?: boolean;
  citations?: Citation[];
  streaming?: boolean;
}

interface EventEntry {
  id: string;
  timestamp: number;
  label: string;
  detail?: string;
  type?: EventType;
}

interface GuidancePreviewPanelProps {
  className?: string;
  onClose?: () => void;
  guidance?: GuidanceRule[];
  personality?: { tone?: string; length?: string };
  attributes?: AttributeSpec[];
  escalationRules?: EscalationRuleSpec[];
  escalationGuidance?: EscalationGuidanceSpec[];
}

export function GuidancePreviewPanel({
  className = "flex w-[400px] shrink-0 flex-col rounded-xl bg-white",
  onClose,
  guidance = [],
  personality,
  attributes = [],
  escalationRules = [],
  escalationGuidance = [],
}: GuidancePreviewPanelProps) {
  const [previewTab, setPreviewTab] = useState<"customer" | "event">("customer");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const endConversation = useMutation(api.conversations.end);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const appendEvent = (label: string, type: EventType, detail?: string) => {
    setEvents((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, timestamp: Date.now(), label, detail, type },
    ]);
  };

  const clearLocal = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setEvents([]);
    setInput("");
    setIsLoading(false);
    setConversationId(null);
  };

  const handleEndConversation = async (outcome: "resolved" | "escalated") => {
    const id = conversationId;
    clearLocal();
    if (!id) return;
    try {
      await endConversation({ conversationId: id, outcome });
    } catch (err) {
      console.error("Failed to end conversation:", err);
    }
  };

  const handleReset = () => {
    clearLocal();
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const isFirstMessage = messages.length === 0;
    const now = Date.now();
    const userMsg: ChatMessage = {
      id: `u-${now}`,
      role: "user",
      content: text,
      timestamp: now,
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    appendEvent("User message", "message", text);

    if (isFirstMessage) {
      const { language, confident } = detectLanguage(text);
      const sessionEvents: EventEntry[] = [
        {
          id: `evt-attr-${now}`,
          timestamp: now + 1,
          label: "Attribute: 'AI Agent: Preview' set to True",
          type: "attribute",
        },
        {
          id: `evt-lang-${now}`,
          timestamp: now + 2,
          label: confident
            ? `Language: ${language}`
            : `Language: ${language} (could not detect with enough confidence)`,
          type: "language",
        },
      ];
      if (personality?.tone && personality?.length) {
        sessionEvents.push({
          id: `evt-pers-${now}`,
          timestamp: now + 3,
          label: `AI Agent's Personality: ${personality.tone}, ${personality.length}`,
          type: "personality",
        });
      }
      setEvents((prev) => [...prev, ...sessionEvents]);
    }

    const assistantId = `a-${Date.now()}`;
    let assistantCreated = false;
    const ensureAssistantMessage = () => {
      if (assistantCreated) return;
      assistantCreated = true;
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: Date.now(),
          streaming: true,
        },
      ]);
    };

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages
            .slice(-20)
            .map((m) => ({ role: m.role, content: m.content })),
          guidance,
          personality,
          attributes,
          escalationRules,
          escalationGuidance,
          conversationId,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        let message = "Request failed";
        try {
          const err = await response.json();
          message = err.error || message;
        } catch {}
        throw new Error(message);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let doneMeta: Extract<StreamEvent, { type: "done" }> | null = null;
      let errorMsg: string | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (!payload) continue;
          let event: StreamEvent;
          try {
            event = JSON.parse(payload) as StreamEvent;
          } catch {
            continue;
          }
          if (event.type === "delta") {
            if (!event.text) continue;
            ensureAssistantMessage();
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content + event.text }
                  : m
              )
            );
          } else if (event.type === "done") {
            doneMeta = event;
          } else if (event.type === "error") {
            errorMsg = event.message;
          }
        }
      }

      if (errorMsg) throw new Error(errorMsg);

      if (doneMeta) {
        const meta = doneMeta;
        if (meta.conversationId) {
          setConversationId(meta.conversationId as Id<"conversations">);
        }
        ensureAssistantMessage();
        setMessages((prev) => {
          const updated = prev.map((m) =>
            m.id === assistantId
              ? { ...m, citations: meta.citations, streaming: false }
              : m
          );
          if (meta.followUp && meta.followUp.length > 0) {
            updated.push({
              id: `${assistantId}-follow`,
              role: "assistant",
              content: meta.followUp,
              timestamp: Date.now(),
            });
          }
          return updated;
        });
        if (meta.guidanceApplied.length > 0) {
          const responseNow = Date.now();
          const guidanceEvents: EventEntry[] = meta.guidanceApplied.map(
            (title, i) => ({
              id: `evt-guide-${responseNow}-${i}`,
              timestamp: responseNow + 1 + i,
              label: `AI Agent follows the guidance: ${title}`,
              type: "guidance_rule",
            })
          );
          setEvents((prev) => [...prev, ...guidanceEvents]);
        }
        const detections = meta.attributeDetections ?? [];
        const matchedDetections = detections.filter(
          (d) => d.valueId !== null && d.valueName !== null
        );
        if (matchedDetections.length > 0) {
          const attrNow = Date.now();
          const attrEvents: EventEntry[] = matchedDetections.map((d, i) => ({
            id: `evt-attr-det-${attrNow}-${i}`,
            timestamp: attrNow + 1 + i,
            label: `Attribute: ${d.attributeTitle} — ${d.valueName}`,
            type: "attribute",
          }));
          setEvents((prev) => [...prev, ...attrEvents]);
        }
        if (meta.escalate) {
          const byRule = meta.escalationTriggeredBy === "rule";
          const ruleTitles = meta.escalationRuleTitles ?? [];
          const label = byRule
            ? `Escalation triggered by rule${ruleTitles.length === 1 ? "" : "s"}: ${ruleTitles.join(", ")}`
            : `Escalation triggered by guidance`;
          const detail = meta.escalationReason ?? undefined;
          appendEvent(label, "escalation", detail);
        }
        const srcCount = meta.citations.length;
        const kbCount = meta.knowledgePagesAvailable;
        appendEvent(
          "Agent response",
          "response",
          `${meta.guidanceApplied.length} of ${meta.rulesApplied} rule${meta.rulesApplied === 1 ? "" : "s"} applied · ${srcCount} of ${kbCount} source${kbCount === 1 ? "" : "s"} cited · ${meta.latencyMs}ms`
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, streaming: false } : m
          )
        );
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        if (assistantCreated) {
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        }
      } else {
        const message = err instanceof Error ? err.message : "Failed to get response";
        if (assistantCreated) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: message, error: true, streaming: false }
                : m
            )
          );
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: assistantId,
              role: "assistant",
              content: message,
              timestamp: Date.now(),
              error: true,
            },
          ]);
        }
        appendEvent("Error", "error", message);
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="text-[20px] font-semibold tracking-tight">Preview</h2>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={() => setShowEvents((v) => !v)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer",
                showEvents ? "bg-muted" : "hover:bg-muted"
              )}
              aria-label={showEvents ? "Hide events" : "Show events"}
            >
              {showEvents ? (
                <Eye className="h-[18px] w-[18px] text-foreground" />
              ) : (
                <EyeOff className="h-[18px] w-[18px] text-muted-foreground" />
              )}
            </button>
          )}
          {conversationId && messages.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex h-8 items-center gap-1 rounded-lg px-2 hover:bg-muted transition-colors cursor-pointer text-[13px] text-muted-foreground"
                aria-label="End conversation"
              >
                <RotateCcw className="h-[16px] w-[16px]" />
                <ChevronDown className="h-[14px] w-[14px]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={6}>
                <DropdownMenuItem onClick={() => handleEndConversation("resolved")}>
                  <CheckCircle2 className="text-emerald-600" />
                  End as Resolved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEndConversation("escalated")}>
                  <UserCog className="text-amber-600" />
                  End as Escalated
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleReset}>
                  <RotateCcw />
                  Discard without saving
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={handleReset}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer"
              aria-label="Reset conversation"
            >
              <RotateCcw className="h-[18px] w-[18px] text-muted-foreground" />
            </button>
          )}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-[18px] w-[18px] text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="flex border-t border-border/40 px-2">
        <button
          onClick={() => setPreviewTab("customer")}
          className={`px-4 py-3.5 text-[14px] font-medium transition-colors cursor-pointer ${
            previewTab === "customer"
              ? "border-b-[2.5px] border-[#e87537] text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Customer view
        </button>
        <button
          onClick={() => setPreviewTab("event")}
          className={`px-4 py-3.5 text-[14px] font-medium transition-colors cursor-pointer ${
            previewTab === "event"
              ? "border-b-[2.5px] border-[#e87537] text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Event log
        </button>
      </div>

      <div ref={scrollRef} className="flex flex-1 flex-col overflow-y-auto border-t border-border/40">
        {previewTab === "customer" ? (
          messages.length === 0 && !isLoading && !showEvents ? (
            <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-muted/60">
                <Bot className="h-7 w-7 text-muted-foreground/70" />
              </div>
              <p className="text-[14px] leading-[1.6] text-muted-foreground">
                Ask your agent a question your customers might ask, to preview its response.
              </p>
            </div>
          ) : showEvents ? (
            <div className="flex flex-col gap-2 px-5 py-5">
              {buildTimeline(messages, events).map((item) =>
                item.kind === "event" ? (
                  <InlineEventRow key={item.id} event={item.data} />
                ) : (
                  <MessageBubble key={item.id} message={item.data} />
                )
              )}
              {isLoading &&
                !messages.some((m) => m.role === "assistant" && m.streaming) && (
                  <TypingIndicator />
                )}
            </div>
          ) : (
            <div className="flex flex-col gap-3 px-5 py-5">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading &&
                !messages.some((m) => m.role === "assistant" && m.streaming) && (
                  <TypingIndicator />
                )}
            </div>
          )
        ) : (
          <EventLog events={events} />
        )}
      </div>

      <div className="border-t border-border/40 px-5 py-5">
        <div className="rounded-xl border border-border/60 px-4 py-3.5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            rows={1}
            className="w-full resize-none bg-transparent text-[14px] outline-none placeholder:text-muted-foreground [field-sizing:content]"
          />
          <div className="mt-3 flex items-center gap-1">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer">
              <Paperclip className="h-[18px] w-[18px] text-muted-foreground/60" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer">
              <Smile className="h-[18px] w-[18px] text-muted-foreground/60" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer">
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image className="h-[18px] w-[18px] text-muted-foreground/60" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer">
              <Mic className="h-[18px] w-[18px] text-muted-foreground/60" />
            </button>
            <div className="flex-1" />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                input.trim() && !isLoading
                  ? "bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
                  : "bg-muted text-muted-foreground/50 cursor-not-allowed"
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type StreamEvent =
  | { type: "delta"; text: string }
  | {
      type: "done";
      followUp: string;
      citations: Citation[];
      guidanceApplied: string[];
      rulesApplied: number;
      knowledgePagesAvailable: number;
      latencyMs: number;
      attributeDetections?: AttributeDetection[];
      conversationId?: string | null;
      escalate?: boolean;
      escalationReason?: string | null;
      escalationTriggeredBy?: "rule" | "guidance" | null;
      escalationRuleTitles?: string[];
    }
  | { type: "error"; message: string };

type MdNode = {
  type: string;
  value?: string;
  children?: MdNode[];
  url?: string;
  title?: string | null;
};

function splitCitationText(text: string): MdNode[] {
  const regex = /\[\^(\d+)\]/g;
  const matches = [...text.matchAll(regex)];
  if (matches.length === 0) return [{ type: "text", value: text }];
  const out: MdNode[] = [];
  let lastIdx = 0;
  for (const m of matches) {
    const mi = m.index ?? 0;
    if (mi > lastIdx) {
      out.push({ type: "text", value: text.slice(lastIdx, mi) });
    }
    out.push({
      type: "link",
      url: `citation:${m[1]}`,
      title: null,
      children: [{ type: "text", value: m[1] }],
    });
    lastIdx = mi + m[0].length;
  }
  if (lastIdx < text.length) {
    out.push({ type: "text", value: text.slice(lastIdx) });
  }
  return out;
}

function transformCitations(node: MdNode): void {
  if (!Array.isArray(node.children)) return;
  const next: MdNode[] = [];
  for (const child of node.children) {
    if (child.type === "text" && typeof child.value === "string") {
      next.push(...splitCitationText(child.value));
    } else {
      transformCitations(child);
      next.push(child);
    }
  }
  node.children = next;
}

function remarkCitations() {
  return (tree: MdNode) => {
    transformCitations(tree);
  };
}

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function CitationBadge({ citation }: { citation: Citation }) {
  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={`Citation ${citation.id}: ${citation.title}`}
        className="mx-0.5 inline-flex h-[15px] min-w-[15px] items-center justify-center rounded-[4px] bg-foreground/10 px-1 align-baseline text-[10px] font-semibold leading-none text-foreground/75 transition-colors hover:bg-foreground/15 cursor-pointer"
        render={<button type="button" />}
      >
        {citation.id}
      </TooltipTrigger>
      <TooltipContent className="max-w-[280px] items-start !px-3.5 !py-3">
        <div className="flex flex-col gap-1.5 text-left">
          {citation.url && (
            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{domainFromUrl(citation.url)}</span>
            </div>
          )}
          <div className="text-[14px] font-semibold text-foreground leading-[1.35] line-clamp-2">
            {citation.title || "Untitled source"}
          </div>
          {citation.url && (
            <a
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 text-[12.5px] font-medium text-[#e87537] hover:text-[#d26529]"
            >
              Open source
            </a>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const renderAsMarkdown = !isUser && !message.error;
  const citations = message.citations ?? [];
  const citationMap = new Map(citations.map((c) => [c.id, c]));

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-[1.5]",
          !renderAsMarkdown && "whitespace-pre-wrap",
          isUser
            ? "bg-[#e87537] text-white rounded-br-md"
            : message.error
            ? "bg-destructive/10 text-destructive rounded-bl-md"
            : "bg-muted text-foreground rounded-bl-md"
        )}
      >
        {renderAsMarkdown ? (
          <>
            <ReactMarkdown
              remarkPlugins={[remarkCitations]}
              urlTransform={(url) => url}
              components={{
                p: ({ children }) => (
                  <p className="[&:not(:first-child)]:mt-2">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="my-2 list-disc space-y-1 pl-5 marker:text-muted-foreground/70">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-2 list-decimal space-y-1 pl-5 marker:text-muted-foreground/70">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="leading-[1.55]">{children}</li>,
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">{children}</strong>
                ),
                em: ({ children }) => <em className="italic">{children}</em>,
                a: ({ href, children }) => {
                  if (typeof href === "string" && href.startsWith("citation:")) {
                    const id = Number(href.slice("citation:".length));
                    const citation = citationMap.get(id);
                    if (citation) return <CitationBadge citation={citation} />;
                    return null;
                  }
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-[#e87537] underline underline-offset-2 hover:text-[#d26529]"
                    >
                      {children}
                    </a>
                  );
                },
                code: ({ children }) => (
                  <code className="rounded bg-background/70 px-1 py-0.5 font-mono text-[12.5px]">
                    {children}
                  </code>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
            {message.streaming && (
              <span className="ml-0.5 inline-block h-[14px] w-[2px] translate-y-[2px] animate-pulse bg-foreground/40 align-baseline" />
            )}
          </>
        ) : (
          message.content
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-muted px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" />
      </div>
    </div>
  );
}

type TimelineItem =
  | { kind: "event"; id: string; timestamp: number; data: EventEntry }
  | { kind: "message"; id: string; timestamp: number; data: ChatMessage };

const INLINE_EVENT_TYPES: EventType[] = [
  "attribute",
  "language",
  "personality",
  "guidance_rule",
  "escalation",
  "error",
];

function buildTimeline(
  messages: ChatMessage[],
  events: EventEntry[]
): TimelineItem[] {
  const eventItems = events
    .filter((e) => e.type && INLINE_EVENT_TYPES.includes(e.type))
    .map<TimelineItem>((e) => ({
      kind: "event",
      id: e.id,
      timestamp: e.timestamp,
      data: e,
    }));
  const messageItems = messages.map<TimelineItem>((m) => ({
    kind: "message",
    id: m.id,
    timestamp: m.timestamp,
    data: m,
  }));
  return [...eventItems, ...messageItems].sort((a, b) => a.timestamp - b.timestamp);
}

function formatRelativeTime(ts: number): string {
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 60) return "now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  return new Date(ts).toLocaleDateString();
}

function InlineEventRow({ event }: { event: EventEntry }) {
  const Icon =
    event.type === "attribute"
      ? Code
      : event.type === "language"
      ? Languages
      : event.type === "personality"
      ? Sparkles
      : event.type === "guidance_rule"
      ? BookOpen
      : event.type === "escalation"
      ? UserCog
      : event.type === "error"
      ? AlertCircle
      : Bot;

  const tone =
    event.type === "error"
      ? "text-destructive"
      : event.type === "escalation"
      ? "text-amber-600"
      : "text-muted-foreground";

  return (
    <div className={cn("flex items-start gap-2.5 px-1 py-1 text-[12.5px]", tone)}>
      <span className="shrink-0 tabular-nums pt-px w-7">
        {formatRelativeTime(event.timestamp)}
      </span>
      <Icon className="h-3.5 w-3.5 shrink-0 mt-[3px]" />
      <span className="leading-[1.5] flex-1">{event.label}</span>
    </div>
  );
}

function EventLog({ events }: { events: EventEntry[] }) {
  if (events.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
        <p className="text-[13px] text-muted-foreground">
          Events will appear here when you start a conversation.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col divide-y divide-border/40">
      {events.map((e) => (
        <div key={e.id} className="px-5 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-foreground">{e.label}</span>
            <span className="text-[11.5px] text-muted-foreground tabular-nums">
              {new Date(e.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
          {e.detail && (
            <p className="mt-1 text-[12.5px] leading-[1.5] text-muted-foreground line-clamp-3">
              {e.detail}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
