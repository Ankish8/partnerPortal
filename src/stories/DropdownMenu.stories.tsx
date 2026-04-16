import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Settings, Trash2, RefreshCw, History } from "lucide-react";

const meta: Meta = {
  title: "UI/DropdownMenu",
  parameters: {
    docs: {
      description: {
        component:
          "Context menu built on `@base-ui/react` MenuPrimitive. Compose with `Trigger`, `Content`, `Item`, `Label`, `Separator`, `CheckboxItem`, `RadioGroup`, `RadioItem`, and nested `Sub` menus. Supports `destructive` variant on items. Use for overflow actions on cards, rows, and icon buttons.",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<button type="button" />}
        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer"
      >
        <MoreHorizontal className="h-[18px] w-[18px] text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4} className="w-52">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem className="gap-2 px-3 py-2 cursor-pointer">
          <Settings className="h-4 w-4" />
          <span className="text-[13px]">Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 px-3 py-2 cursor-pointer">
          <RefreshCw className="h-4 w-4" />
          <span className="text-[13px]">Re-sync</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 px-3 py-2 cursor-pointer">
          <History className="h-4 w-4" />
          <span className="text-[13px]">View history</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" className="gap-2 px-3 py-2 cursor-pointer">
          <Trash2 className="h-4 w-4" />
          <span className="text-[13px]">Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithButton: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<button type="button" />}>
        <Button variant="outline" size="sm">
          Options
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={4} className="w-44">
        <DropdownMenuItem className="cursor-pointer">Edit</DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" className="cursor-pointer">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
