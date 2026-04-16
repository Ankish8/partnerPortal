import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Separator } from "@/components/ui/separator";

const meta: Meta<typeof Separator> = {
  title: "UI/Separator",
  component: Separator,
  parameters: {
    docs: {
      description: {
        component:
          "Visual divider built on `@base-ui/react` SeparatorPrimitive. Supports `horizontal` (default) and `vertical` orientations. Use between content sections, menu items, or inline elements.",
      },
    },
  },
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "Divider direction",
      table: { defaultValue: { summary: "horizontal" } },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-[300px]">
      <p className="text-sm">Content above</p>
      <Separator className="my-4" />
      <p className="text-sm">Content below</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex items-center gap-4 h-8">
      <span className="text-sm">Left</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Right</span>
    </div>
  ),
};
