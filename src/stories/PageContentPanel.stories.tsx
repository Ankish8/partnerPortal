import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PageContentPanel } from "@/components/train/page-content-panel";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const meta: Meta<typeof PageContentPanel> = {
  title: "Train/PageContentPanel",
  component: PageContentPanel,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Slide-over that renders a synced website page: title, URL, crawled markdown, and collapsible details sections (links, metadata, tags, raw source). Includes a maximize/minimize toggle. Images and SVGs are stripped from the markdown; links are styled with a dark underline.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof PageContentPanel>;

const sampleMarkdown = `# Return Policy

We accept returns within **14 days** of delivery for any reason.

## How to return an item

1. Sign in and open your order
2. Click _Start a return_ next to the item
3. Drop the parcel at any courier pickup point

Refunds land in your original payment method within **5 business days** of our warehouse receiving the return.

Need help? [Contact support](https://example.com/support).
`;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open page content</Button>
        <PageContentPanel
          open={open}
          onClose={() => setOpen(false)}
          title="Return Policy"
          url="https://example.com/returns"
          markdown={sampleMarkdown}
        />
      </div>
    );
  },
};

export const EmptyMarkdown: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open empty page</Button>
        <PageContentPanel
          open={open}
          onClose={() => setOpen(false)}
          title="Untitled page"
          url="https://example.com/untitled"
        />
      </div>
    );
  },
};
