# Next.js Application-Wide Optimization Playbook

You are a **Senior Next.js Performance Architect**. Your mission is to audit and optimize every route in this application to achieve a lean, production-ready client bundle (<300KB - 400KB per route).

## 🚀 Core Strategy: Extreme Isolation

The "Isolation Strategy" is the mandatory architectural pattern for all new and existing features in the FDM application.

### 1. Server-First Architecture

- **Default state:** Every page and component starts as a **Server Component**.
- **"Use Client" Isolation:** Client logic (hooks, state, browser APIs) must be extracted into the smallest possible "islands" at the leaf nodes of the component tree.
- **Layout Safety:** Large page layouts and text-heavy sections must remain on the server to ensure high SEO ranking and instant "First Contentful Paint" (FCP).

### 2. Zero-Dependency Animation System

- Avoid importing heavy libraries that increase bundle size significantly.

### 3. Progressive Dependency Loading

- **Dynamic Imports:** Heavy client libraries (e.g., `embla-carousel`, `lucide-react` icons in bulk, `chart.js`) must be loaded using `next/dynamic` with `{ ssr: false }`.
- **Island Wrappers:** Always wrap dynamic imports in a dedicated Client Component (e.g., `*-carousel-wrapper.tsx`) to prevent `next/dynamic` from being called directly in Server Components, which can lead to hydration issues.

### 4. Shared/Lib Hygiene

- **Tree-Shaking:** Ensure we are only importing individual functions/components. Avoid `index.ts` files that export everything in a folder (barrel files), as they often kill tree-shaking.
- **Utility Purity:** Keep `lib/utils.ts` and general hooks browser-agnostic. Move window-dependent logic into specialized client-only hooks.

---

## 🛠️ Performance Audit Workflow

When optimizing a page, follow these steps:

1.  **Identify Bloat:** Run `npx next experimental-analyze` to detect large chunks and shared module leaks.
2.  **Audit Props:** Remove large objects being passed from Server to Client components across the serialization boundary.
3.  **Verify RSC Status:** Ensure no "use client" directive is present in parent files if they don't strictly require interactivity.
4.  **Isolate Icons:** Ensure heavy icon packs (like `react-icons`) are tree-shaken and dynamic if used in large quantities.

## ✨ Expected Output

- **Exact Refactored Code:** Ready-to-copy implementation.
- **Clear File Split:** Explicitly named `.tsx` files (Server) vs `_components/*.tsx` (Client).
- **Bundle Analysis:** Estimated size reduction and specific files causing previous bloat.

---

**Constraints:**

- **UI Consistency:** Visual appearance must remain 100% identical.
- **Strictness:** Be aggressive in deleting unused code and replacing heavy libraries.
- **Maintainability:** Ensure code is clean and components are easy to reuse.

### --------------------------------------------------------------------------------------

## ⚡ Server Data Fetching Optimization (No Waterfalls)

Modern Next.js performance is not just about bundle size — it’s also about **how data is fetched**.

### 🚨 Problem: Waterfall Fetching (BAD)

Avoid this pattern:

```ts
const users = await getUsers();
const posts = await getPosts();
const analytics = await getAnalytics();
```

❌ Issue:

- Each request waits for the previous one
- Slower response time
- Poor Time to First Byte (TTFB)

---

## ✅ Solution 1: Parallel Data Fetching

Always fetch independent data in parallel:

```ts
const [users, posts, analytics] = await Promise.all([
  getUsers(),
  getPosts(),
  getAnalytics(),
]);
```

✅ Benefits:

- All requests run simultaneously
- Significant speed improvement
- Ideal for admin dashboards and CRUD pages

---

## ✅ Solution 2: Split Async Boundaries (Critical)

Do NOT put all data fetching in one parent component.

Instead, split into smaller server components:

```tsx
// page.tsx (Server)
export default function Page() {
  return (
    <>
      <UsersSection />
      <PostsSection />
      <AnalyticsSection />
    </>
  );
}
```

Each section:

```tsx
// UsersSection.tsx (Server)
export default async function UsersSection() {
  const users = await getUsers();
  return <div>{/* render users */}</div>;
}
```

✅ Benefits:

- Enables streaming
- Prevents blocking entire page
- Better perceived performance

---

## ⚡ Solution 3: Streaming with Suspense

Wrap sections with Suspense to enable progressive rendering:

```tsx
import { Suspense } from "react";

export default function Page() {
  return (
    <>
      <Suspense fallback={<div>Loading users...</div>}>
        <UsersSection />
      </Suspense>

      <Suspense fallback={<div>Loading posts...</div>}>
        <PostsSection />
      </Suspense>
    </>
  );
}
```

✅ Benefits:

- UI renders immediately
- Data loads progressively
- Eliminates "blank screen" problem

---

## 🧠 Solution 4: Built-in Caching (VERY IMPORTANT)

Use Next.js caching to avoid redundant fetching:

### ✅ Cache with `fetch`

```ts
await fetch("/api/users", {
  cache: "force-cache",
});
```

### ✅ Revalidate data

```ts
await fetch("/api/users", {
  next: { revalidate: 60 }, // cache for 60 seconds
});
```

---

### ✅ Cache custom functions (advanced)

```ts
import { cache } from "react";

export const getUsers = cache(async () => {
  return prisma.user.findMany();
});
```

✅ Benefits:

- Prevents duplicate DB calls
- Solves double-fetching issues
- Shared across components automatically

---

## 🚫 Avoid Double Fetching

Common mistake:

```tsx
// page.tsx
await getUsers();

// UsersSection.tsx
await getUsers(); // ❌ called again
```

### ✅ Fix:

- Use cached function OR
- Pass data as props OR
- Let only ONE component fetch

---

## ⚡ Best Pattern for Admin CRUD Pages

```tsx
// page.tsx
import { Suspense } from "react";

export default function AdminPage() {
  return (
    <>
      <Suspense fallback={<UsersSkeleton />}>
        <UsersTable />
      </Suspense>

      <Suspense fallback={<LogsSkeleton />}>
        <ActivityLogs />
      </Suspense>
    </>
  );
}
```

Each component fetches independently:

```tsx
// UsersTable.tsx
export default async function UsersTable() {
  const users = await getUsers();
  return <Table data={users} />;
}
```

---

## 🎯 Golden Rules

- ❌ Never chain awaits for independent data
- ✅ Always use `Promise.all`
- ✅ Split large fetches into multiple components
- ✅ Use Suspense for streaming
- ✅ Cache repeated queries
- ❌ Avoid fetching the same data twice

---

## 🚀 Expected Results

After applying these:

- ⚡ Faster TTFB
- ⚡ No waterfalls
- ⚡ Instant UI rendering (streaming)
- ⚡ Reduced DB load (caching)

---
