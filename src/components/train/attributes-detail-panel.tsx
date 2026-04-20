"use client";

import { useState, useMemo } from "react";
import { X, Play, Plus, Trash2, Search, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { SlidePanel } from "@/components/ui/slide-panel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import type { Id } from "../../../convex/_generated/dataModel";
import type { AttributeCategory } from "./attribute-templates";

export interface AttributeValueDraft {
  id: string;
  name: string;
  description: string;
}

export interface AttributeConditionDraft {
  id: string;
  ifAttributeId: Id<"attributes"> | "";
  ifValueId: string;
  useValueIds: string[];
}

export interface AttributeDraft {
  _id?: Id<"attributes">;
  title: string;
  description: string;
  category: AttributeCategory;
  enabled: boolean;
  audience: string;
  redetectOnClose: boolean;
  values: AttributeValueDraft[];
  conditions: AttributeConditionDraft[];
  stats: { detected: number };
}

export interface ExistingAttributeRef {
  _id: Id<"attributes">;
  title: string;
  values: { id: string; name: string }[];
}

interface Props {
  open: boolean;
  draft: AttributeDraft | null;
  onClose: () => void;
  onSave: (updated: AttributeDraft) => void | Promise<void>;
  onDelete: (id: Id<"attributes">) => void | Promise<void>;
  otherAttributes: ExistingAttributeRef[];
}

type Tab = "general" | "values" | "conditions";

const AUDIENCE_OPTIONS = ["Everyone", "New users", "Returning users"];

const CATEGORY_OPTIONS: { value: AttributeCategory; label: string }[] = [
  { value: "escalation", label: "Escalation" },
  { value: "routing", label: "Routing" },
  { value: "filtering", label: "Filtering" },
  { value: "custom", label: "Custom" },
];

function nanoid(): string {
  return `v_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function AttributesDetailPanel({
  open,
  draft,
  onClose,
  onSave,
  onDelete,
  otherAttributes,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [state, setState] = useState<AttributeDraft | null>(draft);
  const [valueSearch, setValueSearch] = useState("");
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [prevDraft, setPrevDraft] = useState(draft);

  if (draft !== prevDraft) {
    setPrevDraft(draft);
    setState(draft);
    setActiveTab("general");
    setValueSearch("");
  }

  const filteredValues = useMemo(() => {
    if (!state) return [];
    if (!valueSearch.trim()) return state.values;
    const q = valueSearch.toLowerCase();
    return state.values.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q),
    );
  }, [state, valueSearch]);

  if (!state || !draft) return null;

  const titleEmpty = !state.title.trim();
  const canEnable = !titleEmpty && state.values.length >= 2;
  const hasChanges = JSON.stringify(state) !== JSON.stringify(draft);

  const saveDisabledReason = titleEmpty
    ? "Name can't be empty"
    : !hasChanges
    ? "No changes to save"
    : null;

  const enableDisabledReason = titleEmpty
    ? "Name can't be empty"
    : state.values.length < 2
    ? "Add at least 2 values to enable"
    : null;

  const handleSave = () => {
    if (!hasChanges || titleEmpty) return;
    onSave(state);
  };

  const handleToggleEnable = () => {
    if (!canEnable) return;
    onSave({ ...state, enabled: !state.enabled });
  };

  const requestClose = () => {
    if (hasChanges) {
      setConfirmDiscardOpen(true);
    } else {
      onClose();
    }
  };

  const updateValue = (id: string, patch: Partial<AttributeValueDraft>) => {
    setState((s) =>
      s ? { ...s, values: s.values.map((v) => (v.id === id ? { ...v, ...patch } : v)) } : s,
    );
  };

  const addValue = () => {
    setState((s) =>
      s
        ? {
            ...s,
            values: [...s.values, { id: nanoid(), name: "", description: "" }],
          }
        : s,
    );
  };

  const removeValue = (id: string) => {
    setState((s) => (s ? { ...s, values: s.values.filter((v) => v.id !== id) } : s));
  };

  const addCondition = () => {
    setState((s) =>
      s
        ? {
            ...s,
            conditions: [
              ...s.conditions,
              {
                id: nanoid(),
                ifAttributeId: "" as Id<"attributes"> | "",
                ifValueId: "",
                useValueIds: [],
              },
            ],
          }
        : s,
    );
  };

  const updateCondition = (
    id: string,
    patch: Partial<AttributeConditionDraft>,
  ) => {
    setState((s) =>
      s
        ? {
            ...s,
            conditions: s.conditions.map((c) =>
              c.id === id ? { ...c, ...patch } : c,
            ),
          }
        : s,
    );
  };

  const removeCondition = (id: string) => {
    setState((s) =>
      s ? { ...s, conditions: s.conditions.filter((c) => c.id !== id) } : s,
    );
  };

  const header = (
    <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <h2 className="text-[17px] font-semibold truncate">
          {state._id ? "Edit attribute" : "New attribute"}
        </h2>
        <Badge
          variant="outline"
          className={cn(
            "text-[11px] font-normal shrink-0",
            state.enabled && "border-emerald-200 bg-emerald-50 text-emerald-700",
          )}
        >
          {state.enabled ? "Enabled" : "Disabled"}
        </Badge>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={handleToggleEnable}
                aria-disabled={!canEnable}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full h-8 px-3.5 text-[13px] font-medium transition-colors",
                  !canEnable
                    ? "bg-secondary text-secondary-foreground/60 cursor-not-allowed"
                    : state.enabled
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer",
                )}
              />
            }
          >
            <Play className="h-3 w-3 fill-current" />
            {state.enabled ? "Disable" : "Enable"}
          </TooltipTrigger>
          {!canEnable && enableDisabledReason && (
            <TooltipContent>{enableDisabledReason}</TooltipContent>
          )}
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={handleSave}
                aria-disabled={!hasChanges || titleEmpty}
                className={cn(
                  "inline-flex items-center rounded-full h-8 px-3.5 text-[13px] font-medium transition-colors",
                  hasChanges && !titleEmpty
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer"
                    : "bg-secondary text-secondary-foreground/60 cursor-not-allowed",
                )}
              />
            }
          >
            Save
          </TooltipTrigger>
          {saveDisabledReason && <TooltipContent>{saveDisabledReason}</TooltipContent>}
        </Tooltip>

        <button
          onClick={requestClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "general", label: "General" },
    { id: "values", label: "Values", count: state.values.length },
    { id: "conditions", label: "Conditions", count: state.conditions.length },
  ];

  return (
    <>
      <SlidePanel
        open={open}
        onClose={requestClose}
        title="Edit attribute"
        customHeader={header}
        panelClassName="!w-[860px]"
      >
        {/* Tabs */}
        <div className="flex border-b border-border/60 px-6 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-3 text-[14px] font-medium transition-colors cursor-pointer",
                activeTab === tab.id
                  ? "border-b-[2.5px] border-[#e87537] text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1 text-muted-foreground/70">({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "general" && (
            <div className="px-6 py-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-[13px] font-semibold mb-1.5">Name</label>
                <p className="text-[12.5px] text-muted-foreground mb-2">
                  Choose a clear, descriptive name that tells the agent the purpose of this
                  attribute. For example, if it&apos;s for detecting customer sentiment, call it
                  &ldquo;Sentiment&rdquo;.
                </p>
                <Input
                  value={state.title}
                  onChange={(e) => setState({ ...state, title: e.target.value })}
                  placeholder="e.g. Sentiment"
                  className="h-10 text-[14px]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[13px] font-semibold mb-1.5">Description</label>
                <p className="text-[12.5px] text-muted-foreground mb-2">
                  Briefly describe this attribute&apos;s purpose and how the agent should use it.
                </p>
                <Textarea
                  value={state.description}
                  onChange={(e) => setState({ ...state, description: e.target.value })}
                  placeholder="What does this attribute capture?"
                  className="min-h-[100px] text-[14px]"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[13px] font-semibold mb-1.5">Category</label>
                <p className="text-[12.5px] text-muted-foreground mb-2">
                  Used for organization and to color-code badges on the attributes list.
                </p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setState({ ...state, category: opt.value })}
                      className={cn(
                        "inline-flex items-center rounded-lg border px-3 py-1.5 text-[13px] transition-colors cursor-pointer",
                        state.category === opt.value
                          ? "border-[#e87537] bg-[#e87537]/5 text-foreground font-medium"
                          : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Agent settings */}
              <div className="rounded-xl border border-border/60 p-5 space-y-5">
                <p className="text-[14px] font-semibold">Agent settings</p>

                {/* Audience */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[13px] font-medium">Audience</p>
                    <p className="text-[12.5px] text-muted-foreground mt-0.5">
                      Choose which audiences the agent should detect this attribute for.
                    </p>
                  </div>
                  <select
                    value={state.audience}
                    onChange={(e) => setState({ ...state, audience: e.target.value })}
                    className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-[13px] cursor-pointer focus:border-ring focus:ring-2 focus:ring-ring/30 outline-none"
                  >
                    {AUDIENCE_OPTIONS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Re-detect on close */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[13px] font-medium">Re-detect on close</p>
                    <p className="text-[12.5px] text-muted-foreground mt-0.5">
                      Run detection again when a teammate or workflow closes the conversation.
                    </p>
                  </div>
                  <Switch
                    checked={state.redetectOnClose}
                    onCheckedChange={(checked) =>
                      setState({ ...state, redetectOnClose: checked })
                    }
                  />
                </div>
              </div>

              {/* Delete (only for existing attributes) */}
              {state._id && (
                <div className="border-t border-border/60 pt-5">
                  <button
                    onClick={() => {
                      if (state._id) onDelete(state._id);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-destructive/20 text-destructive hover:bg-destructive/5 px-3.5 py-1.5 text-[13px] transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete attribute
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "values" && (
            <div className="px-6 py-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search values..."
                    value={valueSearch}
                    onChange={(e) => setValueSearch(e.target.value)}
                    className="pl-9 h-9 text-[13px]"
                  />
                </div>
                <button
                  onClick={addValue}
                  className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background hover:bg-foreground/90 px-3.5 py-1.5 text-[13px] font-medium transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New value
                </button>
              </div>

              {filteredValues.length === 0 ? (
                <div className="rounded-lg border border-border/60 border-dashed py-10 px-5 text-center">
                  <p className="text-[13px] text-muted-foreground">
                    {valueSearch
                      ? "No values match your search."
                      : "No values yet. Add at least two to enable detection."}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-border/60 overflow-hidden">
                  <div className="grid grid-cols-[20px_1fr_2fr_28px] items-center gap-3 px-4 py-2.5 border-b border-border/60 bg-muted/20">
                    <span />
                    <span className="text-[12px] font-medium text-muted-foreground">Name</span>
                    <span className="text-[12px] font-medium text-muted-foreground">
                      Description
                    </span>
                    <span />
                  </div>
                  {filteredValues.map((v, i) => (
                    <div
                      key={v.id}
                      className={cn(
                        "grid grid-cols-[20px_1fr_2fr_28px] items-start gap-3 px-4 py-3",
                        i !== filteredValues.length - 1 && "border-b border-border/40",
                      )}
                    >
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/60 mt-2" />
                      <Input
                        value={v.name}
                        onChange={(e) => updateValue(v.id, { name: e.target.value })}
                        placeholder="Value name"
                        className="h-8 text-[13px]"
                      />
                      <Textarea
                        value={v.description}
                        onChange={(e) =>
                          updateValue(v.id, { description: e.target.value })
                        }
                        placeholder="Describe when this value applies"
                        className="min-h-[32px] text-[13px] py-1.5 resize-none"
                      />
                      <button
                        onClick={() => removeValue(v.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "conditions" && (
            <div className="px-6 py-6">
              <p className="text-[13px] text-muted-foreground mb-4">
                Set up conditional rules to control when the agent detects this attribute. Once
                conditions are defined, the agent waits for those conditions to be met before
                attempting detection.
              </p>

              {state.conditions.length > 0 && (
                <div className="space-y-3 mb-4">
                  {state.conditions.map((cond) => {
                    const ctrl = otherAttributes.find(
                      (a) => a._id === cond.ifAttributeId,
                    );
                    return (
                      <div
                        key={cond.id}
                        className="rounded-lg border border-border/60 p-4 space-y-3"
                      >
                        <div className="grid grid-cols-[1fr_1fr_28px] gap-3 items-start">
                          {/* If attribute */}
                          <div>
                            <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                              If attribute is detected as...
                            </label>
                            <select
                              value={cond.ifAttributeId}
                              onChange={(e) =>
                                updateCondition(cond.id, {
                                  ifAttributeId: e.target.value as Id<"attributes">,
                                  ifValueId: "",
                                })
                              }
                              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-[13px] cursor-pointer focus:border-ring focus:ring-2 focus:ring-ring/30 outline-none"
                            >
                              <option value="">Select attribute...</option>
                              {otherAttributes.map((a) => (
                                <option key={a._id} value={a._id}>
                                  {a.title}
                                </option>
                              ))}
                            </select>
                            {ctrl && (
                              <select
                                value={cond.ifValueId}
                                onChange={(e) =>
                                  updateCondition(cond.id, { ifValueId: e.target.value })
                                }
                                className="mt-2 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-[13px] cursor-pointer focus:border-ring focus:ring-2 focus:ring-ring/30 outline-none"
                              >
                                <option value="">Any value</option>
                                {ctrl.values.map((val) => (
                                  <option key={val.id} value={val.id}>
                                    {val.name || "Untitled"}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>

                          {/* Then detect using values */}
                          <div>
                            <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                              Using values...
                            </label>
                            <div className="rounded-lg border border-input px-2.5 py-1.5 min-h-8 max-h-32 overflow-y-auto">
                              {state.values.length === 0 ? (
                                <p className="text-[12px] text-muted-foreground">
                                  Add values in the Values tab first.
                                </p>
                              ) : (
                                <div className="space-y-1">
                                  {state.values.map((val) => {
                                    const checked = cond.useValueIds.includes(val.id);
                                    return (
                                      <label
                                        key={val.id}
                                        className="flex items-center gap-2 text-[13px] cursor-pointer"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={(e) => {
                                            updateCondition(cond.id, {
                                              useValueIds: e.target.checked
                                                ? [...cond.useValueIds, val.id]
                                                : cond.useValueIds.filter(
                                                    (id) => id !== val.id,
                                                  ),
                                            });
                                          }}
                                          className="accent-[#e87537]"
                                        />
                                        {val.name || "Untitled"}
                                      </label>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => removeCondition(cond.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors cursor-pointer mt-5"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={addCondition}
                disabled={otherAttributes.length === 0}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                  otherAttributes.length === 0
                    ? "bg-secondary text-secondary-foreground/60 cursor-not-allowed"
                    : "bg-foreground text-background hover:bg-foreground/90 cursor-pointer",
                )}
              >
                <Plus className="h-3.5 w-3.5" />
                Add condition
              </button>
              {otherAttributes.length === 0 && (
                <p className="text-[12.5px] text-muted-foreground mt-2">
                  Create at least one other attribute to use as a condition trigger.
                </p>
              )}
            </div>
          )}
        </div>
      </SlidePanel>

      <ConfirmModal
        open={confirmDiscardOpen}
        onClose={() => setConfirmDiscardOpen(false)}
        onConfirm={() => onClose()}
        title="Unsaved Changes"
        description="You haven't finished editing this attribute. If you leave now, your changes will be lost."
        cancelLabel="Keep editing"
        confirmLabel="Discard"
      />
    </>
  );
}
