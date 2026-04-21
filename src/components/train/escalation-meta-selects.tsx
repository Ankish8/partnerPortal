"use client";

import { useState } from "react";
import { Check, ChevronDown, Zap, HandHelping, HelpCircle, Ban, Users, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export type RuleMode = "immediate" | "offer";
export type GuidanceMode = "immediate" | "offer" | "ask_more" | "never";

export const RULE_MODE_OPTIONS: Array<{
  value: RuleMode;
  label: string;
  description: string;
}> = [
  {
    value: "immediate",
    label: "Immediate",
    description: "Hand off to a human as soon as the rule matches.",
  },
  {
    value: "offer",
    label: "Offer",
    description:
      "Ask the customer if they want a human. Escalate only if they accept.",
  },
];

export const GUIDANCE_MODE_OPTIONS: Array<{
  value: GuidanceMode;
  label: string;
  description: string;
}> = [
  {
    value: "immediate",
    label: "Immediate",
    description: "Hand off to a human as soon as this guidance applies.",
  },
  {
    value: "offer",
    label: "Offer",
    description:
      "Ask the customer if they want a human. Escalate only if they accept.",
  },
  {
    value: "ask_more",
    label: "Ask more",
    description:
      "Ask a clarifying question before deciding whether to escalate.",
  },
  {
    value: "never",
    label: "Never",
    description: "Keep the agent handling the conversation; do not hand off.",
  },
];

export const AUDIENCE_OPTIONS = [
  "Everyone",
  "Logged-in customers",
  "Logged-out visitors",
];

export const CHANNEL_OPTIONS = [
  "All channels",
  "Web",
  "WhatsApp",
  "Email",
];

export function ModeSelect<M extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: M;
  onChange: (v: M) => void;
  options: Array<{ value: M; label: string; description: string }>;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value) ?? options[0];
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 h-7 text-[12.5px] hover:bg-muted/30 transition-colors cursor-pointer",
              className,
            )}
          />
        }
      >
        <ModeIcon mode={current.value} className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium">{current.label}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="w-[300px] !p-1" sideOffset={6}>
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors cursor-pointer",
                selected ? "bg-muted" : "hover:bg-muted/50",
              )}
            >
              <ModeIcon
                mode={o.value}
                className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium leading-tight">{o.label}</p>
                <p className="text-[12px] text-muted-foreground leading-[1.35] mt-0.5">
                  {o.description}
                </p>
              </div>
              {selected && (
                <Check className="h-3.5 w-3.5 text-[#e87537] shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

function ModeIcon({ mode, className }: { mode: string; className?: string }) {
  switch (mode) {
    case "offer":
      return <HandHelping className={className} />;
    case "ask_more":
      return <HelpCircle className={className} />;
    case "never":
      return <Ban className={className} />;
    case "immediate":
    default:
      return <Zap className={className} />;
  }
}

export function AudienceSelect({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <SimpleOptionSelect
      icon={Users}
      value={value}
      onChange={onChange}
      options={AUDIENCE_OPTIONS}
      className={className}
    />
  );
}

export function ChannelSelect({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <SimpleOptionSelect
      icon={Globe}
      value={value}
      onChange={onChange}
      options={CHANNEL_OPTIONS}
      className={className}
    />
  );
}

function SimpleOptionSelect({
  icon: Icon,
  value,
  onChange,
  options,
  className,
}: {
  icon: typeof Users;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 h-7 text-[12.5px] hover:bg-muted/30 transition-colors cursor-pointer",
              className,
            )}
          />
        }
      >
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium">{value}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="!p-1 min-w-[180px]" sideOffset={6}>
        {options.map((o) => {
          const selected = o === value;
          return (
            <button
              key={o}
              type="button"
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors cursor-pointer",
                selected ? "bg-muted" : "hover:bg-muted/50",
              )}
            >
              <span>{o}</span>
              {selected && <Check className="h-3.5 w-3.5 text-[#e87537]" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

const MODE_LABELS: Record<GuidanceMode, string> = {
  immediate: "Immediate",
  offer: "Offer",
  ask_more: "Ask more",
  never: "Never",
};

export function modeLabel(mode: string): string {
  return MODE_LABELS[mode as GuidanceMode] ?? "Immediate";
}
