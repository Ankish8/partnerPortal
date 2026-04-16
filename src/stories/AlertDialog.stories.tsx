import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogClose,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const meta: Meta = {
  title: "UI/AlertDialog",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Modal confirmation dialog built on `@base-ui/react` AlertDialogPrimitive. Renders centered over a dimmed backdrop with enter/exit animations. Compose with `AlertDialogTrigger`, `AlertDialogPopup`, `AlertDialogTitle`, `AlertDialogDescription`, and `AlertDialogClose`. Use for destructive actions (delete, disconnect) or irreversible operations (publish).",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<button type="button" />}>
        <Button variant="destructive">Delete item</Button>
      </AlertDialogTrigger>
      <AlertDialogPopup>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete the item and remove its data
          from our servers.
        </AlertDialogDescription>
        <div className="mt-5 flex justify-end gap-2">
          <AlertDialogClose render={<button type="button" />}>
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </AlertDialogClose>
          <AlertDialogClose render={<button type="button" />}>
            <Button variant="destructive" size="sm">
              Delete
            </Button>
          </AlertDialogClose>
        </div>
      </AlertDialogPopup>
    </AlertDialog>
  ),
};

export const Confirmation: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<button type="button" />}>
        <Button>Publish changes</Button>
      </AlertDialogTrigger>
      <AlertDialogPopup>
        <AlertDialogTitle>Publish changes?</AlertDialogTitle>
        <AlertDialogDescription>
          This will deploy your configuration changes to the live WhatsApp agent. Your customers
          will see the updated responses immediately.
        </AlertDialogDescription>
        <div className="mt-5 flex justify-end gap-2">
          <AlertDialogClose render={<button type="button" />}>
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </AlertDialogClose>
          <AlertDialogClose render={<button type="button" />}>
            <Button size="sm" className="bg-emerald-700 text-white hover:bg-emerald-800">
              Publish
            </Button>
          </AlertDialogClose>
        </div>
      </AlertDialogPopup>
    </AlertDialog>
  ),
};

export const DisconnectWarning: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<button type="button" />}>
        <Button variant="outline">Disconnect</Button>
      </AlertDialogTrigger>
      <AlertDialogPopup>
        <AlertDialogTitle>Disconnect WhatsApp?</AlertDialogTitle>
        <AlertDialogDescription>
          Disconnecting will stop the AI agent from responding to messages on this number. You can
          reconnect at any time from the Deploy page.
        </AlertDialogDescription>
        <div className="mt-5 flex justify-end gap-2">
          <AlertDialogClose render={<button type="button" />}>
            <Button variant="outline" size="sm">
              Keep connected
            </Button>
          </AlertDialogClose>
          <AlertDialogClose render={<button type="button" />}>
            <Button variant="destructive" size="sm">
              Disconnect
            </Button>
          </AlertDialogClose>
        </div>
      </AlertDialogPopup>
    </AlertDialog>
  ),
};
