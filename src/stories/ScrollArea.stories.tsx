import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const meta: Meta<typeof ScrollArea> = {
  title: "UI/ScrollArea",
  component: ScrollArea,
  parameters: {
    docs: {
      description: {
        component:
          "Custom scrollable container built on `@base-ui/react` ScrollAreaPrimitive. Renders a styled scrollbar thumb with rounded corners. Use `ScrollBar` with `orientation=\"horizontal\"` for horizontal scroll areas. Wrap any overflowing content — lists, galleries, or data tables.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ScrollArea>;

export const Vertical: Story = {
  render: () => (
    <ScrollArea className="h-[200px] w-[300px] rounded-lg border p-4">
      <div className="space-y-4">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="text-sm">
            <p className="font-medium">Item {i + 1}</p>
            <p className="text-muted-foreground">Description for item {i + 1}</p>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <ScrollArea className="w-[400px] rounded-lg border">
      <div className="flex gap-4 p-4">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="flex h-20 w-32 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-medium"
          >
            Card {i + 1}
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};

export const LongList: Story = {
  render: () => (
    <ScrollArea className="h-[300px] w-[250px] rounded-lg border">
      <div className="p-4">
        <h4 className="mb-3 text-sm font-semibold">Tags</h4>
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b py-2 text-sm last:border-0"
          >
            <span>Tag {i + 1}</span>
            <span className="text-muted-foreground">{Math.floor(Math.random() * 100)}</span>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};
