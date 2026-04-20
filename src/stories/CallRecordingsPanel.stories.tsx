import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CallRecordingsPanel } from "@/components/train/call-recordings-panel";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const meta: Meta<typeof CallRecordingsPanel> = {
  title: "Train/CallRecordingsPanel",
  component: CallRecordingsPanel,
  parameters: {
    layout: "fullscreen",
    convex: true,
    docs: {
      description: {
        component:
          "Slide-over for uploading audio call recordings. Shows a drop zone for MP3/WAV/M4A/OGG/WebM/MP4 files; each upload appears as a row with a progress bar during upload and a `Transcribing…` label while Convex processes it. The Done button is disabled until at least one recording is ready. Convex mutations are mocked in Storybook — uploads will not succeed, but the UI states are exercisable.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof CallRecordingsPanel>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open call recordings</Button>
        <CallRecordingsPanel open={open} onClose={() => setOpen(false)} />
      </div>
    );
  },
};
