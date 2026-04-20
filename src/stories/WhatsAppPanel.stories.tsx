import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WhatsAppPanel } from "@/components/train/whatsapp-panel";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const meta: Meta<typeof WhatsAppPanel> = {
  title: "Train/WhatsAppPanel",
  component: WhatsAppPanel,
  parameters: {
    layout: "fullscreen",
    convex: true,
    docs: {
      description: {
        component:
          "Two-tab slide-over for WhatsApp knowledge sources. The `Import export` tab accepts .txt/.zip chat exports and renders imported chats with message counts and date ranges. The `Connect API` tab captures a phone number and access token for the WhatsApp Business API. The primary action swaps between `Done` and `Connect WhatsApp` based on the active tab.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof WhatsAppPanel>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open WhatsApp panel</Button>
        <WhatsAppPanel open={open} onClose={() => setOpen(false)} />
      </div>
    );
  },
};
