import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GuidancePreviewPanel } from "@/components/train/guidance-preview-panel";

const meta: Meta<typeof GuidancePreviewPanel> = {
  title: "Train/GuidancePreviewPanel",
  component: GuidancePreviewPanel,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Working preview chat that posts to `/api/chat` with the current `guidance` rules applied. Renders user and assistant message bubbles, a typing indicator while loading, and an event log tab that records each turn with latency and rule count. The reset icon clears the conversation. In Storybook the API call will fail (no route handler), so use these stories to verify the empty, typing, and error states visually — end-to-end behaviour must be tested in the running Next.js app.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof GuidancePreviewPanel>;

export const Empty: Story = {
  render: () => (
    <div className="flex h-screen items-center justify-center bg-muted/20 p-8">
      <div className="rounded-xl border border-border bg-white shadow-sm">
        <GuidancePreviewPanel />
      </div>
    </div>
  ),
};

export const WithDraftGuidance: Story = {
  render: () => (
    <div className="flex h-screen items-center justify-center bg-muted/20 p-8">
      <div className="rounded-xl border border-border bg-white shadow-sm">
        <GuidancePreviewPanel
          guidance={[
            {
              title: "Keep it short",
              content:
                "Reply in under two sentences unless the customer asks for more detail.",
            },
          ]}
        />
      </div>
    </div>
  ),
};

export const WithMultipleRules: Story = {
  render: () => (
    <div className="flex h-screen items-center justify-center bg-muted/20 p-8">
      <div className="rounded-xl border border-border bg-white shadow-sm">
        <GuidancePreviewPanel
          guidance={[
            {
              title: "Friendly tone",
              content:
                "Always greet the customer warmly and sign off with a thank-you.",
            },
            {
              title: "No speculation",
              content:
                "If you do not know the answer, say so instead of guessing.",
            },
            {
              title: "Refund policy",
              content:
                "Refunds are only possible within 14 days of purchase. Ask for an order number before confirming eligibility.",
            },
          ]}
        />
      </div>
    </div>
  ),
};

export const Closable: Story = {
  render: () => (
    <div className="flex h-screen items-center justify-center bg-muted/20 p-8">
      <div className="rounded-xl border border-border bg-white shadow-sm">
        <GuidancePreviewPanel
          guidance={[]}
          onClose={() => console.log("preview closed")}
        />
      </div>
    </div>
  ),
};

export const WithPersonality: Story = {
  render: () => (
    <div className="flex h-screen items-center justify-center bg-muted/20 p-8">
      <div className="rounded-xl border border-border bg-white shadow-sm">
        <GuidancePreviewPanel
          guidance={[
            {
              title: "Keep it short",
              content:
                "Reply in under two sentences unless the customer asks for more detail.",
            },
          ]}
          personality={{ tone: "Professional", length: "Concise" }}
        />
      </div>
    </div>
  ),
};
