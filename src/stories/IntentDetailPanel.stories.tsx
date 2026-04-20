import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  IntentDetailPanel,
  type Intent,
} from "@/components/configure/intent-detail-panel";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const meta: Meta<typeof IntentDetailPanel> = {
  title: "Configure/IntentDetailPanel",
  component: IntentDetailPanel,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Slide-over that displays a single intent's description, sample queries, source, status, confidence, and audience. Has `Content` and `Testing` tabs; the Testing tab shows a placeholder chat input. Footer exposes Delete (leading), Cancel, and Save actions via `SlidePanelFooter`.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof IntentDetailPanel>;

const enabledIntent: Intent = {
  id: "int-001",
  name: "Check order status",
  description:
    "Customer wants to know where their order is — typically asking for a delivery window, a tracking number, or a status update.",
  source: "whatsapp",
  flowLinked: true,
  sampleQueries: [
    "Where is my order?",
    "Has my package shipped yet?",
    "Can I get a tracking link for order #4829?",
  ],
  confidence: 92,
};

const draftIntent: Intent = {
  id: "int-002",
  name: "Request refund",
  description:
    "Customer wants a refund for a recent purchase. Always ask for the order number before confirming eligibility.",
  source: "call",
  flowLinked: false,
  sampleQueries: [
    "I'd like to return this please.",
    "Can I get my money back?",
  ],
  confidence: 74,
};

export const Enabled: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open enabled intent</Button>
        <IntentDetailPanel
          open={open}
          onClose={() => setOpen(false)}
          intent={enabledIntent}
        />
      </div>
    );
  },
};

export const Draft: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open draft intent</Button>
        <IntentDetailPanel
          open={open}
          onClose={() => setOpen(false)}
          intent={draftIntent}
        />
      </div>
    );
  },
};
