import { headers } from "next/headers";
import { NO_STORE_HEADERS, jsonError } from "@/lib/http";
import { getStore } from "@/lib/store";

/**
 * GET /matches
 * Only mutual likes. This is the sole place a person who liked the user is
 * ever revealed, and only after the user liked them back.
 */
export async function GET() {
  await headers();

  try {
    return Response.json({ matches: getStore().getMatches() }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("[coy] GET /matches failed", error);
    return jsonError(500, "Could not load matches");
  }
}
