# FDM — Master Task Plan

> Based on FDM Community Management System Requirements v3.0
> Work phase by phase. Complete and verify each phase before moving to the next.
> Run `npx tsc --noEmit` after every phase — zero errors required.
>
> WORKFLOW:
>
> 1. Build the phase tasks below
> 2. Copy that phase's checklist to checking.md for manual verification
> 3. Once ALL checks pass → move phase entry to completed.md

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
