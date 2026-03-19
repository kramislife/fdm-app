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
>
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
- Phase 14: Users CRUD ✅

---

## Phase 14: Users CRUD

> Goal: Admin can create, update, and soft delete users.
> No email invite flow yet — that comes later.
> Guests excluded — status != 'guest'.
> SD + Elder only for full access.

- Columns to display:
  Full Name | Email | Contact Number | Birthday | Chapter | Status | Created At | Actions
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

### 14a. Users Page Updates

- [x] `app/(dashboard)/admin/users/page.tsx`
  - Add "+ Add User" button top-right aligned with page header
  - Table columns: Full Name | Email | Contact Number | Birthday | Chapter | Status | Created At | Actions
  - Status badge: active=green, registered=default, pending=outline, inactive=red
  - Actions ellipsis:
    - View
    - Edit
    - Manage Roles
    - Deactivate (if status = active or registered)
    - Restore (if status = inactive)
    - Separator
    - Delete (destructive, soft delete)

### 14b. Create User Sheet

Form fields:

- First Name (Input, required)
- Last Name (Input, required)
- Contact Number (Input, optional, type=tel)
  - Validate: unique if provided — check against existing users
- Email (Input, type=email, optional)
  - Note: email is stored but invite logic skipped for now
  - Validate: unique — check against existing users
- Birthday (Date picker, optional)
- Chapter (Select from getChaptersForSelect(), required)
- Status (Select: active | registered | pending)
- Address (Textarea, optional)

### 14c. Edit User Sheet

- [x] Same AdminSheet component, pre-filled with user data
  - All fields editable except Email
    - Email shown as read-only text (not input) — auth identifier - use Detail-field
  - Chapter change: updates user_chapters is_primary record

### 14d. Manage Role

- In sheet, display user's full name and chapter in detailfield
- Select role, below display in success badge the current roles of the user, below of this once admin click and select a role, display in badge too in outline variant. Put an x on the badge so admin can remove a role. Same button below cancel and update. Only trigger updates once admin click update button

---
