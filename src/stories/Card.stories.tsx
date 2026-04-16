import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          "Composable container with `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, and `CardFooter` sub-components. Supports `default` and `sm` size presets that adjust padding. Use for grouped content blocks, settings panels, and list items.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm"],
      description: "Padding density — `sm` reduces internal spacing",
      table: { defaultValue: { summary: "default" } },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description with supporting text.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here.</p>
      </CardContent>
      <CardFooter>
        <Button size="sm">Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const Small: Story = {
  render: () => (
    <Card size="sm" className="w-[380px]">
      <CardHeader>
        <CardTitle>Small Card</CardTitle>
        <CardDescription>Compact card variant.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Less padding.</p>
      </CardContent>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-[380px]">
      <CardContent className="p-5">
        <p className="text-sm font-semibold mb-1">Simple Card</p>
        <p className="text-xs text-muted-foreground">Just content, no header or footer.</p>
      </CardContent>
    </Card>
  ),
};
