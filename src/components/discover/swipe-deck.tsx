"use client";

import type { PublicProfile, SwipeDirection, SwipeResponse } from "@/lib/types";
import SwipeCard from "./swipe-card";

interface SwipeDeckProps {
  profiles: PublicProfile[];
  total: number;
  disabled?: boolean;
  onSwipe: (profile: PublicProfile, direction: SwipeDirection) => Promise<SwipeResponse>;
  onSwiped: (profileId: string, outcome: SwipeResponse) => void;
}

export default function SwipeDeck({
  profiles,
  total,
  disabled = false,
  onSwipe,
  onSwiped,
}: SwipeDeckProps) {
  const top = profiles[0];
  if (!top) return null;

  return (
    <SwipeCard
      key={top.id}
      profile={top}
      upcoming={profiles.slice(1, 3)}
      position={total - profiles.length + 1}
      total={total}
      disabled={disabled}
      onSwipe={onSwipe}
      onSwiped={onSwiped}
    />
  );
}
