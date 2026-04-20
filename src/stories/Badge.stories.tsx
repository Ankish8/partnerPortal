import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "@/components/ui/badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    docs: {
      description: {
        component:
          "Small status label for categorization and metadata. Renders as an inline-flex pill with six visual variants. Used for statuses (enabled/disabled), tags, and channel labels.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "destructive",
        "outline",
        "success",
        "ghost",
        "link",
      ],
      description: "Visual style of the badge",
      table: { defaultValue: { summary: "default" } },
    },
    children: {
      description: "Badge label text",
    },
  },
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: { children: "Badge" },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Secondary" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "Destructive" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Outline" },
};

export const Success: Story = {
  args: { variant: "success", children: "Enabled" },
};

export const Ghost: Story = {
  args: { variant: "ghost", children: "Ghost" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="link">Link</Badge>
    </div>
  ),
};

export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <Badge variant="success">Enabled</Badge>
      <Badge variant="outline">Not enabled</Badge>
      <Badge variant="outline">Everyone on All channels</Badge>
      <Badge variant="outline">New</Badge>
    </div>
  ),
};
