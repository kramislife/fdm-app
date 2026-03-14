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
