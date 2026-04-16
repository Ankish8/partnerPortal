import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Switch } from "@/components/ui/switch";

const meta: Meta<typeof Switch> = {
  title: "UI/Switch",
  component: Switch,
  parameters: {
    docs: {
      description: {
        component:
          "Toggle switch built on `@base-ui/react` SwitchPrimitive. Supports `default` and `sm` sizes. Animated thumb slides on toggle. Use for boolean on/off settings like enabling notifications or features.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm"],
      description: "Size preset",
      table: { defaultValue: { summary: "default" } },
    },
    disabled: { control: "boolean", description: "Disables toggle interaction" },
    defaultChecked: { control: "boolean", description: "Initial checked state (uncontrolled)" },
  },
};
export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Small: Story = {
  args: { size: "sm" },
};

export const SmallChecked: Story = {
  args: { size: "sm", defaultChecked: true },
};

export const WithLabel: Story = {
  render: () => (
    <label className="flex items-center gap-2 cursor-pointer">
      <Switch />
      <span className="text-sm">Enable notifications</span>
    </label>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <label className="flex items-center gap-2">
        <Switch />
        <span className="text-sm">Default off</span>
      </label>
      <label className="flex items-center gap-2">
        <Switch defaultChecked />
        <span className="text-sm">Default on</span>
      </label>
      <label className="flex items-center gap-2">
        <Switch size="sm" />
        <span className="text-sm">Small off</span>
      </label>
      <label className="flex items-center gap-2">
        <Switch size="sm" defaultChecked />
        <span className="text-sm">Small on</span>
      </label>
      <label className="flex items-center gap-2">
        <Switch disabled />
        <span className="text-sm text-muted-foreground">Disabled</span>
      </label>
    </div>
  ),
};
