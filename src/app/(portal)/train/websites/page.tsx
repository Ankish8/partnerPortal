"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ContentPanel } from "@/components/layout/content-panel";
import { PageContentPanel } from "@/components/train/page-content-panel";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import {
  Globe,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  Circle,
  ChevronDown,
  History,
  Settings,
  Plus,
  Columns3,
  Database,
  ChevronRight,
} from "lucide-react";

type SortDir = "asc" | "desc";

const ALL_COLUMNS = [
  { id: "status", label: "Status" },
] as const;

type ColumnId = (typeof ALL_COLUMNS)[number]["id"];

const SKELETON_WIDTHS = Array.from({ length: 12 }, (_, i) => `${45 + (i * 7) % 40}%`);

export default function WebsitesDetailPage() {
  const router = useRouter();

  // Convex queries
  const websiteSources = useQuery(api.websiteSources.list);
  const source = websiteSources?.[0];
  const pages = useQuery(
    api.syncedPages.listBySource,
    source ? { websiteSourceId: source._id } : "skip"
  );

  const loading = websiteSources === undefined || (source && pages === undefined);

  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnId>>(
    new Set(["status"])
  );
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [contentPanel, setContentPanel] = useState<{
    open: boolean;
    page: { _id: string; title: string; url: string; status: string; markdown?: string } | null;
  }>({ open: false, page: null });

  const filteredPages = useMemo(() => {
    if (!pages) return [];
    let list = [...pages];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) || p.url.toLowerCase().includes(q)
      );
    }

    // Sort by title
    list.sort((a, b) => {
      const cmp = a.title.localeCompare(b.title);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [pages, search, sortDir]);

  const livePagesCount = pages
    ? pages.filter((p) => p.status === "live").length
    : 0;
  const totalPages = pages?.length || 0;

  const toggleColumn = (col: ColumnId) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredPages.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredPages.map((p) => p._id)));
    }
  };

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Empty state
  if (!loading && !source) {
    return (
      <ContentPanel>
        <div className="flex flex-col items-center justify-center h-full py-32 px-6 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted/60">
            <Globe className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <h2 className="text-[17px] font-semibold mb-2">No website synced</h2>
          <p className="text-[14px] text-muted-foreground mb-6 max-w-md">
            Sync a website to extract content for your AI agent. All pages will
            be automatically crawled and indexed.
          </p>
          <Button
            onClick={() => router.push("/train")}
            className="rounded-lg bg-foreground text-white hover:bg-foreground/90"
          >
            Go to Knowledge Sources
          </Button>
        </div>
      </ContentPanel>
    );
  }

  return (
    <ContentPanel>
      {/* Header */}
      <div className="border-b px-6 py-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-3 text-[13px]">
          <Link
            href="/train"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-[#e87537] transition-colors"
          >
            <Database className="h-3.5 w-3.5" />
            Content
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <Globe className="h-3.5 w-3.5 text-[#e87537]" />
            {source?.name || "Website Pages"}
          </span>
        </div>

        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-[17px] font-semibold">
              {source?.name || "Website Pages"}
            </h1>
            {source && (
              <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                <Circle className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" />
                {livePagesCount}/{totalPages} live
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-[13px] rounded-lg cursor-pointer"
            >
              <History className="h-3.5 w-3.5" />
              Sync history
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-[13px] rounded-lg cursor-pointer"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b px-6 py-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-[13px]"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 text-[13px] rounded-lg cursor-pointer"
        >
          <ChevronDown className="h-3.5 w-3.5" />
          Status
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 text-[13px] rounded-lg cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          Filters
        </Button>
      </div>

      {/* Item count + column selector */}
      <div className="flex items-center justify-between px-6 py-3 border-b">
        <span className="text-[13px] text-muted-foreground">
          {loading ? "" : `${filteredPages.length} items`}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<button type="button" />}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer"
          >
            <Columns3 className="h-[18px] w-[18px] text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4} className="w-48">
            <div className="px-3 py-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search columns..."
                  className="w-full rounded-md border border-border/60 bg-transparent py-1.5 pl-7 pr-2 text-[13px] outline-none focus:ring-1 focus:ring-[#e87537]/30"
                />
              </div>
            </div>
            <DropdownMenuSeparator />
            {ALL_COLUMNS.map((col) => (
              <DropdownMenuCheckboxItem
                key={col.id}
                checked={visibleColumns.has(col.id)}
                onClick={() => toggleColumn(col.id)}
                className="text-[13px] cursor-pointer"
              >
                {col.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {/* Table header */}
        <div
          className={cn(
            "grid items-center gap-4 border-b border-border/60 px-5 py-2.5",
            visibleColumns.has("status")
              ? "grid-cols-[32px_1fr_120px_48px]"
              : "grid-cols-[32px_1fr_48px]"
          )}
        >
          <Checkbox
            checked={
              filteredPages.length > 0 &&
              selectedRows.size === filteredPages.length
            }
            onCheckedChange={toggleSelectAll}
            className="cursor-pointer"
          />
          <button
            className="group flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-[#e87537] transition-colors cursor-pointer"
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          >
            Title
            <ArrowUpDown className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
          </button>
          {visibleColumns.has("status") && (
            <span className="text-[13px] font-medium text-muted-foreground">
              Status
            </span>
          )}
          <span />
        </div>

        {/* Skeleton loading */}
        {loading &&
          Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="grid items-center gap-4 border-b border-border/40 px-5 py-3.5 grid-cols-[32px_1fr_120px_48px]"
            >
              <div className="h-4 w-4 rounded bg-muted animate-pulse" />
              <div
                className="h-4 rounded bg-muted animate-pulse"
                style={{ width: SKELETON_WIDTHS[i] }}
              />
              <div className="h-5 w-14 rounded-full bg-muted animate-pulse" />
              <div />
            </div>
          ))}

        {/* Table rows */}
        {!loading &&
          filteredPages.map((page) => (
            <div
              key={page._id}
              className={cn(
                "group grid items-center gap-4 border-b border-border/40 px-5 py-3 hover:bg-muted/30 transition-colors cursor-pointer",
                visibleColumns.has("status")
                  ? "grid-cols-[32px_1fr_120px_48px]"
                  : "grid-cols-[32px_1fr_48px]"
              )}
              onClick={() => setContentPanel({ open: true, page })}
            >
              {/* Checkbox */}
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedRows.has(page._id)}
                  onCheckedChange={() => toggleRow(page._id)}
                  className="opacity-0 group-hover:opacity-100 data-[checked]:opacity-100 transition-opacity cursor-pointer"
                />
              </div>

              {/* Title */}
              <span className="text-[14px] truncate group-hover:text-[#e87537] transition-colors">
                {page.title}
              </span>

              {/* Status */}
              {visibleColumns.has("status") && (
                <div>
                  {page.status === "live" ? (
                    <Badge variant="success">Live</Badge>
                  ) : (
                    <span className="text-[13px] text-muted-foreground">
                      Excluded
                    </span>
                  )}
                </div>
              )}

              {/* Actions (last column) */}
              <div
                className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<button type="button" />}
                    className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors cursor-pointer"
                  >
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem className="text-[13px] cursor-pointer">
                      View page
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-[13px] cursor-pointer">
                      Open original URL
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      className="text-[13px] cursor-pointer"
                    >
                      Exclude page
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}

        {/* No results */}
        {!loading && filteredPages.length === 0 && source && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-[14px] text-muted-foreground">
              No pages match your search.
            </p>
          </div>
        )}
      </div>

      {/* Page content slide panel */}
      <PageContentPanel
        open={contentPanel.open}
        onClose={() => setContentPanel({ open: false, page: null })}
        title={contentPanel.page?.title || ""}
        url={contentPanel.page?.url || ""}
        markdown={contentPanel.page?.markdown}
      />
    </ContentPanel>
  );
}
