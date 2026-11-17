# Coy · Discover

A production-quality, mobile-first discovery experience built for the Coy SDE intern assignment. Coy's **Home** tab stays an intentional placeholder; the product lives in **Discover**.

Part A of the assignment is in **[PART_A.md](./PART_A.md)**.

## The experience

- **32 seeded students** with photographic portraits, ages, cities, colleges, bios and interest tags. Ten have already liked the logged-in user, so mutual matches happen during a demo.
- **A premium swipe deck**: large editorial cards with a stacked preview, pointer drag and rotation, LIKE / NOPE stamps, spring-back, fly-out exits, keyboard shortcuts, and circular pass/like actions with hard neo-brutalist shadows.
- **Strictly mutual matching**: a match screen appears only after both people like each other. A one-sided like is never exposed by the UI or any response.
- **A real Matches section**: a photographic grid of every mutual match, matched times, an empty state, and a way back into Discover.
- **Loading, error and empty states** for the feed, matches, swipes and resets, with toast feedback for failures.
- **Persistence** in SQLite, so swipes and matches survive reloads and server restarts.
- **Responsive shell**: brand header, Home / Discover / Matches tabs with a live match badge, profile chip, and a proper bottom tab bar on phones. Tablets and desktops use the top navigation.

## Stack

- **Next.js 16 App Router + React 19 + TypeScript.** The brief requires literal `GET /feed`, `POST /swipe` and `GET /matches` routes, and the app was already built around Next route handlers. Keeping Next avoids adding a second Express server or breaking those contracts.
- **Tailwind CSS v4** for the design system and responsive layout.
- **Motion** (`motion/react`) for gestures, card exits, view transitions, match confetti and staggered match cards.
- **TanStack Query** for feed/matches state and the swipe mutation.
- **Zod** for request validation in `POST /swipe` and response validation in the browser.
- **Radix Dialog** with shadcn-style primitives, **Sonner** for toasts, and **Lucide** for icons.

## Quick start

Requires **Node.js 22.5+** because the app uses the built-in `node:sqlite` driver. Node 24 is recommended.

```bash
npm install
npm run dev
```

Open [http://localhost:3000/discover](http://localhost:3000/discover). The first request creates `data/coy.db` and seeds the 32 profiles. The file is gitignored; use **Reset demo** or `POST /reset` to start the demo over.

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build + typecheck |
| `npm start` | Run the production build |
| `npm run lint` | ESLint, including React Compiler rules |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Backend tests (`node:test` through `tsx`) |

## API

All endpoints return JSON and set `Cache-Control: no-store`.

### `GET /feed`

Profiles the logged-in user has not swiped on, in seed order.

```json
{
  "profiles": [
    {
      "id": "p01",
      "name": "Aanya",
      "age": 23,
      "city": "New Delhi",
      "college": "Hansraj College",
      "bio": "Economics by day, 35mm by night...",
      "interests": ["film photography", "indie music", "cold coffee"],
      "photo": "/portraits/p01.jpg"
    }
  ]
}
```

### `POST /swipe`

```json
{ "profileId": "p03", "direction": "like" }
```

```json
{ "match": true, "duplicate": false, "matchProfile": { "id": "p03", "name": "Meera" } }
```

- `direction` must be `"like"` or `"pass"`.
- `match` is true only when the user likes someone who had already liked them.
- A repeated swipe is idempotent: it returns `duplicate: true` with the existing match state and never creates a second match.
- Unknown profile → `404`; malformed body → `400`.

### `GET /matches`

```json
{
  "matches": [
    {
      "matchedAt": "2026-11-18T12:34:56.000Z",
      "profile": { "id": "p03", "name": "Meera", "photo": "/portraits/p03.jpg" }
    }
  ]
}
```

Only mutual matches exist here. There is no endpoint that returns who liked the user.

### `POST /reset`

Demo helper, not part of the assignment's required surface. Clears swipes and matches, leaving the seeded profiles intact. Returns `{ "ok": true, "remaining": 32 }`.

## How the double blind is enforced

`likes_you` is a private column on `profiles`. It is read in exactly one place — the match decision inside `recordSwipe` — and every response goes through `toPublicProfile`, which drops it.

- `GET /feed` only selects rows with no swipe, so a profile never comes back after a like or a pass.
- `GET /matches` joins the `matches` table, which is only written when `direction === "like" && profile.likes_you === 1`.
- Swipes and matches are unique per profile in SQLite, so retries and concurrent requests cannot duplicate them.
- The UI never imports the seed file, so the private `likesYou` flags cannot leak into the client bundle. It only knows the total profile count.
- Tests assert that serialized feed and swipe responses never contain `likesYou`, `likes_you`, or the id of a one-sided liker.

## Project structure

```text
src/
  app/
    page.tsx                 Home placeholder
    discover/page.tsx        Discover + Matches views
    layout.tsx               Fonts, providers, header, mobile nav
    feed/route.ts            GET /feed
    swipe/route.ts           POST /swipe (Zod-validated)
    matches/route.ts         GET /matches
    reset/route.ts           POST /reset (demo)
  components/
    site-header.tsx          Brand, top navigation, match badge, profile
    bottom-nav.tsx           Phone tab bar
    providers.tsx            TanStack Query + Sonner
    ui/                      Button and Radix dialog primitives
    discover/
      discover-client.tsx    Query orchestration, view switching, matching
      swipe-card.tsx         Drag, stamps, exits, keyboard, actions
      swipe-deck.tsx         Top card + stack previews
      profile-card.tsx       Editorial profile card
      match-dialog.tsx       Celebration + both portraits
      matches-view.tsx       Matches grid, empty/error/loading states
      discover-aside.tsx     Privacy promise + recent matches
      empty-state.tsx        End-of-feed state
      *-skeleton.tsx         Loading states
  lib/
    types.ts                 Shared domain types
    profiles.seed.ts         32 profiles (with the private likesYou flag)
    db.ts                    SQLite schema, seed upsert
    store.ts                 Feed, swipe/match transactions, reset, singleton
    schemas.ts               Shared Zod schemas
    api.ts                   Validated client fetchers
    queries.ts               TanStack Query hooks
public/portraits/            32 locally hosted portraits + the user's photo
tests/store.test.ts          12 backend tests
```

The store takes a `DatabaseSync` handle, so tests run against a throwaway SQLite file. `getStore()` is the singleton used by route handlers and is cached on `globalThis` across dev-server reloads.

`openDatabase()` **upserts** the seed on every open. Demo content can evolve without discarding a reviewer's swipes, and a database created by an older build never points at deleted assets. Swipes and matches live in separate tables and are untouched by the upsert.

If the database file cannot be opened (for example on a read-only serverless filesystem), the app logs a warning and falls back to an in-memory database so the demo still runs — persistence then lasts only as long as the process.

## Verification

Last run:

```bash
npm test        # 12 passing backend tests
npm run lint    # clean
npm run typecheck
npm run build   # production build succeeds
```

A headless-Chrome pass against the production server covered:

- **390 × 844 phone**: drag-to-pass changes the card, like → match opens the modal, Matches tab shows the match, reload preserves it, and the action row sits above the bottom tab bar.
- **820 × 1180 tablet** and **1440 × 900 desktop**: card and actions fit, tablet uses the top navigation without a duplicate bottom bar.
- **No console errors, page errors or HTTP 4xx responses** during the pass.

The browser pass was a development check; the reusable automated suite is the 12 backend tests. Add API/UI tests before treating the UI as regression-covered.

## Photo credits

Portraits are sourced from [Pexels](https://www.pexels.com) and stored locally in `public/portraits`, so the demo makes no third-party image requests at runtime. Pexels photos are free to use under the Pexels license. The included images are mock profile data for this assignment.

## Deployment notes

SQLite needs a **persistent, writable disk**:

- Railway, Render, Fly.io, or a VPS with a volume are a good fit. Point `COY_DB_PATH` at the mounted volume.
- Vercel's serverless filesystem is read-only; the app falls back to an in-memory store, so swipes would not survive a cold start. To deploy there, swap the store for Postgres (the `Store` interface is the only thing the routes know about).

No authentication is included, by design: the brief assumes a single logged-in user.

## Design decisions

- **Exact API paths.** The brief names `GET /feed`, `POST /swipe`, and `GET /matches`, so those are the real routes rather than `/api/*` equivalents.
- **Matches is both a view and a navigation destination.** It lives inside the Discover experience at `/discover?view=matches`, with Home / Discover / Matches in both the top and bottom navigation.
- **Local photography.** Portraits are pre-cropped 4:5 files committed to the repo, so the deck looks consistent and the demo has no image API keys or runtime hotlinking.
- **No undo.** The brief says a swiped profile must never reappear; adding undo would contradict that rule and the matching model.
- **One-sided likes stay private.** There is no "who liked you" list, hint, or count anywhere in the product.
