/** The only shape of a profile the API is ever allowed to return. */
export interface PublicProfile {
  id: string;
  name: string;
  age: number;
  city: string;
  college: string;
  bio: string;
  interests: string[];
  photo: string;
}

/**
 * The seeded row. `likesYou` models the other side of the double-blind
 * exchange: it is read on the server to decide matches and is never
 * serialized into a response.
 */
export interface SeedProfile extends PublicProfile {
  likesYou: boolean;
}

export type SwipeDirection = "like" | "pass";

export interface MatchSummary {
  matchedAt: string;
  profile: PublicProfile;
}

export interface FeedResponse {
  profiles: PublicProfile[];
}

export interface MatchesResponse {
  matches: MatchSummary[];
}

export interface SwipeResponse {
  match: boolean;
  duplicate: boolean;
  matchProfile?: PublicProfile;
}
