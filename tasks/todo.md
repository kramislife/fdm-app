# FDM — Master Task Plan

> Work phase by phase. Complete and verify before moving to the next.
> Run `npx tsc --noEmit` after every phase — zero errors required.

---

## Phases Overview

- Phase 1–12 ✅
- Phase 13: Ministry Heads Management
- Phase 14: Users CRUD
- Phase 15: User Account State Management ← CURRENT

---

## Phase 15: User Account State Management

> Goal: Clean user account lifecycle from creation to login to access management.
> All flows documented step by step with no gaps.

---

### 15a. Schema Changes

Update `users` table — remove old fields, keep clean ones:

Remove:

- `account_expires_at`
- `is_active`
- `deleted_at`
- `deleted_by`

Keep / Add:

- `account_status` String — pending | registered | active
- `has_qr` Boolean default false
- `member_qr` String? — QR code value
- `is_temp_password` Boolean default false
- `auth_id` String? @unique — Supabase Auth UUID
- `deactivated_at` DateTime? — when access was last removed
- `deactivated_by` Int? — who removed access

Add to `user_roles` table:

- `deactivated_at` DateTime? — when this role was deactivated
  Used to match roles belonging to same deactivation batch

Run SQL in Supabase before db push:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deactivated_by INT REFERENCES users(id);
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP;
```

Then: `npx prisma generate` → `npx prisma db push`

---

### 15b. Flow 1 — Admin Creates Account

Step by step:

```
1. Admin fills create user form:
     First Name, Last Name, Email (required here),
     Contact Number (optional), Birthday (optional),
     Chapter (optional — home chapter),
     Address (optional)

2. On Save — server action runs:
     a. Check email uniqueness across ALL users including deleted
        → active conflict: show error toast, no button
        → deleted conflict: show error toast + Restore Account button

     b. Create public.users row:
          account_status = pending
          is_temp_password = true
          has_qr = false
          auth_id = null (set in next step)

     b2. If chapter provided in form:
          Create user_chapters row:
            user_id = newUser.id
            chapter_id = data.chapter_id
            is_primary = true

     c. Create Supabase Auth account:
          supabase.auth.admin.createUser({
            email: data.email,
            password: [auto-generated temp password],
            email_confirm: true
          })

     d. Save auth_id to public.users:
          auth_id = supabase_user.id

     e. Create user_chapters row if chapter provided

     f. Send invite email (future phase — skip for now)
        For now: admin manually shares credentials

3. Result:
     User appears in table with status = Pending
     auth_id is set — Supabase auth exists
     User can log in with temp password immediately
```

---

### 15b2. Flow 1b — Admin Edits Account (Pending Only — Email Correction)

```
Email is editable ONLY when account_status = pending
Once registered or active — email is read-only forever

When admin edits a pending user and changes email:
  1. Validate new email uniqueness across ALL users
  2. Update email in public.users
  3. Update email in Supabase auth:
       supabase.auth.admin.updateUserById(auth_id, { email: newEmail })
     → Same auth_id preserved — just email corrected
     → No need to delete/recreate Supabase auth account

When admin edits a registered/active user:
  → Email field shown as read-only text
  → Cannot be changed
  → If email is genuinely wrong on a registered account:
       Admin removes access → deletes account (if still pending)
       OR creates a new account with correct email
```

---

### 15c. Flow 2 — Member Logs In (Email + Temp Password)

Step by step:

```
1. Member goes to /login
   Enters email + temp password

2. Supabase validates credentials
   → invalid → show "Invalid email or password" (standard error)
   → valid → proceed

3. Check public.users by auth_id:
   → is_temp_password = true
     → redirect to /first-login

4. Member on /first-login:
   → enters new password
   → confirms new password

5. On submit:
   a. supabase.auth.updateUser({ password: newPassword })
   b. Update public.users:
        is_temp_password = false
        account_status = registered
        auth_id already set — no change needed

6. Attendance backfill:
   → find guest_logs WHERE email matches AND linked_user_id is null
   → update attendance.user_id for matching records
   → set guest_logs.linked_user_id = user.id

7. Check user_roles:
   → has active roles → redirect to /dashboard
   → no active roles  → redirect to /
```

---

### 15d. Flow 3 — Member Logs In (Returning, Normal)

Step by step:

```
1. Member goes to /login
   Enters email + password

2. Supabase validates
   → invalid → "Invalid email or password"
   → valid → proceed

3. Check public.users:
   → is_temp_password = true → redirect to /first-login (edge case)
   → is_temp_password = false → proceed

4. Check user_roles:
   → has active roles → redirect to /dashboard
   → no active roles  → redirect to /

5. Middleware on every request:
   → no session → redirect to /login
   → session exists → proceed normally
```

---

### 15e. Flow 4 — Member Logs In (Gmail OAuth)

Step by step:

```
1. Member clicks "Continue with Google" on /login

2. Google OAuth flow → Supabase callback

3. In /auth/callback route:
   a. Exchange code for session

   b. Get Google user data:
        email, display name, avatar URL

   c. Check public.users by email:

      CASE 1 — email matches pending account (admin provisioned):
        → Do NOT create new user
        → Sign out from Supabase immediately
        → Redirect to /login?error=provisioned&date=[created_at]
        → Login page shows:
          "Your account was created by our admin on [date].
           Check your email for your login credentials."

      CASE 2 — email matches existing active account:
        → Link auth_id if not yet linked
        → Run attendance backfill
        → Check user_roles → /dashboard or /

      CASE 3 — email not found (new user):
        → Upload Google avatar to Cloudinary
        → Create public.users row:
             first_name + last_name from Google display name
             email from Google
             photo_url = Cloudinary URL
             account_status = registered
             is_temp_password = false
             auth_id = linked immediately
             has_qr = false
        → Auto-assign no role (basic member)
        → Run attendance backfill
        → Redirect to /
```

---

### 15f. Flow 5 — Account Status Progression

Status moves forward automatically — never set manually by admin:

```
pending
  → admin created account
  → Supabase auth exists, auth_id set
  → is_temp_password = true
  → has_qr = false
  → can log in → forced to /first-login

     ↓ (on first login + password change)

registered
  → is_temp_password = false
  → auth_id already set
  → has_qr = false
  → can log in normally

     ↓ (when QR is generated)

active
  → has_qr = true
  → fully onboarded
  → can log in normally
```

---

### 15g. Flow 6 — QR Code Generation

```
Admin or Chapter Head opens user detail in admin panel

has_qr = false:
  → Show "Generate QR Code" button
  → Click:
      a. Generate unique QR value for this user
      b. Store in member_qr field
      c. Set has_qr = true
      d. Set account_status = active
  → Show QR image
  → Show Download button
  → Chapter Head can print or send to member via chat

has_qr = true:
  → Show QR image
  → Show Download button
  → Show Regenerate button
      → replaces old QR value
      → same steps as generation above

Purpose:
  Elderly member never needs to touch the system
  Chapter Head generates and prints QR for them
  Secretariat scans printed QR at events
```

---

### 15h. Flow 7 — Remove Access (Deactivate)

```
When to show "Remove Access" in ellipsis:
  User has at least one active user_role
  Hide if user has no active roles

Validations:
  → Cannot remove own access
  → Cannot remove Director Adviser's access

Steps:
  1. Get current timestamp (now)
  2. Update all active user_roles:
       is_active = false
       deactivated_at = now
  3. Update users:
       deactivated_at = now
       deactivated_by = currentUser.id

Result:
  User logs in → no active roles → lands on / only
  Account still exists, can still log in
  Can still see: public pages, My QR, My Profile
  Cannot see: /dashboard, any admin navigation
```

Example:

```
Juan is Head Servant of QC
Admin clicks Remove Access
→ user_roles: head_servant QC → is_active=false, deactivated_at=now
→ users: deactivated_at=now, deactivated_by=admin_id
→ Juan logs in → no roles → / only
```

---

### 15i. Flow 8 — Restore Access

```
When to show "Restore Access" in ellipsis:
  users.deactivated_at is not null
  AND user has user_roles with deactivated_at = users.deactivated_at

Steps:
  1. Find user_roles WHERE:
       user_id = this user
       is_active = false
       deactivated_at = users.deactivated_at (same batch only)
  2. Set those roles:
       is_active = true
       deactivated_at = null
  3. Update users:
       deactivated_at = null
       deactivated_by = null

Why match deactivated_at:
  Only restores roles from the most recent deactivation
  Old historical removed roles stay removed

Toast on success:
  "[Name]'s access has been restored.
   Visit Manage Roles if changes are needed."

Result:
  User logs in → has active roles → /dashboard
```

Example:

```
Juan was deactivated (head_servant removed)
Admin clicks Restore Access
→ finds user_roles WHERE deactivated_at = users.deactivated_at
→ sets is_active = true on those rows only
→ Juan logs in → head_servant active → /dashboard
```

---

### 15j. Flow 9 — Delete Account (Pending Only)

```
When to show "Delete Account" in ellipsis:
  account_status = pending
  AND created_at is older than 7 days

Who can delete:
  Director Adviser — all chapters
  Elder — all chapters
  Head Servant — own chapter pending members only

Steps:
  1. Show confirm dialog:
       "Delete [Name]'s account?
        This account has been pending for [X] days.
        This cannot be undone."
  2. On confirm — hard delete:
       Delete user_roles rows
       Delete user_chapters rows
       Delete users row
       Delete Supabase auth account:
         supabase.auth.admin.deleteUser(user.auth_id)

What is preserved (not deleted):
  guest_logs — linked by email not user_id
  attendance — linked via guest_logs

If they register later via Gmail:
  → Same email found in guest_logs
  → Attendance backfill restores their history
```

---

### 15j2. Chapter Assignment Rules

Chapter is home chapter — where the member belongs for fellowship,
attendance filtering, and reporting. Set in two ways:

WAY 1 — Create or Edit User form (always available):

```
Both create and edit forms include Chapter select field
  → Select from active chapters
  → Optional — can be left empty
  → On create: creates user_chapters row if chapter selected
  → On edit: updates existing record or creates new one
  → Saves to user_chapters as is_primary = true
  → Basic members (no elevated roles) set chapter here
```

WAY 2 — Auto-set from Manage Roles (elevated roles):

```
When chapter-scoped role assigned via Manage Roles:
  → chapter_id from role assignment
  → If user has no home chapter yet:
       auto-create user_chapters row with is_primary = true
  → If user already has a home chapter:
       do NOT override — keep existing home chapter
  → Admin can always change home chapter via Edit User
```

Chapter change via Edit User:

```
Admin selects different chapter in Edit User form
  → Update user_chapters: set old chapter is_primary = false
  → Create new user_chapters row with is_primary = true
  → user_roles NOT affected — role chapters are separate
```

Example — basic member:

```
Maria created as basic member
No elevated roles assigned
Admin edits Maria → selects Quezon City chapter
→ user_chapters: { user_id: Maria, chapter_id: QC, is_primary: true }
Maria now shows up in QC chapter reports and filters
```

Example — elevated role member:

```
Juan assigned Head Servant of Bataan via Manage Roles
→ user_roles: { head_servant, chapter_id: Bataan }
→ user_chapters auto-created: { chapter_id: Bataan, is_primary: true }
Juan's home chapter = Bataan (set automatically)
```

---

### 15k. Ellipsis Actions Summary

```
User has active roles (registered/active):
  Edit | Manage Roles | ── | Remove Access

User has deactivated roles (deactivated_at set):
  Edit | Manage Roles | ── | Restore Access

User is pending + older than 7 days:
  Edit | Manage Roles | ── | Delete Account

User has no roles (basic member, never deactivated):
  Edit | Manage Roles
```

---

### 15l. Middleware Rules

```
Every protected route request:
  1. Check Supabase session exists
     → no session → redirect to /login

  2. Check user_roles:
     → has active roles → allow /dashboard access
     → no active roles  → redirect to / if trying to access /dashboard

  3. Check route-level role:
     → /dashboard/admin/* → requireRole(['director_adviser', 'elder'])
     → /dashboard/* → any active role allowed
```

---

## Decisions Recorded

- auth_id set at account creation — not at first login
- account_status never manually set — system driven only
- Pending = Supabase auth exists + is_temp_password = true
- Deactivation = role removal only, user can still log in
- Restore = only roles from same deactivation batch
- Delete = hard delete, pending only, older than 7 days
- No soft delete on users table
- No account_expires_at
- QR generated by admin/chapter head for elderly
- Gmail: provisioned email → blocked + show message
- Gmail: new user → registered + no roles + /
- All users are members by default — no member role in user_roles

## -----------------------------------------------------------------

### Manage role revisions

Read CLAUDE.md before starting.
Only touch the files listed below — nothing else.

== REQUIREMENTS: MANAGE ROLES OVERHAUL ==

== PART 1: ROLES TO SHOW IN MANAGE ROLES ==

Exclude from role select dropdown:

- Member (all users are members by default)
- Ministry Head (assigned via Ministry Heads page only)

Group roles in dropdown:
Global (no chapter needed):
Director Adviser, Elder, Finance Head, Ministry Coordinator

Chapter (chapter select required):
Head Servant, Asst. Head Servant, Finance, Builder, Cluster Head

== PART 2: CHAPTER SELECT BEHAVIOR ==

Show chapter select when selected role scope = 'chapter'
Hide chapter select when selected role scope = 'global'

Default value of chapter select:
Pre-fill with user's home chapter (user_chapters where is_primary = true)
If no home chapter → empty, admin must select manually

When role chapter differs from user's home chapter:
Show inline note below chapter select (not an error, just info):
"Note: This chapter differs from [Name]'s home chapter ([chapter name])."

== PART 3: VALIDATION PER ROLE ==

Director Adviser:

- Only one person globally at any time
  Check: any other user has director_adviser active
  error: "[Name] is currently the Director Adviser.
  Remove it from them first."
- Cannot be assigned by non-Director Adviser users
  Only current Director Adviser can assign this role
- On assign: auto-deactivate existing Director Adviser
  user_role in same transaction before creating new one
- Cannot remove own Director Adviser role
  error: "You cannot remove your own Director Adviser role.
  Assign it to someone else first."

Elder:

- Block if already assigned to this user
  error: "Elder is already assigned to this user."
- Multiple users can be Elder globally ✅

Finance Head:

- Block if already assigned to this user
  error: "Finance Head is already assigned to this user."
- Multiple users can be Finance Head globally ✅

Ministry Coordinator:

- Block if already assigned to this user
  error: "Ministry Coordinator is already assigned to this user."
- Multiple users can be Ministry Coordinator globally ✅

Head Servant:

- Chapter required
- Block if already assigned to this user for same chapter
  error: "Head Servant is already assigned for [chapter]."
- Block if user already has Head Servant in different chapter
  error: "Head Servant can only be assigned to one chapter.
  Remove Head Servant from [chapter] first."
- Block if another user is already Head Servant of that chapter
  error: "[chapter] already has a Head Servant ([name]).
  Remove them first."

Asst. Head Servant:

- Chapter required
- Block if already assigned to this user for same chapter
  error: "Asst. Head Servant is already assigned for [chapter]."
- Block if user already has Asst. Head Servant in different chapter
  error: "Asst. Head Servant can only be assigned to one chapter."
- Multiple Asst. Head Servants per chapter allowed ✅

Finance:

- Chapter required
- Block if already assigned to this user for same chapter
  error: "Finance is already assigned for [chapter]."
- Same user can be Finance in multiple chapters ✅
- Multiple Finance per chapter allowed ✅

Builder:

- Chapter required
- Block if already assigned to this user for same chapter
  error: "Builder is already assigned for [chapter]."
- Block if user already has Builder in different chapter
  error: "Builder can only be assigned to one chapter."
- Multiple Builders per chapter allowed ✅

Cluster Head:

- Chapter required
- Block if already assigned to this user for same chapter
  error: "Cluster Head is already assigned for [chapter]."
- Block if user already has Cluster Head in different chapter
  error: "Cluster Head can only be assigned to one chapter."
- Multiple Cluster Heads per chapter allowed ✅

== PART 4: CHANGE HOME CHAPTER VALIDATION ==

File: app/(dashboard)/admin/users/actions.ts — updateUser

When admin changes home chapter in Edit User form:
Check if user has active chapter-scoped roles in OLD chapter:
user_roles WHERE user_id = id AND is_active = true
AND chapter_id = old chapter id
AND role.scope = 'chapter'

If found → return warning alongside success:
{
success: true,
warning: "Juan has active roles in [old chapter]:
[role1], [role2].
Changing home chapter does not affect these roles.
Update them via Manage Roles if needed."
}

If not found → proceed silently, no warning

UI: show warning as amber toast after successful chapter change
(not a block — just inform admin)

== PART 5: FILES TO TOUCH ==

- Update role select: exclude Member and Ministry Head
- Group roles: Global and Chapter sections in dropdown
- Add chapter select with pre-fill from home chapter
- Show inline note when role chapter != home chapter
- Apply all validations per role listed above
- Director Adviser: auto-deactivate existing in same transaction

app/(dashboard)/admin/users/actions.ts

- addUserRoles: apply all role validations above
- removeUserRole: block Director Adviser self-removal
- updateUser: add home chapter change warning

lib/data/users.ts

- getChaptersForSelect: already exists, no change
- getRolesForSelect: exclude member and ministry_head keys
  add scope field to returned data for grouping

== RULES ==

- All validations run on server action — never trust client only
- Return { success: false, error } for blocks
- Return { success: true, warning } for warns
- Director Adviser assign/deactivate in single DB transaction
- Chapter pre-fill is client-side convenience only
- TypeScript strict — no any
- npx tsc --noEmit after changes — zero errors
