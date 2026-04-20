"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export interface GuidanceTemplate {
  title: string;
  description: string;
}

export const COMMUNICATION_STYLE_TEMPLATES: GuidanceTemplate[] = [
  {
    title: "Use simple language",
    description:
      "Use clear, straightforward language and avoid jargon or buzzwords. For example:\n- Say \"easy\" instead of \"frictionless\"\n- Say \"help\" instead of \"enable\"\n- Say \"start\" instead of \"onboard\"\n- Say \"use\" instead of \"leverage\"\n- Say \"choose\" instead of \"curate\"",
  },
  {
    title: "Keep answers concise",
    description:
      "Answers should be clear and to the point. Use short sentences, limit paragraphs to 1-2 sentences, and keep responses under 100 words unless absolutely necessary. Break paragraphs into sentences with a new line, but do not apply this rule to code, bullet points, lists, or other structured markdown.",
  },
  {
    title: "Don't guarantee outcomes",
    description:
      "Never guarantee financial outcomes (e.g. \"this investment will grow by 10%\"). Instead, use cautious, factual statements like \"Past performance is not indicative of future results.\" Emphasize that investors should not rely solely on past performance when making decisions.",
  },
  {
    title: "Follow naming conventions",
    description:
      "Always refer to our offerings as they appear in our documentation and marketing materials. Don't shorten them or add modifiers. Our company name should never be capitalized or written in all caps.",
  },
  {
    title: "Show empathy and care",
    description:
      "If a customer expresses frustration, start by acknowledging their feelings and understanding the situation. Use empathetic phrases like \"I understand how…\" or \"That sounds…\" Move beyond just answering the question to showing genuine care.",
  },
  {
    title: "Use British English",
    description:
      "Always use British English conventions (e.g., 'colour' not 'color', 'organise' not 'organize'). Say 'labour' instead of 'labor' and 'centre' instead of 'center'.",
  },
  {
    title: "Add seasonal greetings",
    description:
      "For a warm customer experience during specific times of year, include seasonal greetings in your responses. For example: Winter: \"Happy holidays\"; Spring: \"Happy spring\"; Summer: \"Hope you're enjoying the sun.\"",
  },
  {
    title: "Avoid directing queries to email",
    description:
      "If a customer asks a question, try to help them right away. Only direct them to our support team if you can't help them directly. Never direct customers to send their query to a support email.",
  },
  {
    title: "Personalize responses with names",
    description:
      "When possible, address the customer by their name based on any available user info or their profile. If you know their name, begin your response with a personal greeting. For example, \"Hi Sarah, happy to help.\"",
  },
  {
    title: "Sales Representative",
    description:
      "Adopt a confident, persuasive tone that highlights value. Focus on benefits over features and always include a clear next step for the customer.",
  },
  {
    title: "Shopping Assistant",
    description:
      "Act as a helpful shopping guide. Recommend products based on the customer's needs, compare options, and proactively flag promotions or bundle deals.",
  },
  {
    title: "Support Specialist",
    description:
      "Be patient and thorough. Troubleshoot step by step, confirm understanding at each stage, and escalate to a human if the issue isn't resolved in two attempts.",
  },
];

export interface TemplatesModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: GuidanceTemplate) => void;
  title?: string;
  templates?: GuidanceTemplate[];
}

export function TemplatesModal({
  open,
  onClose,
  onSelect,
  title = "Communication style templates",
  templates = COMMUNICATION_STYLE_TEMPLATES,
}: TemplatesModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative flex max-h-[85vh] w-[920px] max-w-[calc(100vw-32px)] flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/60 shrink-0">
          <h2 className="text-[17px] font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-3 gap-3">
            {templates.map((tpl) => (
              <button
                key={tpl.title}
                onClick={() => {
                  onSelect(tpl);
                  onClose();
                }}
                className="text-left rounded-xl border border-border/60 p-4 hover:border-foreground/30 hover:bg-muted/20 transition-colors cursor-pointer"
              >
                <p className="text-[14px] font-semibold mb-1.5">{tpl.title}</p>
                <p className="text-[12.5px] leading-[1.5] text-muted-foreground line-clamp-5">
                  {tpl.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
