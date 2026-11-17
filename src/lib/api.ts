import type {
  FeedResponse,
  MatchesResponse,
  SwipeDirection,
  SwipeResponse,
} from "./types";
import {
  feedResponseSchema,
  matchesResponseSchema,
  swipeResponseSchema,
} from "./schemas";

async function toError(response: Response): Promise<Error> {
  let message = `Request failed (${response.status})`;
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body.error === "string") message = body.error;
  } catch {
    // Keep the status-based message when the body is not JSON.
  }
  return new Error(message);
}

async function getJson(url: string): Promise<unknown> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw await toError(response);
  return response.json();
}

export async function fetchFeed(): Promise<FeedResponse> {
  return feedResponseSchema.parse(await getJson("/feed"));
}

export async function fetchMatches(): Promise<MatchesResponse> {
  return matchesResponseSchema.parse(await getJson("/matches"));
}

export async function postSwipe(
  profileId: string,
  direction: SwipeDirection,
): Promise<SwipeResponse> {
  const response = await fetch("/swipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profileId, direction }),
  });
  if (!response.ok) throw await toError(response);
  return swipeResponseSchema.parse(await response.json());
}

export async function resetDemo(): Promise<void> {
  const response = await fetch("/reset", { method: "POST" });
  if (!response.ok) throw await toError(response);
}
