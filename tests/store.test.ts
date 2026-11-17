import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, it } from "node:test";
import { openDatabase } from "../src/lib/db";
import { seedProfiles } from "../src/lib/profiles.seed";
import { StoreError, createStore, type Store } from "../src/lib/store";

const PROFILE_KEYS = [
  "age",
  "bio",
  "city",
  "college",
  "id",
  "interests",
  "name",
  "photo",
].sort();

describe("Coy discover backend", () => {
  let directory: string;
  let databasePath: string;
  let db: DatabaseSync;
  let store: Store;

  const reopen = () => {
    db.close();
    db = openDatabase(databasePath);
    store = createStore(db);
  };

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "coy-discover-"));
    databasePath = join(directory, "test.db");
    db = openDatabase(databasePath);
    store = createStore(db);
  });

  afterEach(() => {
    db.close();
    rmSync(directory, { recursive: true, force: true });
  });

  it("seeds at least 30 complete, unique profiles", () => {
    const feed = store.getFeed();

    assert.ok(feed.length >= 30, `expected >= 30 profiles, got ${feed.length}`);
    assert.equal(feed.length, seedProfiles.length);
    assert.equal(new Set(feed.map((profile) => profile.id)).size, feed.length);

    for (const profile of feed) {
      assert.equal(typeof profile.name, "string");
      assert.ok(profile.name.length > 0);
      assert.ok(profile.age >= 18 && profile.age <= 99);
      assert.ok(profile.city.length > 0);
      assert.ok(profile.college.length > 0);
      assert.ok(profile.bio.length > 0);
      assert.ok(profile.interests.length >= 1);
      assert.ok(profile.photo.startsWith("/portraits/"));
      assert.deepEqual(Object.keys(profile).sort(), PROFILE_KEYS);
    }
  });

  it("refreshes seed content on an existing database without losing swipes", () => {
    store.recordSwipe("p01", "pass");
    db.prepare("UPDATE profiles SET photo = '/old.jpg', bio = 'stale' WHERE id = 'p01'").run();

    reopen();

    const profile = store.getFeed().find((item) => item.id === "p02");
    assert.equal(profile?.photo, "/portraits/p02.jpg");
    assert.ok(!store.getFeed().some((item) => item.id === "p01"));

    const row = db.prepare("SELECT photo, bio FROM profiles WHERE id = 'p01'").get() as
      | { photo: string; bio: string }
      | undefined;
    assert.equal(row?.photo, "/portraits/p01.jpg");
    assert.notEqual(row?.bio, "stale");
  });

  it("starts with demo profiles who already like the user", () => {
    const seededLikers = seedProfiles.filter((profile) => profile.likesYou);
    assert.ok(seededLikers.length >= 5, "need enough pre-liked profiles for a demo");
    assert.ok(seededLikers.length < seedProfiles.length);
  });

  it("removes every swiped profile from the feed, whatever the direction", () => {
    store.recordSwipe("p01", "pass");
    assert.equal(store.getFeed().length, seedProfiles.length - 1);
    assert.ok(!store.getFeed().some((profile) => profile.id === "p01"));

    store.recordSwipe("p02", "like");
    const feed = store.getFeed();
    assert.equal(feed.length, seedProfiles.length - 2);
    assert.deepEqual(
      feed.filter((profile) => profile.id === "p01" || profile.id === "p02"),
      [],
    );
  });

  it("creates a match only when the like is mutual", () => {
    const outcome = store.recordSwipe("p03", "like"); // p03 already likes the user

    assert.equal(outcome.match, true);
    assert.equal(outcome.duplicate, false);
    assert.equal(outcome.matchProfile?.id, "p03");

    const matches = store.getMatches();
    assert.equal(matches.length, 1);
    assert.equal(matches[0].profile.id, "p03");
    assert.ok(!Number.isNaN(Date.parse(matches[0].matchedAt)));
  });

  it("does not match when the user likes someone who has not liked them", () => {
    const outcome = store.recordSwipe("p04", "like");

    assert.equal(outcome.match, false);
    assert.equal(outcome.matchProfile, undefined);
    assert.deepEqual(store.getMatches(), []);
  });

  it("never reveals a one-sided liker, even after a pass", () => {
    const outcome = store.recordSwipe("p05", "pass"); // p05 likes the user

    assert.equal(outcome.match, false);
    assert.equal(outcome.matchProfile, undefined);
    assert.deepEqual(store.getMatches(), []);

    const serialized = JSON.stringify({ outcome, matches: store.getMatches() });
    assert.ok(!serialized.includes("likesYou"));
    assert.ok(!serialized.includes("likes_you"));
    assert.ok(!serialized.includes("p05"));
  });

  it("keeps the private like flag out of every profile payload", () => {
    const feed = store.getFeed();
    assert.ok(!JSON.stringify(feed).includes("likesYou"));
    assert.ok(!JSON.stringify(feed).includes("likes_you"));

    for (const profile of feed) {
      assert.ok(!("likesYou" in profile));
      assert.ok(!("likes_you" in profile));
    }
  });

  it("treats a repeated swipe as idempotent", () => {
    const first = store.recordSwipe("p03", "like");
    const second = store.recordSwipe("p03", "like");

    assert.equal(first.match, true);
    assert.equal(second.duplicate, true);
    assert.equal(second.match, true);
    assert.equal(store.getMatches().length, 1);
    assert.ok(!store.getFeed().some((profile) => profile.id === "p03"));
  });

  it("persists swipes and matches when the database is reopened", () => {
    store.recordSwipe("p03", "like");
    store.recordSwipe("p01", "pass");

    reopen();

    const feed = store.getFeed();
    const ids = feed.map((profile) => profile.id);
    assert.ok(!ids.includes("p03"));
    assert.ok(!ids.includes("p01"));
    assert.equal(feed.length, seedProfiles.length - 2);
    assert.equal(store.getMatches().length, 1);
    assert.equal(store.getMatches()[0].profile.id, "p03");
  });

  it("resets swipes and matches for a fresh demo", () => {
    store.recordSwipe("p03", "like");
    store.recordSwipe("p05", "pass");
    store.reset();

    assert.equal(store.getFeed().length, seedProfiles.length);
    assert.deepEqual(store.getMatches(), []);
  });

  it("rejects unknown profile ids without writing a swipe", () => {
    assert.throws(
      () => store.recordSwipe("does-not-exist", "like"),
      (error: unknown) =>
        error instanceof StoreError && error.code === "PROFILE_NOT_FOUND",
    );
    assert.equal(store.getFeed().length, seedProfiles.length);
  });
});
