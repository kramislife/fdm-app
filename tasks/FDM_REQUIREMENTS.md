# Church Community Management System — Requirements Document

> Based on planning discussions. Last updated: March 2026.

---

## 1. Project Overview

A **web-based Church Community Management System** designed to handle member management, QR-based attendance monitoring, role-based access control, ministry management, and basic finance tracking across multiple chapters of a church community.

---

## 2. Goals & Objectives

- Eliminate paper-based attendance (no more sign-up sheets or long lines)
- Provide fast, inclusive check-in for all member types (elderly, non-techy, phone users)
- Manage a multi-chapter, multi-role church organization digitally
- Track attendance per event, per chapter, per ministry
- Support new member onboarding without friction
- Provide role-appropriate dashboards and reports for all levels of leadership

---

## 3. Technology Approach

| Decision      | Choice                                 | Reason                                     |
| ------------- | -------------------------------------- | ------------------------------------------ |
| Platform      | Web-based only                         | No app install needed, works on any device |
| QR Scanning   | Browser camera via `jsQR` / `ZXing-js` | No native app required                     |
| QR Generation | Server-side or `qrcode.js`             | Per-member unique QR                       |
| Camera API    | `getUserMedia()`                       | Works on Chrome/Safari mobile              |
| Auth          | JWT or session-based                   | Secure role-based login                    |

---

## 4. Attendance Check-in System

### 4 Check-in Methods

| Method                        | Who Uses It                                                  | How It Works                                                 |
| ----------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **Mounted Tablet Scanner**    | Elderly, members with printed ID, members with QR in gallery | Greeter's tablet scans member's QR code at entrance          |
| **Self Check-in (own phone)** | Regular members, large gatherings                            | Member opens church website, scans central event QR code     |
| **Greeter Manual Search**     | Elderly who forgot ID, anyone without QR                     | Greeter searches by name on laptop, taps to log attendance   |
| **Greeter Quick Encode**      | Brand new / walk-in members                                  | Greeter encodes basic info on laptop, attendance auto-logged |

### Greeter Station Setup

```
ENTRANCE
│
├── TABLE
│     ├── Tablet 1 → QR Scanner (mounted, always open)
│     ├── Laptop   → New member encoding + manual check-in
│     └── (Optional) Small portable printer for QR ID printing
│
└── 2 Greeters
      ├── Greeter 1 → Scans IDs / phone QRs (fast lane)
      └── Greeter 2 → Assists new members & elderly (assisted lane)
```

### Check-in Flow (Existing Members)

```
Member arrives
      ↓
Shows QR (printed ID card / phone gallery / own phone scan)
      ↓
System looks up member ID
      ↓
Logs attendance with timestamp + method
      ↓
Shows ✅ "Welcome, [Name]!" on screen
```

### Check-in Flow (New / Walk-in Members)

```
New member arrives
      ↓
Greeter encodes on laptop:
  - First Name (required)
  - Last Name (required)
  - Contact Number (required)
  - Email Address (required)
  - Event (auto-filled)
      ↓
Attendance log entry created
  → Status: "Guest"
      ↓
System automatically sends email to guest:
  → "Hi [First Name]! Thank you for attending [Event Name].
     Please create your account at church-website.com/register
     to receive your QR Code for future check-ins."
      ↓
Head Servant also reviews guest list after service
  → Can manually follow up via phone if no response to email
      ↓
Guest registers on website
  (uses same email address greeter encoded)
      ↓
System matches email → links to existing attendance logs
  → Past attendance auto-marked ✅
  → QR Code generated
  → Save to gallery or print on ID

## 5. Member Account States

| State               | Description                                 | Has QR? | Can Self Check-in? | Can Log In? |
| ------------------- | ------------------------------------------- | ------- | ------------------ | ----------- |
| **Guest**           | Encoded by greeter, no account yet          | ❌      | ❌                 | ❌          |
| **Registered**      | Created own account, linked to guest record | ✅      | ✅                 | ✅          |
| **Active Member**   | Fully onboarded, has ID/QR                  | ✅      | ✅                 | ✅          |

---
## 6. Organization Structure

👑 LEADER (1 person — top of everything)
│
└── 🏛️ ELDER / SENIOR LEADERSHIP
      │
      ├── 📋 MINISTRY COORDINATOR (cross-chapter, per ministry type)
      │     → No direct chapter authority
      │     → Called in by Head Servant when expertise needed
      │     → Monitors ministry health across all chapters
      │     → Can be an Elder
      │
      │     ├── Music       → QC Ministry Head, Bataan Ministry Head, Caloocan Ministry Head
      │     ├── Outreach    → QC Ministry Head, Bataan Ministry Head, Caloocan Ministry Head
      │     └── Media       → QC Ministry Head, Bataan Ministry Head, Caloocan Ministry Head
      │
      └── 🏛️ HEAD SERVANT (per chapter — full authority over chapter)
            → First escalation point for all member issues
            → Coordinates with Ministry Coordinators as needed
            → Manages 1 or more chapters
            │
            ├── 🤝 ASSISTANT HEAD SERVANT (1 chapter only)
            │     → Supports Head Servant in day-to-day chapter operations
            │
            ├── 🔨 BUILDER (per chapter, reports to Head Servant)
            │     → Responsible for member growth and discipleship
            │     └── 📦 CLUSTER HEADS (report directly to their Builder)
            │           └── Members (grouped in clusters)
            │
            ├── 💰 FINANCE / TREASURER (per chapter, reports to Head Servant)
            │     → Manages chapter funds and financial reporting
            │
            └── 🎵 MINISTRY HEAD (per ministry per chapter)
                  → Reports to Head Servant for chapter concerns
                  → Coordinates with Ministry Coordinator for ministry expertise
                  └── Ministry Members

---

## 7. Complete Role List

| #   | Role                       | Scope                             | Reports To           | Notes                                                               |
| --- | -------------------------- | --------------------------------- | -------------------- | ------------------------------------------------------------------- |
| 1   | **Leader**                 | Community-wide                    | —                    | Only 1 person, full access                                          |
| 2   | **Elder**                  | Community-wide                    | Leader               | Multiple allowed; can also be Head Servant                          |
| 3   | **Head Servant**           | 1 or more chapters                | Elder / Leader       | 1 main per chapter; can manage multiple chapters                    |
| 4   | **Assistant Head Servant** | 1 chapter only                    | Head Servant         | Multiple per chapter; chapter-locked                                |
| 5   | **Ministry Coordinator**   | Community-wide, per ministry type | Elder / Leader       | One per ministry type (e.g. one Music Coordinator for all chapters) |
| 6   | **Builder**                | Per chapter                       | Head Servant         | 1 per chapter; handles Divine Mercy enthronement                    |
| 7   | **Cluster Head**           | Per cluster                       | Builder              | Multiple per chapter; reports directly to Builder                   |
| 8   | **Finance / Treasurer**    | Per chapter                       | Head Servant         | Handles chapter finances                                            |
| 9   | **Ministry Head**          | Per ministry per chapter          | Ministry Coordinator | One per ministry per chapter                                        |
| 10  | **Member**                 | Per chapter                       | Head Servant         | Can belong to a chapter AND one or more ministries                  |
| 11  | **Guest**                  | None                              | —                    | No login; awaiting full registration                                |

### Multiple Role Rules

- A person **can hold multiple roles** simultaneously
- Example: Elder + Head Servant of QC Chapter
- Example: Member + Ministry Head of Music + Finance/Treasurer
- Every role is **scoped** (chapter, ministry, cluster, or community-wide)

---

## 8. Ministries

Every chapter has **all 6 ministries**. Each ministry has:

- 1 Ministry Head (per chapter)
- 1 Ministry Coordinator (community-wide, oversees all chapters for that ministry type)
- Multiple members

| #   | Ministry         |
| --- | ---------------- |
| 1   | Music            |
| 2   | Dance            |
| 3   | General Services |
| 4   | Media            |
| 5   | Food Ministry    |
| 6   | Youth Group      |

---

## 9. Chapters

- Multiple chapters exist (e.g. QC, Bataan, Caloocan)
- Each chapter has:
  - 1 main Head Servant (can manage multiple chapters)
  - Multiple Assistant Head Servants (chapter-locked)
  - Multiple Builder
  - Multiple Cluster Heads (under Builder)
  - 1 Finance / Treasurer
  - All 6 ministries, each with a Ministry Head
  - Members

---

## 10. Permission Matrix

**Legend:**

✅ → Full access
❌ → No access
👁️ View → Read only
🏛️ Chapter → Own chapter only
📦 Cluster → Own cluster only
🎵 Ministry → Own ministry only
👤 Self → Own record only

```

## | Feature | Leader | Elder | Head Servant | Asst. HS | Ministry Coord. | Builder | Cluster Head | Finance | Ministry Head | Member |

| View all chapters | ✅ | ✅ | 🏛️ Own | 🏛️ Own | 👁️ View | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage chapter | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Encode new members | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manual check-in | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View all members | ✅ | ✅ | 🏛️ Chapter | 🏛️ Chapter | 🎵 Ministry/All Ch. | 🏛️ Chapter | 📦 Cluster | ❌ | 🎵 Ministry | ❌ |
| Manage ministries | ✅ | ✅ | ✅ | ✅ | 🎵 Own type | ❌ | ❌ | ❌ | 🎵 Own | ❌ |
| Manage Builder/Clusters | ✅ | ✅ | ✅ | ✅ | ❌ | 🔨 Chapter | 📦 Cluster | ❌ | ❌ | ❌ |
| Finance records | ✅ | ✅ | 👁️ View | 👁️ View | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Attendance reports | ✅ | ✅ | 🏛️ Chapter | 🏛️ Chapter | 🎵 All Ch./Ministry | 📦 Cluster | 📦 Cluster | ❌ | 🎵 Ministry | 👤 Self |
| Self check-in | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View own QR code | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View own attendance | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

```

---

## 11. Database Structure (Planned)

```

USERS
id, name, contact, email, password
status: guest | invited | registered | active
chapter_id (primary chapter)

USER_ROLES (many-to-many — one user can have many roles)
user_id
role
chapter_id ← null if community-wide
ministry_type ← e.g. "music" (for coordinator & ministry head)
ministry_id ← specific chapter ministry instance
cluster_id ← if cluster head

CHAPTERS
id, name, location
head_servant_id (main)

CHAPTER_ASSISTANTS
chapter_id, user_id

MINISTRIES (per chapter — auto-created for every chapter)
id
type: music | dance | media | gen_services | food | youth
chapter_id
ministry_head_id
coordinator_id ← links to community-wide coordinator

MINISTRY_COORDINATORS (community-wide)
id, user_id
ministry_type

MINISTRY_MEMBERS (many-to-many)
user_id, ministry_id

CLUSTERS
id, name
chapter_id
builder_id
cluster_head_id

FINANCE_RECORDS
id, chapter_id
recorded_by (user_id)
type: income | expense
amount, description, date

EVENTS
id, name, date, time
chapter_id
type: sunday_service | special | youth | etc.
qr_code (for self check-in)

ATTENDANCE
id, user_id, event_id
method: scanned | self_checkin | manual
timestamp

```

---

## 12. Key System Features (To Build)

### Authentication

- [ ] Login / logout
- [ ] Role-based access control
- [ ] Session management
- [ ] Password reset

### Member Management

- [ ] Member profile (name, contact, birthday, address, photo)
- [ ] QR code generation per member
- [ ] Member status tracking (guest → active)
- [ ] Invite link generation for new members
- [ ] Guest record linking when member registers
- [ ] Multi-role assignment per member

### Check-in System

- [ ] Tablet QR scanner page (always-on, camera-based)
- [ ] Self check-in page (member scans event QR with own phone)
- [ ] Manual check-in (search by name)
- [ ] Greeter quick-encode form (new member, 3 fields, under 30 sec)
- [ ] Welcome screen on successful scan
- [ ] Auto-fill current event on greeter form

### Admin Dashboard

- [ ] Attendance reports (by event, chapter, date range)
- [ ] Member list with filters
- [ ] Pending/guest member list with follow-up tracking
- [ ] Export attendance to CSV/PDF

### Ministry Management

- [ ] Ministry member list per chapter
- [ ] Ministry attendance tracking
- [ ] Ministry Coordinator cross-chapter view

### Builder & Cluster Management

- [ ] Cluster list under each Builder
- [ ] Enthronement activity tracking
- [ ] Cluster attendance

### Finance Module

- [ ] Income / expense recording
- [ ] Finance report per chapter
- [ ] View-only access for Head Servant / Elder / Leader

### Chapter Management

- [ ] Chapter creation and editing
- [ ] Assign Head Servant (main + assistants)
- [ ] Auto-create all 6 ministries on chapter creation

---

## 13. Design Principles

> **The greeter does the work, not the member.**
> Elderly and non-techy members should never have to touch a device.

- Keep greeter forms to **3 required fields max** for speed
- Every member type is supported: elderly (printed ID), phone users (gallery QR), large gatherings (self scan)
- Guest records are **never lost** — attendance history preserved even before full registration
- All roles are **scoped** — no one sees more than they need to
- Web-only — no native app required for any feature

---

_End of Requirements Document_

```

```

```
