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
