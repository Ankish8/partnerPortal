import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  TemplatesModal,
  COMMUNICATION_STYLE_TEMPLATES,
  type GuidanceTemplate,
} from "@/components/train/templates-modal";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const meta: Meta<typeof TemplatesModal> = {
  title: "Train/TemplatesModal",
  component: TemplatesModal,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Centered modal that displays a 3-column grid of guidance templates. Clicking a card fires `onSelect` with the template and closes the modal. Accepts a custom `title` and `templates` list; defaults to `COMMUNICATION_STYLE_TEMPLATES`. Closes on Escape key or backdrop click.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof TemplatesModal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<GuidanceTemplate | null>(null);
    return (
      <div className="p-8 space-y-4">
        <Button onClick={() => setOpen(true)}>Open templates</Button>
        {selected && (
          <div className="rounded-lg border border-border p-4 max-w-2xl">
            <p className="text-sm font-semibold mb-1">Selected: {selected.title}</p>
            <p className="text-sm text-muted-foreground">{selected.description}</p>
          </div>
        )}
        <TemplatesModal
          open={open}
          onClose={() => setOpen(false)}
          onSelect={(tpl) => setSelected(tpl)}
        />
      </div>
    );
  },
};

export const CustomTitle: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open with custom title</Button>
        <TemplatesModal
          open={open}
          onClose={() => setOpen(false)}
          title="Context and clarification templates"
          onSelect={() => setOpen(false)}
        />
      </div>
    );
  },
};

export const CustomTemplates: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const templates: GuidanceTemplate[] = [
      {
        title: "Ask before assuming",
        description:
          "If a request is ambiguous, ask a clarifying question before answering. Never guess what the customer meant.",
      },
      {
        title: "Confirm understanding",
        description:
          "After a complex explanation, confirm the customer has understood by asking a brief check-in question.",
      },
      {
        title: "Offer alternatives",
        description:
          "When you cannot fulfil a request, always offer at least one alternative path or workaround.",
      },
    ];
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open custom set</Button>
        <TemplatesModal
          open={open}
          onClose={() => setOpen(false)}
          title="Context and clarification"
          templates={templates}
          onSelect={() => setOpen(false)}
        />
      </div>
    );
  },
};

export const FullList: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Reopen</Button>
        <TemplatesModal
          open={open}
          onClose={() => setOpen(false)}
          templates={COMMUNICATION_STYLE_TEMPLATES}
          onSelect={() => setOpen(false)}
        />
      </div>
    );
  },
};
