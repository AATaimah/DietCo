# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 8080
npm run build        # Production build
npm run lint         # Run ESLint
npm run test         # Run Vitest tests once
npm run test:watch   # Run tests in watch mode
npm run preview      # Preview production build
```

## Architecture

**DietCo** is a B2B2C e-commerce SPA for pharmaceutical/dietary supplement distribution, built with React 18 + TypeScript + Vite.

### Tech Stack
- **React Router v6** for routing, **React Hook Form + Zod** for forms
- **Supabase** (REST API, no SDK) for auth and data — client in `src/lib/supabase.ts`
- **shadcn/ui** (Radix UI) + **Tailwind CSS** for UI
- **TanStack React Query** for server state
- **Google Maps API** via `useGoogleMaps` hook for address input

### State Management
Three global Context providers (composed in `src/main.tsx`):
- `useAuth` — Supabase authentication state
- `useCart` — shopping cart (persisted in localStorage)
- `useI18n` — English/Arabic translations (persisted in localStorage), RTL layout support

Translation strings live in `src/locales/en.json` and `src/locales/ar.json`. Access via the `useI18n` hook's `t()` function.

### Data Flow
Pages → Components → Hooks → `src/lib/supabase.ts` (direct REST calls to Supabase)

Product catalog is currently hardcoded in `src/data/mockProducts.ts`.

### Key Paths
- `src/pages/` — 8 route pages (Index, Order, Checkout, Auth, Profile, Orders, Contact, NotFound)
- `src/components/ui/` — 50+ shadcn/ui primitives (do not edit these)
- `src/components/checkout/` — AddressInput, CardInputForm, OrderSummary, PaymentMethodSelector
- `src/hooks/` — useCart, useAuth, useI18n, useGoogleMaps, useMobile, useToast
- `supabase/schema.sql` — Postgres database schema

### Path Alias
`@/` maps to `src/` — use this for all internal imports.
