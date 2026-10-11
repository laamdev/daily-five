# Daily Five

A minimalist daily habit tracker for two. Each day you each check off five things:

| Category | Examples |
| --- | --- |
| **Physical** | walk, gym, yoga |
| **Social** | call family, coffee with a friend, work from a café |
| **Mental** | reading, crossword, meditation |
| **Home** | tidy the bedroom, organize the closet, vacuum |
| **Growth** | practice music, learn something, side project |

…and close the day with a journal entry (private unless you share it). Link accounts with your partner to see each other's day live and earn badges together.

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

Deploy the Next.js app to Vercel and set the build command to
`npx convex deploy --cmd 'npm run build'` with a `CONVEX_DEPLOY_KEY` from the Convex dashboard. Use Clerk production keys and set `CLERK_JWT_ISSUER_DOMAIN` on the production Convex deployment.
