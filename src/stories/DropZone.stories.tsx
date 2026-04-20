import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DropZone } from "@/components/train/drop-zone";
import { Upload, Mic, MessageSquare } from "lucide-react";

const meta: Meta<typeof DropZone> = {
  title: "Train/DropZone",
  component: DropZone,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Dashed-border upload area that accepts clicks and drag-and-drop. Switches to the brand orange when a file is dragged over it. Takes an `icon`, a primary message, a secondary hint, and an optional `draggingText` that replaces the primary message during drag-over.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof DropZone>;

export const Documents: Story = {
  render: () => (
    <div className="w-[520px]">
      <DropZone
        accept=".pdf,.docx,.txt"
        onFiles={() => {}}
        icon={<Upload className="h-5 w-5 text-muted-foreground" />}
        primaryText="Click to upload or drag and drop"
        draggingText="Drop files here"
        secondaryText="PDF, DOCX, TXT, MD, CSV, XLSX, PPTX up to 25MB each"
      />
    </div>
  ),
};

export const CallRecordings: Story = {
  render: () => (
    <div className="w-[520px]">
      <DropZone
        accept=".mp3,.wav"
        onFiles={() => {}}
        icon={<Mic className="h-5 w-5 text-muted-foreground" />}
        primaryText="Click to upload or drag and drop"
        draggingText="Drop recordings here"
        secondaryText="MP3, WAV, M4A, OGG, WebM, MP4 up to 100MB each"
      />
    </div>
  ),
};

export const WhatsAppExports: Story = {
  render: () => (
    <div className="w-[520px]">
      <DropZone
        accept=".txt,.zip"
        onFiles={() => {}}
        icon={<MessageSquare className="h-5 w-5 text-muted-foreground" />}
        primaryText="Upload WhatsApp chat exports"
        draggingText="Drop chat exports here"
        secondaryText=".txt or .zip files exported from WhatsApp"
      />
    </div>
  ),
};
