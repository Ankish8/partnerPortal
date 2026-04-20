import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Settings, ChevronDown, Mail } from "lucide-react";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          "Primary interactive element built on `@base-ui/react` ButtonPrimitive. Supports six visual variants and six size presets including icon-only modes. Uses `class-variance-authority` for variant composition.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost", "destructive", "link"],
      description: "Visual style of the button",
      table: { defaultValue: { summary: "default" } },
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon", "icon-sm", "icon-lg"],
      description: "Size preset — `icon` sizes render a square button for icon-only use",
      table: { defaultValue: { summary: "default" } },
    },
    disabled: {
      control: "boolean",
      description: "Disables the button and applies muted styling",
    },
    children: {
      control: "text",
      description: "Button label — can include text, icons, or both",
    },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { children: "Button" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Outline" },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Secondary" },
};

export const Ghost: Story = {
  args: { variant: "ghost", children: "Ghost" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "Delete" },
};

export const Link: Story = {
  args: { variant: "link", children: "Link Button" },
};

export const Small: Story = {
  args: { size: "sm", children: "Small" },
};

export const Large: Story = {
  args: { size: "lg", children: "Large" },
};

export const Icon: Story = {
  args: { size: "icon", children: <Settings className="h-4 w-4" /> },
};

export const WithIcon: Story = {
  args: {
    size: "sm",
    children: (
      <>
        <Plus className="h-3.5 w-3.5 mr-1" />
        Add Item
      </>
    ),
  },
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon"><Mail className="h-4 w-4" /></Button>
    </div>
  ),
};

export const RoundedPills: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <Button variant="secondary" className="rounded-full">
        <Plus className="h-4 w-4" /> New
      </Button>
      <Button variant="outline" className="rounded-full">
        Cancel
      </Button>
      <Button className="rounded-full bg-emerald-700 text-white hover:bg-emerald-800">
        Enable
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: { children: "Disabled", disabled: true },
};
