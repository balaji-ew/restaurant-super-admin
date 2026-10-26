# Admin Portal Template

A clean, modular, and production-ready Next.js admin console template built with TypeScript, Tailwind CSS, TanStack React Query, NextAuth.js, and Server-Sent Events (SSE).

Designed as an extensible foundation for building enterprise admin consoles, multi-tenant dashboards, and back-office tools.

---

## Features & Architecture

- **Authentication & Session Management**:
  - Full NextAuth.js integration (`next-api/auth/[...nextauth]`) with Credentials Provider.
  - JWT session storage with automatic token refresh, token rotation, and skew handling.
  - Protected route shell (`(protected)/layout.tsx`) that enforces authentication and gracefully handles expired sessions.
  - Working staff self-service profile and password modification (`settings/profile`).
- **Real-time Server-Sent Events (SSE)**:
  - Background live event listener (`components/admin/layout/live-updates.tsx`).
  - Automatic reconnection, query invalidation scheduling, and token rotation synchronization.
- **State Management & Query Caching**:
  - TanStack React Query store (`lib/admin/store.ts`) with `useCollection`, `useRecord`, and `mutate`.
  - Cache deduplication, pagination helpers, and background revalidation.
- **Network & API Client**:
  - Centralized Axios client (`lib/api.ts`) with automatic bearer token injection from session.
  - Standardized error envelope normalizer (`lib/api-error.ts`).
- **Design System & Layout**:
  - 70+ reusable components (`components/ui` and `components/admin/common`).
  - Responsive layout with collapsible mobile drawer, fixed header, and customizable sidebar (`config/menu.config.tsx`).
  - Role-based presentation matrix (`lib/admin/permissions.ts` and `providers/viewer-provider.tsx`).

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and set your configuration:

```bash
cp .env.example .env.local
```

| Variable                   | Description                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API origin (e.g., `http://localhost:8080`). The `/v1` prefix is appended automatically.    |
| `NEXTAUTH_SECRET`          | Secret key used to encrypt and sign JWT tokens.                                                   |
| `NEXTAUTH_URL`             | Origin of this admin portal (e.g., `http://localhost:3001`).                                      |
| `NEXT_PUBLIC_BASE_PATH`    | Base path if running behind a reverse proxy or sub-path.                                          |

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## Available Scripts

```bash
npm run dev         # Starts the local development server (port 3001)
npm run build       # Creates an optimized production build
npm run start       # Starts the production server
npm run typecheck   # Runs TypeScript type check (tsc --noEmit)
npm run lint        # Runs ESLint code quality checks
npm run format      # Formats code with Prettier
```

---

## How to Add New Modules

1. **Define Types**: Add your data models in `lib/admin/types.ts` or a new file in `types/`.
2. **API Methods**: Add typed endpoints to `lib/admin/api.ts` using `apiGet`, `apiPost`, `apiPatch`, or `apiDelete`.
3. **Register Routes**: Create a new route folder under `app/(protected)/your-module/page.tsx`.
4. **Sidebar Navigation**: Add your menu item to `config/menu.config.tsx`:
   ```tsx
   {
     title: 'Your Module',
     icon: YourLucideIcon,
     path: '/your-module',
     permission: 'your_module.view',
   }
   ```
5. **Real-time Invalidation (Optional)**: If your backend emits SSE events for this module, register your event mapping in `components/admin/layout/live-updates.tsx`:
   ```tsx
   export const EVENT_INVALIDATIONS: Record<string, string[][]> = {
     'your_module.changed': [['your-query-key']],
   };
   ```
