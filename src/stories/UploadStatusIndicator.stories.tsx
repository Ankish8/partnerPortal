import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { UploadStatusIndicator } from "@/components/ui/upload-status";

const meta: Meta<typeof UploadStatusIndicator> = {
  title: "UI/UploadStatusIndicator",
  component: UploadStatusIndicator,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Compact status cluster used at the trailing edge of upload list rows. Shows a spinner while uploading, a processing/transcribing label for post-upload work, a green check when ready, and a red alert on error. An optional `onRemove` callback renders an X button that dismisses the row. Used by the documents, call recordings, and WhatsApp upload panels.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof UploadStatusIndicator>;

const Row = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3 rounded-lg border border-border/60 px-4 py-3 w-[360px]">
    <div className="flex-1 text-[13px] font-medium">example-file.pdf</div>
    {children}
  </div>
);

export const Uploading: Story = {
  render: () => (
    <Row>
      <UploadStatusIndicator status="uploading" onRemove={() => {}} />
    </Row>
  ),
};

export const Processing: Story = {
  render: () => (
    <Row>
      <UploadStatusIndicator status="processing" onRemove={() => {}} />
    </Row>
  ),
};

export const Transcribing: Story = {
  render: () => (
    <Row>
      <UploadStatusIndicator status="transcribing" onRemove={() => {}} />
    </Row>
  ),
};

export const Ready: Story = {
  render: () => (
    <Row>
      <UploadStatusIndicator status="ready" onRemove={() => {}} />
    </Row>
  ),
};

export const Error: Story = {
  render: () => (
    <Row>
      <UploadStatusIndicator status="error" onRemove={() => {}} />
    </Row>
  ),
};

export const WithoutRemove: Story = {
  render: () => (
    <Row>
      <UploadStatusIndicator status="ready" />
    </Row>
  ),
};
