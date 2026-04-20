import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/ui/button";
import { ToastProvider, useToast, type ToastVariant } from "@/components/ui/toast";
import { HardDrive, Users } from "lucide-react";

const meta: Meta = {
  title: "UI/Toast",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Pill-style toast notification pinned to the bottom-center of the viewport. Built on `@base-ui/react` Toast primitives. Supports stacking (up to 3 visible), variants, optional action button, dismiss, and auto-timeout.",
      },
    },
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <div className="flex min-h-[480px] items-start justify-center p-10">
          <Story />
        </div>
      </ToastProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj;

function TriggerButton({
  label,
  variant,
  onTrigger,
  className,
}: {
  label: string;
  variant?: "default" | "secondary" | "outline";
  onTrigger: () => void;
  className?: string;
}) {
  return (
    <Button variant={variant ?? "secondary"} onClick={onTrigger} className={className}>
      {label}
    </Button>
  );
}

function Variants() {
  const toast = useToast();

  const fire = (variant: ToastVariant) =>
    toast.add({
      title: `${variant[0].toUpperCase()}${variant.slice(1)} toast`,
      description: "This is a toast notification.",
      data: { variant },
    });

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <TriggerButton label="Default toast" onTrigger={() => fire("default")} />
      <TriggerButton
        label="Accent toast"
        onTrigger={() => fire("accent")}
        className="text-sky-700"
      />
      <TriggerButton
        label="Success toast"
        onTrigger={() => fire("success")}
        className="text-emerald-700"
      />
      <TriggerButton
        label="Warning toast"
        onTrigger={() => fire("warning")}
        className="text-amber-700"
      />
      <TriggerButton
        label="Danger toast"
        onTrigger={() => fire("danger")}
        className="text-rose-700"
      />
    </div>
  );
}

export const AllVariants: Story = {
  render: () => <Variants />,
};

function ActionButtonDemo() {
  const toast = useToast();

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button
        variant="secondary"
        onClick={() =>
          toast.add({
            title: "You have been invited to a team",
            description: "Bob sent you an invitation to join HeroUI team",
            data: {
              variant: "default",
              icon: <Users className="h-[18px] w-[18px]" />,
              action: { label: "Dismiss", variant: "outline" },
            },
            timeout: 0,
          })
        }
      >
        Team invite
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.add({
            title: "You have no credits left",
            description: "Upgrade to a paid plan to continue",
            data: {
              variant: "warning",
              action: { label: "Upgrade", variant: "solid" },
            },
            timeout: 0,
          })
        }
      >
        Upgrade required
      </Button>
      <Button
        onClick={() =>
          toast.add({
            title: "Backup complete",
            description: "All files synced to cloud storage",
            data: {
              variant: "success",
              icon: <HardDrive className="h-[18px] w-[18px]" />,
            },
          })
        }
      >
        Backup complete
      </Button>
    </div>
  );
}

export const WithAction: Story = {
  render: () => <ActionButtonDemo />,
};

function StackingDemo() {
  const toast = useToast();
  let count = 0;

  const fireOne = () => {
    count += 1;
    toast.add({
      title: `Toast #${count}`,
      description: "Hover the stack to expand.",
      data: { variant: "default" },
      timeout: 0,
    });
  };

  const fireMany = () => {
    for (let i = 0; i < 4; i += 1) {
      setTimeout(() => {
        toast.add({
          title: `Stacked ${i + 1}`,
          description: "Auto-dismisses in 4s.",
          data: {
            variant: (["default", "accent", "success", "warning"] as ToastVariant[])[i % 4],
          },
        });
      }, i * 150);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2">
        <Button variant="secondary" onClick={fireOne}>
          Add one (persistent)
        </Button>
        <Button onClick={fireMany}>Fire 4 in sequence</Button>
      </div>
      <p className="text-[13px] text-muted-foreground">
        Up to 3 toasts are visible; older ones collapse behind. Hover to expand.
      </p>
    </div>
  );
}

export const Stacking: Story = {
  render: () => <StackingDemo />,
};
