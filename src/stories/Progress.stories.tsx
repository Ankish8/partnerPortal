import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Progress } from "@/components/ui/progress";

const meta: Meta<typeof Progress> = {
  title: "UI/Progress",
  component: Progress,
  parameters: {
    docs: {
      description: {
        component:
          "Determinate progress bar built on `@base-ui/react` ProgressPrimitive. The `Progress` root includes a track and indicator automatically. Optionally add `ProgressLabel` and `ProgressValue` for accessible labeling. Track height is 4px with a rounded indicator. Used for file uploads, crawl progress, and processing status.",
      },
    },
  },
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100 },
      description: "Current progress value (0–100)",
    },
  },
};
export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: { value: 40 },
  render: (args) => (
    <div className="w-[400px]">
      <Progress {...args} />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="w-[400px]">
      <Progress value={0} />
    </div>
  ),
};

export const Half: Story = {
  render: () => (
    <div className="w-[400px]">
      <Progress value={50} />
    </div>
  ),
};

export const Complete: Story = {
  render: () => (
    <div className="w-[400px]">
      <Progress value={100} />
    </div>
  ),
};

export const AllStages: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <div>
        <p className="mb-1 text-xs text-muted-foreground">Queued (0%)</p>
        <Progress value={0} />
      </div>
      <div>
        <p className="mb-1 text-xs text-muted-foreground">Crawling (25%)</p>
        <Progress value={25} />
      </div>
      <div>
        <p className="mb-1 text-xs text-muted-foreground">Processing (60%)</p>
        <Progress value={60} />
      </div>
      <div>
        <p className="mb-1 text-xs text-muted-foreground">Complete (100%)</p>
        <Progress value={100} />
      </div>
    </div>
  ),
};
