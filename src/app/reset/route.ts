import { NO_STORE_HEADERS, jsonError } from "@/lib/http";
import { getStore } from "@/lib/store";

/**
 * POST /reset
 * Demo helper, not part of the assignment's API surface. Clears swipes and
 * matches so the seeded profiles can be demoed again without deleting the DB.
 */
export async function POST() {
  try {
    const store = getStore();
    store.reset();
    return Response.json(
      { ok: true, remaining: store.getFeed().length },
      { headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    console.error("[coy] POST /reset failed", error);
    return jsonError(500, "Could not reset the demo");
  }
}
