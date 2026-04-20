import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  KnowledgeDetailPanel,
  type KnowledgeEntry,
} from "@/components/configure/knowledge-detail-panel";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const meta: Meta<typeof KnowledgeDetailPanel> = {
  title: "Configure/KnowledgeDetailPanel",
  component: KnowledgeDetailPanel,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Slide-over that renders a single knowledge base entry: question, answer, tag, status, confidence, source, timestamps, and linked intent. Footer exposes Edit plus an Activate/Deactivate toggle via `SlidePanelFooter` depending on the entry status.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof KnowledgeDetailPanel>;

const activeEntry: KnowledgeEntry = {
  id: "kb-001",
  shortId: "KB-001",
  question: "What is the return window for online orders?",
  answer:
    "Online orders can be returned within 14 days of delivery. The item must be unused and in its original packaging. Refunds are issued to the original payment method within 5 business days of our warehouse receiving the return.",
  tag: "returns",
  version: 3,
  status: "active",
  confidence: 94,
  sourceType: "document",
  sourceId: "doc-123",
  intent: "Request refund",
  scenarioType: "policy",
  activationPolicy: "always",
  createdAt: "Jan 12, 2026",
  updatedAt: "Mar 02, 2026",
};

const inactiveEntry: KnowledgeEntry = {
  ...activeEntry,
  id: "kb-002",
  status: "inactive",
  question: "Do you ship internationally?",
  answer:
    "We currently ship to India, the US, and the UK. International orders outside those regions are paused while we rework our logistics partner contracts.",
  sourceType: "website",
  intent: "Check shipping availability",
  confidence: 68,
};

export const Active: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open active entry</Button>
        <KnowledgeDetailPanel
          open={open}
          onClose={() => setOpen(false)}
          entry={activeEntry}
        />
      </div>
    );
  },
};

export const Inactive: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open inactive entry</Button>
        <KnowledgeDetailPanel
          open={open}
          onClose={() => setOpen(false)}
          entry={inactiveEntry}
        />
      </div>
    );
  },
};
