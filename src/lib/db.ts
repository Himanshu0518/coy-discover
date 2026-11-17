import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { seedProfiles } from "./profiles.seed";

/**
 * SQLite schema. This demo has one logged-in user, so a swipe is unique per
 * profile and a match is unique per profile. That is what makes
 * "a swiped profile never comes back" a database guarantee rather than a UI
 * detail.
 */
const SCHEMA = `
CREATE TABLE IF NOT EXISTS profiles (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  age        INTEGER NOT NULL,
  city       TEXT NOT NULL,
  college    TEXT NOT NULL,
  bio        TEXT NOT NULL,
  interests  TEXT NOT NULL,
  photo      TEXT NOT NULL,
  likes_you  INTEGER NOT NULL CHECK (likes_you IN (0, 1)),
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS swipes (
  profile_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  direction  TEXT NOT NULL CHECK (direction IN ('like', 'pass')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS matches (
  profile_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL
);
`;

/**
 * Upserts the seed on every open rather than only seeding an empty table.
 * Demo content (photos, bios, interest tags) can then evolve without throwing
 * away a reviewer's swipes and matches, and a database created by an older
 * build never points at deleted assets.
 */
function syncSeedProfiles(db: DatabaseSync): void {
  const upsert = db.prepare(
    `INSERT INTO profiles
      (id, name, age, city, college, bio, interests, photo, likes_you, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       age = excluded.age,
       city = excluded.city,
       college = excluded.college,
       bio = excluded.bio,
       interests = excluded.interests,
       photo = excluded.photo,
       likes_you = excluded.likes_you,
       sort_order = excluded.sort_order`,
  );

  db.exec("BEGIN IMMEDIATE");
  try {
    seedProfiles.forEach((profile, index) => {
      upsert.run(
        profile.id,
        profile.name,
        profile.age,
        profile.city,
        profile.college,
        profile.bio,
        JSON.stringify(profile.interests),
        profile.photo,
        profile.likesYou ? 1 : 0,
        index,
      );
    });
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

/**
 * Opens (and creates if needed) a SQLite database, applies the schema and
 * keeps the 32 demo profiles in sync with the seed file.
 */
export function openDatabase(filename: string): DatabaseSync {
  if (filename !== ":memory:") {
    mkdirSync(dirname(filename), { recursive: true });
  }

  const db = new DatabaseSync(filename);
  db.exec("PRAGMA foreign_keys = ON;");
  if (filename !== ":memory:") {
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA synchronous = NORMAL;");
  }
  db.exec(SCHEMA);
  syncSeedProfiles(db);
  return db;
}
