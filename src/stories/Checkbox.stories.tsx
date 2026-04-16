import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Checkbox } from "@/components/ui/checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component:
          "Checkbox input built on `@base-ui/react` CheckboxPrimitive. Shows a check icon when selected. Pair with a `<label>` element for accessible click targets. Used in page selection, filters, and settings.",
      },
    },
  },
  argTypes: {
    defaultChecked: { control: "boolean", description: "Initial checked state (uncontrolled)" },
    disabled: { control: "boolean", description: "Disables checkbox interaction" },
  },
};
export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const WithLabel: Story = {
  render: () => (
    <label className="flex items-center gap-2 cursor-pointer">
      <Checkbox />
      <span className="text-sm">Accept terms and conditions</span>
    </label>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const CheckboxGroup: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <Checkbox defaultChecked />
        <span className="text-sm">Website Pages</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <Checkbox defaultChecked />
        <span className="text-sm">Documents</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <Checkbox />
        <span className="text-sm">Call Recordings</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <Checkbox />
        <span className="text-sm">WhatsApp Chats</span>
      </label>
    </div>
  ),
};
