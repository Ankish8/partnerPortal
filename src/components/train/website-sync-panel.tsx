"use client";

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { SlidePanel } from "@/components/ui/slide-panel";
import { Button } from "@/components/ui/button";
import {
  Globe,
  CornerDownRight,
  Loader2,
  AlertCircle,
  Check,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  RefreshCw,
  FileText,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

const TABS = ["Connect", "Pages", "Review"] as const;

const TIPS = {
  mainLink: [
    "Paste the root URL of your Help Center, docs, or knowledge base.",
    "All linked sub-pages will be automatically discovered and crawled.",
    "Use a specific section URL (e.g. /help) rather than your homepage for better results.",
  ],
  pages: [
    "Select pages and sections that contain support content like help articles, guides, or FAQs.",
    "Avoid selecting marketing pages, product listings, or pages with complex layouts.",
    "All linked sub-pages within selected sections will be automatically included.",
    "You can always update your selection later in the content management settings.",
  ],
  additionalUrls: [
    "Add standalone pages that aren\u2019t linked from your main website URL.",
    "Useful for pages behind navigation menus, gated content, or separate subdomains.",
  ],
  excludeUrls: [
    "Exclude pages that contain irrelevant or duplicate content.",
    "Common exclusions: login pages, terms of service, privacy policy, changelog.",
  ],
  excludeSelectors: [
    "Use CSS selectors to skip parts of each page, like sidebars or banners.",
    "Example: .sidebar, #newsletter-banner, footer",
  ],
  clickableSelectors: [
    "Some content is hidden behind tabs, accordions, or dropdowns.",
    "Add selectors for elements that should be clicked to reveal hidden content.",
  ],
  waitSelectors: [
    "For pages that load content dynamically (e.g. via JavaScript).",
    "The crawler will wait for these elements to appear before extracting content.",
  ],
} as const;

function SeeTips({ tips }: { tips: readonly string[] }) {
  return (
    <Tooltip>
      <TooltipTrigger
        className="underline hover:text-foreground transition-colors cursor-pointer text-[13px] text-muted-foreground"
        render={<button type="button" />}
      >
        See tips.
      </TooltipTrigger>
      <TooltipContent side="bottom" align="start" className="max-w-[280px] px-5 py-4">
        <ul className="list-disc pl-4 space-y-1.5">
          {tips.map((tip, i) => (
            <li key={i} className="text-[13px] leading-relaxed">
              {tip}
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}

function FilledCheck({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-emerald-500 text-white",
        className
      )}
    >
      <Check className="h-[60%] w-[60%] stroke-[3]" />
    </span>
  );
}

type Tab = (typeof TABS)[number];

interface DiscoveredPage {
  url: string;
  status: "completed" | "pending" | "queued" | "errored" | "skipped" | "disallowed" | "cancelled";
  title?: string;
  markdown?: string;
}

interface CrawlState {
  status: "idle" | "starting" | "crawling" | "completed" | "error";
  jobId: string | null;
  pages: DiscoveredPage[];
  error: string | null;
}

interface WebsiteSyncPanelProps {
  open: boolean;
  onClose: () => void;
  existingSyncUrls?: string[];
  onSeeExistingSync?: () => void;
}

function normalizeUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/+$/, "").toLowerCase();
}

const PageRow = memo(function PageRow({
  url,
  displayUrl,
  checked,
  onToggle,
}: {
  url: string;
  displayUrl: string;
  checked: boolean;
  onToggle: (url: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 pl-12 pr-4 py-2.5 border-b border-border/40 last:border-b-0 bg-muted/20">
      <Checkbox
        checked={checked}
        onCheckedChange={() => onToggle(url)}
        className="cursor-pointer"
      />
      <span className="text-[14px] text-muted-foreground truncate flex-1">
        {displayUrl}
      </span>
    </div>
  );
});

export function WebsiteSyncPanel({
  open,
  onClose,
  existingSyncUrls = [],
  onSeeExistingSync,
}: WebsiteSyncPanelProps) {
  const createWebsiteSource = useMutation(api.websiteSources.create);
  const [activeTab, setActiveTab] = useState<Tab>("Connect");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<Tab>>(new Set());

  // Check if the entered URL matches any existing synced source
  const urlAlreadySynced = useMemo(() => {
    if (!websiteUrl.trim()) return false;
    const normalized = normalizeUrl(websiteUrl);
    return existingSyncUrls.some((u) => normalizeUrl(u) === normalized);
  }, [websiteUrl, existingSyncUrls]);

  // Crawl settings
  const [crawlDepth, setCrawlDepth] = useState(2);
  const [maxPages, setMaxPages] = useState(10);
  const [ignorePatterns, setIgnorePatterns] = useState("");
  const [showCrawlSettings, setShowCrawlSettings] = useState(false);

  // Advanced settings
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [additionalUrls, setAdditionalUrls] = useState<string[]>([]);
  const [excludeUrls, setExcludeUrls] = useState<string[]>([]);
  const [pageElements, setPageElements] = useState<"main" | "custom">("main");
  const [excludeSelectors, setExcludeSelectors] = useState("");
  const [clickableSelectors, setClickableSelectors] = useState("");
  const [waitSelectors, setWaitSelectors] = useState("");

  const [crawl, setCrawl] = useState<CrawlState>({
    status: "idle",
    jobId: null,
    pages: [],
    error: null,
  });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const knownUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      if (pollRef.current) clearInterval(pollRef.current);
      knownUrlsRef.current.clear();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset panel state when parent closes it
      setCrawl({ status: "idle", jobId: null, pages: [], error: null });
      setActiveTab("Connect");
      setSelectedPages(new Set());
      setExpandedPages(new Set());
      setCompletedSteps(new Set());
      setSourceTitle("");
      setCrawlDepth(2);
      setMaxPages(10);
      setIgnorePatterns("");
      setShowCrawlSettings(false);
      setShowAdvanced(false);
      setAdditionalUrls([]);
      setExcludeUrls([]);
      setPageElements("main");
      setExcludeSelectors("");
      setClickableSelectors("");
      setWaitSelectors("");
    }
  }, [open]);

  const pollCrawlStatus = useCallback((jobId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);

    const poll = async () => {
      try {
        const res = await fetch(`/api/crawl/${jobId}?limit=100`);
        const data = await res.json();

        if (!res.ok) {
          setCrawl((prev) => ({ ...prev, status: "error", error: data.error }));
          if (pollRef.current) clearInterval(pollRef.current);
          return;
        }

        const result = data.result;
        const pages: DiscoveredPage[] = (result?.records || []).map(
          (r: { url: string; status: string; metadata?: { title?: string }; markdown?: string }) => ({
            url: r.url,
            status: r.status,
            title: r.metadata?.title,
            markdown: r.markdown,
          })
        );

        const jobStatus = result?.status;
        const isComplete = jobStatus === "completed" || jobStatus === "cancelled";

        const newStatus = isComplete ? "completed" : "crawling";
        setCrawl((prev) => {
          if (prev.status === newStatus && prev.pages.length === pages.length) return prev;
          return { ...prev, status: newStatus, pages };
        });

        if (pages.length > 0) {
          // Only auto-select newly discovered completed pages, don't override manual changes
          const completedUrls = pages.filter((p) => p.status === "completed").map((p) => p.url);
          setSelectedPages((prev) => {
            const next = new Set(prev);
            let changed = false;
            for (const url of completedUrls) {
              if (!knownUrlsRef.current.has(url)) {
                next.add(url);
                knownUrlsRef.current.add(url);
                changed = true;
              }
            }
            return changed ? next : prev;
          });
          // Auto-set title from first page
          const firstPage = pages.find((p) => p.title);
          if (firstPage?.title) {
            setSourceTitle((prev) => prev || firstPage.title || "");
          }
        }

        if (isComplete && pollRef.current) {
          clearInterval(pollRef.current);
        }
      } catch {
        setCrawl((prev) => ({
          ...prev,
          status: "error",
          error: "Failed to check crawl status",
        }));
        if (pollRef.current) clearInterval(pollRef.current);
      }
    };

    poll();
    pollRef.current = setInterval(poll, 3000);
  }, []);

  const startCrawl = async () => {
    if (!websiteUrl.trim()) return;

    let normalizedUrl = websiteUrl.trim();
    if (!normalizedUrl.startsWith("http")) {
      normalizedUrl = `https://${normalizedUrl}`;
      setWebsiteUrl(normalizedUrl);
    }

    setCrawl({ status: "starting", jobId: null, pages: [], error: null });

    try {
      const res = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl, limit: maxPages }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCrawl((prev) => ({ ...prev, status: "error", error: data.error }));
        return;
      }

      const jobId = typeof data.result === "string" ? data.result : data.result?.id;
      if (!jobId) {
        setCrawl((prev) => ({ ...prev, status: "error", error: "No job ID returned" }));
        return;
      }

      setCrawl((prev) => ({ ...prev, status: "crawling", jobId }));
      setCompletedSteps((prev) => new Set([...prev, "Connect"]));
      setActiveTab("Pages");
      pollCrawlStatus(jobId);
    } catch {
      setCrawl((prev) => ({
        ...prev,
        status: "error",
        error: "Failed to start crawl. Check your connection.",
      }));
    }
  };

  const togglePage = useCallback((url: string) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  }, []);

  const toggleExpand = (url: string) => {
    setExpandedPages((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  const getDisplayUrl = (fullUrl: string) => {
    try {
      const parsed = new URL(fullUrl);
      return `${parsed.hostname}${parsed.pathname}`;
    } catch {
      return fullUrl;
    }
  };

  const getDisplayUrlBold = (fullUrl: string) => {
    try {
      const parsed = new URL(fullUrl);
      const parts = parsed.pathname.split("/").filter(Boolean);
      const lastPart = parts.pop();
      const prefix = `${parsed.hostname}/${parts.join("/")}${parts.length ? "/" : ""}`;
      return { prefix, bold: lastPart || "" };
    } catch {
      return { prefix: fullUrl, bold: "" };
    }
  };

  const updateUrlField = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    const next = [...list];
    next[index] = value;
    setList(next);
  };

  const removeUrlField = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    setList(list.filter((_, i) => i !== index));
  };

  const goToTab = (tab: Tab) => {
    // Mark current tab as completed when moving forward
    const currentIndex = TABS.indexOf(activeTab);
    const nextIndex = TABS.indexOf(tab);
    if (nextIndex > currentIndex) {
      setCompletedSteps((prev) => new Set([...prev, activeTab]));
    }
    setActiveTab(tab);
  };

  const pageTree = useMemo(() => {
    if (crawl.pages.length === 0) return [];
    const root = crawl.pages[0];
    let children = crawl.pages.slice(1);

    // Filter by crawl depth relative to root URL
    try {
      const rootDepth = new URL(root.url).pathname.split("/").filter(Boolean).length;
      children = children.filter((p) => {
        try {
          const depth = new URL(p.url).pathname.split("/").filter(Boolean).length;
          return depth - rootDepth < crawlDepth;
        } catch { return true; }
      });
    } catch { /* keep all */ }

    // Filter by ignore patterns
    const patterns = ignorePatterns.split(",").map((p) => p.trim()).filter(Boolean);
    if (patterns.length > 0) {
      children = children.filter((p) => {
        try {
          const pathname = new URL(p.url).pathname;
          return !patterns.some((pat) => pathname.startsWith(pat));
        } catch { return true; }
      });
    }

    return [{ ...root, children }];
  }, [crawl.pages, crawlDepth, ignorePatterns]);

  const filteredAdditionalUrls = additionalUrls.filter(Boolean);
  const filteredExcludeUrls = excludeUrls.filter(Boolean);

  return (
    <TooltipProvider>
    <SlidePanel open={open} onClose={onClose} title="Sync website" learnMoreHref="#">
      {/* Tabs with completion indicators */}
      <div className="flex border-b border-border/60 px-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-3 text-[14px] font-medium transition-colors cursor-pointer",
              activeTab === tab
                ? "border-b-[2.5px] border-[#e87537] text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {completedSteps.has(tab) && activeTab !== tab && (
              <FilledCheck className="h-4 w-4" />
            )}
            {tab}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto">
        {/* ─── CONNECT TAB ─── */}
        {activeTab === "Connect" && (
          <div className="flex flex-col p-6">
            {/* Already synced banner */}
            {urlAlreadySynced && (
              <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-5 py-4">
                <div>
                  <p className="text-[14px] font-semibold text-foreground">
                    This website source is already synced
                  </p>
                  <p className="text-[13px] text-muted-foreground mt-0.5">
                    To sync a new version, update or delete the existing source.
                  </p>
                </div>
                {onSeeExistingSync && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onSeeExistingSync}
                    className="shrink-0 text-[13px] font-semibold border-foreground/20 bg-white hover:bg-gray-50"
                  >
                    See existing sync
                  </Button>
                )}
              </div>
            )}

            {/* Browser mockup with gradient background */}
            <div className="rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-rose-100 via-pink-50 to-sky-100 p-6 pt-4">
              {/* Browser chrome */}
              <div className="rounded-xl overflow-hidden shadow-lg border border-white/60">
                <div className="bg-gradient-to-b from-gray-100 to-gray-50/90 px-4 py-2.5 flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-300/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-300/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-300/80" />
                  </div>
                  <div className="flex-1 flex items-center gap-2 bg-white rounded-lg px-3 py-1.5">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[13px] text-foreground font-medium">
                      {websiteUrl ? getDisplayUrl(websiteUrl) : "app.com/help"}
                    </span>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm p-3 space-y-0.5">
                  {["/faq", "/account", "/billing"].map((path) => {
                    const { prefix, bold } = getDisplayUrlBold(
                      websiteUrl
                        ? `${websiteUrl}${path}`
                        : `https://app.com/help${path}`
                    );
                    return (
                      <div
                        key={path}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                      >
                        <CornerDownRight className="h-4 w-4 text-muted-foreground/40" />
                        <span className="text-[14px] text-muted-foreground">
                          {prefix}
                          <span className="font-semibold text-foreground">{bold}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Main website link */}
            <div className="space-y-2">
              <h3 className="text-[14px] font-semibold">Main website link</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                The top-level URL to your Help Center or docs. This page and all
                the sub-pages will be synced.{" "}
                <SeeTips tips={TIPS.mainLink} />
              </p>
              <div className="mt-3">
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors",
                    websiteUrl
                      ? "border-[#e87537]/50 ring-1 ring-[#e87537]/20"
                      : "border-border/60"
                  )}
                >
                  <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && websiteUrl.trim()) startCrawl();
                    }}
                    className="flex-1 text-[14px] outline-none bg-transparent"
                    placeholder="https://app.com/help"
                  />
                </div>
              </div>

              {crawl.status === "error" && crawl.error && (
                <div className="flex items-center gap-2 mt-2 text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p className="text-[13px]">{crawl.error}</p>
                </div>
              )}
            </div>

            {/* Crawl Settings */}
            <div className="mt-8">
              <button
                onClick={() => setShowCrawlSettings(!showCrawlSettings)}
                className="flex items-center gap-1.5 text-[14px] font-semibold hover:text-foreground transition-colors cursor-pointer"
              >
                <Settings2 className="h-4 w-4" />
                Crawl Settings
                {showCrawlSettings ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {showCrawlSettings && (
                <div className="mt-4 rounded-xl border border-border/60 bg-muted/20 p-5">
                  <div className="grid grid-cols-2 gap-5 mb-5">
                    <div>
                      <h4 className="text-[14px] font-semibold mb-1.5">Crawl Depth</h4>
                      <input
                        type="number"
                        min={1}
                        max={3}
                        value={crawlDepth}
                        onChange={(e) => setCrawlDepth(Math.min(3, Math.max(1, Number(e.target.value) || 1)))}
                        className="w-full rounded-lg border border-border/60 px-3 py-2.5 text-[14px] outline-none bg-white focus:border-[#e87537]/50 focus:ring-1 focus:ring-[#e87537]/20 transition-colors"
                      />
                      <p className="text-[12px] text-muted-foreground mt-1.5">
                        How deep to crawl the Primary Website URL (1-3 levels)
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[14px] font-semibold mb-1.5">Max Pages</h4>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={maxPages}
                        onChange={(e) => setMaxPages(Math.min(100, Math.max(1, Number(e.target.value) || 1)))}
                        className="w-full rounded-lg border border-border/60 px-3 py-2.5 text-[14px] outline-none bg-white focus:border-[#e87537]/50 focus:ring-1 focus:ring-[#e87537]/20 transition-colors"
                      />
                      <p className="text-[12px] text-muted-foreground mt-1.5">
                        Maximum pages to process from the Primary Website URL
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[14px] font-semibold mb-1.5">Ignore Patterns</h4>
                    <p className="text-[12px] text-muted-foreground mb-2">
                      URL patterns to skip during Primary Website URL crawling (comma-separated, must start with &apos;/&apos;)
                    </p>
                    <input
                      type="text"
                      value={ignorePatterns}
                      onChange={(e) => setIgnorePatterns(e.target.value)}
                      className="w-full rounded-lg border border-border/60 px-3 py-2.5 text-[14px] outline-none bg-white focus:border-[#e87537]/50 focus:ring-1 focus:ring-[#e87537]/20 transition-colors"
                      placeholder="/blog,/admin,/private"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── PAGES TAB ─── */}
        {activeTab === "Pages" && (
          <div className="flex flex-col p-6">
            {/* Review pages to sync */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[14px] font-semibold">Review pages to sync</h3>
                {crawl.status === "crawling" && (
                  <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Crawling...
                  </span>
                )}
                {crawl.status === "completed" && (
                  <span className="flex items-center gap-1.5 text-[13px] text-emerald-600">
                    <FilledCheck className="h-3.5 w-3.5" />
                    {crawl.pages.length} pages found
                  </span>
                )}
              </div>
              <p className="text-[13px] text-muted-foreground">
                All sub-pages linked in each selected section will be synced.
                Select only relevant up-to-date content.{" "}
                <SeeTips tips={TIPS.pages} />
              </p>
            </div>

            {/* Page tree */}
            <div className="rounded-lg border border-border/60 overflow-hidden mb-6">
              {crawl.pages.length === 0 && crawl.status === "crawling" && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50 mb-3" />
                  <p className="text-[14px] text-muted-foreground">
                    Discovering pages...
                  </p>
                </div>
              )}

              {crawl.pages.length === 0 && crawl.status === "error" && (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <AlertCircle className="h-8 w-8 text-red-400 mb-3" />
                  <p className="text-[14px] text-muted-foreground mb-1">Crawl failed</p>
                  <p className="text-[13px] text-muted-foreground">
                    {crawl.error || "Something went wrong."}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 text-[13px]"
                    onClick={() => {
                      goToTab("Connect");
                      setCrawl({ status: "idle", jobId: null, pages: [], error: null });
                    }}
                  >
                    Try again
                  </Button>
                </div>
              )}

              {/* Tree view */}
              {pageTree.map((rootPage) => (
                <div key={rootPage.url}>
                  {/* Root page */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 last:border-b-0">
                    <button
                      onClick={() => toggleExpand(rootPage.url)}
                      className="p-0.5 hover:bg-muted rounded transition-colors cursor-pointer"
                    >
                      {expandedPages.has(rootPage.url) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    <Checkbox
                      checked={selectedPages.has(rootPage.url)}
                      onCheckedChange={() => togglePage(rootPage.url)}
                      className="cursor-pointer"
                    />
                    <span className="text-[14px] truncate">{rootPage.url}</span>
                  </div>

                  {/* Sub-pages */}
                  {expandedPages.has(rootPage.url) &&
                    rootPage.children.map((page) => (
                      <PageRow
                        key={page.url}
                        url={page.url}
                        displayUrl={getDisplayUrl(page.url)}
                        checked={selectedPages.has(page.url)}
                        onToggle={togglePage}
                      />
                    ))}
                </div>
              ))}
            </div>

            {/* Advanced settings */}
            <div className="border-t border-border/40 pt-5">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1 text-[14px] font-semibold hover:text-foreground transition-colors cursor-pointer"
              >
                Advanced settings
                {showAdvanced ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {showAdvanced && (
                <div className="mt-6 space-y-8">
                  {/* Additional URLs */}
                  <div>
                    <h4 className="text-[14px] font-semibold mb-0.5">
                      Additional URLs
                    </h4>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                      Add pages to sync that aren&apos;t linked as sub-pages from
                      the above sections.{" "}
                      <SeeTips tips={TIPS.additionalUrls} />
                    </p>
                    <div className="mt-3 space-y-2">
                      {(additionalUrls.length === 0 ? [""] : additionalUrls).map(
                        (url, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={url}
                              onChange={(e) => {
                                if (additionalUrls.length === 0) {
                                  setAdditionalUrls([e.target.value]);
                                } else {
                                  updateUrlField(
                                    additionalUrls,
                                    setAdditionalUrls,
                                    i,
                                    e.target.value
                                  );
                                }
                              }}
                              className="flex-1 rounded-lg border border-border/60 px-3 py-2.5 text-[14px] outline-none bg-transparent focus:border-[#e87537]/50 focus:ring-1 focus:ring-[#e87537]/20 transition-colors"
                              placeholder="https://example.com/additional-page"
                            />
                            {additionalUrls.length > 1 && (
                              <button
                                onClick={() =>
                                  removeUrlField(
                                    additionalUrls,
                                    setAdditionalUrls,
                                    i
                                  )
                                }
                                className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                              >
                                <X className="h-4 w-4 text-muted-foreground" />
                              </button>
                            )}
                          </div>
                        )
                      )}
                    </div>
                    <button
                      onClick={() => setAdditionalUrls((prev) => [...prev, ""])}
                      className="flex items-center gap-1.5 mt-3 text-[14px] font-medium hover:text-foreground transition-colors cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>

                  {/* URLs to exclude */}
                  <div>
                    <h4 className="text-[14px] font-semibold mb-0.5">
                      URLs to exclude
                    </h4>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                      Specify any pages you don&apos;t want synced.{" "}
                      <SeeTips tips={TIPS.excludeUrls} />
                    </p>
                    <div className="mt-3 space-y-2">
                      {(excludeUrls.length === 0 ? [""] : excludeUrls).map(
                        (url, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={url}
                              onChange={(e) => {
                                if (excludeUrls.length === 0) {
                                  setExcludeUrls([e.target.value]);
                                } else {
                                  updateUrlField(
                                    excludeUrls,
                                    setExcludeUrls,
                                    i,
                                    e.target.value
                                  );
                                }
                              }}
                              className="flex-1 rounded-lg border border-border/60 px-3 py-2.5 text-[14px] outline-none bg-transparent focus:border-[#e87537]/50 focus:ring-1 focus:ring-[#e87537]/20 transition-colors"
                              placeholder="https://example.com/page-to-exclude"
                            />
                            {excludeUrls.length > 1 && (
                              <button
                                onClick={() =>
                                  removeUrlField(
                                    excludeUrls,
                                    setExcludeUrls,
                                    i
                                  )
                                }
                                className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                              >
                                <X className="h-4 w-4 text-muted-foreground" />
                              </button>
                            )}
                          </div>
                        )
                      )}
                    </div>
                    <button
                      onClick={() =>
                        setExcludeUrls((prev) => [...prev, ""])
                      }
                      className="flex items-center gap-1.5 mt-3 text-[14px] font-medium hover:text-foreground transition-colors cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>

                  {/* Page elements to include */}
                  <div>
                    <h4 className="text-[14px] font-semibold mb-4">
                      Page elements to include
                    </h4>
                    <RadioGroup
                      value={pageElements}
                      onValueChange={(v) => setPageElements(v as "main" | "custom")}
                      className="space-y-4"
                    >
                      <label className="flex items-start gap-3 cursor-pointer">
                        <RadioGroupItem value="main" className="mt-0.5 cursor-pointer" />
                        <div>
                          <p className="text-[14px] font-medium">
                            Only main page content
                          </p>
                          <p className="text-[13px] text-muted-foreground leading-relaxed">
                            Excludes elements like headers, footers, modals,
                            scripts, and images.
                          </p>
                        </div>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <RadioGroupItem value="custom" className="mt-0.5 cursor-pointer" />
                        <div>
                          <p className="text-[14px] font-medium">Custom</p>
                          <p className="text-[13px] text-muted-foreground leading-relaxed">
                            Include or exclude specific page elements in addition
                            to the main content.
                          </p>
                        </div>
                      </label>
                    </RadioGroup>

                    {/* Custom page element options */}
                    {pageElements === "custom" && (
                      <div className="mt-6 pl-7 space-y-6">
                        <div>
                          <h5 className="text-[14px] font-medium mb-0.5">
                            Page elements to exclude
                          </h5>
                          <p className="text-[13px] text-muted-foreground leading-relaxed mb-2.5">
                            List any CSS selectors you want to skip to avoid
                            syncing irrelevant content.{" "}
                            <SeeTips tips={TIPS.excludeSelectors} />
                          </p>
                          <input
                            type="text"
                            value={excludeSelectors}
                            onChange={(e) => setExcludeSelectors(e.target.value)}
                            className="w-full rounded-lg border border-border/60 px-3 py-2.5 text-[14px] outline-none bg-transparent focus:border-[#e87537]/50 focus:ring-1 focus:ring-[#e87537]/20 transition-colors"
                            placeholder=".sidebar, #newsletter-banner"
                          />
                        </div>

                        <div>
                          <h5 className="text-[14px] font-medium mb-0.5">
                            Clickable page elements
                          </h5>
                          <p className="text-[13px] text-muted-foreground leading-relaxed mb-2.5">
                            Add CSS selectors for tabs, dropdowns, or other
                            elements that need to be clicked to reveal content.
                            These will be auto-clicked during syncing.{" "}
                            <SeeTips tips={TIPS.clickableSelectors} />
                          </p>
                          <input
                            type="text"
                            value={clickableSelectors}
                            onChange={(e) => setClickableSelectors(e.target.value)}
                            className="w-full rounded-lg border border-border/60 px-3 py-2.5 text-[14px] outline-none bg-transparent focus:border-[#e87537]/50 focus:ring-1 focus:ring-[#e87537]/20 transition-colors"
                            placeholder="#expandable_section_id, .tab"
                          />
                        </div>

                        <div>
                          <h5 className="text-[14px] font-medium mb-0.5">
                            Wait to load page element
                          </h5>
                          <p className="text-[13px] text-muted-foreground leading-relaxed mb-2.5">
                            Add CSS selectors for elements that load with a delay.
                            The scraper will wait for them to appear before syncing
                            content.{" "}
                            <SeeTips tips={TIPS.waitSelectors} />
                          </p>
                          <input
                            type="text"
                            value={waitSelectors}
                            onChange={(e) => setWaitSelectors(e.target.value)}
                            className="w-full rounded-lg border border-border/60 px-3 py-2.5 text-[14px] outline-none bg-transparent focus:border-[#e87537]/50 focus:ring-1 focus:ring-[#e87537]/20 transition-colors"
                            placeholder="#load_content_id, .article_paragraph"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── REVIEW TAB ─── */}
        {activeTab === "Review" && (
          <div className="flex flex-col p-6">
            <div className="mb-6">
              <h3 className="text-[15px] font-semibold mb-1">Review and finish</h3>
              <p className="text-[13px] text-muted-foreground">
                Check your sync settings before completing.
              </p>
            </div>

            <div className="rounded-lg border border-border/60">
              {/* Source */}
              <div className="flex items-start border-b border-border/60">
                <div className="w-[200px] shrink-0 py-4 pl-5 pr-3">
                  <span className="text-[13px] text-muted-foreground">Source</span>
                </div>
                <div className="flex-1 py-4 pr-5">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-[13px] font-medium">Website</span>
                  </div>
                </div>
              </div>

              {/* Custom name */}
              <div className="flex items-start border-b border-border/60">
                <div className="w-[200px] shrink-0 py-4 pl-5 pr-3">
                  <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                    <CornerDownRight className="h-3 w-3" />
                    Custom name
                  </div>
                </div>
                <div className="flex-1 py-2.5 pr-5">
                  <input
                    type="text"
                    value={sourceTitle}
                    onChange={(e) => setSourceTitle(e.target.value)}
                    className="w-full text-[13px] px-3 py-1.5 rounded-md border border-border/60 bg-transparent outline-none focus:ring-2 focus:ring-[#e87537]/30 focus:border-[#e87537] transition-colors"
                    placeholder="Enter a custom name"
                  />
                </div>
              </div>

              {/* URL */}
              <div className="flex items-start border-b border-border/60">
                <div className="w-[200px] shrink-0 py-4 pl-5 pr-3">
                  <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                    <CornerDownRight className="h-3 w-3" />
                    URL
                  </div>
                </div>
                <div className="flex-1 py-4 pr-5">
                  <span className="text-[13px] text-muted-foreground">{websiteUrl}</span>
                </div>
              </div>

              {/* Sync frequency */}
              <div className="flex items-start border-b border-border/60">
                <div className="w-[200px] shrink-0 py-4 pl-5 pr-3">
                  <span className="text-[13px] text-muted-foreground">Sync frequency</span>
                </div>
                <div className="flex-1 py-4 pr-5">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[13px] font-medium">Every week</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className={cn(
                "flex items-start",
                (pageElements === "custom" || filteredAdditionalUrls.length > 0 || filteredExcludeUrls.length > 0) && "border-b border-border/60"
              )}>
                <div className="w-[200px] shrink-0 py-4 pl-5 pr-3">
                  <span className="text-[13px] text-muted-foreground">Content</span>
                </div>
                <div className="flex-1 py-4 pr-5">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[13px] font-medium">
                      {selectedPages.size} page{selectedPages.size !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional URLs (if any) */}
              {filteredAdditionalUrls.length > 0 && (
                <div className={cn(
                  "flex items-start",
                  (filteredExcludeUrls.length > 0 || pageElements === "custom") && "border-b border-border/60"
                )}>
                  <div className="w-[200px] shrink-0 py-4 pl-5 pr-3">
                    <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                      <CornerDownRight className="h-3 w-3" />
                      Additional URLs
                    </div>
                  </div>
                  <div className="flex-1 py-4 pr-5">
                    <span className="text-[13px] text-muted-foreground">
                      {filteredAdditionalUrls.length} URL{filteredAdditionalUrls.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              )}

              {/* Excluded URLs (if any) */}
              {filteredExcludeUrls.length > 0 && (
                <div className={cn(
                  "flex items-start",
                  pageElements === "custom" && "border-b border-border/60"
                )}>
                  <div className="w-[200px] shrink-0 py-4 pl-5 pr-3">
                    <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                      <CornerDownRight className="h-3 w-3" />
                      Excluded URLs
                    </div>
                  </div>
                  <div className="flex-1 py-4 pr-5">
                    <span className="text-[13px] text-muted-foreground">
                      {filteredExcludeUrls.length} URL{filteredExcludeUrls.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              )}

              {/* Page elements (if custom) */}
              {pageElements === "custom" && (
                <div className="flex items-start">
                  <div className="w-[200px] shrink-0 py-4 pl-5 pr-3">
                    <span className="text-[13px] text-muted-foreground">Page elements</span>
                  </div>
                  <div className="flex-1 py-4 pr-5">
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-[13px] font-medium">Custom configuration</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom nav */}
      <div className="shrink-0 border-t border-border/40 px-6 py-5 flex justify-between">
        {activeTab === "Connect" ? (
          <div />
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              const idx = TABS.indexOf(activeTab);
              if (idx > 0) setActiveTab(TABS[idx - 1]);
            }}
            className="text-[14px] rounded-lg"
          >
            Previous
          </Button>
        )}

        {activeTab === "Connect" && (
          <Button
            onClick={startCrawl}
            disabled={
              !websiteUrl.trim() ||
              crawl.status === "starting" ||
              urlAlreadySynced
            }
            className="px-6 text-[14px] rounded-lg bg-foreground text-white hover:bg-foreground/90"
          >
            {crawl.status === "starting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Crawling...
              </>
            ) : (
              "Next"
            )}
          </Button>
        )}

        {activeTab === "Pages" && (
          <Button
            onClick={() => goToTab("Review")}
            disabled={selectedPages.size === 0}
            className="px-6 text-[14px] rounded-lg bg-foreground text-white hover:bg-foreground/90"
          >
            Next
          </Button>
        )}

        {activeTab === "Review" && (
          <Button
            onClick={async () => {
              const selectedPagesList = crawl.pages
                .filter((p) => selectedPages.has(p.url))
                .map((p) => ({
                  title: p.title || new URL(p.url).pathname,
                  url: p.url,
                  markdown: p.markdown,
                }));
              await createWebsiteSource({
                name: sourceTitle || websiteUrl,
                url: websiteUrl,
                pages: selectedPagesList,
              });
              onClose();
            }}
            className="px-6 text-[14px] rounded-lg bg-foreground text-white hover:bg-foreground/90"
          >
            Sync website
          </Button>
        )}
      </div>
    </SlidePanel>
    </TooltipProvider>
  );
}
