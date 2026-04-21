"use client";

import { useEffect, useRef, useState } from "react";
import { Ellipsis, GripVertical, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProcedureStepEditorProps {
  initialContent: unknown;
  onChange: (json: unknown) => void;
  editable?: boolean;
  className?: string;
}

export function ProcedureStepEditor({
  initialContent,
  onChange,
  editable = true,
  className,
}: ProcedureStepEditorProps) {
  const [steps, setSteps] = useState<string[]>(() => parseSteps(initialContent));
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const textareaRefs = useRef<Array<HTMLTextAreaElement | null>>([]);
  const pendingFocusIndexRef = useRef<number | null>(null);
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    onChange(buildProcedureDoc(steps));
  }, [onChange, steps]);

  useEffect(() => {
    textareaRefs.current.forEach((node) => {
      if (!node) return;
      autoSizeTextarea(node);
    });
    const pendingFocusIndex = pendingFocusIndexRef.current;
    if (pendingFocusIndex === null) return;
    const textarea = textareaRefs.current[pendingFocusIndex];
    if (!textarea) return;
    textarea.focus();
    const end = textarea.value.length;
    textarea.setSelectionRange(end, end);
    pendingFocusIndexRef.current = null;
  }, [steps]);

  const updateStep = (index: number, value: string) => {
    setSteps((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addStepAfter = (index: number) => {
    setSteps((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, "");
      return next;
    });
    pendingFocusIndexRef.current = index + 1;
  };

  const removeStep = (index: number) => {
    setSteps((prev) => {
      if (prev.length <= 1) return [""];
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [""];
    });
    pendingFocusIndexRef.current = Math.max(0, index - 1);
  };

  const handleRowKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
    index: number,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      addStepAfter(index);
      return;
    }
    if (event.key === "Backspace" && steps[index] === "" && steps.length > 1) {
      event.preventDefault();
      removeStep(index);
    }
  };

  const handleDrop = (targetIndex: number) => {
    if (draggingIndex === null || draggingIndex === targetIndex) {
      setDraggingIndex(null);
      setDragOverIndex(null);
      return;
    }
    setSteps((prev) => reorder(prev, draggingIndex, targetIndex));
    pendingFocusIndexRef.current = targetIndex;
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className={cn("procedure-editor", className)}>
      <div className="space-y-1.5">
        {steps.map((step, index) => {
          const isDropTarget = dragOverIndex === index && draggingIndex !== null;
          return (
            <div
              key={index}
              className={cn(
                "group/step relative rounded-lg transition-colors",
                isDropTarget && "bg-muted/40",
              )}
              onDragOver={(event) => {
                if (!editable || draggingIndex === null) return;
                event.preventDefault();
                if (dragOverIndex !== index) {
                  setDragOverIndex(index);
                }
              }}
              onDrop={(event) => {
                if (!editable) return;
                event.preventDefault();
                handleDrop(index);
              }}
            >
              {editable && (
                <div className="absolute left-0 top-1/2 z-10 flex -translate-y-1/2 -translate-x-[calc(100%+10px)] items-center gap-0.5 rounded-full border border-border/70 bg-background px-1 py-0.5 shadow-sm opacity-0 pointer-events-none transition-opacity group-hover/step:opacity-100 group-hover/step:pointer-events-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => addStepAfter(index)}
                    className="h-6 w-6 rounded-md"
                    aria-label="Add step"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <button
                    type="button"
                    draggable
                    onDragStart={(event) => {
                      setDraggingIndex(index);
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => {
                      setDraggingIndex(null);
                      setDragOverIndex(null);
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-grab active:cursor-grabbing"
                    aria-label="Reorder step"
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-[auto_1fr] items-start gap-3 py-1.5 pr-10">
                <span className="pt-[3px] text-[13px] font-medium leading-6 text-muted-foreground">
                  {index + 1}.
                </span>

                <textarea
                  ref={(node) => {
                    textareaRefs.current[index] = node;
                  }}
                  value={step}
                  onChange={(event) => {
                    updateStep(index, event.target.value);
                    autoSizeTextarea(event.target);
                  }}
                  onKeyDown={(event) => handleRowKeyDown(event, index)}
                  disabled={!editable}
                  rows={1}
                  placeholder={
                    index === 0
                      ? 'Tell Fin what to do. Type "@" for tools...'
                      : 'Tell Fin what to do next. Type "@" for tools...'
                  }
                  className="min-h-7 w-full resize-none border-none bg-transparent px-0 py-1 text-[15px] leading-6 text-foreground outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed"
                />
              </div>
              {editable && (
                <div className="absolute right-1 top-1/2 z-10 -translate-y-1/2 opacity-0 pointer-events-none transition-opacity group-hover/step:opacity-100 group-hover/step:pointer-events-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<button type="button" />}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Step options"
                    >
                      <Ellipsis className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={6} className="w-40">
                      <DropdownMenuItem
                        variant="destructive"
                        className="gap-2 px-3 py-2 cursor-pointer"
                        onClick={() => removeStep(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-[13px]">Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type DocNode = {
  type?: string;
  text?: string;
  content?: DocNode[];
};

function parseSteps(initialContent: unknown): string[] {
  if (!initialContent || typeof initialContent !== "object") return [""];
  const root = initialContent as DocNode;
  const rootContent = Array.isArray(root.content) ? root.content : [];

  const orderedList = rootContent.find((node) => node.type === "orderedList");
  if (orderedList?.content?.length) {
    const fromList = orderedList.content.map((item) => extractText(item).trim());
    return fromList.length > 0 ? fromList : [""];
  }

  const paragraphs = rootContent.filter((node) => node.type === "paragraph");
  if (paragraphs.length > 0) {
    const fromParagraphs = paragraphs.map((node) => extractText(node).trim());
    return fromParagraphs.length > 0 ? fromParagraphs : [""];
  }

  return [""];
}

function extractText(node: DocNode): string {
  if (typeof node.text === "string") return node.text;
  if (!Array.isArray(node.content)) return "";
  return node.content.map(extractText).join("");
}

function buildProcedureDoc(steps: string[]): unknown {
  const normalized = steps.length > 0 ? steps : [""];
  return {
    type: "doc",
    content: [
      {
        type: "orderedList",
        attrs: { start: 1 },
        content: normalized.map((step) => ({
          type: "listItem",
          content: [
            step.trim().length > 0
              ? {
                  type: "paragraph",
                  content: [{ type: "text", text: step }],
                }
              : {
                  type: "paragraph",
                },
          ],
        })),
      },
    ],
  };
}

function reorder<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function autoSizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = "0px";
  textarea.style.height = `${Math.max(textarea.scrollHeight, 28)}px`;
}
