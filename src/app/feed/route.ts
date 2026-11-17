import { headers } from "next/headers";
import { NO_STORE_HEADERS, jsonError } from "@/lib/http";
import { getStore } from "@/lib/store";

/**
 * GET /feed
 * Profiles the logged-in user has not swiped on yet. The response never
 * includes the private `likesYou` flag.
 */
export async function GET() {
  // Feed is per-user state; making a runtime read keeps Next from prerendering
  // it at build time under Cache Components.
  await headers();

  try {
    return Response.json({ profiles: getStore().getFeed() }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("[coy] GET /feed failed", error);
    return jsonError(500, "Could not load the feed");
  }
}
