import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AnimateHeight } from "@/components/ui/animate-height";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const meta: Meta<typeof AnimateHeight> = {
  title: "UI/AnimateHeight",
  component: AnimateHeight,
  parameters: {
    docs: {
      description: {
        component:
          "Smooth height transition wrapper. Pass `expanded` to show/hide children with an animated height and opacity change. Default duration is 200ms, configurable via the `duration` prop. Use for accordion sections, expandable details, and collapsible panels.",
      },
    },
  },
  argTypes: {
    expanded: { control: "boolean", description: "Whether the content is visible" },
    duration: {
      control: { type: "number", min: 50, max: 1000, step: 50 },
      description: "Animation duration in milliseconds",
      table: { defaultValue: { summary: "200" } },
    },
  },
};
export default meta;
type Story = StoryObj<typeof AnimateHeight>;

export const Default: Story = {
  render: () => {
    const [expanded, setExpanded] = useState(false);
    return (
      <div className="w-[400px]">
        <Button size="sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Collapse" : "Expand"}
        </Button>
        <AnimateHeight expanded={expanded}>
          <div className="mt-3 rounded-lg border p-4">
            <p className="text-sm font-medium">Expandable content</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This section smoothly animates open and closed. It can contain any content including
              text, forms, or other components.
            </p>
          </div>
        </AnimateHeight>
      </div>
    );
  },
};

export const InitiallyExpanded: Story = {
  render: () => {
    const [expanded, setExpanded] = useState(true);
    return (
      <div className="w-[400px]">
        <Button size="sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Collapse" : "Expand"}
        </Button>
        <AnimateHeight expanded={expanded}>
          <div className="mt-3 rounded-lg border p-4">
            <p className="text-sm font-medium">Starts expanded</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This section is visible by default and can be collapsed.
            </p>
          </div>
        </AnimateHeight>
      </div>
    );
  },
};

export const SlowAnimation: Story = {
  render: () => {
    const [expanded, setExpanded] = useState(false);
    return (
      <div className="w-[400px]">
        <Button size="sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Collapse" : "Expand"} (500ms)
        </Button>
        <AnimateHeight expanded={expanded} duration={500}>
          <div className="mt-3 rounded-lg border p-4">
            <p className="text-sm font-medium">Slow animation</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This uses a custom 500ms duration for a slower transition.
            </p>
          </div>
        </AnimateHeight>
      </div>
    );
  },
};

export const MultipleItems: Story = {
  render: () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const items = [
      { title: "Section 1", content: "Content for the first section with some details." },
      { title: "Section 2", content: "Content for the second section with different info." },
      { title: "Section 3", content: "Content for the third section with more data." },
    ];
    return (
      <div className="w-[400px] space-y-2">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border">
            <button
              className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              {item.title}
            </button>
            <AnimateHeight expanded={openIndex === i}>
              <div className="border-t px-4 py-3">
                <p className="text-sm text-muted-foreground">{item.content}</p>
              </div>
            </AnimateHeight>
          </div>
        ))}
      </div>
    );
  },
};
