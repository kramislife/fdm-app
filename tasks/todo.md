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

- `design/about.pen` — Full About page designed (9 sections)

### Config & Data

- `config/about.ts` — chapters, pillars, communityStats, heroStats

### Implementation

- `app/(public)/about/page.tsx` — Hero, Mission, Pillars, Chapters, Gallery, Stats, Our Story, CTA, Footer
- Verify all 6 chapter images load (qc, bataan, cavite, pasau, pasig, tala)
- `npx tsc --noEmit` — zero errors

---

## Phase 4: Public Pages — Chapters

> Goal: Comprehensive list of all FDM chapters with locations and schedules.

- `app/(public)/chapters/page.tsx` — Grid layout of all 6 chapters
- Integration with `config/about.ts` (or move to `config/chapters.ts`)
- Responsive design & visual consistency with About page
- `npx tsc --noEmit` — zero errors

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

### Phase 7: Secure Authentication, Role Handling & Logout

Goal: Server-enforced roles, secure session handling, clean logout with full page refresh.
All business logic lives in lib/ files — pages and components are thin.

#### 7a. Auth Logic File

lib/auth.ts — all auth business logic lives here, imported by server actions

getSession() — returns Supabase session or null
getUser() — returns full user row from public.users joined with role
requireAuth() — throws redirect to /login if no session
requireRole(roles: string[]) — throws redirect if user role not in allowed list
signOut() — calls supabase.auth.signOut(), clears cookies, returns void
All functions are server-side only — never called from client components

#### 7b. Role Resolution (Server-Side Only)

lib/roles.ts — role resolution logic

getUserRole(userId: string) — queries user_roles table, returns role key
getUserWithRole(authId: string) — returns { user, role, chapter } in one query
hasRole(userRole: string, allowed: string[]) — pure boolean check
isAdminRole(role: string) — returns true if role is not member
Role is ALWAYS resolved from DB — never from cookie, localStorage, or client context
Cache result per request using React cache() to avoid duplicate DB calls

#### 7c. Middleware — Route Protection

Update middleware.ts

Protect all /dashboard/\* routes — redirect to /login if no session
Protect all /my-qr, /my-attendance, /profile — redirect to /login if no session
Allow public routes: /, /about, /chapters, /contact, /login, /auth/callback
Do NOT check role in middleware — only check session exists
Role checks happen inside each page/action, not middleware
Uses lib/supabase/proxy.ts for session refresh

### 7d. Server Actions — Auth

app/(auth)/login/actions.ts — refactor to use lib/auth.ts

Call supabase.auth.signInWithPassword()
On success: fetch role via getUserRole() from lib/roles.ts
Redirect: member → /, all others → /dashboard
On error: return typed error object — never throw to client

app/(auth)/logout/actions.ts — dedicated logout server action

Call lib/auth.signOut()
Call revalidatePath('/', 'layout') — clears all cached data
Return { success: true } — client handles full page reload

#### 7e. Logout — Full Page Refresh

Logout flow:

Client calls logout server action
Server: supabase.auth.signOut() + revalidatePath('/', 'layout')
Server returns success
Client receives response → calls window.location.href = '/'
Full hard reload — clears all React state, context, cached data

Update components/shared/user-dropdown.tsx

Sign Out calls the server action then does window.location.href = '/'
Show loading state on Sign Out button while action is pending
Use useTransition() for pending state

### 7f. Protected Page Pattern

lib/auth.ts exports requireAuth() and requireRole()
Every dashboard page calls requireAuth() at the top (server component)
Admin-only pages call requireRole(['spiritual_director', 'elder']) at the top
Pattern to use in every protected page:

ts // app/(dashboard)/admin/roles/page.tsx
import { requireRole } from '@/lib/auth'

export default async function RolesPage() {
await requireRole(['spiritual_director', 'elder'])
// render page
}

### 7g. UserContext — Server-Fed, Not Self-Fetching

Update lib/context/user-context.tsx

Remove any client-side Supabase fetching from context
Context receives user + role as props from server layout
Layout fetches once server-side, passes down to context provider
Client components read from context — never fetch role themselves

Update app/(dashboard)/layout.tsx

Fetch user + role server-side using getUserWithRole() from lib/roles.ts
Pass to <UserProvider user={user} role={role} />
If fetch fails → redirect to /login

### 7h. Remove Dev Role Switcher from Context

Dev role switcher only overrides the UI display — it never changes
the actual session or DB role
Add a clear comment: "DEV ONLY — does not affect server-side role checks"
Ensure switching role in dev switcher does NOT bypass requireRole() checks

### Security Rules (add to CLAUDE.md after this phase)

Role is always resolved from DB — never from client, cookie, or context alone
requireAuth() and requireRole() called at the top of every protected page
Business logic lives in lib/ — pages are thin wrappers only
Logout always does a full hard reload via window.location.href
Middleware only checks session — role checks are inside pages and actions
Never expose role or user data in client-readable cookies

### Phase 8: Reusable Admin Table Component

Goal: One reusable page layout component used across ALL admin list pages.

### 8a. Page Header Component

components/admin/page-header.tsx

title, description, optional action button (+ icon, bg-primary)
Stacks on mobile

### 8b. Table Controls Component

components/admin/table-controls.tsx

Left: "Show [select] entries" — options: 10, 20, 30, 50, All
Right: search input with Search icon
shadcn Select + Input

### 8c. Data Table Component

components/admin/data-table.tsx

Columns: { key, label, width?, align? }
All headers and data centered
Loader component (not skeleton) for loading state
"No data found" text for empty state
Horizontal scroll on mobile

### 8d. Table Footer Component

components/admin/table-footer.tsx

Left: "Showing X to Y of Z entries"
Right: icon-only Previous + Next buttons (no text)
Previous disabled on page 1, Next disabled on last page

### 8e. Admin Page Layout Wrapper

components/admin/admin-page.tsx

Composes: PageHeader + TableControls + DataTable + TableFooter
Internal state: perPage, currentPage, searchValue
Search and perPage change resets to page 1
Client-side filtering + pagination

### 8f. Barrel Export

components/admin/index.ts — exports all components

### 8g. Demo Page

app/(dashboard)/admin/roles/page.tsx — mock data verified

Search, per-page, pagination all working
No row-actions — actions via modal (wired in Phase 9)

## Phase 9: Reference Data — Display Only

> Goal: Wire Roles, Ministry Types, Event Types to real Prisma data.
> Display only — no CRUD yet. Just fetch from DB and show in AdminPage table.

### 9a. Data Fetcher Files

- `lib/data/roles.ts` — `getRoles()` — fetch all, ordered by scope
- `lib/data/ministry-types.ts` — `getMinistryTypes()` — fetch all active
- `lib/data/event-types.ts` — `getEventTypes()` — fetch all active
- All use `prisma` from `lib/prisma.ts`
- All server-side only — no Prisma calls in pages or components directly

### 9b. Roles Page

- `app/(dashboard)/admin/roles/page.tsx`
  - `requireRole(['spiritual_director', 'elder'])`
  - Fetch via `getRoles()`
  - Columns: Key (badge) | Name | Scope
  - No add button, no actions column — view only

### 9c. Ministry Types Page

- `app/(dashboard)/admin/ministry-types/page.tsx`
  - `requireRole(['spiritual_director', 'elder'])`
  - Fetch via `getMinistryTypes()`
  - Columns: Key (badge) | Name | Description
  - No add button, no actions column — view only

### 9d. Event Types Page

- `app/(dashboard)/admin/event-types/page.tsx`
  - `requireRole(['spiritual_director', 'elder'])`
  - Fetch via `getEventTypes()`
  - Columns: Key (badge) | Name | Description
  - No add button, no actions column — view only

---

## Phase 10: Google OAuth

> Goal: Members can sign in with Google as an alternative to email + password.
> Admin-provisioned accounts still go to /first-login.
> Gmail sign-ins bypass first-login entirely.
> Duplicate email accounts are blocked with a friendly message.
>
> MANUAL SETUP REQUIRED BEFORE STARTING:
> ✅ Google Cloud Console — OAuth credentials created
> ✅ Supabase — Google provider enabled with Client ID + Secret
> (Do these manually first — see setup guide given separately)

### 10a. Schema Update

- Make `contact_number` nullable in `schema.prisma`
- Remove `@unique` constraint — add `@@index([contact_number])`
- Partial unique index via Supabase migration (WHERE contact_number IS NOT NULL)
- `npx prisma generate` + `npx prisma db push`

### 10b. Login Page — Google Button

- `components/auth/google-sign-in-button.tsx` — "use client" button only
- "or" divider between email form and Google button
- White button with official Google G SVG icon + "Continue with Google"
- Calls `supabase.auth.signInWithOAuth({ provider: 'google', ... })`

### 10c. Auth Callback — Full Flow

- `app/auth/callback/route.ts` — all 3 OAuth cases handled
- Case 1: provisioned → sign out + redirect to `/login?error=provisioned&date=`
- Case 2: existing user → link auth_id + backfill + role-based redirect
- Case 3: new Gmail → create user, upload avatar, assign member role, backfill

### 10d. Attendance Backfill Utility

- `lib/auth.ts` — `backfillAttendance(email, userId)` implemented

### 10e. Photo Update Logic

- `lib/cloudinary.ts` — `uploadUserPhoto()` + `replaceUserPhoto()` implemented

### 10f. Error Message on Login Page

- `app/(auth)/login/page.tsx` — server component reads `searchParams`
- `app/(auth)/login/login-form.tsx` — shows amber Alert for provisioned error
- Date formatted as "Mar 14, 2026"

---

## Decisions Recorded

- `contact_number` nullable — user completes via profile page
- Partial unique index on `contact_number` (unique only when not null)
- Gmail users get `member` role automatically on first sign-up
- Google avatar uploaded to Cloudinary — stored as `photo_url`
- Photo update always deletes old Cloudinary asset first
- One photo source of truth — Gmail and FDM use same stored URL
- Admin-provisioned email block shows `users.created_at` date

### Phase 11: Admin CRUD — Roles, Ministry Types, Event Types ✅

Goal: Full CRUD on the 3 simplest reference tables using reusable components.
Key field never shown in table — used internally only.
All editable via Sheet slide-over. All actions via ellipsis dropdown per row.

### 11a. Reusable Action Column Component

components/admin/row-action-menu.tsx

Props:

ts type RowActionMenuProps = {
onEdit: () => void
onDelete: () => void
editLabel?: string // default: "Edit"
deleteLabel?: string // default: "Delete"
disabled?: boolean
}

Trigger: ellipsis icon button (MoreHorizontal from lucide-react)
Opens shadcn DropdownMenu with:

Edit item — editLabel
Separator
Delete item — deleteLabel, text-destructive color

### 11b. Reusable Admin Sheet Component

components/admin/admin-sheet.tsx

Props:

ts type AdminSheetProps = {
open: boolean
onClose: () => void
title: string // "Add Ministry Type" | "Edit Ministry Type"
description?: string
children: ReactNode // form fields — different per table
onSubmit: () => void
isSubmitting?: boolean
submitLabel?: string // default: "Save"
}

Uses shadcn Sheet, side="right"
Header: title + description
Body: scrollable, renders children (the form)
Footer: Cancel button (outline) + Submit button (bg-primary)
Submit shows loader when isSubmitting
Cancel closes sheet without saving
Closes automatically on successful submit (parent controls open)
Full screen on mobile (default Sheet behavior)

11c. Reusable Delete Confirm Dialog

components/admin/delete-confirm-dialog.tsx

Props:

ts type DeleteConfirmDialogProps = {
open: boolean
onClose: () => void
onConfirm: () => void
isDeleting?: boolean
title?: string // default: "Delete this item?"
description?: string // default: "This action cannot be undone."
}

Uses shadcn AlertDialog
Cancel + Delete (destructive) buttons
Delete button shows loader when isDeleting
Used by all admin pages — same dialog everywhere

### 11d. Key Auto-slug Utility

lib/utils/slugify.ts — toKey(name: string): string

Converts name to snake_case key
"Sacred Heart Ministry" → "sacred_heart_ministry"
Lowercase, spaces to underscores, strip special chars
Used in create server actions for ministry types + event types

### 11e. Roles Page — Edit Only (no add/delete)

app/(dashboard)/admin/roles/page.tsx

Add button: none — roles are fixed, no adding
Actions column: ellipsis → Edit only (no delete option)
Edit → AdminSheet opens with:

Editable: Name (Input), Description (Textarea)

Server action: updateRole(id, { name, description })

revalidatePath('/dashboard/admin/roles')

app/(dashboard)/admin/roles/actions.ts

updateRole(id: number, data: { name: string; description?: string })

### 11f. Ministry Types Page — Full CRUD

app/(dashboard)/admin/ministry-types/page.tsx

Add button top-right: "+ Add Ministry Type"
→ AdminSheet opens (empty form, title "Add Ministry Type")
Actions column: ellipsis → Edit | Delete
Edit → AdminSheet opens (pre-filled, title "Edit Ministry Type")
Delete → DeleteConfirmDialog opens
Form fields in Sheet:

Name (Input, required)
Description (Textarea, optional)
Status toggle (Switch — Active/Inactive)

On create: key auto-generated via toKey(name)
Soft delete: sets deleted_at — record hidden from table but preserved

app/(dashboard)/admin/ministry-types/actions.ts

createMinistryType(data: { name: string; description?: string; is_active: boolean })

Auto-generates key via toKey(name)
revalidatePath('/dashboard/admin/ministry-types')

updateMinistryType(id: number, data: { name: string; description?: string; is_active: boolean })

Key is never updated — immutable after creation
revalidatePath('/dashboard/admin/ministry-types')

deleteMinistryType(id: number)

Sets deleted_at = new Date()
revalidatePath('/dashboard/admin/ministry-types')

### 11g. Event Types Page — Full CRUD

app/(dashboard)/admin/event-types/page.tsx

Same pattern as Ministry Types
Add button: "+ Add Event Type"
Form fields: Name, Description, Status toggle, Key preview
Actions: Edit | Delete via ellipsis

app/(dashboard)/admin/event-types/actions.ts

createEventType(data)
updateEventType(id, data)
deleteEventType(id) — soft delete

### 11h. Update Fetchers — Exclude Soft Deleted

lib/data/ministry-types.ts — add deleted_at: null to where clause
lib/data/event-types.ts — add deleted_at: null to where clause
lib/data/roles.ts — no change (roles have no deleted_at)

Shared Decisions

Key field never shown in table — internal use only
Key is auto-generated on create, never editable after
Roles: edit name + description only, no add/delete
Ministry Types + Event Types: full CRUD
Delete is soft delete — sets deleted_at, never hard deletes
Add button is top-right of page, aligned with page header
Actions column is always the last column, ellipsis trigger
Sheet is right-side slide-over, full screen on mobile
Form is same component for add and edit — title changes only

Build Order

lib/utils/slugify.ts
components/admin/row-action-menu.tsx
components/admin/admin-sheet.tsx
components/admin/delete-confirm-dialog.tsx
app/(dashboard)/admin/roles/actions.ts + page update
app/(dashboard)/admin/ministry-types/actions.ts + page update
app/(dashboard)/admin/event-types/actions.ts + page update
Update fetchers to exclude soft deleted records
