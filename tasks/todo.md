# FDM — Master Task Plan

> Based on FDM Community Management System Requirements v3.0
> Work phase by phase. Complete and verify each phase before moving to the next.
> Run `npx tsc --noEmit` after every phase — zero errors required.
>
> WORKFLOW:
>
> 1. Build the phase tasks below
> 2. Copy that phase's checklist to checking.md for manual verification

---

## Phase 2: Public Header & Shared Layout

> Goal: Public header live, reusable branding components, and responsive state management.

- `config/navigation.ts` — nav data file
- `components/ui/logo.tsx` — reusable logo with fallback icon & text fallback
- `components/layout/public-header.tsx` — Refactored with NavLinks and AuthAction helpers
  - Center: nav links from config, hidden on mobile
  - Right: "Sign In" button → `/login` (AuthAction)
  - Mobile: hamburger toggles drawer
  - Active link via current pathname
  - Sticky with shadow-sm and backdrop blur
- `hooks/use-close-on-resize.ts` — Custom hook to auto-close sheet on desktop resize
- `proxy.ts` (Middleware) — Unified to use proxy convention and allowed public routes
- Update `AuthFormCard` to use the new `Logo` component

---

## Phase 3: Public Pages — About

> Goal: About FDM page live, all sections, data-driven from config, using real assets.

### Design

- [x] `design/about.pen` — Full About page designed (9 sections)

### Config & Data

- [x] `config/about.ts` — chapters, pillars, communityStats, heroStats

### Implementation

- [x] `app/(public)/about/page.tsx` — Hero, Mission, Pillars, Chapters, Gallery, Stats, Our Story, CTA, Footer
- [x] Verify all 6 chapter images load (qc, bataan, cavite, pasau, pasig, tala)
- [x] `npx tsc --noEmit` — zero errors

---

## Phase 4: Public Pages — Chapters

> Goal: Comprehensive list of all FDM chapters with locations and schedules.

- [ ] `app/(public)/chapters/page.tsx` — Grid layout of all 6 chapters
- [ ] Integration with `config/about.ts` (or move to `config/chapters.ts`)
- [ ] Responsive design & visual consistency with About page
- [ ] `npx tsc --noEmit` — zero errors

## Phase 5: Admin Panel UI (Mock Data Only)

> Goal: Full dashboard shell with sidebar, all nav items, and mock dashboard home.
> No real DB calls yet — all data is hardcoded mock.

### 5a. Sidebar Navigation Config

config/sidebar-navigation.ts — single source of truth for all nav items
Each item shape: { label, href, icon, roles: string[] }
Groups and items:
OVERVIEW

Dashboard /dashboard roles: all

COMMUNITY

Members /dashboard/members roles: sd, elder, hs, ahs, mh
Guests /dashboard/guests roles: sd, elder, hs, ahs
Clusters /dashboard/clusters roles: sd, elder, hs, ahs, builder, cluster_head
Ministries /dashboard/ministries roles: sd, elder, hs, mc, mh

EVENTS

Events /dashboard/events roles: sd, elder, hs, ahs
Attendance /dashboard/attendance roles: sd, elder, hs, ahs
Guest Encode /dashboard/encode roles: ahs

RECORDS

Enthronements /dashboard/enthronements roles: sd, elder, hs, builder, cluster_head
Finance /dashboard/finance roles: sd, elder, hs, finance
Announcements /dashboard/announcements roles: sd, elder, hs, ahs

REPORTS

General Assembly /dashboard/reports roles: sd, elder, hs

ADMIN

Users /dashboard/admin/users roles: sd, elder, hs, ahs
Chapters /dashboard/admin/chapters roles: sd, elder
Areas & Clusters /dashboard/admin/areas roles: sd, elder, hs, ahs
Ministries /dashboard/admin/ministries roles: sd, elder, hs
Ministry Types /dashboard/admin/ministry-types roles: sd, elder
Event Types /dashboard/admin/event-types roles: sd, elder
Roles /dashboard/admin/roles roles: sd, elder

MY ACCOUNT

My QR Code /dashboard/my-qr roles: member
My Attendance /dashboard/my-attendance roles: member

### 5b. User Context (Mock)

lib/context/user-context.tsx

Mock user object: { id, name, email, role, chapter, initials }
Export useUser() hook
Role defaults to spiritual_director for now
Will be replaced with real Supabase session in Phase 4

### 5c. Sidebar Component

components/layout/sidebar.tsx

Reads from config/sidebar-navigation.ts
Filters nav groups by useUser().role
Expanded: 240px wide, icon + label always visible
Collapsed: 64px wide, icon only + shadcn Tooltip with label
Collapse toggle button at very bottom of sidebar
Active item: bg-primary text-white rounded pill
Inactive: text-muted-foreground, hover shifts to text-primary
Group labels: text-xs uppercase tracking-wider text-muted-foreground
Footer: avatar initials circle + name + role badge + Sign Out button
Mobile: hidden, opens as Sheet drawer (shadcn Sheet)
Min tap target 44px per item

### 5d. Dashboard Header Component

components/layout/dashboard-header.tsx

Right: notification bell icon
Mobile: hamburger triggers sidebar Sheet
Height 64px, border-b border-border bg-background
DO NOT confuse with public-header.tsx — this is dashboard only

### 5e. Dashboard Layout

app/(dashboard)/layout.tsx

Sidebar left + header top + {children} right
UserProvider wraps everything
Sidebar hidden on mobile, toggled via header hamburger
Scrollable content area, sidebar stays fixed

### 5f. Dashboard Home Page (Mock)

app/(dashboard)/page.tsx
STAT CARDS — 4 cards, top row:

Total Members: 248 | +12 this month
Active This Month: 187 | 75% attendance rate
Guests: 34 | 8 awaiting follow-up
Enthronements: 91 | +6 this quarter

QUICK ACTIONS — 4 large icon cards below stats:

Encode Guest → /dashboard/encode
Create Event → /dashboard/events/new
Add Member → /dashboard/admin/users/new
View Reports → /dashboard/reports

MIDDLE ROW — 2 columns:

Recent Attendance: 3 events (name + date + count attended)
Finance Snapshot: income ₱18,400 / expenses ₱6,200 / net ₱12,200

BOTTOM ROW — 2 columns:

Guest Follow-up Queue: 4 guests, status badge each
pending=gray, contacted=blue, emailed=amber, registered=green
Upcoming Events: 3 events, type badge + date + chapter

### 5g. Placeholder Pages (shell only)

All sidebar links must resolve — create empty pages with title + "Coming soon" card.
No content needed yet. Batch these in one pass:

app/(dashboard)/members/page.tsx
app/(dashboard)/guests/page.tsx
app/(dashboard)/clusters/page.tsx
app/(dashboard)/ministries/page.tsx
app/(dashboard)/events/page.tsx
app/(dashboard)/attendance/page.tsx
app/(dashboard)/encode/page.tsx
app/(dashboard)/enthronements/page.tsx
app/(dashboard)/finance/page.tsx
app/(dashboard)/announcements/page.tsx
app/(dashboard)/reports/page.tsx
app/(dashboard)/my-qr/page.tsx
app/(dashboard)/my-attendance/page.tsx
app/(dashboard)/admin/users/page.tsx
app/(dashboard)/admin/chapters/page.tsx
app/(dashboard)/admin/areas/page.tsx
app/(dashboard)/admin/ministries/page.tsx
app/(dashboard)/admin/ministry-types/page.tsx
app/(dashboard)/admin/event-types/page.tsx
app/(dashboard)/admin/roles/page.tsx

### 5h. Dev Role Switcher

components/dev/role-switcher.tsx

Floating pill button, bottom-right corner
Dropdown lists all 10 roles
Switching role updates UserContext → sidebar re-renders with filtered nav
Only renders when process.env.NODE_ENV === 'development'
Remove before production

Build Order

Follow this exact order so imports resolve correctly:

config/sidebar-navigation.ts
lib/context/user-context.tsx
components/layout/sidebar.tsx
components/layout/dashboard-header.tsx
app/(dashboard)/layout.tsx
app/(dashboard)/page.tsx
All placeholder pages (batch)
components/dev/role-switcher.tsx

Design Rules

Typography: follow CLAUDE.md responsive scale
Min font size: text-sm — never smaller for readable content
shadcn only: Card, Badge, Button, Avatar, Separator, Tooltip, ScrollArea, Sheet
All nav items: icon + label always visible in expanded state
No info by color alone — always pair with text label on badges
Mobile-first layout

## Phase 6: Auth-Aware Header + Member Layout

Goal: Public header becomes auth-aware. Members stay on public layout.
Dashboard stays separate — no public header/footer inside it.

### 6a. Login Redirect Split

After login, check role:

member → redirect to / (public layout)
all other roles → redirect to /dashboard

Update app/(auth)/login/actions.ts redirect logic

### 6b. Auth-Aware Public Header

When session exists, replace "Sign In" button with avatar dropdown
Avatar shows user initials (or photo if available) and their email account
Dropdown items:

My QR Code → /my-qr
My Attendance → /my-attendance
My Profile → /profile
─────────────
Sign Out

Use shadcn DropdownMenu
Dropdown only visible when session exists
"Sign In" only visible when no session

### 6c. Member Pages (under public layout)

Move /my-qr and /my-attendance from app/(dashboard)/ to app/(public)/
app/(public)/my-qr/page.tsx — shows member's QR code (mock for now)
app/(public)/my-attendance/page.tsx — shows own attendance history (mock)
Both pages protected — redirect to /login if no session
Both use public header + footer (not dashboard layout)

### 6d. Remove Member from Dashboard

Remove member role from config/sidebar-navigation.ts entirely
Remove my-qr and my-attendance placeholder pages from app/(dashboard)/
Dashboard middleware: if role is member, redirect to /

### 6e. Confirm Layout Separation

Public layout (app/(public)/layout.tsx) — has public header + footer
Dashboard layout (app/(dashboard)/layout.tsx) — has sidebar + dashboard header only
No public header/footer inside dashboard ever
No sidebar inside public pages ever
