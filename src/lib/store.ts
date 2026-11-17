import type { DatabaseSync } from "node:sqlite";
import { join } from "node:path";
import { openDatabase } from "./db";
import type { MatchSummary, PublicProfile, SwipeDirection } from "./types";

interface ProfileRow {
  id: string;
  name: string;
  age: number;
  city: string;
  college: string;
  bio: string;
  interests: string;
  photo: string;
  likes_you: number;
  matched_at?: string;
}

export type StoreErrorCode = "PROFILE_NOT_FOUND";

export class StoreError extends Error {
  readonly code: StoreErrorCode;

  constructor(code: StoreErrorCode, message: string) {
    super(message);
    this.name = "StoreError";
    this.code = code;
  }
}

export interface SwipeOutcome {
  match: boolean;
  duplicate: boolean;
  matchProfile?: PublicProfile;
}

export interface Store {
  getFeed(): PublicProfile[];
  getMatches(): MatchSummary[];
  recordSwipe(profileId: string, direction: SwipeDirection): SwipeOutcome;
  reset(): void;
}

/**
 * The single choke point between database rows and the network. `likes_you`
 * is read here for match decisions but deliberately dropped from the result:
 * a profile the user has not matched with must never carry a hint that they
 * liked them.
 */
function toPublicProfile(row: ProfileRow): PublicProfile {
  return {
    id: row.id,
    name: row.name,
    age: Number(row.age),
    city: row.city,
    college: row.college,
    bio: row.bio,
    interests: JSON.parse(row.interests) as string[],
    photo: row.photo,
  };
}

/**
 * Builds the data access object for one database handle. Accepting the handle
 * makes the store trivially testable against a throwaway SQLite file.
 */
export function createStore(db: DatabaseSync): Store {
  const selectProfile = db.prepare("SELECT * FROM profiles WHERE id = ?");
  const selectSwipe = db.prepare("SELECT direction FROM swipes WHERE profile_id = ?");
  const selectMatchedProfile = db.prepare(
    `SELECT p.*, m.created_at AS matched_at
       FROM matches m
       JOIN profiles p ON p.id = m.profile_id
      WHERE m.profile_id = ?`,
  );
  const selectFeed = db.prepare(
    `SELECT p.*
       FROM profiles p
      WHERE NOT EXISTS (SELECT 1 FROM swipes s WHERE s.profile_id = p.id)
      ORDER BY p.sort_order ASC`,
  );
  const selectMatches = db.prepare(
    `SELECT p.*, m.created_at AS matched_at
       FROM matches m
       JOIN profiles p ON p.id = m.profile_id
      ORDER BY m.created_at DESC, p.sort_order ASC`,
  );
  const insertSwipe = db.prepare(
    "INSERT INTO swipes (profile_id, direction, created_at) VALUES (?, ?, ?)",
  );
  const insertMatch = db.prepare(
    "INSERT OR IGNORE INTO matches (profile_id, created_at) VALUES (?, ?)",
  );

  return {
    getFeed() {
      const rows = selectFeed.all() as unknown as ProfileRow[];
      return rows.map(toPublicProfile);
    },

    getMatches() {
      const rows = selectMatches.all() as unknown as ProfileRow[];
      return rows.map((row) => ({
        matchedAt: row.matched_at ?? new Date(0).toISOString(),
        profile: toPublicProfile(row),
      }));
    },

    recordSwipe(profileId: string, direction: SwipeDirection): SwipeOutcome {
      const profile = selectProfile.get(profileId) as ProfileRow | undefined;
      if (!profile) {
        throw new StoreError("PROFILE_NOT_FOUND", "Profile not found");
      }

      // Idempotency: a retried request must not create a second swipe or a
      // second match. The UI also removes the card, but the database is the
      // source of truth for "never show this profile again".
      const existing = selectSwipe.get(profileId) as { direction: string } | undefined;
      if (existing) {
        const matched = selectMatchedProfile.get(profileId) as ProfileRow | undefined;
        return {
          match: Boolean(matched),
          duplicate: true,
          ...(matched ? { matchProfile: toPublicProfile(matched) } : {}),
        };
      }

      const createdAt = new Date().toISOString();
      db.exec("BEGIN IMMEDIATE");
      try {
        insertSwipe.run(profileId, direction, createdAt);

        // The whole product in one condition: both sides said yes.
        const matched = direction === "like" && profile.likes_you === 1;
        if (matched) {
          insertMatch.run(profileId, createdAt);
        }

        db.exec("COMMIT");

        return {
          match: matched,
          duplicate: false,
          ...(matched ? { matchProfile: toPublicProfile(profile) } : {}),
        };
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },

    reset() {
      db.exec("BEGIN IMMEDIATE");
      try {
        db.exec("DELETE FROM swipes");
        db.exec("DELETE FROM matches");
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
  };
}

type GlobalWithStore = typeof globalThis & {
  __coyDatabase?: DatabaseSync;
  __coyStore?: Store;
};

/**
 * Lazily opens the demo database on first use and reuses the handle across
 * requests (and dev-server hot reloads). `COY_DB_PATH` exists so tests and
 * demos can point at a different file.
 *
 * If the filesystem is read-only (for example a serverless deployment), fall
 * back to an in-memory database so the app still runs; persistence then lasts
 * for the life of the process only.
 */
export function getStore(): Store {
  const globalStore = globalThis as GlobalWithStore;
  if (globalStore.__coyStore) return globalStore.__coyStore;

  const filename = process.env.COY_DB_PATH ?? join(process.cwd(), "data", "coy.db");
  let db: DatabaseSync;

  try {
    db = openDatabase(filename);
  } catch (error) {
    console.warn(
      `[coy] could not open ${filename}; using an in-memory database instead. Swipes will not survive a restart.`,
      error,
    );
    db = openDatabase(":memory:");
  }

  const store = createStore(db);
  globalStore.__coyDatabase = db;
  globalStore.__coyStore = store;
  return store;
}
