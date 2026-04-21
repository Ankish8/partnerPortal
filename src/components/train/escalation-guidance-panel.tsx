"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SlidePanel } from "@/components/ui/slide-panel";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { SlidePanelEditorHeader } from "@/components/ui/slide-panel-editor-header";
import { GuidancePreviewPanel } from "@/components/train/guidance-preview-panel";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  ESCALATION_GUIDANCE_SEEDS,
} from "@/components/train/escalation-templates";
import {
  ModeSelect,
  AudienceSelect,
  ChannelSelect,
  GUIDANCE_MODE_OPTIONS,
  type GuidanceMode,
} from "./escalation-meta-selects";

export interface EscalationGuidanceItem {
  _id?: Id<"escalationGuidance">;
  title: string;
  content: string;
  enabled: boolean;
  audience: string;
  channels: string;
  mode: GuidanceMode;
  isNew?: boolean;
}

interface Props {
  open: boolean;
  item: EscalationGuidanceItem | null;
  onClose: () => void;
  onSave: (updated: EscalationGuidanceItem) => void | Promise<void>;
  onDelete: (id: Id<"escalationGuidance">) => void | Promise<void>;
  personality?: { tone?: string; length?: string };
}

export function EscalationGuidancePanel({
  open,
  item,
  onClose,
  onSave,
  onDelete,
  personality,
}: Props) {
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editEnabled, setEditEnabled] = useState(false);
  const [editMode, setEditMode] = useState<GuidanceMode>("immediate");
  const [editAudience, setEditAudience] = useState("Everyone");
  const [editChannels, setEditChannels] = useState("All channels");
  const [previewVisible, setPreviewVisible] = useState(true);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  useEffect(() => {
    if (item) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- load selected item into editor draft state
      setEditTitle(item.title);
      setEditContent(item.content);
      setEditEnabled(item.enabled);
      setEditMode(item.mode ?? "immediate");
      setEditAudience(item.audience ?? "Everyone");
      setEditChannels(item.channels ?? "All channels");
      setPreviewVisible(true);
    }
  }, [item]);

  if (!item) return null;

  const titleEmpty = !editTitle.trim();
  const contentEmpty = !editContent.trim();
  const hasChanges =
    editTitle !== item.title ||
    editContent !== item.content ||
    editEnabled !== item.enabled ||
    editMode !== (item.mode ?? "immediate") ||
    editAudience !== (item.audience ?? "Everyone") ||
    editChannels !== (item.channels ?? "All channels");

  const canSave = hasChanges && !titleEmpty && !contentEmpty;
  const canEnable = !contentEmpty && !titleEmpty;

  const emptyReason = titleEmpty
    ? "Guidance title can't be empty"
    : contentEmpty
    ? "Guidance can't be empty"
    : null;

  const saveDisabledReason =
    emptyReason ?? (!hasChanges ? "No changes to save" : null);

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      ...item,
      title: editTitle,
      content: editContent,
      enabled: editEnabled,
      mode: editMode,
      audience: editAudience,
      channels: editChannels,
    });
  };

  const handleEnable = () => {
    if (!canEnable) return;
    onSave({
      ...item,
      title: editTitle,
      content: editContent,
      enabled: !editEnabled,
      mode: editMode,
      audience: editAudience,
      channels: editChannels,
    });
  };

  const requestClose = () => {
    if (hasChanges) {
      setConfirmDiscardOpen(true);
    } else {
      onClose();
    }
  };

  return (
    <>
      <SlidePanel
        open={open}
        onClose={requestClose}
        title={editTitle || "Escalation guidance"}
        customHeader={<></>}
        panelClassName={cn(
          "!max-w-[1400px]",
          previewVisible ? "!w-[calc(100vw-280px)]" : "!w-[860px]",
        )}
      >
        <div className="flex flex-1 overflow-hidden">
          {/* Left — editor column */}
          <div className="flex flex-1 flex-col overflow-hidden min-w-0">
            <SlidePanelEditorHeader
              title={editTitle}
              onTitleChange={setEditTitle}
              enabled={editEnabled}
              canEnable={canEnable}
              canSave={canSave}
              onEnable={handleEnable}
              onSave={handleSave}
              onClose={requestClose}
              emptyReason={emptyReason}
              saveDisabledReason={saveDisabledReason}
              showOpenPreview={!previewVisible}
              onOpenPreview={() => setPreviewVisible(true)}
            />

            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col">
              {/* Behavior row */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-[12.5px] text-muted-foreground">
                  When this applies
                </span>
                <ModeSelect
                  value={editMode}
                  onChange={setEditMode}
                  options={GUIDANCE_MODE_OPTIONS}
                />
                <span className="mx-2 text-muted-foreground/40">·</span>
                <AudienceSelect
                  value={editAudience}
                  onChange={setEditAudience}
                />
                <ChannelSelect
                  value={editChannels}
                  onChange={setEditChannels}
                />
              </div>
              <p className="text-[14px] text-muted-foreground mb-2">
                Describe when the agent should hand off to a human. The agent will
                read this as natural language guidance.
              </p>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="e.g. If the customer mentions legal action, lawyers, or a data breach, hand off to a human."
                autoFocus
                rows={1}
                className="w-full text-[14px] leading-relaxed bg-transparent resize-none outline-none [field-sizing:content] placeholder:text-muted-foreground/40"
              />

              {contentEmpty && (
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  {ESCALATION_GUIDANCE_SEEDS.map((tpl) => (
                    <Tooltip key={tpl.title}>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
                            onClick={() => {
                              setEditTitle(tpl.title);
                              setEditContent(tpl.content);
                            }}
                            className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-[13px] text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
                          />
                        }
                      >
                        {tpl.title}
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        align="start"
                        className="max-w-[320px] px-4 py-3"
                      >
                        <div>
                          <p className="text-[13px] font-semibold mb-1">
                            {tpl.title}
                          </p>
                          <p className="text-[12.5px] leading-[1.5] text-muted-foreground whitespace-pre-line">
                            {tpl.content}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border/40 px-6 py-3 flex items-center shrink-0">
              <div className="flex-1" />
              <button
                onClick={() => {
                  if (item._id) {
                    onDelete(item._id);
                    onClose();
                  } else {
                    onClose();
                  }
                }}
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            className={cn(
              "flex shrink-0 overflow-hidden border-l border-border transition-all duration-300 ease-out",
              previewVisible ? "w-[400px]" : "w-0 border-l-0",
            )}
          >
            {previewVisible && (
              <GuidancePreviewPanel
                className="flex w-[400px] shrink-0 flex-col"
                onClose={() => setPreviewVisible(false)}
                escalationGuidance={
                  editContent.trim()
                    ? [
                        {
                          ...(item?._id ? { _id: item._id } : {}),
                          title: editTitle || "Escalation rule",
                          content: editContent,
                        },
                      ]
                    : []
                }
                personality={personality}
              />
            )}
          </div>
        </div>
      </SlidePanel>
      <ConfirmModal
        open={confirmDiscardOpen}
        onClose={() => setConfirmDiscardOpen(false)}
        onConfirm={() => onClose()}
        title="Unsaved Changes"
        description="You haven't finished editing this guidance. If you leave now, your changes will be lost."
        cancelLabel="Keep editing"
        confirmLabel="Discard"
      />
    </>
  );
}
