import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { UploadProgress } from "@/components/ui/upload-progress";

const meta: Meta<typeof UploadProgress> = {
  title: "UI/UploadProgress",
  component: UploadProgress,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Thin horizontal progress bar in the brand orange (`#e87537`). Used inside upload list rows to show byte-level upload progress. Accepts any number between 0 and 100 — values outside the range are clamped.",
      },
    },
  },
  argTypes: {
    progress: { control: { type: "range", min: 0, max: 100, step: 1 } },
  },
};
export default meta;
type Story = StoryObj<typeof UploadProgress>;

export const Zero: Story = {
  args: { progress: 0 },
  render: (args) => (
    <div className="w-[320px]">
      <UploadProgress {...args} />
    </div>
  ),
};

export const Midway: Story = {
  args: { progress: 42 },
  render: (args) => (
    <div className="w-[320px]">
      <UploadProgress {...args} />
    </div>
  ),
};

export const NearlyDone: Story = {
  args: { progress: 88 },
  render: (args) => (
    <div className="w-[320px]">
      <UploadProgress {...args} />
    </div>
  ),
};

export const Complete: Story = {
  args: { progress: 100 },
  render: (args) => (
    <div className="w-[320px]">
      <UploadProgress {...args} />
    </div>
  ),
};
