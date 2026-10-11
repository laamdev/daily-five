# Daily Five

A minimalist daily habit tracker for two. Each day you each check off five things:

| Category | Examples |
| --- | --- |
| **Physical** | walk, gym, yoga |
| **Social** | call family, coffee with a friend, work from a café |
| **Mental** | reading, crossword, meditation |
| **Home** | tidy the bedroom, organize the closet, vacuum |
| **Growth** | practice music, learn something, side project |

…and close the day with a journal entry. Link accounts with your partner to see each other's earned badges and unlock couple badges. Everything else is private by default: each of you can opt in to sharing your daily checklist, and journal entries are shared one day at a time.

**Stack:** Next.js 16 (App Router) · Tailwind v4 · shadcn/ui (Base UI) · Clerk · Convex

## Setup

```bash
npm install
```

### 1. Clerk

1. Create an application at [dashboard.clerk.com](https://dashboard.clerk.com).
2. Copy the publishable and secret keys into `.env.local` (see `.env.local.example`).
3. In Clerk, open **Integrations → Convex** and activate it. (Alternatively create a JWT template named `convex`.)
4. Copy your **Frontend API URL** (looks like `https://xxx.clerk.accounts.dev`).

> Without keys, Clerk runs in keyless dev mode so you can click around, but Convex won't accept those sessions until step 3 is done.

### 2. Convex

The project was scaffolded against a local, account-less Convex deployment. To use your own Convex account:

```bash
npx convex login
npx convex dev --configure new
```

Then tell Convex which Clerk app to trust:

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://xxx.clerk.accounts.dev
```

### 3. Run

In two terminals:

```bash
npx convex dev
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npx convex dev` | Convex dev server + codegen (keep it running) |
| `npm test` | Backend tests (convex-test + Vitest) |
| `npm run build` | Production build |

## Project layout

```
app/                    routes: / (landing), /today, /day/[date], /history, /badges, /us
components/             day view, activity rows, journal, progress ring, app shell
convex/                 schema + functions (users, couples, days, badges) and tests
lib/categories.ts       the five categories (shared by UI and backend)
lib/badges.ts           badge catalog and rules
lib/dates.ts            local YYYY-MM-DD helpers and streak math
proxy.ts                Clerk route protection
```

## Deploying

| Piece | Where |
| --- | --- |
| Web app | Vercel project `laam-dev/daily-five`, redeploys on every push to `main` |
| Database (prod) | Convex project `daily-five`, prod deployment `uncommon-platypus-64` |
| Database (dev) | Convex dev deployment `astute-flamingo-198` (what `npx convex dev` uses) |
| Auth | Clerk app "Daily Five", development instance (shared by local and prod) |

Vercel only builds the Next.js app. **When you change anything in `convex/`, deploy the backend yourself:**

```bash
npx convex deploy
```

Vercel environment variables (Production + Preview): `NEXT_PUBLIC_CONVEX_URL` (prod Convex URL),
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` and the four `NEXT_PUBLIC_CLERK_*_URL` routes.

To move auth to Clerk production later you need your own domain: create the production instance in
Clerk, add its DNS records, swap the keys in Vercel and set `CLERK_JWT_ISSUER_DOMAIN` on the prod
Convex deployment (`npx convex env set --prod ...`).
