# Task: Cross-App Features for AvrythinkSuite

## Summary
Implemented 7 cross-app features for AvrythinkSuite: NotificationPanel, enhanced notification store, FileManagerView, Header integration, /files route, CommandPalette additions, and AppShell layout fixes.

## Files Created
- `src/components/app/NotificationPanel.tsx` — Full notification center panel with tabs (All/Unread/Mentions/System), avatar circles, relative time, unread dots, mark-all-read, animated tab indicator, keyboard dismiss, click-to-read+navigate
- `src/components/app/FileManagerView.tsx` — Complete file manager with sidebar filters (All/Docs/Sheets/Slides/Canvas/Exams/Starred/Shared/Recent/Trash), breadcrumb, New/Sort/View toggles, grid+list views, right-click context menus, multi-select with shift+click range, bulk actions toolbar
- `src/app/(app)/files/page.tsx` — Dedicated /files route using FileManagerView, inherits AppShell layout

## Files Modified
- `src/lib/types/index.ts` — Extended NotificationType to include 'comment'|'share'|'exam'|'system', added avatar/actorName/category fields to Notification interface
- `src/stores/notification-store.ts` — Replaced seed data with 9 rich sample notifications across comment/share/exam/system types with avatars and actor names; markRead/markAllRead already existed
- `src/components/app/Header.tsx` — Replaced NotificationBell popover with Bell icon + NotificationPanel slide-in panel; unread count badge on bell
- `src/components/app/CommandPalette.tsx` — Added "Go to Files" nav command, "Switch to Dark"/"Switch to Light" theme commands, setTheme integration
- `src/components/app/AppShell.tsx` — Main content already used h-dvh; added `[overscroll-behavior:none]` and `z-index: var(--z-base)` via style prop

## Key Design Decisions
- Brand color #FF3333 used throughout (unread dots, active sidebar, badges, new button)
- NotificationPanel slides from top-right on desktop, overlays full screen on mobile with backdrop
- FileManagerView uses the existing Breadcrumb component, existing Checkbox from shadcn/ui
- Context menus use existing shadcn ContextMenu component
- All pre-existing lint errors (CommandPalette, KeyboardShortcutsModal, CanvasPenTool) were NOT modified as they predate this task

## Lint Status
- All new/modified files pass ESLint cleanly
- 4 pre-existing lint errors remain in unrelated files
