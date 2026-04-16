import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SlidePanel } from "@/components/ui/slide-panel";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const meta: Meta<typeof SlidePanel> = {
  title: "UI/SlidePanel",
  component: SlidePanel,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Slide-in drawer that enters from the right edge. Includes a header with title, close button, and optional \"Learn more\" link. Closes on Escape key or backdrop click (configurable via `disableBackdropClose`). Default width is 440px, adjustable via `panelClassName`. Used for detail views, forms, and configuration panels.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof SlidePanel>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open Panel</Button>
        <SlidePanel open={open} onClose={() => setOpen(false)} title="Panel Title">
          <div className="p-4">
            <p className="text-sm text-muted-foreground">Panel content goes here.</p>
          </div>
        </SlidePanel>
      </div>
    );
  },
};

export const Wide: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open Wide Panel</Button>
        <SlidePanel
          open={open}
          onClose={() => setOpen(false)}
          title="Details"
          panelClassName="!w-[560px]"
        >
          <div className="p-4">
            <p className="text-sm text-muted-foreground">Wide panel with more space.</p>
          </div>
        </SlidePanel>
      </div>
    );
  },
};

export const WithLearnMore: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open Panel</Button>
        <SlidePanel
          open={open}
          onClose={() => setOpen(false)}
          title="Configuration"
          learnMoreHref="#"
        >
          <div className="p-4">
            <p className="text-sm text-muted-foreground">Panel with learn more link.</p>
          </div>
        </SlidePanel>
      </div>
    );
  },
};
