"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  FeedResponse,
  MatchSummary,
  MatchesResponse,
  PublicProfile,
  SwipeDirection,
  SwipeResponse,
} from "@/lib/types";
import EmptyDeck from "./EmptyDeck";
import MatchModal from "./MatchModal";
import MatchesList from "./MatchesList";
import SwipeDeck from "./SwipeDeck";
import { HeartIcon, LockIcon, RefreshIcon } from "./icons";

type Status = "loading" | "ready" | "error";
type View = "deck" | "matches";

interface Toast {
  key: number;
  message: string;
}

export default function DiscoverClient() {
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [view, setView] = useState<View>("deck");
  const [activeMatch, setActiveMatch] = useState<PublicProfile | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((message: string) => {
    setToast({ key: Date.now(), message });
  }, []);

  const fetchSnapshot = useCallback(async () => {
    const [feedResponse, matchesResponse] = await Promise.all([
      fetch("/feed", { cache: "no-store" }),
      fetch("/matches", { cache: "no-store" }),
    ]);
    if (!feedResponse.ok || !matchesResponse.ok) throw new Error("Request failed");

    const feed = (await feedResponse.json()) as FeedResponse;
    const matchData = (await matchesResponse.json()) as MatchesResponse;
    return { profiles: feed.profiles, matches: matchData.matches };
  }, []);

  const applySnapshot = useCallback(
    (snapshot: { profiles: PublicProfile[]; matches: MatchSummary[] }) => {
      setProfiles(snapshot.profiles);
      setMatches(snapshot.matches);
      setStatus("ready");
    },
    [],
  );

  useEffect(() => {
    let active = true;
    fetchSnapshot()
      .then((snapshot) => {
        if (active) applySnapshot(snapshot);
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [applySnapshot, fetchSnapshot]);

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      applySnapshot(await fetchSnapshot());
    } catch {
      setStatus("error");
    }
  }, [applySnapshot, fetchSnapshot]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timeout);
  }, [toast]);

  const handleSwipe = useCallback(
    async (profile: PublicProfile, direction: SwipeDirection) => {
      let response: Response;

      try {
        response = await fetch("/swipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId: profile.id, direction }),
        });
      } catch {
        showToast("Couldn't reach the server. Check that it's running, then try again.");
        throw new Error("network error");
      }

      if (!response.ok) {
        showToast("That swipe didn't save. Please try again.");
        throw new Error("swipe rejected");
      }

      const outcome = (await response.json()) as SwipeResponse;
      const matchedProfile = outcome.matchProfile;

      if (outcome.match && matchedProfile) {
        setActiveMatch(matchedProfile);
        setMatches((current) =>
          current.some((match) => match.profile.id === matchedProfile.id)
            ? current
            : [{ profile: matchedProfile, matchedAt: new Date().toISOString() }, ...current],
        );
      }
    },
    [showToast],
  );

  const handleSwiped = useCallback((profileId: string) => {
    setProfiles((current) => current.filter((profile) => profile.id !== profileId));
  }, []);

  const handleReset = useCallback(async () => {
    try {
      const response = await fetch("/reset", { method: "POST" });
      if (!response.ok) throw new Error("reset failed");

      setActiveMatch(null);
      setView("deck");
      await refresh();
      showToast("Demo reset. All profiles are back.");
    } catch {
      showToast("Couldn't reset the demo. Try again.");
    }
  }, [refresh, showToast]);

  const openMatches = useCallback(() => {
    setView("matches");
    setActiveMatch(null);
  }, []);

  return (
    <>
      <header className="px-5 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-coral text-white shadow-[0_8px_20px_-8px_rgba(244,67,90,0.9)]">
              <HeartIcon filled className="h-4 w-4" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">coy</span>
            <span className="rounded-full bg-ink/[0.05] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-ink/40">
              Discover
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-ink/35">
            <LockIcon className="h-3.5 w-3.5" />
            Mutual only
          </span>
        </div>

        <div
          role="tablist"
          aria-label="Discover views"
          className="mt-4 flex items-center gap-1 rounded-full border border-ink/[0.08] bg-white/60 p-1 backdrop-blur"
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === "deck"}
            onClick={() => setView("deck")}
            className={`flex-1 rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
              view === "deck"
                ? "bg-ink text-cream shadow-sm"
                : "text-ink/50 hover:text-ink/80"
            }`}
          >
            Discover
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "matches"}
            onClick={() => setView("matches")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
              view === "matches"
                ? "bg-ink text-cream shadow-sm"
                : "text-ink/50 hover:text-ink/80"
            }`}
          >
            Matches
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                view === "matches" ? "bg-cream/20 text-cream" : "bg-coral-soft text-coral"
              }`}
            >
              {matches.length}
            </span>
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-5 pb-32 pt-4">
        {status === "loading" ? (
          <DeckSkeleton />
        ) : status === "error" ? (
          <ErrorState onRetry={() => void refresh()} />
        ) : view === "matches" ? (
          <MatchesList
            matches={matches}
            onStartSwiping={() => setView("deck")}
            onReset={() => void handleReset()}
          />
        ) : profiles.length === 0 ? (
          <EmptyDeck
            hasMatches={matches.length > 0}
            onSeeMatches={openMatches}
            onReset={() => void handleReset()}
          />
        ) : (
          <div className="animate-rise">
            <div className="mb-2.5 flex items-center justify-between px-1">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink/35">
                {profiles.length} {profiles.length === 1 ? "person" : "people"} nearby
              </span>
              <span className="text-[10.5px] text-ink/35">Swipe to decide</span>
            </div>

            <SwipeDeck
              profiles={profiles}
              disabled={Boolean(activeMatch)}
              onSwipe={handleSwipe}
              onSwiped={handleSwiped}
            />

            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[10.5px] text-ink/35">
              <LockIcon className="h-3 w-3" />
              Only mutual likes are ever revealed.
            </p>
          </div>
        )}
      </main>

      {activeMatch ? (
        <MatchModal
          profile={activeMatch}
          onClose={() => setActiveMatch(null)}
          onViewMatches={openMatches}
        />
      ) : null}

      {toast ? (
        <div
          key={toast.key}
          role="status"
          className="fixed inset-x-0 bottom-24 z-[80] mx-auto w-fit max-w-[340px] animate-fade-in rounded-full bg-ink px-4 py-2.5 text-center text-[12px] font-medium text-cream shadow-xl"
        >
          {toast.message}
        </div>
      ) : null}
    </>
  );
}

function DeckSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[clamp(380px,56vh,520px)] rounded-[30px] bg-sand/80" />
      <div className="mt-6 flex justify-center gap-6">
        <div className="h-16 w-16 rounded-full bg-sand/80" />
        <div className="h-[72px] w-[72px] rounded-full bg-sand/80" />
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mx-auto mt-10 max-w-[300px] rounded-[28px] border border-ink/[0.07] bg-white/70 p-6 text-center">
      <p className="text-sm font-semibold">Couldn&apos;t load Discover</p>
      <p className="mt-1 text-[13px] leading-relaxed text-ink/45">
        The feed request failed. Make sure the server is running, then try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="press mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-cream"
      >
        <RefreshIcon className="h-4 w-4" />
        Retry
      </button>
    </div>
  );
}
