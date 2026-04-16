import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";

const meta: Meta<typeof Avatar> = {
  title: "UI/Avatar",
  component: Avatar,
  parameters: {
    docs: {
      description: {
        component:
          "User avatar built on `@base-ui/react` AvatarPrimitive. Compose with `AvatarImage`, `AvatarFallback`, and optional `AvatarBadge`. Supports `sm` (24px), `default` (32px), and `lg` (40px) sizes. Use `AvatarGroup` with `AvatarGroupCount` to show stacked users.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
      description: "Avatar diameter — sm (24px), default (32px), lg (40px)",
      table: { defaultValue: { summary: "default" } },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://i.pravatar.cc/150?u=1" alt="User" />
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
  ),
};

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const Small: Story = {
  render: () => (
    <Avatar size="sm">
      <AvatarImage src="https://i.pravatar.cc/150?u=2" alt="User" />
      <AvatarFallback>SM</AvatarFallback>
    </Avatar>
  ),
};

export const Large: Story = {
  render: () => (
    <Avatar size="lg">
      <AvatarImage src="https://i.pravatar.cc/150?u=3" alt="User" />
      <AvatarFallback>LG</AvatarFallback>
    </Avatar>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="sm">
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <Avatar size="lg">
      <AvatarImage src="https://i.pravatar.cc/150?u=4" alt="User" />
      <AvatarFallback>AB</AvatarFallback>
      <AvatarBadge />
    </Avatar>
  ),
};

export const Group: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar>
        <AvatarImage src="https://i.pravatar.cc/150?u=5" alt="User 1" />
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://i.pravatar.cc/150?u=6" alt="User 2" />
        <AvatarFallback>B</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://i.pravatar.cc/150?u=7" alt="User 3" />
        <AvatarFallback>C</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+5</AvatarGroupCount>
    </AvatarGroup>
  ),
};
