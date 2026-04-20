import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DocumentsPanel } from "@/components/train/documents-panel";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const meta: Meta<typeof DocumentsPanel> = {
  title: "Train/DocumentsPanel",
  component: DocumentsPanel,
  parameters: {
    layout: "fullscreen",
    convex: true,
    docs: {
      description: {
        component:
          "Slide-over for uploading knowledge-source documents (PDF, DOCX, TXT, MD, CSV, XLSX, PPTX). Each upload renders as a list row with an inline `UploadProgress` bar during transfer and an `UploadStatusIndicator` for processing/ready/error states. Convex mutations are mocked in Storybook — the drop zone and state transitions can be exercised but files will not persist.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof DocumentsPanel>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open documents</Button>
        <DocumentsPanel open={open} onClose={() => setOpen(false)} />
      </div>
    );
  },
};
