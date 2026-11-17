"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchFeed, fetchMatches, postSwipe, resetDemo } from "./api";
import type { SwipeDirection, SwipeResponse, PublicProfile } from "./types";

export const queryKeys = {
  feed: ["feed"] as const,
  matches: ["matches"] as const,
};

export function useFeed() {
  return useQuery({
    queryKey: queryKeys.feed,
    queryFn: fetchFeed,
    staleTime: 20_000,
  });
}

export function useMatches() {
  return useQuery({
    queryKey: queryKeys.matches,
    queryFn: fetchMatches,
    staleTime: 10_000,
  });
}

interface SwipeVariables {
  profile: PublicProfile;
  direction: SwipeDirection;
}

export function useSwipeMutation() {
  return useMutation<SwipeResponse, Error, SwipeVariables>({
    mutationFn: ({ profile, direction }) => postSwipe(profile.id, direction),
  });
}

export function useResetDemoMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: resetDemo,
    onSuccess: async () => {
      await queryClient.resetQueries();
    },
  });
}
