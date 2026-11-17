# Coy · Discover

A standalone, mobile-first swipe discovery tab built for the Coy SDE intern assignment. The tab bar keeps Coy's **Home** tab intentionally blank and puts the whole experience in **Discover**.

Part A of the assignment lives in **[PART_A.md](./PART_A.md)**.

## What it does

- **32 seeded people** with a name, age, photo, short bio, city/college, and interests. Ten of them have already liked the logged-in user, so mutual matches happen during a demo.
- **One card at a time.** Drag right to like, left to pass; buttons work on desktop; `←` / `→` also work. Cards tilt, show LIKE / NOPE stamps, and fly out with a springy transition.
- **Matching is strictly mutual.** A one-sided like is never revealed anywhere in the UI or the API. A mutual like opens an "It's a match!" screen immediately.
- **A Matches view** inside Discover with every mutual match and when it happened.
- **Persistence** in SQLite, so swipes and matches survive reloads and server restarts.
- **Clear empty state** when the feed runs out, with a one-click demo reset.

## Quick start

Requires **Node.js 22.5+** (the app uses the built-in `node:sqlite` driver). Node 24 is recommended.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then tap **Discover**.

The first request creates `data/coy.db` and seeds it with the 32 profiles. The file is gitignored; delete it or use **Reset demo** to start over.

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm test` | Backend tests (`node:test` through `tsx`) |
| `npm run lint` | ESLint, including React Compiler rules |
| `npm run typecheck` | TypeScript, no emit |
| `npm run avatars` | Regenerate the local SVG avatars |

## API

All endpoints return JSON and set `Cache-Control: no-store`.

### `GET /feed`

Returns profiles the logged-in user has not swiped on, in seed order.

```json
{
  "profiles": [
    {
      "id": "p01",
      "name": "Aanya",
      "age": 23,
      "city": "New Delhi",
      "college": "Hansraj College",
      "bio": "Economics by day, film camera by night...",
      "interests": ["film photography", "indie music", "cold coffee"],
      "photo": "/avatars/p01.svg"
    }
  ]
}
```

### `POST /swipe`

```json
{ "profileId": "p03", "direction": "like" }
```

```json
{ "match": true, "duplicate": false, "matchProfile": { "id": "p03", "name": "Kabir", "...": "..." } }
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
      "matchedAt": "2026-11-17T12:34:56.000Z",
      "profile": { "id": "p03", "name": "Kabir", "...": "..." }
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
- Tests assert that the serialized feed and swipe responses never contain `likesYou`, `likes_you`, or the id of a one-sided liker.

## Architecture

```
src/
  app/
    page.tsx              Home placeholder
    discover/page.tsx     Discover tab
    feed/route.ts         GET /feed
    swipe/route.ts        POST /swipe
    matches/route.ts      GET /matches
    reset/route.ts        POST /reset (demo)
  components/             Tab bar, deck, card, match modal, matches list, empty state
  lib/
    types.ts              Shared domain types
    profiles.seed.ts      32 profiles (with the private likesYou flag)
    db.ts                 SQLite schema, migration, seeding
    store.ts              Feed, swipe/match transactions, reset, singleton
    http.ts               JSON error + no-store helpers
public/avatars/           Locally generated SVG portrait placeholders
scripts/                  Avatar generator
tests/store.test.ts       11 backend tests
```

The store takes a `DatabaseSync` handle, so tests run against a throwaway SQLite file. `getStore()` is the singleton the route handlers use and caches the handle on `globalThis` across HMR reloads.

If the database file cannot be opened (for example on a read-only serverless filesystem), the app logs a warning and falls back to an in-memory database so the demo still runs — persistence then lasts only as long as the process.

## Verification

```bash
npm test        # 11 passing tests
npm run lint    # clean
npm run build   # production build + typecheck
```

Tests cover seeding, feed ordering and exclusion, mutual vs one-sided likes, privacy of the `likesYou` flag, idempotent swipes, persistence across reopening the database, reset, and invalid profile ids.

## Deployment notes

The assignment asks for a standalone public repo, and the demo is designed to run locally. SQLite needs a **persistent, writable disk**:

- Railway, Render, Fly.io, or a VPS with a volume are a good fit. Point `COY_DB_PATH` at the mounted volume.
- Vercel's serverless filesystem is read-only; the app falls back to an in-memory store, so swipes would not survive a cold start. To deploy there, swap the store for Postgres (the `Store` interface is the only thing the routes know about).

No authentication is included, by design: the brief assumes a single logged-in user.

## Design decisions

- **Exact API paths.** The brief names `GET /feed`, `POST /swipe`, and `GET /matches`, so those are the real routes rather than `/api/*` equivalents. **Matches** is a view inside the Discover tab instead of a third tab, keeping the tab bar to Home + Discover.
- **Local avatars.** Photos are generated SVGs committed in `public/avatars`, so the demo has no external image requests, API keys, or licensing questions.
- **Single-user SQLite schema.** Swipes are unique by profile, which is what makes "a swiped profile never returns" a database guarantee.
- **No undo.** The brief says a swiped profile must never reappear; adding an undo would contradict that rule and the matching model.
