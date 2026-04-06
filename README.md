# Designspo — browser extension & API

This folder is the **Chrome extension** plus a small **Express** backend for **Designspo**: capture the current tab as a screenshot, add tags and details, and save everything to your account (Supabase auth + **PostgreSQL** via **Prisma**).

- **`client/`** — Manifest V3 extension UI (**Vite**, **React**, **TypeScript**, **Tailwind**).
- **`backend/`** — REST API (**Express**, **Prisma**, JWT middleware).

The main **Next.js** site and dashboard live in the sibling **`designspo-webpage`** project.

## Run locally

See each package’s `package.json` for scripts (e.g. `npm run dev` in `client/` and `backend/`). Set `DATABASE_URL` and Supabase-related env vars for the backend.
