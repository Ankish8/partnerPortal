import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SlidePanelFooter } from "@/components/ui/slide-panel-footer";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

const meta: Meta<typeof SlidePanelFooter> = {
  title: "UI/SlidePanelFooter",
  component: SlidePanelFooter,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Footer action bar for `SlidePanel`. Children are rendered right-aligned as the primary action cluster (typically Cancel + Save). Pass a `leading` element for a left-aligned action (typically Delete). When only children are provided, they justify to the right; when `leading` is present the layout becomes space-between.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof SlidePanelFooter>;

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="w-[560px] rounded-2xl border border-border bg-white shadow-sm">
    <div className="px-6 py-8 text-[13px] text-muted-foreground">
      Panel content preview
    </div>
    {children}
  </div>
);

export const CancelSave: Story = {
  render: () => (
    <Frame>
      <SlidePanelFooter>
        <Button variant="outline" size="sm" className="rounded-lg">
          Cancel
        </Button>
        <Button size="sm" className="gap-1.5 rounded-lg">
          <Pencil className="h-3.5 w-3.5" />
          Save
        </Button>
      </SlidePanelFooter>
    </Frame>
  ),
};

export const WithDestructiveLeading: Story = {
  render: () => (
    <Frame>
      <SlidePanelFooter
        leading={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-lg text-red-600 hover:bg-red-50 border-red-200"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        }
      >
        <Button variant="outline" size="sm" className="rounded-lg">
          Cancel
        </Button>
        <Button size="sm" className="rounded-lg">
          Save
        </Button>
      </SlidePanelFooter>
    </Frame>
  ),
};

export const DoneOnly: Story = {
  render: () => (
    <Frame>
      <SlidePanelFooter>
        <Button
          size="sm"
          className="rounded-lg bg-foreground text-white hover:bg-foreground/90"
        >
          Done
        </Button>
      </SlidePanelFooter>
    </Frame>
  ),
};
