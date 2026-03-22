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

> Goal: Clean, simple user lifecycle.
> Two types of users: normal (web access) and QR-only (attendance only).
> QR-only users have no email, no auth, no login — just a QR for attendance.
> Normal users: two statuses only — pending and verified.

---

### 15a. Schema Changes - DONE!

Add to `users` table:

```prisma
is_qr_only           Boolean   @default(false)
// true  = elderly/no email, QR attendance only
//         no Supabase auth, no login needed
//         member_qr generated on creation
// false = normal account with login

```

Add to `user_roles` table:

```prisma
access_revoked Boolean @default(false)
// true  = role deactivated as part of Remove Access
// false = role individually removed via Manage Roles
// used to match correct batch on Restore Access
```

Remove from `users` table:

```
has_qr       ← redundant, use member_qr != null instead
```

Run SQL in Supabase: DONE!

```sql
-- Add new columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_qr_only BOOLEAN DEFAULT false;
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS access_revoked BOOLEAN DEFAULT false;

-- Remove old columns
ALTER TABLE users DROP COLUMN IF EXISTS has_qr;
```

Then: `npx prisma generate` → `npx prisma db push`

Update USER_STATUS constant: DONE!

```ts
export const USER_STATUS = {
  GUEST: "guest", // in guest_logs only, no users row
  PENDING: "pending", // account created, not logged in yet
  EXPIRED: "expired", // pending > 7 days, never activated
  VERIFIED: "verified", // logged in + QR auto-generated
} as const;
// is_qr_only users ignore account_status — irrelevant for them
```

---

### 15b. Two User Types

TYPE 1 — Normal Member (is_qr_only = false):

```
Has email (required)
Has Supabase auth (auth_id set)
is_temp_password = true on creation
account_status: pending → verified on first login
QR auto-generated on first login
Can log in to web app
Can access / and /dashboard based on roles
```

TYPE 2 — QR-Only Member (is_qr_only = true):

```
No email required
No phone required
No Supabase auth (auth_id = null)
No login ever
QR generated immediately on creation by admin
member_qr set on creation
account_status: pending
Only purpose: attendance via QR scan
If they later get email → admin converts to normal account
```

---

### 15c. Flow 1 — Create Normal Member

```
1. Admin fills create user form:
     First Name (required)
     Last Name (required)
     Email (required for normal member)
     Contact Number (optional)
     Birthday (optional)
     Chapter (optional — home chapter)
     Address (optional)
     "QR attendance only" toggle = OFF (default)

2. Validations:
     email required + valid format
     email uniqueness check

3. On Save:
     a. Create public.users:
          account_status = pending
          is_temp_password = true
          is_qr_only = false
          member_qr = null
          auth_id = null (set next)
     b. Create user_chapters if chapter provided
     c. Create Supabase Auth account:
          supabase.auth.admin.createUser({
            email,
            password: [auto-generated temp password],
            email_confirm: true
          })
     d. Save auth_id to public.users
     e. Send invite email with temp password
        On email send fail → toast:
          "Account created but invite email failed.
           Use Resend Credentials to try again."
```

---

### 15d. Flow 2 — Create QR-Only Member (Elderly)

```
1. Admin fills create user form:
     First Name (required)
     Last Name (required)
     Email (hidden — not needed)
     Contact (hidden — not needed)
     Birthday (optional)
     Chapter (optional)
     "QR attendance only" toggle = ON

2. On Save:
     a. Create public.users:
          is_qr_only = true
          account_status = pending
          is_temp_password = false
          auth_id = null (never created)
          member_qr = auto-generated immediately
          qr_generated_at = now()
     b. Create user_chapters if chapter provided

3. Show QR immediately after creation:
     QR image displayed
     [Download QR] button

4. Admin prints QR and hands to elderly member
   Secretariat scans QR at events → attendance recorded
   Member never needs phone, email, or web app
```

---

### 15e. Flow 3 — Convert QR-Only to Normal Account

```
Elderly member later gets an email and wants web access:

1. Admin opens Edit User for QR-only member
2. Toggles OFF "QR attendance only"
   → Email input appears
3. Admin adds their email
4. On Save:
     a. Validate email uniqueness
     b. Update public.users:
          is_qr_only = false
          email = new email
          is_temp_password = true
     c. Create Supabase Auth account:
          supabase.auth.admin.createUser({
            email,
            password: [new temp password],
            email_confirm: true
          })
     d. Save auth_id
     e. Send invite email
     f. member_qr preserved → NOT regenerated
        Existing printed QR still works

5. Member logs in with temp password
   → /first-login → changes password
   → account_status = verified
   → member_qr unchanged (already exists)
   → Attendance history preserved
```

---

### 15f. Flow 4 — First Login (Pending → Verified)

```
1. Member enters email + temp password at /login
2. Supabase validates → proceed
3. is_temp_password = true → redirect to /first-login
4. Member changes password on /first-login

5. On submit — completeFirstLogin():
   a. supabase.auth.updateUser({ password: newPassword })
   b. Check if member_qr exists:
        member_qr = null → auto-generate QR:
          member_qr = crypto.randomUUID()
          qr_generated_at = now()
        member_qr exists (converted QR-only) → keep existing QR
   c. Update public.users:
        is_temp_password = false
        account_status = verified
   d. Run attendance backfill:
        find guest_logs WHERE email matches AND linked_user_id null
        update attendance.user_id for matching records
        set guest_logs.linked_user_id = user.id

6. Check user_roles:
   → has active roles → /dashboard
   → no active roles → /
```

---

### 15g. Flow 5 — Normal Login (Returning Member)

```
1. Member enters email + password
2. Supabase validates
3. is_temp_password check:
   → true → /first-login
   → false → proceed
4. Check user_roles:
   → has active roles → /dashboard
   → no active roles → /
```

---

### 15h. Flow 6 — Gmail OAuth Login

```
In /auth/callback after OAuth:

CASE 1 — email matches pending account:
  → Sign out from Supabase
  → Redirect to /login?error=provisioned&date=[created_at]
  → "Your account was created by our admin on [date].
     Check your email for your login credentials."

CASE 2 — email matches existing verified account:
  → Link auth_id if not yet linked
  → Run attendance backfill
  → Check user_roles → /dashboard or /

CASE 3 — email not found (new Gmail user):
  → Upload Google avatar to Cloudinary
  → Auto-generate QR:
       member_qr = unique value
       qr_generated_at = now()
  → Create public.users:
       name from Google display name
       email from Google
       photo_url = Cloudinary URL
       account_status = verified
       is_temp_password = false
       is_qr_only = false
       auth_id = linked
  → Run attendance backfill
  → Redirect to /
```

---

### 15i. Flow 7 — Expired Account (Pending > 7 Days)

```
Scheduled job or on-demand check:
  Find users WHERE:
    account_status = pending
    AND is_qr_only = false
    AND created_at < 7 days ago

  → Set account_status = expired

Expired account in admin table:
  Status badge: expired = red
  Ellipsis shows:
    View | Edit | Manage Roles | Resend Credentials | Delete Account

Resend Credentials:
  → Generate new temp password
  → Update Supabase auth
  → Send invite email
  → Show temp password once
  → Update activation_email_sent_at
  → Increment activation_email_resent

Delete Account (expired only):
  → Confirm dialog:
      "Delete [Name]'s account?
       Created [X days ago], never activated.
       This cannot be undone."
  → Hard delete: user + user_roles + user_chapters
  → supabase.auth.admin.deleteUser(auth_id)
  → guest_logs + attendance preserved
```

---

### 15j. Flow 8 — QR Code (User Side)

```
Verified member goes to My QR page:
  → QR image displayed
  → [Download QR] button
  → [Regenerate] button:
      Basic member (no elevated roles):
        7-day cooldown from qr_generated_at
        If < 7 days: button disabled + tooltip showing available date
        If > 7 days: simple confirm → regenerate
      Elevated role (HS, Elder, SD, etc.):
        No cooldown — regenerate anytime
      On regenerate:
        member_qr = new unique value
        qr_generated_at = now()
        qr_regenerated_count += 1
```

---

### 15k. Flow 9 — QR Code (Admin Side)

```
Admin opens user detail:

Normal member (is_qr_only = false):
  member_qr = null (not yet logged in):
    → No generate button
    → Note: "QR will be auto-generated when member logs in."
    → [Resend Credentials] button if pending/expired

  member_qr exists:
    → Show QR image + [Download] button
    → [Regenerate] button
         SD + Elder + Head Servant: no cooldown
         Simple confirm dialog → regenerate

QR-only member (is_qr_only = true):
  member_qr = null (just created, shouldn't happen):
    → [Generate QR] button → generates immediately, no dialog
  member_qr exists:
    → Show QR image + [Download] button
    → [Regenerate] button with confirm:
    → SD + Elder + Head Servant: no cooldown
```

---

### 15l. Flow 10 — Resend Credentials

```
Available when:
  is_qr_only = false
  AND (account_status = pending OR expired)
  AND is_temp_password = true

Steps:
  1. Generate new temp password
  2. Update Supabase auth: supabase.auth.admin.updateUserById(
       auth_id, { password: newTempPassword }
     )
  3. Send invite email
  4. Update activation_email_sent_at = now()
  5. Increment activation_email_resent
```

---

### 15m. Flow 11 — Remove Access (Deactivate)

```
Show in ellipsis when:
  User has at least one active user_role
  is_qr_only = false
  Hide if no active roles

Validations:
  Cannot remove own access
  Cannot remove Director Adviser access

Steps:
  1. Update all active user_roles:
       is_active = false
       access_revoked = true
  2. Update users:
       deactivated_at = now()
       deactivated_by = currentUser.id

Result:
  User can still log in
  No active roles → lands on / only
  Can see public pages + My QR + My Profile
  No dashboard access
```

---

### 15n. Flow 12 — Restore Access

```
Show in ellipsis when:
  users.deactivated_at is not null

Steps:
  1. Find user_roles WHERE:
       user_id = this user
       is_active = false
       access_revoked = true  ← same batch flag
  2. Set those roles:
       is_active = true
       access_revoked = false
  3. Update users:
       deactivated_at = null
       deactivated_by = null

Toast: "Access restored. Visit Manage Roles if needed."
Old individually-removed roles NOT restored.
```

---

### 15o. Ellipsis Actions Summary

```
Normal member, verified, has active roles:
  View | Edit | Manage Roles | ── | Remove Access

Normal member, deactivated (deactivated_at set):
  View | Edit | Manage Roles | ── | Restore Access

Normal member, pending (< 7 days):
  View | Edit | Manage Roles | ── | Resend Credentials

Normal member, expired (pending > 7 days):
  View | Edit | Manage Roles | ── | Resend Credentials | Delete Account

Normal member, verified, no roles (basic member):
  View | Edit | Manage Roles

QR-only member:
  View | Edit | (no Remove Access, no Delete unless admin decides)
```

---

### 15p. Middleware Rules

```
Every protected route:
  1. No session → /login
  2. is_temp_password = true → /first-login
     (skip for is_qr_only = true — they never have sessions)
  3. /dashboard/* + no active user_roles → redirect to /
  4. /dashboard/admin/* → requireRole(['director_adviser', 'elder'])
```

---

### 15q. Codebase Cleanup

- Remove all `registered` status references
- Remove `has_qr` — use `member_qr !== null` everywhere
- Add `is_qr_only`
- Update status badges:
  pending = warning
  expired = error
  verified = success
- Update middleware with new checks

---

## Decisions Recorded

- Two user types: normal (web) and QR-only (attendance only)
- is_qr_only = true → no email, no auth, QR generated on create
- QR-only → account_status irrelevant, pending
- Normal member: pending → verified on first login
- expired = pending > 7 days (auto-set)
- QR auto-generated on first login for normal members
- Existing QR preserved when QR-only converts to normal
- Temp password shown once on create + resend (never stored)
- access_revoked flag for clean batch restore
- member_qr != null replaces has_qr boolean
- 7-day cooldown for basic members, no cooldown for elevated roles
- No soft delete on users — hard delete for expired only
- Director Adviser: one globally, cannot remove own role
