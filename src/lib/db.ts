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

function seedIfEmpty(db: DatabaseSync): void {
  const row = db.prepare("SELECT COUNT(*) AS count FROM profiles").get() as
    | { count: number }
    | undefined;
  if (!row || Number(row.count) > 0) return;

  const insert = db.prepare(
    `INSERT INTO profiles
      (id, name, age, city, college, bio, interests, photo, likes_you, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  db.exec("BEGIN IMMEDIATE");
  try {
    seedProfiles.forEach((profile, index) => {
      insert.run(
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
 * seeds the 32 demo profiles on a fresh install.
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
  seedIfEmpty(db);
  return db;
}
