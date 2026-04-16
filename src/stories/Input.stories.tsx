import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          "Text input built on `@base-ui/react` InputPrimitive. Default height is `h-8` (32px). Supports placeholder, disabled, file type, and `aria-invalid` states. Pair with a search icon or labels as needed.",
      },
    },
  },
  argTypes: {
    placeholder: { description: "Placeholder text shown when empty" },
    disabled: { control: "boolean", description: "Disables input interaction" },
    type: { description: "HTML input type (`text`, `email`, `file`, etc.)" },
  },
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: "Enter text..." },
};

export const WithValue: Story = {
  args: { defaultValue: "Hello world" },
};

export const Disabled: Story = {
  args: { placeholder: "Disabled", disabled: true },
};

export const WithSearchIcon: Story = {
  render: () => (
    <div className="relative w-[300px]">
      <Search className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-muted-foreground" />
      <Input placeholder="Search..." className="pl-9 h-10 text-[14px]" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-[300px]">
      <Input placeholder="Default (h-8)" />
      <Input placeholder="Tall (h-10)" className="h-10" />
    </div>
  ),
};
