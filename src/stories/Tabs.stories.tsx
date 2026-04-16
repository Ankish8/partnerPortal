import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const meta: Meta<typeof Tabs> = {
  title: "UI/Tabs",
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component:
          "Tab navigation built on `@base-ui/react` TabsPrimitive. Compose with `TabsList`, `TabsTrigger`, and `TabsContent`. Two list variants: `default` (pill background) and `line` (underline indicator). Supports horizontal and vertical orientations.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="tab1">Overview</TabsTrigger>
        <TabsTrigger value="tab2">Analytics</TabsTrigger>
        <TabsTrigger value="tab3">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="text-sm text-muted-foreground p-4">Overview content goes here.</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p className="text-sm text-muted-foreground p-4">Analytics content goes here.</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p className="text-sm text-muted-foreground p-4">Settings content goes here.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const LineVariant: Story = {
  render: () => (
    <Tabs defaultValue="customer" className="w-[400px]">
      <TabsList variant="line">
        <TabsTrigger value="customer">Customer view</TabsTrigger>
        <TabsTrigger value="event">Event log</TabsTrigger>
      </TabsList>
      <TabsContent value="customer">
        <p className="text-sm text-muted-foreground p-4">Customer view content.</p>
      </TabsContent>
      <TabsContent value="event">
        <p className="text-sm text-muted-foreground p-4">Event log content.</p>
      </TabsContent>
    </Tabs>
  ),
};
