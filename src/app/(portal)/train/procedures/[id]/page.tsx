"use client";

import { use, useEffect, useMemo, useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { GuidancePreviewPanel } from "@/components/train/guidance-preview-panel";
import { useToast } from "@/components/ui/toast";
import { ProcedureStepEditor } from "@/components/train/procedures/procedure-step-editor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AudienceSelect,
  ChannelSelect,
} from "@/components/train/escalation-meta-selects";
import { AnimateHeight } from "@/components/ui/animate-height";
import { cn } from "@/lib/utils";
import {
  X,
  Save,
  Play,
  Undo2,
  Ellipsis,
  ChevronDown,
  Plus,
  Trash2,
  GraduationCap,
} from "lucide-react";

type Procedure = Doc<"procedures">;

export default function ProcedureEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = use(params);
  const id = rawId as Id<"procedures">;
  const router = useRouter();
  const toast = useToast();

  const procedure = useQuery(api.procedures.get, { id });
  const updateProcedure = useMutation(api.procedures.update);
  const publishProcedure = useMutation(api.procedures.publish);
  const unpublishProcedure = useMutation(api.procedures.unpublish);
  const removeProcedure = useMutation(api.procedures.remove);

  const [title, setTitle] = useState("");
  const [triggerDescription, setTriggerDescription] = useState("");
  const [examples, setExamples] = useState<string[]>([]);
  const [audience, setAudience] = useState("Everyone");
  const [channels, setChannels] = useState("All channels");
  const [bodyJSON, setBodyJSON] = useState<unknown>(null);
  const [baseline, setBaseline] = useState<Procedure | null>(null);
  const [examplesExpanded, setExamplesExpanded] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (!procedure || baseline) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate draft state once from the loaded procedure
    setTitle(procedure.title);
    setTriggerDescription(procedure.triggerDescription);
    setExamples(procedure.examples);
    setAudience(procedure.audience);
    setChannels(procedure.channels);
    setBodyJSON(procedure.bodyJSON);
    setBaseline(procedure);
  }, [procedure, baseline]);

  const isDirty = useMemo(() => {
    if (!baseline) return false;
    if (title !== baseline.title) return true;
    if (triggerDescription !== baseline.triggerDescription) return true;
    if (audience !== baseline.audience) return true;
    if (channels !== baseline.channels) return true;
    if (examples.length !== baseline.examples.length) return true;
    if (examples.some((e, i) => e !== baseline.examples[i])) return true;
    if (JSON.stringify(bodyJSON) !== JSON.stringify(baseline.bodyJSON))
      return true;
    return false;
  }, [baseline, title, triggerDescription, audience, channels, examples, bodyJSON]);

  const handleSave = useCallback(async () => {
    if (!isDirty || !baseline) return;
    const cleanedExamples = examples.map((e) => e.trim()).filter(Boolean);
    const nextTitle = title.trim() || "Untitled";
    await updateProcedure({
      id,
      title: nextTitle,
      triggerDescription,
      examples: cleanedExamples,
      audience,
      channels,
      bodyJSON,
    });
    setBaseline({
      ...baseline,
      title: nextTitle,
      triggerDescription,
      examples: cleanedExamples,
      audience,
      channels,
      bodyJSON,
    });
    setExamples(cleanedExamples);
    toast.add({
      title: "Saved",
      description: "Your changes were saved.",
      data: { variant: "success" },
    });
  }, [
    isDirty,
    baseline,
    examples,
    updateProcedure,
    id,
    title,
    triggerDescription,
    audience,
    channels,
    bodyJSON,
    toast,
  ]);

  const handlePublish = async () => {
    if (isDirty) await handleSave();
    await publishProcedure({ id });
    setBaseline((prev) => (prev ? { ...prev, status: "live" } : prev));
    toast.add({
      title: "Procedure live",
      description: "This procedure is now active.",
      data: { variant: "success" },
    });
  };

  const handleUnpublish = async () => {
    await unpublishProcedure({ id });
    setBaseline((prev) => (prev ? { ...prev, status: "draft" } : prev));
    toast.add({
      title: "Moved to draft",
      description: "This procedure is no longer active.",
    });
  };

  const handleClose = () => {
    if (isDirty) {
      setConfirmDiscardOpen(true);
    } else {
      router.push("/train/procedures");
    }
  };

  const handleDelete = async () => {
    await removeProcedure({ id });
    toast.add({
      title: "Procedure deleted",
      description: "The procedure was removed.",
    });
    router.push("/train/procedures");
  };

  if (procedure === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center rounded-xl bg-white">
        <p className="text-[13px] text-muted-foreground">Loading…</p>
      </div>
    );
  }
  if (procedure === null) {
    return (
      <div className="flex-1 flex items-center justify-center rounded-xl bg-white flex-col gap-3">
        <p className="text-[14px] text-muted-foreground">Procedure not found</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/train/procedures")}
        >
          Back to procedures
        </Button>
      </div>
    );
  }

  const isLive = (baseline ?? procedure).status === "live";
  const isArchived = (baseline ?? procedure).status === "archived";
  const isDraft = !isLive && !isArchived;

  return (
    <>
      <div className="flex-1 overflow-hidden rounded-xl bg-white min-w-0 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b px-5 h-14 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled"
              size={1}
              className="h-9 !w-auto min-w-0 max-w-[360px] [field-sizing:content] !rounded-none !border-x-0 !border-t-0 border-b border-transparent bg-transparent px-0 text-[18px] font-semibold shadow-none hover:border-dotted hover:border-muted-foreground/50 focus-visible:ring-0 focus-visible:border-dotted focus-visible:border-muted-foreground/60"
            />
            <Badge
              variant={isLive ? "success" : isDraft ? "secondary" : "outline"}
              className="shrink-0 h-6 px-2.5 text-[12px] mt-px"
            >
              {isLive ? "Live" : isArchived ? "Archived" : "Draft"}
            </Badge>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              onClick={handleSave}
              disabled={!isDirty}
              className="h-9 rounded-full px-4 text-[13.5px]"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
            {isLive ? (
              <Button
                variant="outline"
                onClick={handleUnpublish}
                className="h-9 rounded-full px-4 text-[13.5px]"
              >
                <Undo2 className="h-4 w-4" />
                Move to draft
              </Button>
            ) : (
              <Button
                onClick={handlePublish}
                className="h-9 rounded-full px-4 text-[13.5px] bg-green-700 hover:bg-green-800"
              >
                <Play className="h-4 w-4 fill-white" />
                Set live
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<button type="button" />}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="More actions"
              >
                <Ellipsis className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-44">
                <DropdownMenuItem
                  variant="destructive"
                  className="gap-2 px-3 py-2 cursor-pointer"
                  onClick={() => setConfirmDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-[13px]">Delete procedure</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto">
          <div className="w-full px-8 py-8">
            <div className="mx-auto w-full max-w-[860px]">
              {/* When to use */}
              <div className="mb-6">
                <h2 className="text-[18px] font-semibold mb-2.5">
                  When to use this procedure
                </h2>
                <textarea
                  value={triggerDescription}
                  onChange={(e) => setTriggerDescription(e.target.value)}
                  placeholder="Describe when the AI should trigger this procedure. Add audience rules and conversation examples."
                  rows={3}
                  className="w-full resize-none border border-border rounded-lg px-3.5 py-2.5 text-[14px] leading-relaxed outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors placeholder:text-muted-foreground/50"
                />

                {/* Meta pills */}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setExamplesExpanded(!examplesExpanded)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 h-7 text-[12.5px] hover:bg-muted/30 transition-colors cursor-pointer",
                      examplesExpanded && "bg-muted/40",
                    )}
                  >
                    <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">
                      Train on examples ({examples.filter((e) => e.trim()).length})
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 text-muted-foreground transition-transform",
                        examplesExpanded && "rotate-180",
                      )}
                    />
                  </button>
                  <AudienceSelect value={audience} onChange={setAudience} />
                  <ChannelSelect value={channels} onChange={setChannels} />
                </div>

                {/* Examples editor */}
                <AnimateHeight expanded={examplesExpanded}>
                  <div className="mt-3 rounded-lg border border-border/70 p-3 bg-muted/20">
                    <p className="text-[12.5px] text-muted-foreground mb-2">
                      Add short example messages that should trigger this
                      procedure.
                    </p>
                    <div className="space-y-1.5">
                      {examples.map((ex, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            value={ex}
                            onChange={(e) => {
                              const copy = [...examples];
                              copy[i] = e.target.value;
                              setExamples(copy);
                            }}
                            placeholder="e.g. My order arrived broken"
                            className="h-8 bg-white text-[13px]"
                          />
                          <button
                            onClick={() =>
                              setExamples(examples.filter((_, j) => j !== i))
                            }
                            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-white transition-colors cursor-pointer shrink-0"
                            aria-label="Remove example"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExamples([...examples, ""])}
                      className="rounded-full text-[12.5px] mt-2 h-7 px-2.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add example
                    </Button>
                  </div>
                </AnimateHeight>
              </div>

              {/* Body editor */}
              <div className="mt-8">
                {bodyJSON !== null && (
                  <ProcedureStepEditor
                    initialContent={bodyJSON}
                    onChange={setBodyJSON}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <GuidancePreviewPanel />

      <ConfirmModal
        open={confirmDiscardOpen}
        onClose={() => setConfirmDiscardOpen(false)}
        onConfirm={() => router.push("/train/procedures")}
        title="Unsaved changes"
        description="You have unsaved changes. Leave without saving?"
        cancelLabel="Keep editing"
        confirmLabel="Discard"
      />
      <ConfirmModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete this procedure?"
        description="This action permanently removes this procedure and cannot be undone."
        cancelLabel="Cancel"
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </>
  );
}
