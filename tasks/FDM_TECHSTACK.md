# FDM Tech Stack Setup Guide

> For project overview, roles, chapters, brand colors, code style, and architecture decisions — see `CLAUDE.md`.
> This document covers installation, configuration, and code templates only.

---

## Package Versions

| Layer         | Package                                   | Version |
| ------------- | ----------------------------------------- | ------- |
| Framework     | `next`                                    | 15.x    |
| Language      | `typescript`                              | 5.x     |
| Styling       | `tailwindcss`                             | 4.x     |
| UI Components | `shadcn/ui` + `@radix-ui/*`               | latest  |
| ORM           | `prisma` + `@prisma/adapter-pg` + `pg`    | 7.x     |
| Auth + DB     | `@supabase/supabase-js` + `@supabase/ssr` | 2.x     |
| Media         | `cloudinary` + `next-cloudinary`          | 2.x     |
| QR Generate   | `qrcode`                                  | 1.x     |
| QR Scan       | `jsqr`                                    | 1.x     |
| Email         | `resend` + `react-email`                  | 3.x     |
| Validation    | `zod`                                     | 3.x     |
| Date utils    | `date-fns`                                | 3.x     |
| Class utils   | `clsx` + `tailwind-merge`                 | latest  |
| Icons         | `lucide-react`                            | latest  |

> ⚠️ Prisma 7 does **not** use `@prisma/client`. Client is generated into `generated/prisma/` and imported from there.

---

## 1. Create Project

```bash
npx create-next-app@latest fdm-app
```

Accept all recommended defaults (TypeScript, Tailwind, ESLint, App Router, `@/*` alias).

---

## 2. Install Dependencies

```bash
cd fdm-app

# Prisma 7
npm install prisma @prisma/adapter-pg pg
npm install --save-dev @types/pg dotenv

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Cloudinary
npm install cloudinary next-cloudinary

# QR
npm install qrcode jsqr
npm install --save-dev @types/qrcode

# Email
npm install resend react-email

# Utilities
npm install zod date-fns clsx tailwind-merge lucide-react

# Dev types
npm install --save-dev @types/node @types/react @types/react-dom
```

> `npm audit` vulnerabilities after install are safe to ignore — they are inside Prisma's internal CLI tooling and never affect the app. Do **not** run `npm audit fix --force` as it will downgrade Prisma.

---

## 3. shadcn/ui

```bash
npx shadcn@latest init
```

Prompts: **Default** style · **Neutral** color · **Yes** to CSS variables.

```bash
npx shadcn@latest add button input label table dialog select badge card form toast dropdown-menu avatar separator sheet tabs
```

---

## 4. Tailwind v4 + Brand Colors

Replace `app/globals.css` entirely:

```css
@import "tailwindcss";

@theme {
  --color-brand-red: #c0392b;
  --color-brand-red-dark: #922b21;
  --color-brand-red-light: #fadbd8;
  --color-brand-white: #ffffff;
  --color-brand-dark: #1a1a1a;
  --color-brand-mid: #555555;
  --color-brand-gray-light: #f9f9f9;
  --color-brand-gray-mid: #eeeeee;
  --color-brand-gray-border: #cccccc;

  --font-sans: "Inter", sans-serif;
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 10%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 10%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 10%;
    --primary: 5 68% 47%; /* #C0392B */
    --primary-foreground: 0 0% 100%;
    --destructive: 4 60% 35%; /* #922B21 */
    --destructive-foreground: 0 0% 100%;
    --secondary: 0 0% 96%;
    --secondary-foreground: 0 0% 10%;
    --muted: 0 0% 96%;
    --muted-foreground: 0 0% 45%;
    --accent: 5 68% 97%;
    --accent-foreground: 5 68% 47%;
    --border: 0 0% 80%;
    --input: 0 0% 80%;
    --ring: 5 68% 47%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## 5. Prisma 7 Config

```bash
npx prisma init
# Delete the .env Prisma creates — we use .env.local only
Remove-Item .env   # Windows PowerShell
```

**`prisma/schema.prisma`** — generator block only:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

**`prisma.config.ts`:**

```typescript
import { config } from "dotenv";
config({ path: ".env.local" });
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env["DIRECT_URL"] },
});
```

> `prisma.config.ts` uses `DIRECT_URL` (port 5432) for CLI commands.
> `lib/prisma.ts` uses `DATABASE_URL` (port 6543) for app runtime queries.

---

## 6. Environment Variables

**`.env.local`:**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database (Dashboard → Connect → ORMs tab)
DATABASE_URL=postgres://prisma.[REF]:[PASSWORD]@[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgres://prisma.[REF]:[PASSWORD]@[REGION].pooler.supabase.com:5432/postgres

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Resend
RESEND_API_KEY=
EMAIL_FROM=no-reply@fdm.org

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Copy to `.env.example` with empty values — safe to commit. Keep `.env.local` in `.gitignore`.

---

## 7. Supabase Setup

1. New project → region: **Singapore**
2. Dashboard → Settings → API Keys → copy URL, Publishable key, service_role
3. Run in SQL Editor to create Prisma DB user:

```sql
CREATE USER "prisma" WITH PASSWORD 'strong_password' BYPASSRLS CREATEDB;
GRANT "prisma" TO "postgres";
GRANT USAGE, CREATE ON SCHEMA public TO prisma;
GRANT ALL ON ALL TABLES IN SCHEMA public TO prisma;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO prisma;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO prisma;
```

4. Dashboard → Authentication → URL Configuration:

```
Site URL:      http://localhost:3000
Redirect URLs: http://localhost:3000/auth/callback
               https://your-app.vercel.app/auth/callback
```

---

## 8. Core Library Files

**`lib/prisma.ts`**

```typescript
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const pool =
  globalForPrisma.pool ??
  new Pool({ connectionString: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== "production") globalForPrisma.pool = pool;

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**`lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
```

**`lib/supabase/server.ts`**

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    },
  );
}
```

**`lib/supabase/proxy.ts`**

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const publicPaths = ["/login", "/auth", "/scan"];
  const isPublic = publicPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p),
  );

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

**`proxy.ts`** — project root:

```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**`lib/cloudinary.ts`**

```typescript
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export type UploadFolder =
  | "fdm/avatars"
  | "fdm/qrcodes"
  | "fdm/posters"
  | "fdm/enthronements";

export async function uploadImage(
  file: string,
  folder: UploadFolder,
): Promise<string> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    allowed_formats: ["jpg", "png", "webp"],
  });
  return result.secure_url;
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
```

**`lib/email.ts`**

```typescript
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject,
    html,
  });
  if (error) throw new Error(error.message);
  return data;
}
```

**`next.config.ts`**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
```

---

## 9. VS Code

**Extensions:**

```
Prisma                  Prisma.prisma
Tailwind IntelliSense   bradlc.vscode-tailwindcss
ESLint                  dbaeumer.vscode-eslint
Prettier                esbenp.prettier-vscode
Pretty TS Errors        yoavbls.pretty-ts-errors
DotENV                  mikestead.dotenv
Error Lens              usernamehw.errorlens
```

**`.vscode/settings.json`:**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

---

## 10. Commands Reference

```bash
# Dev
npm run dev
npm run build                          # runs prisma generate && next build
npx tsc --noEmit                       # type check only

# Prisma
npx prisma generate
npx prisma db push
npx prisma db push --force-reset       # wipes all data and tables
npx prisma db seed                     # default seed file command
npx tsx prisma/seed-users.ts           # run custom seed files
npx prisma studio --config ./prisma.config.ts
npx prisma format
npx prisma migrate dev --name <name>

# shadcn
npx shadcn@latest add <component>

# Deploy
vercel
vercel --prod
```

---

## Setup Checklist

```
□ create-next-app with recommended defaults
□ All npm packages installed
□ npx shadcn@latest init — Default style, Neutral color, CSS vars: Yes
□ shadcn components installed
□ app/globals.css replaced with brand colors + shadcn overrides
□ npx prisma init — .env deleted
□ prisma/schema.prisma — provider = "prisma-client", output = "../generated/prisma"
□ prisma.config.ts — dotenv → .env.local, url = DIRECT_URL
□ .env.local filled in, .env.example committed, .gitignore has .env.local
□ Supabase: Singapore region, Prisma DB user created, redirect URLs set
□ Cloudinary: Cloud Name + API Key + API Secret copied
□ Resend: API key copied
□ All lib/ files created
□ next.config.ts has Cloudinary remotePatterns
□ FDM schema added to prisma/schema.prisma
□ npx prisma generate — success
□ npx prisma db push — success
□ npx prisma db seed — success
□ npm run dev — opens at localhost:3000
□ npx tsc --noEmit — zero errors
```

###### ---------------- ACCOUNT TO SETUP IN LIVE -------------------------------------------

### Google OAuth Setup

#### Part 1 — Google Cloud Console

- Go to console.cloud.google.com
- Click the project dropdown at the top → New Project
  - Name: FDM Community System
  - Click Create
- Make sure your new project is selected in the dropdown
- In Quick Access → APIs & Services → OAuth consent screen → Branding
  - App name: FDM Community System
  - User support email: your email
  - Developer contact email: your email
    Click Save and Continue

- Left sidebar → APIs & Services → Credentials
  - Click + Create Credentials → OAuth Client ID
  - Application type: Web application
  - Name: FDM Web
  - Under Authorized JavaScript origins — click Add URI:
    - http://localhost:3000

  - Under Authorized redirect URIs — click Add URI:
    - http://localhost:3000/auth/callback
  - Click Create

  - A popup appears with your credentials — copy and save both:
    - Client ID — looks like 123456789-abc.apps.googleusercontent.com
    - Client Secret — looks like GOCSPX-xxxxx

- Left sidebar → Data Access → Add or Remove Scopes
  - Add the following scopes:
    - email (.../auth/userinfo.email)
    - profile (.../auth/userinfo.profile)
    - openid (openid)

#### Part 2 — Supabase Dashboard

- Go to supabase.com → your project
- Left sidebar → Authentication → Sign in / Providers
- In Auth Providers below, find Google in the list → toggle Enable
- Paste your credentials from Google Console:
  - Client ID — from Step 6 above
  - Client Secret — from Step 6 above
- Copy the Callback URL (for OAuth) shown in Supabase — it looks like:
  - https://[your-ref].supabase.co/auth/v1/callback
- Head to Google Console and paste it on redirect URIs - it looks like:
  - https://[your-supa-base-url].supabase.co/auth/v1/callback
- Click Save

---

**When going live (church account)**

When you're ready to switch from test to production:

1. Google Cloud Console → OAuth consent screen → Branding → **Publish App**
   - This removes the test user restriction
   - Google may review your app (usually fast for basic OAuth)

2. Update **Authorized JavaScript origins** to add your production domain:
   - https://yourdomain.com

3. Update **Authorized redirect URIs** to add:
   - https://yourdomain.com/auth/callback
