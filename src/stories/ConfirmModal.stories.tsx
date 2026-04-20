import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const meta: Meta<typeof ConfirmModal> = {
  title: "UI/ConfirmModal",
  component: ConfirmModal,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Lightweight confirmation dialog built on the AlertDialog primitive. Uses dashed dividers between title, body, and actions. Two buttons: a grey `cancel` pill (defaults to \"Keep editing\") and a dark `confirm` pill (defaults to \"Discard\"). Use `confirmVariant=\"destructive\"` to render the confirm button in the destructive red style.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ConfirmModal>;

export const UnsavedChanges: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open unsaved changes</Button>
        <ConfirmModal
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={() => console.log("discarded")}
          title="Unsaved Changes"
          description="You haven't finished creating this guidance. If you leave now, your changes will be lost."
        />
      </div>
    );
  },
};

export const CustomLabels: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open with custom labels</Button>
        <ConfirmModal
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={() => console.log("confirmed")}
          title="Leave this page?"
          description="Your draft will be saved but the preview will be closed."
          cancelLabel="Stay here"
          confirmLabel="Leave"
        />
      </div>
    );
  },
};

export const Destructive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open destructive confirm</Button>
        <ConfirmModal
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={() => console.log("deleted")}
          title="Delete guidance?"
          description="This guidance will be permanently removed. This action cannot be undone."
          cancelLabel="Cancel"
          confirmLabel="Delete"
          confirmVariant="destructive"
        />
      </div>
    );
  },
};
