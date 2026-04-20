import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  AttributesDetailPanel,
  type AttributeDraft,
} from "@/components/train/attributes-detail-panel";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const meta: Meta<typeof AttributesDetailPanel> = {
  title: "Train/AttributesDetailPanel",
  component: AttributesDetailPanel,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Three-tab slide-over for editing a customer attribute draft: General (title, description, category, audience, enabled), Values (list of allowed values), and Conditions (dependencies on other attributes). Deletion is confirmed through `ConfirmModal`. Convex IDs are supplied as mock values in Storybook.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof AttributesDetailPanel>;

const draft: AttributeDraft = {
  _id: "attr_mock_1" as Id<"attributes">,
  title: "Preferred language",
  description:
    "The language the customer prefers the agent to reply in. Detected from prior conversation and profile data.",
  category: "routing",
  enabled: true,
  audience: "Everyone",
  redetectOnClose: false,
  values: [
    { id: "v1", name: "English", description: "Default reply language" },
    { id: "v2", name: "Hindi", description: "Use for customers in India" },
    { id: "v3", name: "Arabic", description: "Use for customers in MENA" },
  ],
  conditions: [],
  stats: { detected: 1284 },
};

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open attribute</Button>
        <AttributesDetailPanel
          open={open}
          draft={draft}
          otherAttributes={[
            {
              _id: "attr_mock_2" as Id<"attributes">,
              title: "Customer tier",
              values: [
                { id: "t1", name: "Free" },
                { id: "t2", name: "Pro" },
              ],
            },
          ]}
          onClose={() => setOpen(false)}
          onSave={() => setOpen(false)}
          onDelete={() => setOpen(false)}
        />
      </div>
    );
  },
};
