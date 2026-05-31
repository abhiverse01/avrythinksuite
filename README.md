<div align="center">

<img src="public/avrythink-logo.png" alt="AvrythinkSuite Logo" width="80" height="80" />

<h1>AvrythinkSuite</h1>

<p><strong>The all-in-one browser productivity suite.</strong></p>

<p>
Documents &middot; Spreadsheets &middot; Presentations &middot; Canvas &middot; Exams<br/>
Five powerful apps. One suite. Zero friction.
</p>

<img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16" />
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5" />
<img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
<img src="https://img.shields.io/badge/shadcn/ui-latest-18181B?style=flat-square&logo=radix-ui&logoColor=white" alt="shadcn/ui" />
<img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
<img src="https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma 6" />

</div>

---

## Overview

**AvrythinkSuite** is a full-featured, browser-based productivity suite designed to compete with Google Workspace and Microsoft 365. Built with a "silent giant" design philosophy, the suite delivers a premium, polished experience where every interaction is effortless and every transition is earned. The application is architected as a modern monorepo using Next.js 16 with the App Router, featuring a comprehensive design token system, component library, client-side state management via Zustand, and a Prisma-powered data layer with SQLite.

The suite consists of five core applications — **Docs**, **Sheets**, **Slides**, **Canvas**, and **Examiner** — unified under a single application shell with persistent navigation, a global command palette (accessible via `Cmd+K`), real-time notification system, organization management, and a fully dark-mode-aware design system built on CSS custom properties.

---

## Features

### Core Applications

| App | Description |
|-----|-------------|
| **Docs** | Rich document editor with real-time collaborative editing support (Tiptap v2 + Yjs integration planned) |
| **Sheets** | Powerful spreadsheet application for data analysis, budgeting, and tracking |
| **Slides** | Presentation builder for creating impactful decks and pitch materials |
| **Canvas** | Free-form visual thinking space for wireframes, mood boards, and creative exploration |
| **Examiner** | Full exam creation and assessment system with multiple question types, timed exams, scoring, and shareable links |

### Platform Features

- **Command Palette** — Global fuzzy search across all files, actions, and navigation. Trigger with `Cmd+K` or `Ctrl+K`.
- **Organization System** — Multi-organization support with role-based access (`owner`, `admin`, `member`, `viewer`) and organization switcher.
- **Notification Center** — Real-time notification bell with unread badge, type-coded indicators, and mark-all-read functionality.
- **File Management** — Full CRUD operations, star/unstar, soft-delete with trash recovery (30-day auto-purge policy), and collaborative sharing.
- **Responsive Navigation** — Collapsible 64px/240px navigation rail with three organized sections (Apps, Personal, System) and tooltip support in collapsed mode.
- **Theme System** — Light, dark, and system-auto theme modes with full design token coverage and smooth transitions.
- **Keyboard Shortcuts** — Comprehensive keyboard shortcut reference built into the settings page.
- **Accessibility** — WCAG-compliant focus rings, `aria-live` route announcer, semantic HTML, screen reader support, and `prefers-reduced-motion` respect.

---

## Architecture

```
AvrythinkSuite/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout (Inter + JetBrains Mono fonts)
│   │   ├── globals.css           # Design tokens + base styles
│   │   ├── api/                  # API routes
│   │   ├── (public)/             # Public route group (no auth required)
│   │   │   ├── page.tsx          # Landing page
│   │   │   ├── login/            # Sign-in page
│   │   │   ├── signup/           # Sign-up page
│   │   │   └── exam/[examId]/    # Public exam entry
│   │   └── (app)/                # Protected route group (auth required)
│   │       ├── layout.tsx        # Auth guard + AppShell wrapper
│   │       ├── home/             # Personal dashboard
│   │       ├── docs/             # Document list + editor
│   │       ├── sheets/           # Spreadsheet list + editor
│   │       ├── slides/           # Presentation list + editor
│   │       ├── canvas/           # Canvas list + editor
│   │       ├── examiner/         # Exam list + creator + results
│   │       ├── org/              # Organization pages
│   │       ├── settings/         # User settings
│   │       └── trash/            # Deleted files
│   ├── components/
│   │   ├── app/                  # Application-specific components (12)
│   │   └── ui/                   # shadcn/ui primitives (50+)
│   ├── stores/                   # Zustand state stores (4)
│   ├── hooks/                    # Custom React hooks
│   └── lib/                      # Utilities, types, DB client
├── prisma/
│   └── schema.prisma             # Database schema
├── public/                       # Static assets (logo, favicon, robots.txt)
└── config files                  # next.config, tailwind, eslint, tsconfig
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 | App Router, SSR/SSG, API routes, standalone output |
| **Language** | TypeScript 5 (strict) | Type safety across the entire codebase |
| **UI Library** | React 19 | Concurrent features, hooks, server components |
| **Styling** | Tailwind CSS v4 | Utility-first styling with `@theme inline` token mapping |
| **Component Library** | shadcn/ui | 50+ Radix UI-based accessible primitives |
| **State Management** | Zustand 5 | Lightweight, scalable client-side state |
| **Animation** | Framer Motion 12 | Page transitions, stagger effects, gesture animations |
| **Database ORM** | Prisma 6 | Type-safe database access with SQLite |
| **Database** | SQLite | Zero-config local database for development |
| **Icons** | Lucide React | Consistent, tree-shakeable icon set |
| **Fonts** | Inter + JetBrains Mono | Sans-serif body + monospace code |
| **Form Validation** | Zod 4 + React Hook Form 7 | Schema validation and form state |
| **Tables** | TanStack React Table 8 | Headless table logic for data views |
| **Charts** | Recharts 2 | Data visualization for dashboards |
| **Drag & Drop** | dnd-kit 6 + 10 | Accessible drag and drop interactions |
| **Date** | date-fns 4 | Immutable date formatting and manipulation |
| **Build Tool** | Bun | Fast package manager and script runner |
| **Deployment** | Standalone output | Self-contained production build |

---

## Design System

### Design Philosophy

AvrythinkSuite follows the **"Silent Giant"** principle — the interface should feel premium and powerful without drawing attention to itself. Every transition is smooth, every spacing decision is deliberate, and every color has purpose. The design avoids visual noise and lets content take center stage.

### Design Tokens

All visual properties are driven by CSS custom properties defined in `src/app/globals.css`. The token system provides complete light/dark mode coverage with smooth transitions.

#### Color Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--color-bg-base` | `#FAFAF9` | `#111110` | Page background |
| `--color-bg-surface` | `#FFFFFF` | `#1C1C1B` | Cards, panels, elevated surfaces |
| `--color-bg-elevated` | `#F5F5F4` | `#242423` | Input fields, subtle fills |
| `--color-bg-overlay` | `#EDECE9` | `#2E2E2C` | Hover states, overlays |
| `--color-text-primary` | `#1C1B19` | `#F0EFE9` | Headings, primary text |
| `--color-text-secondary` | `#6B6A63` | `#9B9A94` | Descriptions, secondary text |
| `--color-text-tertiary` | `#A09F99` | `#6B6A65` | Placeholders, metadata |
| `--color-accent` | `#5B57E6` | `#7B78F0` | Primary actions, active states |
| `--color-accent-hover` | `#4C48D4` | `#8B88F2` | Hover variant of accent |
| `--color-success` | `#1A9E6A` | `#2AD485` | Success states, online indicators |
| `--color-warning` | `#D4860A` | `#E8A020` | Warning states, starred items |
| `--color-danger` | `#D63B3B` | `#E85555` | Error states, destructive actions |

#### Typography

- **Font Family**: Inter (body), JetBrains Mono (code)
- **Base Size**: 14px with 1.6 line height
- **Weights**: 300 (light), 400 (regular), 500 (medium), 600 (semibold)
- **Font smoothing**: `-webkit-font-smoothing: antialiased`

#### Spacing Scale

Based on a 4px grid system: `0.25rem` to `6rem` (`--space-1` through `--space-24`).

#### Border Radius

Five levels: `4px` (sm), `8px` (md), `12px` (lg), `16px` (xl), `24px` (2xl).

#### Shadows

Four levels from subtle (`shadow-sm`: 1px offset) to dramatic (`shadow-xl`: 48px blur), each adjusting opacity between light and dark modes.

#### Motion

| Token | Value | Usage |
|-------|-------|-------|
| `--ease-smooth` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard transitions |
| `--ease-enter` | `cubic-bezier(0, 0, 0.2, 1)` | Enter animations |
| `--ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Exit animations |
| `--duration-fast` | `120ms` | Micro-interactions |
| `--duration-base` | `200ms` | Standard transitions |
| `--duration-slow` | `320ms` | Complex animations |

### shadcn/ui Token Mapping

Custom design tokens are mapped to shadcn/ui's expected variables (`--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--card`, `--popover`, `--border`, `--input`, `--ring`, sidebar tokens, and chart colors) ensuring full compatibility with all 50+ UI primitives.

---

## Database Schema

The data model is managed by Prisma with SQLite for zero-configuration local development. Seven models cover the full domain:

```
Profile ──┬──< FileItem >──< FileCollaborator
          │       │
          │       └──< Exam >──< ExamSubmission
          │
          ├──< Organization >──< OrgMember
          │
          └── (owns files, orgs, exams, submissions)
```

### Models

| Model | Purpose | Key Fields |
|-------|---------|-----------|
| **Profile** | User profiles with email, name, avatar | `id` (cuid), `email`, `full_name`, `avatar_url` |
| **Organization** | Workspace entities with slug, plan tier | `id`, `name`, `slug` (unique), `plan` (free/pro/enterprise) |
| **OrgMember** | Membership junction with role | `org_id` + `user_id` (unique), `role` (owner/admin/member/viewer) |
| **FileItem** | Universal file entity across all apps | `id`, `name`, `type` (doc/sheet/slide/canvas/exam), `content` (JSON), `parent_id` (self-ref for folders), `is_deleted`, `is_starred` |
| **FileCollaborator** | File-level sharing permissions | `file_id` + `user_id` (unique), `permission` (view/comment/edit) |
| **Exam** | Assessment definitions | `file_id` (unique), `questions` (JSON), `settings` (JSON), `share_token` (unique) |
| **ExamSubmission** | Exam responses | `exam_id`, `respondent_name`, `answers` (JSON), `score` |

### Cascade Rules

- Deleting an `Organization` cascades to its `OrgMember` records.
- Deleting a `Profile` cascades to `OrgMember` and `FileCollaborator` records.
- Deleting a `FileItem` cascades to `FileCollaborator` records.
- Deleting an `Exam` cascades to `ExamSubmission` records.

---

## State Management

Four Zustand stores manage all client-side state:

### Auth Store (`stores/auth-store.ts`)

Handles credential-based authentication with hardcoded admin account, session persistence via `localStorage`, and automatic hydration on page load.

| Action | Description |
|--------|-------------|
| `hydrate()` | Restores session from `localStorage` on mount |
| `signIn(email, password)` | Validates credentials, creates session (24h expiry) |
| `signUp(email, password, name)` | Creates new user, persists credentials |
| `signOut()` | Clears session and localStorage |
| `updateProfile(updates)` | Merges profile changes into persisted session |

**Default Admin Credentials:**
- Email: `admin@admina.com`
- Password: `admin123`

### UI Store (`stores/ui-store.ts`)

Manages all interface state including sidebar, theme, and command palette.

| State | Type | Description |
|-------|------|-------------|
| `sidebarCollapsed` | `boolean` | Collapsed (64px) vs expanded (240px) |
| `sidebarOpen` | `boolean` | Mobile sidebar visibility |
| `theme` | `'light' \| 'dark' \| 'system'` | Active theme mode (persisted) |
| `commandPaletteOpen` | `boolean` | Command palette visibility |
| `activeOrg` | `Organization \| null` | Currently selected organization |
| `headerScrolled` | `boolean` | Header shadow on scroll |

### File Store (`stores/file-store.ts`)

Manages file CRUD operations with 12 pre-seeded demo files for immediate visual feedback.

| Action | Description |
|--------|-------------|
| `createFile(partial)` | Creates a new file, returns the created `FileItem` |
| `renameFile(id, name)` | Updates file name and `updated_at` |
| `deleteFile(id)` | Soft-deletes (sets `is_deleted: true`, filters from view) |
| `restoreFile(id)` | Restores soft-deleted file |
| `starFile(id)` / `unstarFile(id)` | Toggles star status |
| `updateFileContent(id, content)` | Updates file content and `updated_at` |

### Notification Store (`stores/notification-store.ts`)

Manages in-app notifications with type-coding and unread tracking. Pre-seeded with 3 demo notifications.

| Action | Description |
|--------|-------------|
| `addNotification(partial)` | Creates notification, increments unread count |
| `markRead(id)` | Marks single notification as read |
| `markAllRead()` | Clears all unread indicators |
| `dismiss(id)` | Removes notification entirely |

---

## Components

### Application Components (`src/components/app/`)

| Component | Description |
|-----------|-------------|
| **AppShell** | Master layout: `NavRail` + `Header` + scrollable content area + `Announcer`. Renders 48px sticky header with blurred backdrop, responsive sidebar, and manages theme initialization. |
| **Header** | Sticky top bar with logo + optional doc title (left), `Cmd+K` search bar (center), and controls cluster: `NotificationBell`, `OrgSwitcher`, `UserAvatar` (right). Tracks scroll position for conditional shadow. |
| **NavRail** | Collapsible left navigation (64px collapsed / 240px expanded) with three sections: **Apps** (Home, Docs, Sheets, Slides, Canvas, Examiner), **Personal** (Recent, Starred, Shared), **System** (Organization, Settings, Trash). Shows tooltips in collapsed mode. |
| **CommandPalette** | Global dialog triggered by `Cmd+K`. Searches across files (from store), actions (create new files), and navigation targets. Supports keyboard navigation (arrow keys + enter), auto-focus, and grouped results. |
| **FileCard** | File preview card with type icon (color-coded), name, relative timestamp, owner avatar with initials, and a three-dot dropdown menu (Open, Star/Unstar, Rename, Share, Delete). Hover lifts with shadow. |
| **QuickCreateBar** | Pill-shaped bar with 5 dashed-outline buttons for instant file creation. Each button creates a new file in the store and navigates to its editor. |
| **NotificationBell** | Bell icon with unread count badge. Popover lists notifications with type-coded dots (info/success/warning/error), mark-all-read support, and click-to-read. |
| **OrgSwitcher** | Organization dropdown showing current org with role badges. Supports switching between Personal, Acme Corp (Pro), and Design Team (Pro). |
| **UserAvatar** | Circular avatar with initials fallback and online presence indicator (green dot). Dropdown menu with Profile, Settings, and Log Out actions. |
| **EmptyState** | Centered placeholder with large icon, title, description, and CTA button for zero-data states. |
| **Breadcrumb** | Navigation breadcrumb with auto-collapse on mobile (shows first + ellipsis + last). Chevron separators. |
| **Announcer** | Visually hidden `aria-live` region that announces route changes to screen readers. |

### UI Primitives (`src/components/ui/`)

50+ shadcn/ui components including: Accordion, AlertDialog, Alert, AspectRatio, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Command, ContextMenu, Dialog, Drawer, DropdownMenu, Form, HoverCard, InputOTP, Input, Label, Menubar, NavigationMenu, Pagination, Popover, Progress, RadioGroup, Resizable, ScrollArea, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Switch, Table, Tabs, Textarea, Toast, Toaster, ToggleGroup, Toggle, and Tooltip.

---

## Routes

### Public Routes (No Auth Required)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Marketing homepage with hero, app showcase, feature grid, CTA, footer |
| `/login` | Login | Email/password sign-in with form validation, Google OAuth placeholder (coming soon) |
| `/signup` | Signup | Account creation with name/email/password, form validation |
| `/exam/[examId]` | Public Exam | Shareable exam entry point for respondents |

### Protected Routes (Auth Required)

All routes under `(app)/` are protected by an auth guard in the layout. Unauthenticated users are redirected to `/login`.

| Route | Page | Description |
|-------|------|-------------|
| `/home` | Dashboard | Personal dashboard with greeting, date, stat cards, quick create bar, recent/starred/shared file grids |
| `/docs` | Docs List | Filterable, sortable document list with grid/list toggle |
| `/docs/[docId]` | Doc Editor | Document editing shell |
| `/sheets` | Sheets List | Filterable, sortable spreadsheet list |
| `/sheets/[sheetId]` | Sheet Editor | Spreadsheet editing shell |
| `/slides` | Slides List | Filterable, sortable presentation list |
| `/slides/[slideId]` | Slide Editor | Presentation editing shell |
| `/canvas` | Canvas List | Filterable, sortable canvas list |
| `/canvas/[canvasId]` | Canvas Editor | Canvas editing shell |
| `/examiner` | Examiner Dashboard | Exam management with stats (total/submissions/avg score), filter/sort |
| `/examiner/create` | Exam Creator | New exam creation flow |
| `/examiner/[examId]` | Exam Detail | Exam editor/viewer |
| `/org` | Organization | Organization overview and management |
| `/org/members` | Members | Team member management |
| `/org/settings` | Org Settings | Organization configuration |
| `/settings` | Settings | Profile, appearance (theme), notifications, keyboard shortcuts, danger zone |
| `/trash` | Trash | Soft-deleted files with restore and empty trash |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.0+ (recommended) or Node.js v20+
- SQLite3 (usually pre-installed)

### Installation

```bash
# Clone or extract the project
tar -xzf avrythinksuite-project.tar.gz
cd avrythinksuite-project

# Install dependencies
bun install

# Set up the database
bun run db:generate
bun run db:push
```

### Development

```bash
# Start development server on port 3000
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

### Default Login

```
Email:    admin@admina.com
Password: admin123
```

Or create a new account via the sign-up page. All credentials registered via sign-up are persisted in-memory and valid for the current session.

### Production Build

```bash
# Build for production (standalone output)
bun run build

# Start production server
bun run start
```

### Database Commands

```bash
bun run db:push       # Push schema changes to database
bun run db:generate   # Generate Prisma client
bun run db:migrate    # Run migrations (development)
bun run db:reset      # Reset database (development)
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database connection string | `file:./dev.db` |
| `NEXT_PUBLIC_*` | Public client-side environment variables | — |

---

## Configuration Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js configuration (standalone output, TypeScript build) |
| `tsconfig.json` | TypeScript strict mode configuration |
| `tailwind.config.ts` | Tailwind CSS content paths |
| `postcss.config.mjs` | PostCSS with Tailwind v4 plugin |
| `eslint.config.mjs` | ESLint with Next.js config |
| `components.json` | shadcn/ui component configuration |
| `prisma/schema.prisma` | Database schema definition |

---

## Utility Functions (`src/lib/utils.ts`)

| Function | Signature | Description |
|----------|-----------|-------------|
| `cn()` | `(...inputs: ClassValue[]) => string` | Merges Tailwind classes without conflicts (clsx + tailwind-merge) |
| `formatRelativeTime()` | `(date: string \| Date) => string` | Human-readable relative timestamps ("just now", "5m ago", "3d ago") |
| `formatDate()` | `(date: string \| Date) => string` | Full date string ("January 15, 2025") |
| `formatTime()` | `(date: string \| Date) => string` | Time string ("3:45 PM") |
| `getGreeting()` | `(name?: string) => string` | Time-aware greeting ("Good morning, Admin") |
| `generateSlug()` | `(text: string) => string` | URL-friendly slug generation |
| `getFileTypeLabel()` | `(type: string) => string` | Human-readable file type names |
| `getFileTypeColor()` | `(type: string) => string` | Tailwind color classes per file type |
| `truncate()` | `(text: string, maxLength: number) => string` | Text truncation with ellipsis |
| `generateShareToken()` | `() => string` | Cryptographically random hex token |
| `debounce()` | `<T>(fn: T, delay: number) => ...` | Function debouncing |
| `formatFileSize()` | `(bytes: number) => string` | Human-readable file sizes ("1.5 MB") |
| `getInitials()` | `(name: string) => string` | Extract initials from name |
| `isValidEmail()` | `(email: string) => boolean` | Email format validation |
| `generateId()` | `() => string` | Random ID generation |
| `clamp()` | `(value: number, min: number, max: number) => number` | Numeric clamping |
| `arraysEqual()` | `<T>(a: T[], b: T[]) => boolean` | Order-independent array comparison |

---

## TypeScript Types (`src/lib/types/index.ts`)

The type system defines the complete domain model with comprehensive interfaces for:

- **User & Auth**: `User`, `AuthSession`
- **Organization**: `Organization`, `OrgMember`, `OrgRole`, `OrgPlan`
- **Files**: `FileItem`, `FileCollaborator`, `FileType`, `FilePermission`
- **Exams**: `Exam`, `ExamQuestion`, `ExamSettings`, `ExamSubmission`, `QuestionType`, `MCQOption`
- **Notifications**: `Notification`
- **UI State**: `ThemeMode`, `ViewMode`, `SortField`, `FilterPreset`, `FileFilter`
- **Editor**: `EditorState`, `SyncStatus`
- **Command Palette**: `CommandItem`, `CommandItemType`
- **Navigation**: `NavItem`

---

## Project Statistics

| Metric | Value |
|--------|-------|
| Total source files | 100+ |
| Application components | 12 |
| UI primitives (shadcn/ui) | 50+ |
| Zustand stores | 4 |
| Public pages | 4 |
| Protected pages | 17 |
| API routes | 5 (health check + 4 exam CRUD endpoints) |
| Database models | 7 |
| Utility functions | 17 |
| TypeScript interfaces/types | 25+ |
| CSS custom properties | 40+ |
| Design token categories | 6 (color, typography, spacing, radius, shadow, motion) |

---

## Design Decisions

### Why Zustand over Redux/Context?

Zustand provides a minimal, boilerplate-free API with excellent TypeScript support, selective re-renders via subscriptions, and no provider wrapping. For a medium-complexity suite like this, it hits the sweet spot between simplicity and capability.

### Why SQLite for Development?

SQLite requires zero configuration, no external services, and produces a single portable database file. This keeps the development experience frictionless while the Prisma abstraction allows easy migration to PostgreSQL/MySQL for production.

### Why shadcn/ui over MUI/Ant Design?

shadcn/ui provides unstyled, accessible primitives that are owned by the project (copied into `src/components/ui/`), enabling complete design token integration without fighting against pre-baked styles. Combined with Tailwind CSS v4, this gives pixel-perfect control over every visual property.

### Why CSS Custom Properties over Tailwind Config?

CSS custom properties enable runtime theme switching (light/dark) without JavaScript class manipulation overhead. They also allow shadcn/ui component theming via a single mapping layer in `globals.css`.

### Why the App Router `(app)` and `(public)` Route Groups?

Route groups enable layout nesting without URL path segments. The `(app)` group applies the auth guard and `AppShell` wrapper to all protected routes, while the `(public)` group renders pages without any shell or authentication requirement.

---

## Future Roadmap

- **Google OAuth Integration** — Replace hardcoded auth with Google sign-in via NextAuth.js
- **Real-time Collaboration** — Tiptap v2 + Yjs for simultaneous editing across documents
- **File Storage** — Supabase Storage or S3 for file attachments and media uploads
- **Production Database** — Migrate from SQLite to PostgreSQL via Prisma
- **Real-time Notifications** — WebSocket push notifications via Supabase Realtime
- **Rich Exam Analytics** — Charts and breakdowns per question, per respondent
- **Mobile App** — React Native wrapper for iOS/Android native access
- **API Documentation** — OpenAPI spec for third-party integrations
- **Internationalization** — Multi-language support via next-intl
- **Audit Logging** — Comprehensive activity logs for enterprise compliance

---

## License

This project is proprietary software. All rights reserved.

---

<div align="center">

Built with precision. Designed to disappear.

</div>
