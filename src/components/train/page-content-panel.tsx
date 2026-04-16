"use client";

import { useState } from "react";
import { SlidePanel } from "@/components/ui/slide-panel";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { cn } from "@/lib/utils";
import {
  X,
  Maximize2,
  Minimize2,
  PanelRight,
  Globe,
  Link2,
  BarChart3,
  Tag,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
} from "lucide-react";

interface PageContentPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  url: string;
  markdown?: string;
}

// Strip images/SVGs, style links like Intercom (dark, underlined)
const markdownComponents: Components = {
  img: () => null,
  svg: () => null,
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      className="text-foreground underline decoration-foreground/30 hover:decoration-foreground transition-colors"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
};

function DetailsSection({
  icon,
  title,
  defaultOpen = false,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="text-[13px] font-semibold">{title}</span>
        </div>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
      {open && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}

export function PageContentPanel({
  open,
  onClose,
  title,
  url,
  markdown,
}: PageContentPanelProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleClose = () => {
    setIsFullscreen(false);
    setShowDetails(false);
    onClose();
  };

  const panelWidth = isFullscreen
    ? "!w-[calc(100vw-16px)] !max-w-none"
    : "!w-[70vw] !max-w-[calc(100vw-160px)]";

  const header = (
    <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-border">
      <h2 className="text-[15px] font-semibold">Webpage</h2>
      <div className="flex items-center gap-1">
        {/* Fullscreen toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-[16px] w-[16px] text-muted-foreground" />
          ) : (
            <Maximize2 className="h-[16px] w-[16px] text-muted-foreground" />
          )}
        </button>

        {/* Close */}
        <button
          onClick={handleClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer"
          title="Close editor"
        >
          <X className="h-[16px] w-[16px] text-muted-foreground" />
        </button>

        {/* Show details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer",
            showDetails
              ? "bg-muted text-foreground"
              : "hover:bg-muted text-muted-foreground"
          )}
          title="Show details"
        >
          <PanelRight className="h-[16px] w-[16px]" />
        </button>
      </div>
    </div>
  );

  return (
    <SlidePanel
      open={open}
      onClose={handleClose}
      title="Webpage"
      panelClassName={panelWidth}
      disableBackdropClose
      customHeader={header}
    >
      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[680px] px-8 py-10">
            {/* URL breadcrumb */}
            <p className="mb-2 text-[13px] text-muted-foreground">{url}</p>

            {/* Page title */}
            <h1 className="text-[28px] font-bold leading-[1.3] mb-8 text-foreground">
              {title}
            </h1>

            {/* Rendered markdown content */}
            {markdown ? (
              <article
                className={[
                  "text-[15px] leading-[1.8] text-foreground/80",
                  "[&_h1]:text-[24px] [&_h1]:font-bold [&_h1]:mt-10 [&_h1]:mb-4 [&_h1]:text-foreground [&_h1]:leading-[1.3]",
                  "[&_h2]:text-[20px] [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-foreground",
                  "[&_h3]:text-[17px] [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-foreground",
                  "[&_p]:mb-5",
                  "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ul]:space-y-1",
                  "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_ol]:space-y-1",
                  "[&_li]:leading-[1.7]",
                  "[&_blockquote]:border-l-[3px] [&_blockquote]:border-border [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:my-6 [&_blockquote]:text-muted-foreground",
                  "[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px]",
                  "[&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-6",
                  "[&_hr]:my-8 [&_hr]:border-border/60",
                ].join(" ")}
              >
                <ReactMarkdown components={markdownComponents}>
                  {markdown}
                </ReactMarkdown>
              </article>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-[14px] text-muted-foreground">
                  No content available for this page.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Details side panel */}
        <div
          className={cn(
            "shrink-0 border-l border-border bg-white overflow-y-auto transition-all duration-300 ease-out",
            showDetails ? "w-[340px]" : "w-0 border-l-0"
          )}
        >
          {showDetails && (
            <div className="w-[340px]">
              {/* Details header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <span className="text-[14px] font-semibold">Details</span>
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors cursor-pointer"
                >
                  <PanelRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>

              {/* Data section */}
              <DetailsSection
                icon={<Code2 className="h-4 w-4 text-muted-foreground" />}
                title="Data"
                defaultOpen
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-muted-foreground">Type</span>
                    <span className="flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-0.5 text-[12px] font-medium">
                      <Globe className="h-3 w-3" />
                      Webpage
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-muted-foreground">Language</span>
                    <span className="text-[13px]">English</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-muted-foreground">Created</span>
                    <span className="text-[13px]">Today</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-muted-foreground">Last updated</span>
                    <span className="text-[13px]">Today</span>
                  </div>
                </div>
              </DetailsSection>

              {/* Link section */}
              <DetailsSection
                icon={<Link2 className="h-4 w-4 text-muted-foreground" />}
                title="Link"
                defaultOpen
              >
                <div className="flex items-center gap-2">
                  <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-foreground underline decoration-foreground/30 hover:decoration-foreground truncate"
                  >
                    {url}
                  </a>
                  <button
                    onClick={() => navigator.clipboard.writeText(url)}
                    className="shrink-0 flex h-6 w-6 items-center justify-center rounded hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              </DetailsSection>

              {/* Reports section */}
              <DetailsSection
                icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
                title="Reports"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-muted-foreground">Resolutions</span>
                    <span className="text-[13px]">-</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-muted-foreground">Involvements</span>
                    <span className="text-[13px]">-</span>
                  </div>
                </div>
              </DetailsSection>

              {/* Tags section */}
              <DetailsSection
                icon={<Tag className="h-4 w-4 text-muted-foreground" />}
                title="Tags"
              >
                <button className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <span className="text-lg leading-none">+</span>
                  <span>Add tag</span>
                </button>
              </DetailsSection>
            </div>
          )}
        </div>
      </div>
    </SlidePanel>
  );
}
