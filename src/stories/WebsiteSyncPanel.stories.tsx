import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WebsiteSyncPanel } from "@/components/train/website-sync-panel";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const meta: Meta<typeof WebsiteSyncPanel> = {
  title: "Train/WebsiteSyncPanel",
  component: WebsiteSyncPanel,
  parameters: {
    layout: "fullscreen",
    convex: true,
    docs: {
      description: {
        component:
          "Slide-over for configuring website crawls. Hosts the URL entry form, crawl-depth controls, and the live list of synced pages. In Storybook the Cloudflare crawl endpoint is not reachable, so the panel demonstrates the idle and empty states — end-to-end crawling must be verified in the running app.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof WebsiteSyncPanel>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open website sync</Button>
        <WebsiteSyncPanel open={open} onClose={() => setOpen(false)} />
      </div>
    );
  },
};
