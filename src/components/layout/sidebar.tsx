"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Database,
  Settings2,
  FlaskConical,
  Rocket,
  BarChart3,
  Globe,
  FileText,
  Phone,
  MessageSquare,
  Brain,
  GitBranch,
  Tags,
  BookOpen,
  ChevronRight,
  Bot,
  Sparkles,
  Workflow,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: { label: string; href: string; icon: React.ElementType }[];
}

const navItems: NavItem[] = [
  {
    label: "Get started",
    href: "/",
    icon: Sparkles,
  },
  {
    label: "Ingest",
    href: "/ingest",
    icon: Database,
    children: [
      { label: "Knowledge Sources", href: "/ingest", icon: BookOpen },
      { label: "Websites", href: "/ingest/websites", icon: Globe },
      { label: "Documents", href: "/ingest/documents", icon: FileText },
      { label: "Call Recordings", href: "/ingest/calls", icon: Phone },
      { label: "WhatsApp Chats", href: "/ingest/whatsapp", icon: MessageSquare },
    ],
  },
  {
    label: "Configure",
    href: "/configure",
    icon: Settings2,
    children: [
      { label: "Intents", href: "/configure/intents", icon: Brain },
      { label: "Flows", href: "/configure/flows", icon: GitBranch },
      { label: "Knowledge Base", href: "/configure/knowledge", icon: BookOpen },
      { label: "Tags", href: "/configure/tags", icon: Tags },
    ],
  },
  {
    label: "Test",
    href: "/test",
    icon: FlaskConical,
  },
  {
    label: "Deploy",
    href: "/deploy",
    icon: Rocket,
  },
  {
    label: "Analyze",
    href: "/analyze",
    icon: BarChart3,
  },
];

const bottomItems: NavItem[] = [
  {
    label: "Bot Settings",
    href: "/settings",
    icon: Workflow,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>(["Ingest", "Configure"]);

  const toggleSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex h-full w-[240px] flex-col border-r border-separator bg-surface">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-separator">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
          <Bot className="h-4.5 w-4.5 text-accent-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">Partner Portal</span>
          <span className="text-xs text-muted">AI Agent Builder</span>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.label}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleSection(item.label)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors hover:bg-default ${
                      isActive(item.href)
                        ? "text-accent"
                        : "text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronRight
                      className={`h-3.5 w-3.5 text-muted transition-transform ${
                        expandedSections.includes(item.label) ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                  {expandedSections.includes(item.label) && (
                    <ul className="mt-0.5 space-y-0.5 pl-4">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors hover:bg-default ${
                              isActive(child.href) &&
                              (child.href === item.href
                                ? pathname === item.href
                                : true)
                                ? "bg-default text-accent font-medium"
                                : "text-muted"
                            }`}
                          >
                            <child.icon className="h-3.5 w-3.5 shrink-0" />
                            <span>{child.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors hover:bg-default ${
                    isActive(item.href)
                      ? "bg-default text-accent"
                      : "text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom nav */}
      <div className="border-t border-separator px-3 py-3">
        <ul className="space-y-0.5">
          {bottomItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors hover:bg-default ${
                  isActive(item.href)
                    ? "bg-default text-accent"
                    : "text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
