# FDM — Master Task Plan

> Work phase by phase. Complete and verify before moving to the next.
> Run `npx tsc --noEmit` after every phase — zero errors required.

---

## Phases Overview

- Phase 1–12 ✅
- Phase 13: Ministry Heads Management
- Phase 14: Users CRUD ✅
- Phase 15: User Account State Management ✅
- Phase 16: Events CRUD ← CURRENT

---

## Phase 16: Events CRUD

> Goal: Admin and Head Servant can create, edit, and delete events.
> Two scopes: global (all chapters) and chapter (specific chapter).
> Meeting type unlocks invitees section.
> QR toggle controls whether attendance is tracked.
> Upcoming events on dashboard filtered by scope + invitees + role.

---

### 16a. Schema Changes

Update `events` table:

```prisma
model Event {
  id            Int      @id @default(autoincrement())
  name          String   @db.VarChar(255)
  event_type_id Int
  chapter_id    Int?     // null = global, set = chapter-scoped
  scope         String   @db.VarChar(10) @default("chapter")
  // global | chapter

  date          DateTime @db.Date
  time          DateTime @db.Time
  location      String?  @db.VarChar(255)  // venue/address

  qr_enabled    Boolean  @default(false)
  // true  = QR token generated, attendance tracked via scan
  // false = no QR, guest encoding only or notify only

  qr_token      String?  @db.VarChar(500)
  qr_expires_at DateTime?
  qr_interval   Int      @default(15)

  is_raffle_event Boolean @default(false)

  created_by    Int
  updated_by    Int?
  deleted_at    DateTime?
  deleted_by    Int?
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  // relations
  event_type    EventType @relation(...)
  chapter       Chapter?  @relation(...)
  creator       User      @relation(...)
  attendance    Attendance[]
  guest_logs    GuestLog[]
  invitees      EventInvitee[]
}
```

Add new `event_invitees` table:

```prisma
model EventInvitee {
  id          Int    @id @default(autoincrement())
  event_id    Int
  type        String @db.VarChar(20)
  // everyone | role | chapter | user

  role_id     Int?   // set when type = role
  chapter_id  Int?   // set when type = chapter
  user_id     Int?   // set when type = user

  event       Event    @relation(...)
  role        Role?    @relation(...)
  chapter     Chapter? @relation(...)
  user        User?    @relation(...)

  @@index([event_id])
  @@map("event_invitees")
}
```

Run SQL in Supabase:

```sql
ALTER TABLE events ADD COLUMN IF NOT EXISTS scope VARCHAR(10) DEFAULT 'chapter';
ALTER TABLE events ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE events ADD COLUMN IF NOT EXISTS qr_enabled BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_by INT REFERENCES users(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE events ADD COLUMN IF NOT EXISTS deleted_by INT REFERENCES users(id);
```

Then: `npx prisma generate` → `npx prisma db push`

---

### 16b. Data Fetchers

`lib/data/events.ts`

`getEvents(params: TableParams & { scope?: string, chapterId?: number })`

- where: `{ deleted_at: null }`
- Include: event_type, chapter, creator, invitees, \_count attendance
- Search: name, event_type name, location
- Sort: date desc by default
- SD + Elder: all events
- Head Servant: global + own chapter events only

`getUpcomingEvents(userId, chapterIds, roles)`

- Returns events for dashboard display
- Filters:
  1. Global events → always included for elevated roles
  2. Chapter events WHERE chapter_id in user's chapters
  3. Meeting events WHERE user is in invitees
- date >= today
- Limit 5, ordered by date asc
- Used on dashboard homepage

`getEventTypesForSelect()`

- All active non-deleted event types
- select: { id, key, name }
- orderBy: name asc

`getChaptersForSelect()` — already exists, reuse

`getActiveUsersForInvite(search, chapterId?)`

- For specific user search in invitees
- Filter: account_status = verified, is_qr_only = false
- Search: first_name, last_name, email
- chapterId filter optional (for chapter-scoped meetings)
- Limit 10 results
- Returns: { id, first_name, last_name, photo_url, chapter }

---

### 16c. Events Page

`app/(dashboard)/admin/events/page.tsx`

Page header:

- Title: "Event Management"
- Description: "Manage community events and gatherings"
- "+ Add Event" button top-right

Table columns:
Name | Type | Scope | Date | Time | Location | QR | Attendees | Actions

Scope column:

- Global → green badge "Global"
- Chapter → chapter name badge

QR column:

- ON → green dot
- OFF → gray dot

Actions ellipsis:

- View
- Edit
- Delete (soft delete)

---

### 16d. Create / Edit Event Sheet

Single AdminSheet, title changes per mode.

Form fields:

```
Event Name       Input, required

Event Type       Select from getEventTypesForSelect()
                 required

Scope            Radio or Select: Global | Chapter
                 Global:
                   chapter select hidden
                   chapter_id = null
                 Chapter:
                   chapter select shown, required
                   SD/Elder: can select any chapter
                   Head Servant: locked to own chapter

Date             Date picker, required

Time             Time picker, required

Location         Text area, optional
                 Venue name or address

QR Attendance    Toggle on/off
                 ON  → QR token auto-generated on save
                 OFF → no QR token

-- INVITEES SECTION --
Shown ONLY when event_type = meeting

Invite:
  [+ Add Invitee Group] button
  Each group is a tag:

  Type select:
    Everyone     → one tag: [Everyone ✕]
                   replaces all other tags if selected
    By Role      → role select appears → [Role Name ✕]
    By Chapter   → chapter select appears → [Chapter Name ✕]
    Specific User → search input → [User Name ✕]

  Multiple tags allowed (except Everyone replaces all)
  Each tag shown below the selects

  Examples:
    [All Elders ✕] [All Head Servants ✕]
    [QC Chapter ✕] [Rosa Villanueva ✕]
```

---

### 16e. Server Actions

`app/(dashboard)/admin/events/actions.ts`

`createEvent(data)`

- `requireRole(['director_adviser', 'elder', 'head_servant'])`
- Head Servant validation:
  - Cannot create global events
    error: "Head Servants can only create chapter events."
  - Cannot create events for other chapters
    error: "You can only create events for your own chapter."
- Validate: name, event_type, date, time required
- If qr_enabled = true:
  - Generate qr_token: crypto.randomUUID()
  - Set qr_expires_at if needed
- Create event row
- If meeting type + invitees provided:
  - Create event_invitees rows for each invitee group
- `revalidatePath('/dashboard/admin/events')`
- Return `{ success: true }` or `{ success: false, error }`

`updateEvent(id, data)`

- `requireRole(['director_adviser', 'elder', 'head_servant'])`
- Head Servant: can only update own chapter events
- If qr_enabled toggled ON and no qr_token:
  - Generate new qr_token
- If qr_enabled toggled OFF:
  - Clear qr_token, qr_expires_at
- Update event_invitees:
  - Delete existing invitees for this event
  - Re-create from new invitees data
- `revalidatePath('/dashboard/admin/events')`
- Return `{ success: true }` or `{ success: false, error }`

`deleteEvent(id)`

- `requireRole(['director_adviser', 'elder', 'head_servant'])`
- Head Servant: can only delete own chapter events
- Soft delete:
  ```ts
  data: {
    deleted_at: new Date(),
    deleted_by: currentUser.id
  }
  ```
- `revalidatePath('/dashboard/admin/events')`
- Return `{ success: true }` or `{ success: false, error }`

---

### 16g. Fellowship Day Suggestion

When event_type = fellowship AND scope = chapter:

- System reads fellowship_day from selected chapter
- Pre-fills date with next occurrence of that day
- Admin can override
- Example: QC fellowship_day = Friday
  → Date pre-fills with next Friday from today

Logic:

```ts
function getNextFellowshipDate(fellowshipDay: string): Date {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const targetDay = days.indexOf(fellowshipDay);
  const today = new Date();
  const diff = (targetDay - today.getDay() + 7) % 7 || 7;
  return new Date(today.setDate(today.getDate() + diff));
}
```

---

### 16h. Access Rules

| Role             | Can create | Scope allowed        | Can edit/delete  |
| ---------------- | ---------- | -------------------- | ---------------- |
| Director Adviser | ✅         | Global + any chapter | All events       |
| Elder            | ✅         | Global + any chapter | All events       |
| Head Servant     | ✅         | Own chapter only     | Own chapter only |
| Others           | ❌         | —                    | —                |

---

## Decisions Recorded

- One form for all event types — meeting type unlocks invitees
- scope: global (no chapter_id) or chapter (chapter_id set)
- QR toggle: on = attendance via scan, off = no QR
- Head Servant locked to own chapter, cannot create global
- Meeting invitees: Everyone, By Role, By Chapter, Specific User
- Everyone tag replaces all other invitee tags
- Fellowship date pre-filled from chapter's fellowship_day
- Soft delete on events (deleted_at)
- Upcoming events: global + own chapter + invited meetings

####

<!-- "use client";

import { useActionState } from "react";
import { AuthFormCard } from "@/components/auth/auth-form-card";
import { FormInput } from "@/components/shared/form-fields";
import { setPasswordAction, type SetPasswordState } from "./actions";

const initialState: SetPasswordState = { error: null };

const AUTH_LABEL_STYLE =
"text-xs font-bold tracking-wider uppercase text-muted-foreground";

export function SetPasswordForm() {
const [state, formAction, isPending] = useActionState(
setPasswordAction,
initialState,
);

return (
<AuthFormCard
title="Create your Password"
description="Welcome to the community. Please create a secure password to activate your account."
formAction={formAction}
isPending={isPending}
error={state.error}
errorId={state.errorId}
submitLabel="Save password"
pendingLabel="Saving password…"
footer={
<div className="space-y-2">
<p>
By saving this, you agree to our{" "}
<button className="underline hover:text-primary transition-colors cursor-pointer">
Community Guidelines
</button>
</p>
</div>
} >
<FormInput
        label="New Password"
        id="new_password"
        name="new_password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        placeholder="••••••••"
        className="h-12"
        labelClassName={AUTH_LABEL_STYLE}
      />
<FormInput
        label="Confirm Password"
        id="confirm_password"
        name="confirm_password"
        type="password"
        autoComplete="new-password"
        required
        placeholder="••••••••"
        className="h-12"
        labelClassName={AUTH_LABEL_STYLE}
      />
</AuthFormCard>
);
} -->
