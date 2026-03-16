# FDM — Developer Checklist

> Use this file to verify each phase before marking it complete.
> Once all boxes checked, move the phase to completed.md.

---

## How to use this file

1. When Claude finishes a phase, copy that phase's checklist here
2. Manually test each item and tick the box
3. Only after ALL boxes are ticked → move phase to completed.md

---

# FDM — Developer Checklist

> Currently Verifying: Phase 12 — Schema Update + Chapters CRUD

---

### 12a. Schema

- [x] `areas` table removed from schema
- [x] `area_id` removed from `Cluster`
- [x] `areas` relation removed from `Chapter` and `User`
- [x] `Chapter` has: region, province, city, barangay, street?, google_maps_url?, landmark?
- [x] `Chapter` has: updated_by?, deleted_at?, deleted_by?
- [x] `Cluster` has: street?, google_maps_url?, landmark?
- [x] `Cluster` has: updated_by?, deleted_at?, deleted_by?
- [x] Indexes added: region, province, city on chapters
- [x] `npx prisma generate` — no errors
- [x] `npx prisma db push` — no errors

### 12b. Address Package

- [x] `select-philippines-address` installed
- [x] Import works without TypeScript errors

### 12c. ChapterAddressForm

- [x] Region select loads all PH regions
- [x] Province populates after region selected
- [x] City populates after province selected
- [x] Barangay populates after city selected
- [x] Selecting a parent resets all child selects
- [x] Street input visible always (optional)
- [x] Google Maps input visible always (optional)
- [x] Landmark toggle hidden by default
- [x] Toggling landmark on shows input
- [x] Toggling landmark off hides and clears input
- [x] Works on mobile (375px)

### 12d. Chapters Page

- [x] "+ Add Chapter" button top-right aligned with page header
- [x] Table columns: Name | City | Street | Address Link | Schedule | Members | Status | Actions
- [x] Ellipsis actions: View | Edit | Delete
- [x] Add opens empty AdminSheet with address form
- [x] Cascading selects work correctly inside sheet
- [x] Created chapter appears in table
- [x] Edit pre-fills all address fields correctly
- [x] Fellowship Day select shows Monday–Sunday options
- [x] Is Active toggle works
- [x] View action shows chapter details (read-only)
- [x] Delete opens confirm dialog
- [x] Soft deleted chapter disappears from table
- [x] deleted_at, deleted_by set on soft delete
- [x] Search works across name, city, street, schedule

### 12f. Fetcher

- [x] Soft deleted chapters excluded from results (`deleted_at: null`)
- [x] Cluster and member counts show correctly
- [x] Search covers all relevant address fields

### Final

- [x] `npx tsc --noEmit` — zero errors
- [x] No console errors on chapters page
- [x] Add, edit, delete all tested end to end
- [x] Mobile tested at 375px — sheet is full screen
- [x] Cascading address selects tested on mobile
