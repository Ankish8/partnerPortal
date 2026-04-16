"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Paperclip } from "lucide-react";
import { ContentPanel } from "@/components/layout/content-panel";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'm your AI Agent Builder assistant. I can help you set up knowledge sources, configure intents and flows, test your agent, and deploy to WhatsApp. What would you like to do?",
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <ContentPanel>
      <div className="flex h-full flex-col">
        {isEmpty ? (
          /* Empty state — centered prompt */
          <div className="relative flex flex-1 flex-col items-center justify-center px-6 overflow-hidden">
            <div className="relative flex w-full max-w-[640px] flex-col items-center">
              <h1 className="mb-2 text-[22px] font-semibold tracking-[-0.01em] text-foreground">
                What can I help you build?
              </h1>
              <p className="mb-8 text-[15px] text-muted-foreground">
                Tell me about your business and I'll set up your AI agent.
              </p>

              {/* Input area */}
              <div className="relative w-full">
                <div className="relative z-10 rounded-xl border border-border/80 bg-white shadow-sm transition-shadow focus-within:border-border focus-within:shadow-md">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask AI anything"
                    rows={3}
                    className="w-full resize-none bg-transparent px-4 pt-4 pb-14 text-[15px] placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-end">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <Paperclip className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!input.trim()}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                          input.trim()
                            ? "bg-foreground text-background hover:bg-foreground/90"
                            : "bg-muted text-muted-foreground/50 cursor-not-allowed"
                        )}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Chat messages */
          <>
            <div className="flex-1 overflow-y-auto px-6 pt-6">
              <div className="mx-auto max-w-[720px] space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    {message.role === "assistant" && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                        AI
                      </div>
                    )}
                    <div
                      className={cn(
                        "flex-1 text-[15px] leading-relaxed",
                        message.role === "user" &&
                          "ml-auto max-w-[80%] rounded-2xl bg-muted px-4 py-3"
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                      AI
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
                      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
                      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Bottom input for chat mode */}
            <div className="border-t border-border/40 px-6 py-4">
              <div className="mx-auto max-w-[720px]">
                <div className="relative rounded-xl border border-border/80 bg-white shadow-sm transition-shadow focus-within:border-border focus-within:shadow-md">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a follow-up..."
                    rows={1}
                    className="w-full resize-none bg-transparent px-4 pt-3 pb-12 text-[15px] placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-end">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <Paperclip className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!input.trim()}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                          input.trim()
                            ? "bg-foreground text-background hover:bg-foreground/90"
                            : "bg-muted text-muted-foreground/50 cursor-not-allowed"
                        )}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </ContentPanel>
  );
}
