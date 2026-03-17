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

---

## Phase 13: Ministries — Display + Ministry Head Assignment

> Goal: Display all ministries per chapter in a table.
> Assign, change, and remove Ministry Heads.
> No create/delete UI — ministries are auto-created via DB triggers.
> Access is chapter-scoped per permission matrix.


- [ ] `lib/data/ministries.ts`

  `getMinistries(params: TableParams & { chapterId?: number })`
  - where: `{ deleted_at: null }`
  - Filter by `chapterId` when provided
  - Include:
    ```ts
    ministry_type: { select: { name: true, key: true } }
    chapter: { select: { id: true, name: true } }
    _count: { select: { ministry_members: true } }
    user_roles: {
      where: {
        role: { key: 'ministry_head' },
        is_active: true
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            photo_url: true,
          }
        }
      },
      take: 1
    }
    ```
  - Default sort: ministry_type name asc
  - SD + Elder: all ministries (no chapter filter required)
  - HS + AHS: scoped to own chapter only

  `getChapterActiveUsers(chapterId: number)`
  - Used to populate user select in Assign Head sheet
  - Filter:
    ```ts
    where: {
      status: 'active',
      deleted_at: null,
      user_chapters: {
        some: { chapter_id: chapterId, is_primary: true }
      }
    }
    select: { id, first_name, last_name, photo_url }
    orderBy: [{ last_name: 'asc' }, { first_name: 'asc' }]
    ```

  `getChaptersForFilter()`
  - Returns all active non-deleted chapters
  - Used for chapter filter dropdown
  - select: { id, name }
  - orderBy: name asc

### 13a. Ministries Page

- [ ] `app/(dashboard)/admin/ministries/page.tsx`

  **Page header:**
  - Title: "Ministries"
  - Description: "Manage ministry heads per chapter"
  - No Add button — ministries are auto-created

  **Chapter filter (above table):**
  - Select: "All Chapters" | each chapter name
  - SD + Elder: show all chapters option + individual chapters
  - HS + AHS: no filter shown — locked to own chapter
  - Filter updates URL param `?chapterId=`
  - Server re-fetches on param change

  **Table columns:**
  Ministry | Chapter | Head | Members | Actions

  **Ministry column:**
  - Ministry type name (e.g. "Music Ministry")

  **Chapter column:**
  - Chapter name (hidden when filtered by single chapter)

  **Head column:**
  - Assigned: avatar initials circle + full name
  - Unassigned: "Unassigned" muted text

  **Members column:**
  - Count from `_count.ministry_members`

  **Actions ellipsis (RowActionMenu):**
  - "Assign Head" — when no head assigned
  - "Change Head" — when head already assigned
  - "Remove Head" — when head assigned, destructive

  No Edit, no Delete in actions — ministries are permanent

### 13b. Assign / Change Head Sheet

- [ ] `components/admin/admin-sheet.tsx`

  Props:

  ```ts
  type AssignHeadSheetProps = {
    open: boolean;
    onClose: () => void;
    mode: "assign" | "change";
    ministry: {
      id: number;
      name: string;
      chapterId: number;
      chapterName: string;
      currentHead?: { id: number; fullName: string };
    };
  };
  ```

  Sheet content:
  - Title: "Assign Ministry Head" or "Change Ministry Head"
  - Read-only context: ministry name + chapter name
  - If mode = 'change': show current head name with note
    "Current head: [Name] — will be replaced on save"
  - User select:
    - Fetches `getChapterActiveUsers(chapterId)` on mount
    - Shows: avatar initials + full name per option
    - Sorted alphabetically: last name then first name
    - Searchable — type to filter
    - Only active users from that chapter
  - Save + Cancel buttons

### 13d. Remove Head Confirm

- [ ] Uses existing `DeleteConfirmDialog` component
  - Title: "Remove Ministry Head"
  - Description: "[Name] will be removed as head of [Ministry] — [Chapter]"
  - On confirm: calls `removeMinistryHead` action

### 13e. Server Actions

- [ ] `app/(dashboard)/admin/ministries/actions.ts`

  `assignMinistryHead(ministryId, userId)`
  - `requireRole(['spiritual_director', 'elder', 'head_servant'])`
  - Get ministryHeadRoleId from roles table
  - Deactivate existing ministry_head role for this ministry:
    ```ts
    prisma.userRole.updateMany({
      where: {
        ministry_id: ministryId,
        role: { key: "ministry_head" },
        is_active: true,
      },
      data: { is_active: false },
    });
    ```
  - Create new user_role:
    ```ts
    prisma.userRole.create({
      data: {
        user_id: userId,
        role_id: ministryHeadRoleId,
        chapter_id: ministry.chapter_id,
        ministry_id: ministryId,
        assigned_by: currentUser.user.id,
        is_active: true,
      },
    });
    ```
  - `revalidatePath('/dashboard/admin/ministries')`
  - Return `{ success: true }` or `{ success: false, error }`

  `removeMinistryHead(ministryId)`
  - `requireRole(['spiritual_director', 'elder', 'head_servant'])`
  - Set `is_active = false` on current ministry_head user_role:
    ```ts
    prisma.userRole.updateMany({
      where: {
        ministry_id: ministryId,
        role: { key: "ministry_head" },
        is_active: true,
      },
      data: { is_active: false },
    });
    ```
  - `revalidatePath('/dashboard/admin/ministries')`
  - Return `{ success: true }` or `{ success: false, error }`

---

## Access Rules

| Role               | Can view         | Can assign/change/remove head |
| ------------------ | ---------------- | ----------------------------- |
| Spiritual Director | All chapters     | All chapters                  |
| Elder              | All chapters     | All chapters                  |
| Head Servant       | Own chapter only | Own chapter only              |
| Asst. Head Servant | Own chapter only | No                            |
| Others             | No access        | No                            |

## Decisions Recorded

- Ministries auto-created via DB triggers — no manual create
- Ministry Head must be status = 'active' user from same chapter
- User select sorted alphabetically: last name then first name
- Only one active Ministry Head per ministry at a time
- Changing head deactivates old role, inserts new — history preserved
- Removing head sets is_active = false — not deleted from user_roles
- Chapter column hidden in table when filtered to single chapter
