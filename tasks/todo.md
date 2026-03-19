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
- Phase 15: User's Role Validation - ongoing

---

== MANAGE ROLES VALIDATION ==

Add Role:

- role required — cannot submit without selecting a role
- chapter required when role scope = 'chapter'
- chapter hidden and null when role scope = 'global'
- role dropdown excludes roles already active for this user
  (filtered client-side to prevent duplicate attempt)
- block if same role_id + chapter_id already active for this user
  error: "This role is already assigned for [chapter name / global]."
- block if role key = 'ministry_head'
  error: "Ministry Head is assigned via Ministry Heads page."
- block if user has deleted_at set
  error: "Cannot assign role to a deleted user."
- on success: auto-set home chapter in user_chapters if none exists yet
  and chapterId is provided

Remove Role:

- block if role key = 'ministry_head'
  error: "Remove Ministry Head via Ministry Heads page."
- warn (not block) if this is user's only active role
  warning: "This is the user's only active role."
- on success: sets user_role.is_active = false — not deleted

Current Roles Display:

- fetch user_roles WHERE user_id = userId AND is_active = true
- show: role name | chapter name (or "Global" if null) | Remove button
- refreshes after every add or remove

== DEACTIVATE VALIDATION ==

<!-- - block if user.id = currentUser.id
  error: "You cannot deactivate your own account." -->
<!-- - block if user active roles include spiritual_director
  error: "Spiritual Director account cannot be deactivated." -->
- block if user.status = 'inactive'
  error: "User is already deactivated."
- block if user.deleted_at is not null
  error: "User is already deleted."
- on success:
  status = expired
  all user_roles is_active = false

== RESTORE VALIDATION ==

- block if user.status != 'expired'
  error: "User account is already active."
- block if user.deleted_at is not null
  error: "Deleted users cannot be restored. Create a new account."
- on success:
  status = active
  roles NOT restored — admin reassigns via Manage Roles

== DELETE VALIDATION ==

- block if user.id = currentUser.id
  error: "You cannot delete your own account."
- block if user active roles include spiritual_director
  error: "Spiritual Director account cannot be deleted."
- warn before confirming (not block):
  "This will permanently hide [Name] from the system.
  Their records will be preserved. This cannot be undone."
- on success:
  deleted_at = now()
  deleted_by = currentUser.id
  status = expired
  all user_roles is_active = false
  attendance, guest_logs, finance records untouched



Fix three issues

== FIX 1: Current roles not updating after add ==
After addUserRole server action returns success:
- Append the new role to currentRoles local state immediately
- Do not wait for server revalidation to update the list
- New role object shape:
  { id: result.userRoleId, role: { key, name, scope }, chapter: { name } | null }

== FIX 2: Chapter resetting when role changes ==
In Role select onChange handler:
- Only reset chapterId to null when new role scope = 'global'
- When new role scope = 'chapter': keep existing chapterId, just show chapter select
- Never clear chapterId solely because the role changed

== FIX 3: Elder + Builder coexist ==
No code change needed — schema already supports it.
Just verify the duplicate check uses role_id + chapter_id combined:
  block only if: same role_id AND same chapter_id already active
  allow if: same role different chapter (Builder QC + Builder Bataan = valid)
  allow if: different roles same chapter (Elder + Builder QC = valid)

npx tsc --noEmit after changes — zero errors