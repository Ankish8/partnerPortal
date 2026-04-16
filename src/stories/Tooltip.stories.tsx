import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const meta: Meta = {
  title: "UI/Tooltip",
  parameters: {
    docs: {
      description: {
        component:
          "Contextual hint that appears on hover, built on `@base-ui/react` TooltipPrimitive. Renders in a portal with animation. Supports `side` (top/bottom/left/right), `sideOffset`, `align`, and optional arrow. Wrap your app in `TooltipProvider` once.",
      },
    },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a tooltip</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const IconButton: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger>
        <Button size="icon" variant="ghost">
          <Settings className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Settings</p>
      </TooltipContent>
    </Tooltip>
  ),
};
