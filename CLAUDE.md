# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Partner Portal is an AI Agent Builder for creating WhatsApp business agents. Partners import knowledge sources (websites, documents, calls, WhatsApp chats), configure intents/flows, test via a simulator, and deploy to WhatsApp.

## Tech Stack

- **Next.js 16** (App Router) with React 19 and TypeScript
- **Convex** for backend (database, file storage, real-time queries)
- **Tailwind CSS v4** with shadcn/ui components (using `@base-ui/react` primitives, NOT Radix)
- **Cloudflare Browser Rendering API** for website crawling

## Critical: Read Before Writing Code

- **Next.js 16 has breaking changes.** Read relevant guides in `node_modules/next/dist/docs/` before writing any code. Do not rely on training data for Next.js APIs.
- **Convex patterns differ from training data.** Always read `convex/_generated/ai/guidelines.md` first when working on Convex code. Key rules: no `.filter()` (use indexes), no `.collect().length`, always include argument validators, use `v.id(tableName)` not `v.string()` for IDs.

## Commands

```bash
npm run dev          # Start dev server on port 4173
npm run build        # Production build
npm run lint         # ESLint
npx convex dev       # Start Convex dev backend (required alongside Next.js dev)
```

Both `npm run dev` and `npx convex dev` must run simultaneously during development.

No test framework is configured yet — there are no tests in the project.

## Architecture

### Component Hierarchy

Root layout (`src/app/layout.tsx`) wraps the entire app in a fixed hierarchy:
```
ConvexClientProvider > TooltipProvider > AppShell (sidebar + content)
```
AppShell lives in the root layout, not in a route-group layout. This means the sidebar is present on every page including the root `/` Get Started dashboard. There is no nested layout inside `(portal)/`.

### Frontend (`src/`)

- **`src/app/page.tsx`** — Get Started dashboard (simulates AI assistant chat interface)
- **`src/app/(portal)/`** — Route group for portal sections, all `"use client"` pages using Convex hooks
- **Sections with sub-routes:**
  - `train/` — Hub page + sub-pages: `websites/`, `documents/`, `calls/`, `whatsapp/`
  - `configure/` — Hub page + sub-pages: `intents/`, `flows/`, `knowledge/`, `tags/`
- **Leaf sections:** `test/`, `deploy/`, `analyze/`, `settings/` (single page each)
- **`src/components/layout/`** — `AppShell` (flex container), `Sidebar` (nav with collapsible Train/Configure sections), `ContentPanel` (scroll wrapper)
- **`src/components/train/`** — Slide-out panels for each knowledge source type
- **`src/components/configure/`** — Detail panels (e.g., `knowledge-detail-panel.tsx`)
- **`src/components/ui/`** — shadcn/ui primitives built on `@base-ui/react`

### Backend (`convex/`)

- **`convex/schema.ts`** — Five tables: `websiteSources`, `syncedPages`, `documents`, `callRecordings`, `whatsappChats`
- One Convex module per table with the same name (e.g., `websiteSources.ts`)
- Standard pattern per module: `list` query, `create`/`remove` mutations; documents/callRecordings/whatsappChats also have `generateUploadUrl` mutation
- File uploads use Convex storage (`_storage` table) with `src/lib/convex-upload.ts` helper for progress-tracked XHR uploads

### API Routes (`src/app/api/`)

- **`/api/crawl`** — POST to start a Cloudflare crawl job; `[jobId]/` GET to poll status, DELETE to cancel. Uses Next.js 16 Route Handlers.

### Key Patterns

- All page components are `"use client"` — they use Convex's `useQuery`/`useMutation` hooks directly
- Convex API is imported via relative path from pages: `import { api } from "../../../../convex/_generated/api"` (the `@/*` alias maps to `./src/*` only, not `convex/`)
- Some configure pages (intents, flows, tags) use mock data and are not yet wired to Convex
- No authentication is configured yet
- Brand accent color is `#e87537` (used for active states, hover highlights)
- Fonts: Inter (`--font-sans`), JetBrains Mono (`--font-mono`), Playfair Display (`--font-serif`, used for headings via `--font-heading`)
- CSS uses Tailwind v4 `@import "tailwindcss"` syntax with OKLch color space for theme variables
- Icons from `lucide-react` throughout

## Environment Variables

- `NEXT_PUBLIC_CONVEX_URL` — Convex deployment URL (required)
- `CLOUDFLARE_ACCOUNT_ID` — For website crawling API
- `CLOUDFLARE_API_TOKEN` — For website crawling API
