# FDM — Developer Checklist

> Use this file to verify each phase before marking it complete.
> Once all boxes checked, move the phase to completed.md.

---

## How to use this file

1. When Claude finishes a phase, copy that phase's checklist here
2. Manually test each item and tick the box
3. Only after ALL boxes are ticked → move phase to completed.md

---

## Currently Verifying: Phase 2 — Public Header

### 2. Public Header

- [x] `config/navigation.ts` exists and exports `navLinks` array
- [x] Adding a new item to `navLinks` appears in header automatically (no other file change needed)
- [x] Header shows ✛ FDM wordmark on the left
- [x] Nav links are centered and visible on desktop
- [x] Sign In button is on the right and links to `/login`
- [x] Active page link is highlighted (underline or color change)
- [x] On mobile (375px): nav links are hidden, hamburger is visible
- [x] Hamburger opens a drawer with all nav links
- [x] Header is sticky — stays at top on scroll
- [x] All tap targets are at least 44px tall

---

## Currently Verifying: Phase 5 — Admin Panel UI (Mock Data Only)

### 5a. Sidebar Config

- [x] `config/sidebar-navigation.ts` exists
- [x] Adding a new item to the config appears in sidebar automatically
- [x] All 20 nav items are present across all groups
- [x] Each item has: label, href, icon, roles array
- [x] ADMIN group only has items with roles: sd, elder (or hs/ahs for some)
- [x] MY ACCOUNT group only appears for member role

### 5b. User Context

- [x] `useUser()` returns mock user with role, name, chapter, initials
- [x] Default role is `spiritual_director`
- [x] No TypeScript errors from useUser()

### 5c. Sidebar — Role Filtering

- [x] Spiritual Director sees ALL groups and items (20 items)
- [x] Elder sees ALL groups and items
- [x] Head Servant: no Encode, no Finance entry, no Admin Type pages, no Roles
- [x] Asst. Head Servant: has Guest Encode, no Finance, no Admin Type pages
- [x] Builder: Clusters + Enthronements only (+ Dashboard)
- [x] Cluster Head: Clusters (view) + Enthronements (view) only
- [x] Finance: Finance only (+ Dashboard)
- [x] Ministry Coordinator: Ministries only (+ Dashboard)
- [x] Ministry Head: Ministries only (+ Dashboard)
- [x] Member: My QR Code + My Attendance only (+ Dashboard)

### 5d. Sidebar — Visual

- [x] Active item: white background + black text
- [x] Inactive items: muted text, gray on hover
- [x] Group labels visible and styled correctly
- [x] Sidebar footer: avatar initials + name + role badge + Sign Out
- [x] Expanded state: 240px, icon + label visible
- [x] Collapsed state: 64px, icon only
- [x] Tooltip shows label on hover in collapsed state
- [x] Collapse toggle button at bottom works
- [x] Mobile: sidebar hidden by default
- [x] Mobile: sidebar opens as drawer overlay

### 5e. Dashboard Header

- [x] Notification bell renders on right
- [x] Mobile: hamburger visible, opens sidebar

### 5f. Layout

- [x] Sidebar + header + content render together correctly
- [x] Content area scrolls independently
- [x] Sidebar stays fixed on scroll

### 5g. Dashboard Home

- [x] 4 stat cards render with correct mock numbers
- [x] ₱ symbol used for all finance figures
- [x] 4 quick action cards link to correct routes
- [x] Recent Attendance shows 3 events
- [x] Finance Snapshot shows income / expenses / net
- [x] Guest Follow-up shows 4 guests with status badges
- [x] Upcoming Events shows 3 events with type badges
- [x] Responsive: 1 col mobile → 2 col tablet → 4 col desktop
- [x] Text minimum text-sm — nothing smaller

### 5h. Placeholder Pages

- [x] All 20 placeholder pages load without 404
- [x] Each shows a page title and "Coming soon" card
- [x] No console errors on any page

### 5i. Role Switcher

- [x] Floating button visible in dev mode (bottom-right)
- [x] Switching role updates sidebar nav immediately
- [x] NOT visible when NODE_ENV is production

### Final

- [x] `npx tsc --noEmit` — zero errors
- [x] No console errors on any page
- [x] All sidebar links navigate without 404
- [x] Tested at 375px mobile width
- [x] Sidebar collapse/expand tested
- [x] All 10 roles tested via role switcher

## Currently Verifying: Phase 6 — Auth-Aware Header + Member Layout

### 6a. Login Redirect

- [x] Member role after login lands on `/` (public page)
- [x] All other roles after login land on `/dashboard`

### 6b. Auth-Aware Header

- [x] Logged out: "Sign In" button visible
- [x] Logged in: avatar shows (initials or photo), no Sign In button
- [x] Avatar click opens dropdown
- [x] Dropdown shows: My QR Code, My Attendance, My Profile, Sign Out
- [x] Sign Out ends session and redirects to `/`

### 6c. Member Pages

- [x] `/my-qr` loads under public layout (header + footer visible)
- [x] `/my-attendance` loads under public layout
- [x] Both redirect to `/login` when no session
- [x] No sidebar visible on either page

### 6d. Dashboard Cleanup

- [x] `member` role removed from sidebar-navigation.ts
- [x] `/dashboard/my-qr` and `/dashboard/my-attendance` removed
- [x] Member visiting `/dashboard` is redirected to `/`

### 6e. Layout Separation

- [x] Dashboard pages: no public header or footer
- [x] Public pages: no sidebar
- [x] No layout bleed between the two

### Final

- [x] `npx tsc --noEmit` — zero errors
- [x] No console errors on any page
- [x] Tested logged out, member login, and admin login flows

### 7a + 7b. Logic Files

- [x] `lib/auth.ts` exists with: getSession, getUser, requireAuth, requireRole, signOut
- [x] `lib/roles.ts` exists with: getUserRole, getUserWithRole, hasRole, isAdminRole
- [x] No role fetching logic exists inside any component or page — only in lib/
- [x] `getUserWithRole()` uses React `cache()` — no duplicate DB calls per request

### 7c. Middleware

- [x] `/dashboard/*` redirects to `/login` when no session
- [x] `/my-qr`, `/my-attendance`, `/profile` redirect to `/login` when no session
- [x] Public routes load without auth: `/`, `/about`, `/chapters`, `/login`
- [x] Middleware does NOT check role — only session existence

### 7d. Login Action

- [x] Wrong credentials shows error message, no crash
- [x] Member login redirects to `/`
- [x] All other roles redirect to `/dashboard`
- [x] Role resolved from DB after login — not from JWT claims alone

### 7e. Logout

- [x] Clicking Sign Out shows loading state on button
- [x] After Sign Out: full hard page reload occurs (`window.location.href`)
- [x] After reload: user is on `/`, avatar dropdown replaced by Sign In button
- [x] No stale user data visible anywhere after logout
- [x] Opening `/dashboard` after logout redirects to `/login`
- [x] Browser back button after logout does not show dashboard

### 7f. Protected Pages

- [x] `/dashboard` without session → redirects to `/login`
- [x] `/dashboard/admin/roles` as Head Servant → redirects (forbidden)
- [x] `/dashboard/admin/roles` as Spiritual Director → loads correctly
- [x] `/dashboard/finance` as Builder → redirects (forbidden)
- [x] `/my-qr` without session → redirects to `/login`

### 7g. UserContext

- [x] Context receives user + role from server layout — no client fetching
- [x] Dashboard layout fetches user + role once server-side
- [x] Failing to resolve user in layout redirects to `/login`
- [x] No Supabase client calls inside UserContext itself

### 7h. Dev Role Switcher

- [x] Role switcher only changes UI display
- [x] Switching role in dev does NOT bypass requireRole() server checks
- [x] Comment in code clearly marks it as DEV ONLY

### Final

- [x] `npx tsc --noEmit` — zero errors
- [x] No console errors
- [x] Test all 3 flows: logged out, member, admin
- [x] Test forbidden page access for 3 different roles
- [x] Hard reload after logout confirmed in browser network tab

### Phase 8 — Reusable Admin Table Component

### 8a. PageHeader

- [x] Title renders correctly
- [x] Description renders below title in muted text
- [x] Action button appears on the right when provided
- [x] Action button has + icon prefix and bg-primary style
- [x] Stacks vertically on mobile

### 8b. TableControls

- [x] "Show X entries" select renders on the left
- [x] Select options: 10, 20, 30, 50, All
- [x] Changing select updates displayed rows correctly
- [x] Search input renders on the right with search icon
- [x] Typing in search filters table rows in real time
- [x] Clearing search restores all rows
- [x] Both controls on same row, space-between layout

### 8c. DataTable

- [x] Columns render with correct labels
- [x] Rows render with correct data
- [x] Header row has muted background
- [x] Rows have hover highlight
- [x] Empty state message shows when data is empty
- [x] Table scrolls horizontally on small screens
- [x] Border and rounded corners applied correctly

### 8d. TableFooter

- [x] "Showing X to Y of Z entries" text is correct
- [x] Previous button disabled on page 1
- [x] Next button disabled on last page
- [x] Clicking Previous goes to previous page
- [x] Clicking Next goes to next page
- [x] Entry count text updates correctly per page

### 8e. RowActions

- [x] Edit button shows Pencil icon
- [x] Delete button shows Trash icon
- [x] Edit hover: text-primary color
- [x] Delete hover: text-destructive color
- [x] Tooltip shows on hover for each button
- [x] Both buttons are at least 44px tap target

### 8f. AdminPage (composed)

- [x] All sub-components render together correctly
- [x] Search resets to page 1 when value changes
- [x] Per-page change resets to page 1
- [x] Pagination calculates correctly from filtered results
- [x] All props pass through to correct sub-components

### 8g. Demo — Roles Page

- [x] Roles page loads with mock data
- [x] 5 mock role rows visible
- [x] Search filters roles correctly
- [x] Per-page selector works
- [x] Pagination shows correct counts
- [x] No TypeScript errors from component usage

Barrel Export

- [x] components/admin/index.ts exports all 6 components
- [x] Importing from @/components/admin works correctly

Final

- [x] npx tsc --noEmit — zero errors
- [x] No console errors
- [x] Tested on mobile (375px) — horizontal scroll on table works
- [x] All components work independently (not just inside AdminPage)

---

### 9a. Data Fetcher Files

- [x] `lib/data/roles.ts` exists and exports `getRoles()`
- [x] `lib/data/ministry-types.ts` exists and exports `getMinistryTypes()`
- [x] `lib/data/event-types.ts` exists and exports `getEventTypes()`
- [x] No Prisma calls inside any page or component directly

### 9b. Roles Page

- [x] `/dashboard/admin/roles` loads without error
- [x] Real data from DB is displayed (11 roles)
- [x] Columns show: Key (badge) | Name | Scope
- [x] No add button visible
- [x] No actions column visible
- [x] Search filters roles correctly
- [x] Per-page selector works

### 9c. Ministry Types Page

- [x] `/dashboard/admin/ministry-types` loads without error
- [x] Real data from DB is displayed (6 types)
- [x] Columns show: Name | Description
- [x] No add button visible
- [x] No actions column visible
- [x] Search filters correctly
- [x] Per-page selector works

### 9d. Event Types Page

- [x] `/dashboard/admin/event-types` loads without error
- [x] Real data from DB is displayed (5 types)
- [x] Columns show: Name | Description
- [x] No add button visible
- [x] No actions column visible
- [x] Search filters correctly
- [x] Per-page selector works

### Final

- [x] `npx tsc --noEmit` — zero errors
- [x] No console errors on any of the 3 pages
- [x] All 3 pages tested while logged in as Spiritual Director
