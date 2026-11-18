# Coy · Discover

A production-quality, mobile-first discovery experience built for the Coy SDE intern assignment.  
Part A of the assignment — product thinking, two feature proposals — is in **[PART_A.md](./PART_A.md)**.

---

## What's built

| Area | What you get |
|---|---|
| **Discover feed** | 32 seeded students with portraits, ages, cities, colleges, bios, and interest tags |
| **Swipe deck** | Drag with rotation, LIKE / NOPE stamps, spring-back, fly-out exits, stacked card preview, keyboard shortcuts |
| **Matching** | Strictly mutual — a match screen appears only when both sides have liked each other |
| **Matches section** | Photographic grid of every mutual match with timestamps, empty / error / loading states |
| **Persistence** | SQLite — swipes and matches survive reloads and server restarts |
| **Responsive shell** | Top nav on tablet / desktop, bottom tab bar on mobile, live match badge on both |
| **States** | Skeleton loaders, error states with retry, empty state when the feed is exhausted, toast feedback for every failure |

---

## Quick start

Requires **Node.js 22.5+** (uses the built-in `node:sqlite` driver). Node 24 is recommended.

```bash
npm install
npm run dev
```

Open [http://localhost:3000/discover](http://localhost:3000/discover).

The first request creates `data/coy.db` and seeds 32 profiles. The file is gitignored. Use the **Reset demo** button in the app, or `POST /reset`, to start over.

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build + type-check |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (including React Compiler rules) |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | 12 backend tests via `node:test` + `tsx` |

---

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | **Next.js 16 App Router + React 19 + TypeScript** | Assignment requires literal `GET /feed`, `POST /swipe`, `GET /matches` routes; Next route handlers serve those directly without a second server |
| Styling | **Tailwind CSS v4** | Design system, responsive utilities, mobile-first layout |
| Animation | **Motion (`motion/react`)** | Drag gestures, card exits, match celebration, staggered grids |
| Data fetching | **TanStack Query v5** | Feed / matches state, optimistic swipe mutation, automatic refetch |
| Validation | **Zod v4** | Server-side request validation on `POST /swipe`, client-side response validation on every fetch |
| UI primitives | **Radix Dialog**, **Sonner** (toasts), **Lucide** (icons) | Accessible dialog, unstyled toasts, consistent icon set |
| Database | **SQLite (`node:sqlite`)** | Zero-config persistence, no external service required for the demo |

---

## API

All endpoints return `application/json` and set `Cache-Control: no-store`.

### `GET /feed`

Returns profiles the logged-in user has not yet swiped on, in seed order.

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

**Request**
```json
{ "profileId": "p03", "direction": "like" }
```

**Response**
```json
{ "match": true, "duplicate": false, "matchProfile": { "id": "p03", "name": "Meera", "photo": "/portraits/p03.jpg" } }
```

- `direction` must be `"like"` or `"pass"`.
- `match: true` only when the user likes someone who has already liked them. A pass on a one-sided liker always returns `match: false`.
- Repeated swipes are idempotent: `duplicate: true` is returned with the existing match state; no second match is created.
- Unknown profile → `404`. Malformed or missing body → `400`.

### `GET /matches`

```json
{
  "matches": [
    {
      "matchedAt": "2026-11-18T12:34:56.000Z",
      "profile": {
        "id": "p03",
        "name": "Meera",
        "age": 21,
        "city": "Mumbai",
        "college": "St. Xavier's College",
        "bio": "...",
        "interests": ["..."],
        "photo": "/portraits/p03.jpg"
      }
    }
  ]
}
```

Only mutual matches appear here. There is no endpoint, field, or count that reveals one-sided likes.

Ordered newest-first by `matched_at`.

### `POST /reset` *(demo helper)*

Clears swipes and matches, leaving the seeded profiles intact.

```json
{ "ok": true, "remaining": 32 }
```

---

## How the double-blind is enforced

The core invariant: **a like is never revealed unless it is mutual — not through a count, not through a flag, not through a paid upgrade.**

- `likes_you` is a private column on the `profiles` table. It is read in exactly one place: the match condition inside `recordSwipe`.
- Every API response goes through `toPublicProfile`, which drops `likes_you`. There is no other serialization path.
- `GET /feed` excludes profiles with an existing swipe row in either direction, so a profile never reappears after a like or a pass.
- `GET /matches` queries the `matches` table, which is written only when `direction === "like" && likes_you === 1`.
- A `BEGIN IMMEDIATE` SQLite transaction wraps every swipe, preventing a concurrent-request race condition.
- A unique-primary-key constraint on `swipes(profile_id)` guarantees exactly-once writes even under retries.
- The seed file (`profiles.seed.ts`) is imported only by `src/lib/db.ts` (a server-only module). The client bundle never sees `likesYou` flags; it only knows the total profile count.
- 12 backend tests assert that serialized feed and swipe responses never contain `likesYou`, `likes_you`, or the id of a one-sided liker, and that a pass on a liker is never a match.

---

## Swipe experience

| Interaction | Behaviour |
|---|---|
| **Drag** | Card rotates ±15° as it moves; LIKE stamp fades in on the right, NOPE on the left |
| **Release past threshold** | Card flies off screen (0.28 s), API call fires, next card rises |
| **Release before threshold** | Card springs back to centre (`stiffness: 420, damping: 32`) |
| **Pass / Like buttons** | Identical to drag commit; card exits in the appropriate direction |
| **Keyboard** | `→` / `ArrowRight` = like, `←` / `ArrowLeft` = pass; blocked while a dialog is open or a form element is focused |
| **Stacked preview** | The next two cards are visible behind the top card, offset by scale and y-position |
| **While match dialog is open** | Deck is fully disabled (drag and buttons) until the dialog is dismissed |

---

## Matching flow

```
POST /swipe { profileId, direction: "like" }
  │
  ├─ profile not found?         → 404
  ├─ already swiped?            → { duplicate: true, match: <existing state> }
  │
  ├─ BEGIN IMMEDIATE
  │   INSERT INTO swipes
  │   if likes_you = 1 → INSERT OR IGNORE INTO matches
  │   COMMIT
  │
  └─ { match: true/false, duplicate: false, matchProfile? }
```

On `match: true`, the client opens the match dialog (both portraits, heart animation) and optimistically prepends the new match to the matches cache. The dialog is the only moment the other person's name is shown — it is never hinted at before this point.

---

## Project structure

```
src/
  app/
    page.tsx                Home placeholder
    discover/page.tsx       Discover + Matches views (Suspense boundary)
    layout.tsx              Fonts, providers, header, mobile nav
    feed/route.ts           GET /feed
    swipe/route.ts          POST /swipe  (Zod-validated)
    matches/route.ts        GET /matches
    reset/route.ts          POST /reset  (demo helper)
  components/
    site-header.tsx         Brand, top nav, live match badge, profile chip
    bottom-nav.tsx          Mobile tab bar (md:hidden)
    providers.tsx           TanStack Query + Sonner
    ui/                     Button + Radix Dialog primitives
    discover/
      discover-client.tsx   Query orchestration, view switching, match state
      swipe-card.tsx        Drag, stamps, exits, keyboard, action buttons
      swipe-deck.tsx        Top card + two stacked previews
      profile-card.tsx      Editorial profile card layout
      match-dialog.tsx      Celebration screen (portraits + heart burst)
      matches-view.tsx      Match grid, empty / error / loading states
      discover-aside.tsx    Desktop sidebar — privacy promise + recent matches
      empty-state.tsx       End-of-feed state with reset and matches links
      deck-skeleton.tsx     Loading state for the swipe deck
      discover-skeleton.tsx Full-page loading skeleton
  lib/
    types.ts                Shared domain types (PublicProfile, SwipeOutcome, …)
    profiles.seed.ts        32 profiles including the private likesYou flag
    db.ts                   SQLite schema creation + seed upsert
    store.ts                Feed, swipe/match transactions, reset, singleton
    schemas.ts              Shared Zod schemas
    api.ts                  Validated client fetchers
    queries.ts              TanStack Query hooks + mutations
public/
  portraits/                32 locally hosted 4:5 portraits + me.jpg
tests/
  store.test.ts             12 backend tests (node:test)
```

### Key architectural notes

- **Store singleton.** `getStore()` is cached on `globalThis` so dev-server hot reloads reuse the same SQLite connection rather than leaking file handles.
- **Seed upsert.** `openDatabase()` upserts the seed on every open. Demo content can evolve without discarding a reviewer's existing swipes, and a database created by an older build never points at a deleted asset. Swipes and matches are untouched.
- **In-memory fallback.** If the database file cannot be opened (read-only serverless filesystem), the app logs a warning and falls back to `:memory:`. The demo still runs; persistence lasts only as long as the process.
- **Optimistic UI.** `handleSwiped` removes the card from the feed cache immediately after the animation completes and the API responds. On a match, the new match is prepended to the matches cache without waiting for a refetch.

---

## Verification

```bash
npm test        # 12 passing backend tests
npm run lint    # clean
npm run typecheck
npm run build   # production build succeeds
```

Manual browser pass on production build:

| Viewport | Checks |
|---|---|
| **390 × 844** (phone) | Drag-to-pass changes the card; like on a pre-liker opens the match dialog; Matches tab shows the match; reload preserves it; action row sits above the bottom tab bar |
| **820 × 1180** (tablet) | Card and actions fit; top navigation shown; no duplicate bottom bar |
| **1440 × 900** (desktop) | Aside panel visible; nav pill; match badge updates after a swipe |

No console errors, page errors, or HTTP 4xx responses during the pass.

---

## Design decisions

- **Exact API paths.** The brief names `GET /feed`, `POST /swipe`, and `GET /matches`, so those are the real routes — not `/api/*` wrappers.
- **Matches lives inside Discover.** It is a view switch at `/discover?view=matches`, not a separate page. Home / Discover / Matches each appear in both the top nav and the bottom tab bar.
- **Local photography.** 32 portraits are pre-cropped 4:5 files committed to the repo. The deck looks consistent and the demo makes zero third-party image requests at runtime.
- **No undo.** The brief states a swiped profile must never reappear; undo would contradict that rule and the matching model.
- **One-sided likes stay private.** There is no "who liked you" list, hint, or count anywhere in the product — not even after a pass.
- **`TOTAL_PROFILES = 32` constant.** The feed's total count is not returned by `GET /feed`. The client derives progress from this constant. It is intentionally server-authoritative; if the seed ever changes, update this constant alongside it.

---

## Deployment

SQLite requires a **persistent, writable disk**:

- **Railway, Render, Fly.io, or any VPS with a volume** are a natural fit. Set `COY_DB_PATH` to point at the mounted path.
- **Vercel** has a read-only serverless filesystem. The app falls back to an in-memory store (swipes will not survive a cold start). To deploy on Vercel, replace the SQLite store with Postgres — the `Store` interface in `store.ts` is the only thing route handlers depend on.

No authentication is included by design; the brief assumes a single logged-in user.

---

## Photo credits

Portraits are sourced from [Pexels](https://www.pexels.com) and stored locally in `public/portraits/`, so no third-party image requests are made at runtime. Pexels photos are free to use under the [Pexels License](https://www.pexels.com/license/). The included images are mock profile data for this assignment only.
