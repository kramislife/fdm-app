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

# FDM — Master Task Plan
> Work phase by phase. Complete and verify before moving to the next.
> Run `npx tsc --noEmit` after every phase — zero errors required.
>
> WORKFLOW:
> 1. Build tasks below
> 2. Verify using checking.md
> 3. Once ALL checks pass → move to completed.md
> 4. Update checking.md for the next phase

---

## Phases Overview
- Phase 1: Foundation — Auth Flow ✅
- Phase 2: Public Header ✅
- Phase 3: Public Pages — About ✅
- Phase 4: Public Pages — Chapters ✅
- Phase 5: Admin Panel UI ✅
- Phase 6: Auth-Aware Header + Member Layout ✅
- Phase 7: Secure Authentication, Role Handling & Logout ✅
- Phase 8: Reusable Admin Table Component ✅
- Phase 9: Reference Data — Display Only ✅
- Phase 10: Google OAuth ✅
- Phase 11: Admin CRUD — Roles, Ministry Types, Event Types ✅
- Phase 12: Schema Update + Chapters CRUD ✅
- Phase 13: Ministry Heads Management ✅
- Phase 14: Users CRUD ← CURRENT

---

## Phase 14: Users CRUD
> Goal: Admin can create, update, and soft delete users.
> No email invite flow yet — that comes later.
> Guests excluded — status != 'guest'.
> SD + Elder only for full access.

### 14a. Data Fetchers
- [x] `lib/data/users.ts` — update existing fetcher

  `getUsers(params: TableParams)`
  - where:
    ```ts
    {
      status: { not: 'guest' },
      deleted_at: null,
    }
    ```
  - Include:
    ```ts
    user_chapters: {
      where: { is_primary: true },
      select: {
        chapter: { select: { id: true, name: true } }
      },
      take: 1
    }
    user_roles: {
      where: { is_active: true },
      select: {
        role: { select: { key: true, name: true } }
      },
      take: 1  // show primary/first active role only
    }
    ```
  - Columns to display:
    Full Name | Email | Contact Number | Birthday | Chapter | Role | Status | Actions
  - Search across: first_name, last_name, email, contact_number, role, chapter

  `getChaptersForSelect()`
  - All active non-deleted chapters
  - select: { id, name }
  - orderBy: name asc
  - Used in create/edit form chapter select

  `getRolesForSelect()`
  - All roles (no deleted_at on roles)
  - select: { id, key, name, scope }
  - orderBy: name asc
  - Used in create/edit form role select

### 14b. Users Page Updates
- [x] `app/(dashboard)/admin/users/page.tsx`
  - Add "+ Add User" button top-right aligned with page header
  - Table columns: Full Name | Email | Contact Number | Birthday | Chapter | Role | Status | Actions
  - Status badge: active=green, registered=blue, pending=amber, expired=red
  - Actions ellipsis:
    - View
    - Edit
    - Separator
    - Deactivate (if status = active or registered)
    - Restore (if status = expired)
    - Separator
    - Delete (destructive, soft delete)

### 14c. Create User Sheet
- [x] `app/(dashboard)/admin/users/page.tsx` — Add sheet for create

  Form fields:
  - First Name (Input, required)
  - Last Name (Input, required)
  - Email (Input, required, type=email)
    - Note: email is stored but invite logic skipped for now
    - Validate: unique — check against existing users
  - Contact Number (Input, optional, type=tel)
    - Validate: unique if provided — check against existing users
  - Birthday (Date picker, optional)
  - Chapter (Select from getChaptersForSelect(), required)
  - Role (Select from getRolesForSelect(), required)
    - When role scope = 'global': no chapter required
    - When role scope = 'chapter': chapter required
  - Status (Select: active | registered | pending, default: pending)
  - Address (Textarea, optional)

### 14d. Edit User Sheet
- [x] Same AdminSheet component, pre-filled with user data
  - All fields editable except Email
    - Email shown as read-only text (not input) — auth identifier - use Detail-field
  - Role change: deactivates old user_role, creates new one
  - Chapter change: updates user_chapters is_primary record

### 14e. Server Actions
- [x] `app/(dashboard)/admin/users/actions.ts`

  `createUser(data)`
  - `requireRole(['spiritual_director', 'elder'])`
  - Validate name, email required
  - Check email uniqueness:
    ```ts
    prisma.user.findFirst({ where: { email: data.email } })
    // if found → return { success: false, error: 'Email already exists.' }
    ```
  - Check contact_number uniqueness if provided:
    ```ts
    prisma.user.findFirst({ where: { contact_number: data.contact_number } })
    // if found → return { success: false, error: 'Contact number already exists.' }
    ```
  - Create user row:
    ```ts
    prisma.user.create({
      data: {
        first_name, last_name, email,
        contact_number: data.contact_number || null,
        birthday: data.birthday || null,
        address: data.address || null,
        status: data.status || 'pending',
        created_by_admin: currentUser.user.id,
      }
    })
    ```
  - Assign chapter:
    ```ts
    prisma.userChapter.create({
      data: { user_id: newUser.id, chapter_id: data.chapter_id, is_primary: true }
    })
    ```
  - Assign role:
    ```ts
    prisma.userRole.create({
      data: {
        user_id: newUser.id,
        role_id: data.role_id,
        chapter_id: roleScope === 'chapter' ? data.chapter_id : null,
        assigned_by: currentUser.user.id,
        is_active: true,
      }
    })
    ```
  - `revalidatePath('/dashboard/admin/users')`
  - Return `{ success: true }` or `{ success: false, error }`

  `updateUser(id, data)`
  - `requireRole(['spiritual_director', 'elder'])`
  - Validate name required
  - Check contact_number uniqueness if changed:
    ```ts
    prisma.user.findFirst({
      where: { contact_number: data.contact_number, id: { not: id } }
    })
    ```
  - Update user row (email never updated)
  - If role changed:
    - Deactivate old user_role
    - Create new user_role
  - If chapter changed:
    - Update user_chapters is_primary record
  - `revalidatePath('/dashboard/admin/users')`
  - Return `{ success: true }` or `{ success: false, error }`

  `deactivateUser(id)`
  - `requireRole(['spiritual_director', 'elder'])`
  - Sets status = 'expired'
  - Deactivates all user_roles:
    ```ts
    prisma.userRole.updateMany({
      where: { user_id: id },
      data: { is_active: false }
    })
    ```
  - `revalidatePath('/dashboard/admin/users')`

  `restoreUser(id)`
  - `requireRole(['spiritual_director', 'elder'])`
  - Sets status = 'active'
  - Does NOT restore roles — admin reassigns manually
  - `revalidatePath('/dashboard/admin/users')`

  `deleteUser(id)`
  - `requireRole(['spiritual_director', 'elder'])`
  - Soft delete only:
    ```ts
    prisma.user.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by: currentUser.user.id,
        status: 'expired'
      }
    })
    ```
  - Deactivate all user_roles
  - Preserve attendance, guest_logs, finance records
  - `revalidatePath('/dashboard/admin/users')`

---

## Decisions Recorded
- Guests (status = guest) excluded from Users table
- Email is required on create but invite logic skipped for now
- Email is never editable after creation — auth identifier
- Contact number optional, unique when provided
- Role change deactivates old role, creates new — history preserved
- Deactivate sets status = expired + deactivates all roles
- Restore sets status = active but does NOT restore roles
- Delete is soft only — all records preserved
- deleted_by and deleted_at set on soft delete



### Revisions 

Update Users CRUD — create and edit user form.
Focus on form fields and validation rules only.

== CREATE USER FORM FIELDS ==

Required:
- First Name
- Last Name
- Status (select: active, registered, pending)

Optional:
- Email (some elderly members may not have one)
- Contact Number (unique when provided)
- Birthday (date picker)
- Chapter (home chapter — not role scope)
- Address (textarea)

== EDIT USER FORM FIELDS ==

Same fields as create except:
- Email shown as read-only text if it exists — not editable
- Email input shown if no email set — can be added later
- All other fields editable

== VALIDATION RULES ==

Email:
- Optional
- If provided: must be valid email format
- If provided: must be unique across users (excluding current user on edit)
- If not provided: null in DB

Contact Number:
- Optional
- If provided: must be unique across users (excluding current user on edit)
- If not provided: null in DB

First Name + Last Name:
- Required, cannot be empty strings

Chapter:
- Optional in form
- If provided: saved to user_chapters as is_primary = true
- If changed on edit: update existing user_chapters primary record
- If removed on edit: set old user_chapters record is_primary = false

Status:
- Options: active, registered, pending
- expired and guest not shown in create/edit — set by system

== SOFT DELETE RULES ==

Delete:
- Sets deleted_at, deleted_by
- Sets status = expired
- Deactivates all user_roles (is_active = false)
- Preserves all attendance, guest_logs, finance records

Deactivate (separate from delete):
- Sets status = expired
- Deactivates all user_roles
- Does not set deleted_at — user still visible in table

Restore:
- Sets status = active
- Does NOT restore roles — admin reassigns via Manage Roles
- deleted_at stays null (was never set by deactivate)

== MANAGE ROLES  ==
- add in row action menu - manage roles
- Handled separately via Manage Roles sheet in ellipsis
- Role + chapter scope set there, not in create/edit form

== RULES ==
- TypeScript strict — no any
- All actions return { success, error } — never throw to client
- npx tsc --noEmit after changes — zero errors