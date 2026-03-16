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

### Phase 12: Schema Update + Chapters CRUD

> Goal: Drop areas table, restructure chapters and clusters with
> Philippine address fields. Build full CRUD for Chapters only.
> Clusters CRUD comes after.

### 12a. Schema Changes (v10)

Areas table dropped. Chapters get structured PH address.
Clusters simplified — inherits geography from chapter.

Drop from schema:

Remove Area model entirely
Remove areas relation from Chapter
Remove area_id from Cluster
Remove Area relation from Cluster
Remove areas_created relation from User

Update Chapter model:

Remove location String — replaced by structured fields
Add:

prisma region String @db.VarChar(100)
province String @db.VarChar(100)
city String @db.VarChar(100)
barangay String @db.VarChar(100)
street String? @db.VarChar(255)
google_maps_url String? @db.VarChar(500)
landmark String? @db.VarChar(255)

Add indexes: @@index([region]), @@index([province]), @@index([city])

Update Cluster model:

Remove area_id Int
Remove Area relation
Remove @@index([area_id])
Add:

prisma street String? @db.VarChar(255)
google_maps_url String? @db.VarChar(500)
landmark String? @db.VarChar(255)

Keep @@unique([name, chapter_id]) and @@index([chapter_id])

add updated_by, deleted_at, deleted_by too fields in chapters and cluster

After schema changes:

Run SQL in Supabase to drop areas table and alter columns safely
npx prisma generate
npx prisma db push

### 12b. Install Address Package

npm install select-philippines-address
Test import works: import { regions, provinces, cities, barangays } from 'select-philippines-address'

### 12c. Chapter Address Form Component

components/admin/chapter-address-form.tsx — "use client"

Uses select-philippines-address for cascading selects
Fields in order:

Region — select, required
Province — select, required, populated after region selected
City/Municipality — select, required, populated after province selected
Barangay — select, required, populated after city selected
Street / Exact Address — text input, optional
Google Maps Link — URL input, optional
Landmark toggle — checkbox/switch

When toggled on: shows Landmark text input
When toggled off: hides input, clears value

### 12d. Chapters CRUD Page

lib/data/chapters.ts — update fetcher

Include structured address fields
Search across: name, region, province, city, barangay
Include \_count: { select: { clusters: true, user_chapters: true } }

app/(dashboard)/admin/chapters/page.tsx

Add button top-right: "+ Add Chapter"
Table columns: Name | City | Province | Region | Fellowship Day | Clusters | Members | Status | Actions
Actions ellipsis: View | Edit | Delete

app/(dashboard)/admin/chapters/actions.ts

createChapter(data) — full address fields + name + fellowship_day + is_active
updateChapter(id, data) — same fields
deleteChapter(id) — soft delete, sets deleted_at
All use revalidatePath('/dashboard/admin/chapters')

AdminSheet form for chapters:

Name (Input, required)
ChapterAddressForm component (cascading selects)
Fellowship Day (Select: Monday–Sunday)
Is Active (Switch)
Key auto-generated from name (not shown in table)

### 12f. Update Chapters Fetcher

lib/data/chapters.ts

Add deleted_at: null to where clause
Search includes region, province, city, barangay

Decisions Recorded

Areas table dropped entirely — too many layers for FDM's scale
Chapters use structured PH address via select-philippines-address
Clusters inherit geography from chapter — only need street, gmaps, landmark
Cluster CRUD comes in next phase after chapters is verified
deleted_at added to chapters for soft delete
