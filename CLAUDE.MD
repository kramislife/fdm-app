# FDM — Friends of the Divine Mercy

Community Management System

---

## Workflow Orchestration

### 1. Plan Mode Default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy

- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop

- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done

- Never mark a task complete without proving it works
- Ask yourself: "Would a senior developer approve this?"
- Run `npx tsc --noEmit` — zero errors before calling anything done
- Check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing

- When given a bug report: just fix it — don't ask for hand-holding
- Point at logs, errors, failing types — then resolve them
- Zero context switching required from the user
- Go fix failing builds without being told how

---

## Task Management

Three-file system — always keep these in sync:

| File                 | Purpose                                                |
| -------------------- | ------------------------------------------------------ |
| `tasks/todo.md`      | Active phase only — current tasks with checkboxes      |
| `tasks/checking.md`  | Developer QA checklist — verify before approving phase |
| `tasks/completed.md` | Permanent log of finished phases + their checklists    |

### Workflow per phase

1. Build tasks from `tasks/todo.md`
2. Run `npx tsc --noEmit` — zero errors required
3. Update `tasks/checking.md` with that phase's checklist
4. Once ALL checklist items pass → move phase to `tasks/completed.md`
5. Update `tasks/checking.md` with the NEXT phase's checklist
6. Capture any lessons in `tasks/lessons.md`

---

## Core Principles

- **Simplicity First:** Make every change as simple as possible. Minimal code impact.
- **No Laziness:** Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact:** Changes should only touch what's necessary. Avoid introducing bugs.

---

## Project Overview

Church community management app for FDM with 6 chapters across Metro Manila and nearby provinces.
Handles attendance (QR-based), guest encoding, enthronements, finance, ministries, and announcements.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** PostgreSQL via Supabase (Singapore region)
- **ORM:** Prisma 7 — client at `lib/generated/prisma/client`
- **Auth:** Supabase Auth — passwords stored in `auth.users`, NOT in `public.users`
- **Media:** Cloudinary (no upload presets — folder-based via `lib/cloudinary.ts`)
- **Email:** Resend via `lib/email.ts`
- **Hosting:** Vercel

---

## Key Commands

```bash
npm run dev                      # start dev server
npm run build                    # prisma generate && next build
npx tsc --noEmit                 # type check — must be zero errors
npx prisma generate              # regenerate Prisma client after schema changes
npx prisma db push               # apply schema to Supabase
npx prisma db push --force-reset # wipe all data and re-push schema
npx prisma db seed               # seed database (uses tsx prisma/seed.ts)
npx prisma migrate reset         # reset database
npx prisma studio                # browse database
```

---

## Project Structure

```
app/                  # Next.js App Router pages and layouts
components/           # shared UI components
config/               # app-wide config data (navigation, constants)
tasks/
  todo.md             # active phase — current tasks only
  checking.md         # developer QA checklist for current phase
  completed.md        # log of finished phases with checklists
  lessons.md          # lessons learned — updated after every correction
  FDM_REQUIREMENTS.md # full product requirements document
  FDM_TECHSTACK.md    # tech stack setup guide and code templates
lib/
  prisma.ts           # Prisma client — import from here for all DB queries
  supabase/
    client.ts         # Supabase for "use client" components
    server.ts         # Supabase for server components and API routes
    proxy.ts          # session refresh middleware — do not call directly
  cloudinary.ts       # image upload/delete
  email.ts            # send emails via Resend
  utils.ts            # cn() for Tailwind class merging
  generated/prisma/   # auto-generated by Prisma — NEVER edit manually
prisma/
  schema.prisma       # database schema
  seed.ts             # seed data
```

---

## Responsive Typography & Spacing

Always use responsive text sizes — never a single fixed size. Follow this scale:

| Use             | Mobile      | Tablet `md:` | Desktop `lg:` |
| --------------- | ----------- | ------------ | ------------- |
| Page title      | `text-xl`   | `text-2xl`   | `text-3xl`    |
| Section heading | `text-lg`   | `text-xl`    | `text-2xl`    |
| Card title      | `text-base` | `text-lg`    | `text-xl`     |
| Body text       | `text-sm`   | `text-base`  | `text-base`   |
| Label / caption | `text-xs`   | `text-sm`    | `text-sm`     |
| Table cell      | `text-xs`   | `text-sm`    | `text-sm`     |
| Button          | `text-sm`   | `text-sm`    | `text-base`   |

**Rules:**

- Always mobile-first — base class is mobile, `md:` and `lg:` scale up
- Minimum `text-xs` (12px) — never go below
- Body text never below `text-sm` on any screen — elderly readability
- Use `font-medium` or `font-semibold` for labels — thin fonts are hard to read

---

## Code Style

- Use TypeScript strictly — no `any`
- Server Components by default; add `"use client"` only when needed
- Use `cn()` from `lib/utils.ts` for conditional Tailwind classes
- Prefer `async/await` over `.then()` chains
- All API routes go in `app/api/`
- Always handle loading and error states in UI

---

## Important Notes

- Run `prisma generate` BEFORE `db push` after any schema change
- `ministry_id: undefined` not `null` for optional Int? fields in Prisma 7 upserts
- Vercel build runs `prisma generate && next build` — already set in `package.json`
- `.env.local` only — no `.env` file used

## Additional Docs

See `tasks/` folder for full requirements (`FDM_REQUIREMENTS.md`) and tech stack setup (`FDM_TECHSTACK.md`).

## Pencil MCP

- pencil get_style_guide: always pass tags as a real array — never a JSON string
  Correct: tags: ["warm", "elegant"]
  Wrong: tags: "[\"warm\", \"elegant\"]"
- If get_style_guide fails with "Either tags or name must be provided",
  retry immediately with tags as a native array, not a quoted string
