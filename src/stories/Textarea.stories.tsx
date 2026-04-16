import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Textarea } from "@/components/ui/textarea";

const meta: Meta<typeof Textarea> = {
  title: "UI/Textarea",
  component: Textarea,
  parameters: {
    docs: {
      description: {
        component:
          "Multi-line text input with `field-sizing: content` for auto-grow behavior. Minimum height is `min-h-16` (64px). Supports a borderless mode for inline editing inside cards or panels.",
      },
    },
  },
  argTypes: {
    placeholder: { description: "Placeholder text shown when empty" },
    disabled: { control: "boolean", description: "Disables textarea interaction" },
  },
};
export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: { placeholder: "Type your message..." },
  decorators: [(Story) => <div className="w-[400px]"><Story /></div>],
};

export const WithContent: Story = {
  args: {
    defaultValue: "You are a helpful shopping assistant. Your goal is to guide customers toward making a purchase.",
  },
  decorators: [(Story) => <div className="w-[400px]"><Story /></div>],
};

export const Borderless: Story = {
  render: () => (
    <div className="w-[400px] border border-border/60 rounded-xl p-4">
      <Textarea
        defaultValue="Borderless textarea for inline editing."
        className="border-0 p-0 shadow-none focus-visible:ring-0 text-[14px] resize-none"
      />
    </div>
  ),
};

export const Disabled: Story = {
  args: { placeholder: "Disabled", disabled: true },
  decorators: [(Story) => <div className="w-[400px]"><Story /></div>],
};
