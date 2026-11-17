"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import {
  queryKeys,
  useFeed,
  useMatches,
  useResetDemoMutation,
  useSwipeMutation,
} from "@/lib/queries";
import type {
  FeedResponse,
  MatchesResponse,
  PublicProfile,
  SwipeDirection,
  SwipeResponse,
} from "@/lib/types";
import DeckSkeleton from "./deck-skeleton";
import DiscoverAside from "./discover-aside";
import EmptyState from "./empty-state";
import ErrorState from "./error-state";
import MatchDialog from "./match-dialog";
import MatchesView from "./matches-view";
import SwipeDeck from "./swipe-deck";

// Kept in the UI layer so the seed (and its private likesYou flags) never
// enters the client bundle.
const TOTAL_PROFILES = 32;

export default function DiscoverClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const feed = useFeed();
  const matches = useMatches();
  const swipeMutation = useSwipeMutation();
  const resetMutation = useResetDemoMutation();
  const [matchedProfile, setMatchedProfile] = useState<PublicProfile | null>(null);

  const view = searchParams.get("view") === "matches" ? "matches" : "deck";
  const profiles = feed.data?.profiles ?? [];
  const remaining = profiles.length;
  const progress = feed.data
    ? Math.max(0, Math.min(100, ((TOTAL_PROFILES - remaining) / TOTAL_PROFILES) * 100))
    : 0;

  const handleSwipe = useCallback(
    async (profile: PublicProfile, direction: SwipeDirection) => {
      try {
        return await swipeMutation.mutateAsync({ profile, direction });
      } catch (error) {
        toast.error("That swipe didn't save.", {
          description: "The card is back — give it another go.",
        });
        throw error;
      }
    },
    [swipeMutation],
  );

  const handleSwiped = useCallback(
    (profileId: string, outcome: SwipeResponse) => {
      queryClient.setQueryData<FeedResponse>(queryKeys.feed, (current) =>
        current
          ? {
              profiles: current.profiles.filter((profile) => profile.id !== profileId),
            }
          : current,
      );

      if (!outcome.match || !outcome.matchProfile) return;

      const matched = outcome.matchProfile;
      queryClient.setQueryData<MatchesResponse>(queryKeys.matches, (current) => ({
        matches: [
          { profile: matched, matchedAt: new Date().toISOString() },
          ...(current?.matches.filter((match) => match.profile.id !== matched.id) ?? []),
        ],
      }));
      setMatchedProfile(matched);
    },
    [queryClient],
  );

  const goToMatches = useCallback(() => {
    setMatchedProfile(null);
    router.push("/discover?view=matches", { scroll: false });
  }, [router]);

  const handleReset = useCallback(async () => {
    try {
      await resetMutation.mutateAsync();
      setMatchedProfile(null);
      if (view === "matches") {
        router.push("/discover", { scroll: false });
      }
      toast.success("Fresh start.", {
        description: "All 32 people are back in your feed.",
      });
    } catch {
      toast.error("Couldn't reset the demo.", {
        description: "Check the server connection and try again.",
      });
    }
  }, [resetMutation, router, view]);

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        {view === "matches" ? (
          <motion.main
            key="matches"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto w-full max-w-5xl px-4 pb-32 pt-8 sm:px-6 lg:px-8"
          >
            <MatchesView
              matches={matches.data?.matches ?? []}
              isLoading={matches.isPending}
              isError={matches.isError}
              resetting={resetMutation.isPending}
              onRetry={() => void matches.refetch()}
              onReset={() => void handleReset()}
            />
          </motion.main>
        ) : (
          <motion.main
            key="deck"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto w-full max-w-5xl px-4 pb-32 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-6"
          >
            <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,480px)_300px] lg:justify-center xl:grid-cols-[minmax(0,500px)_320px] xl:gap-14">
              <section className="mx-auto w-full max-w-[480px] xl:max-w-[500px]">
                <header>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="eyebrow text-coy">
                        <span className="h-1.5 w-1.5 rounded-full bg-coy" />
                        Discover
                      </p>
                      <h1 className="mt-2.5 font-display text-[32px] font-medium leading-[1.02] tracking-[-0.05em] sm:whitespace-nowrap sm:text-[38px] xl:text-[40px]">
                        Discover{" "}
                        <span className="relative inline-block">
                          <span
                            aria-hidden="true"
                            className="absolute inset-x-0.5 bottom-0.5 h-2.5 -rotate-1 bg-sun sm:bottom-1 sm:h-3"
                          />
                          <span className="relative italic text-coy">someone</span>
                        </span>{" "}
                        <span className="ml-0.5">new.</span>
                      </h1>
                    </div>

                    <div className="hidden shrink-0 pt-1 text-right sm:block">
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/35">
                        In your feed
                      </p>
                      <p className="mt-1 font-display text-[34px] font-semibold leading-none tabular-nums">
                        {feed.data ? remaining : "—"}
                      </p>
                      <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-ink/30">
                        people
                      </p>
                    </div>
                  </div>

                  <p className="mt-2 max-w-[390px] text-[11.5px] leading-snug text-ink/55 sm:mt-3 sm:text-[12.5px]">
                    Swipe through students. We only speak up when it&apos;s mutual.
                  </p>

                  <div className="mt-3 flex items-center gap-3 sm:mt-4">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/[0.06]">
                      <motion.div
                        initial={false}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 120, damping: 24 }}
                        className="h-full rounded-full bg-coy"
                      />
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.1em] text-ink/40">
                      <span className="h-1.5 w-1.5 rounded-full bg-mint" />
                      {feed.isPending
                        ? "Loading"
                        : feed.isError
                          ? "Unavailable"
                          : `${remaining} left`}
                    </span>
                  </div>
                </header>

                <div className="mt-4">
                  {feed.isPending ? (
                    <DeckSkeleton />
                  ) : feed.isError ? (
                    <ErrorState onRetry={() => void feed.refetch()} />
                  ) : profiles.length === 0 ? (
                    <EmptyState
                      hasMatches={(matches.data?.matches.length ?? 0) > 0}
                      resetting={resetMutation.isPending}
                      onSeeMatches={goToMatches}
                      onReset={() => void handleReset()}
                    />
                  ) : (
                    <SwipeDeck
                      profiles={profiles}
                      total={TOTAL_PROFILES}
                      disabled={Boolean(matchedProfile)}
                      onSwipe={handleSwipe}
                      onSwiped={handleSwiped}
                    />
                  )}
                </div>

                {!feed.isPending && !feed.isError && profiles.length > 0 ? (
                  <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[10px] text-ink/35">
                    <Lock className="h-3 w-3" />
                    Only mutual likes are ever revealed.
                  </p>
                ) : null}
              </section>

              <DiscoverAside
                matches={matches.data?.matches ?? []}
                resetting={resetMutation.isPending}
                onReset={() => void handleReset()}
              />
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      <MatchDialog
        profile={matchedProfile}
        onClose={() => setMatchedProfile(null)}
        onViewMatches={goToMatches}
      />

    </>
  );
}
