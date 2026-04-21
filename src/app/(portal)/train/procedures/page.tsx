"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ListChecks,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";

type Procedure = Doc<"procedures">;

const STATUS_BADGE: Record<
  Procedure["status"],
  { label: string; variant: "success" | "secondary" | "outline" }
> = {
  live: { label: "Live", variant: "success" },
  draft: { label: "Draft", variant: "outline" },
  archived: { label: "Archived", variant: "secondary" },
};

function relativeTime(ts: number) {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk}w ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  const yr = Math.floor(day / 365);
  return `${yr}y ago`;
}

export default function ProceduresPage() {
  const router = useRouter();
  const proceduresQuery = useQuery(api.procedures.list);
  const procedures = useMemo(
    () => proceduresQuery ?? [],
    [proceduresQuery],
  );
  const createProcedure = useMutation(api.procedures.create);
  const removeProcedure = useMutation(api.procedures.remove);

  const [search, setSearch] = useState("");
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return procedures;
    const q = search.toLowerCase();
    return procedures.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.triggerDescription.toLowerCase().includes(q),
    );
  }, [procedures, search]);

  const handleCreate = async () => {
    const id = await createProcedure({});
    router.push(`/train/procedures/${id}`);
  };

  const handleDelete = async (id: Id<"procedures">) => {
    await removeProcedure({ id });
  };

  const hasProcedures = procedures.length > 0;
  const showOnboarding = !hasProcedures && !onboardingDismissed;

  return (
    <div className="flex-1 overflow-auto rounded-xl bg-white min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-5">
        <div className="flex items-center gap-2.5">
          <ListChecks className="h-[18px] w-[18px] text-muted-foreground" />
          <h1 className="text-[17px] font-semibold">Procedures</h1>
        </div>
        <Button
          className="h-10 rounded-full px-5 text-[14px]"
          onClick={handleCreate}
        >
          <Plus className="h-4 w-4" />
          New procedure
        </Button>
      </div>

      <div className="px-6 py-6">
        {/* Onboarding card */}
        {showOnboarding && (
          <div className="relative mb-6 rounded-xl bg-[#fef0e6] border border-[#f5d5bb] px-6 py-5">
            <button
              onClick={() => setOnboardingDismissed(true)}
              className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-[15px] font-semibold mb-1.5">
              Get started with Procedures
            </h2>
            <p className="text-[13.5px] text-foreground/80 leading-relaxed max-w-3xl">
              Procedures enable your AI Agent to resolve complex, multi-step
              processes like account troubleshooting or damaged order claims.
              Combine natural-language instructions with deterministic controls
              to keep the agent adaptable as conversations shift, while enforcing
              your rules and taking actions across your systems.
            </p>
            <p className="text-[13.5px] text-foreground/80 leading-relaxed mt-3">
              Not sure where to start? Create a new procedure to begin.
            </p>
          </div>
        )}

        {/* Search */}
        <div className="mb-5 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search procedures"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-[14px]"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-1.5 px-4 text-[13px]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* List or empty state */}
        {hasProcedures ? (
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <div className="grid grid-cols-[1fr_100px_120px_110px_40px] items-center gap-4 px-5 py-2.5 border-b border-border/60 bg-muted/20">
              <span className="text-[13px] font-medium text-muted-foreground">
                Name
              </span>
              <span className="text-[13px] font-medium text-muted-foreground">
                Status
              </span>
              <span className="text-[13px] font-medium text-muted-foreground">
                Audience
              </span>
              <span className="text-[13px] font-medium text-muted-foreground">
                Updated
              </span>
              <span />
            </div>
            {filtered.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-[13px] text-muted-foreground">
                  No procedures match &ldquo;{search}&rdquo;
                </p>
              </div>
            ) : (
              filtered.map((p, i) => (
                <ProcedureRow
                  key={p._id}
                  procedure={p}
                  isLast={i === filtered.length - 1}
                  onOpen={() => router.push(`/train/procedures/${p._id}`)}
                  onDelete={() => handleDelete(p._id)}
                />
              ))
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/60 py-14 px-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <ListChecks className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-[14px] font-medium mb-1">No procedures yet</p>
            <p className="text-[13px] text-muted-foreground mb-4">
              Create your first procedure to guide the AI through multi-step
              workflows.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProcedureRow({
  procedure,
  isLast,
  onOpen,
  onDelete,
}: {
  procedure: Procedure;
  isLast: boolean;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const status = STATUS_BADGE[procedure.status];
  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_100px_120px_110px_40px] items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors group",
        !isLast && "border-b border-border/40",
      )}
    >
      <button
        onClick={onOpen}
        className="text-left min-w-0 cursor-pointer"
      >
        <p className="text-[14px] font-medium truncate">
          {procedure.title || "Untitled"}
        </p>
        {procedure.triggerDescription && (
          <p className="text-[13px] text-muted-foreground line-clamp-1 mt-0.5">
            {procedure.triggerDescription}
          </p>
        )}
      </button>
      <div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>
      <span className="text-[13px] text-muted-foreground truncate">
        {procedure.audience}
      </span>
      <span className="text-[13px] text-muted-foreground">
        {relativeTime(procedure._creationTime)}
      </span>
      <button
        onClick={onDelete}
        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
        aria-label="Delete procedure"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
