import { NO_STORE_HEADERS, jsonError } from "@/lib/http";
import { swipeRequestSchema } from "@/lib/schemas";
import { StoreError, getStore } from "@/lib/store";

/**
 * POST /swipe
 * Body: { profileId: string, direction: "like" | "pass" }
 * Records the swipe and reports whether it created a mutual match. Retried
 * requests are idempotent and return `duplicate: true`.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Request body must be valid JSON");
  }

  const parsed = swipeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, 'Expected { profileId: string, direction: "like" | "pass" }');
  }

  try {
    const outcome = getStore().recordSwipe(parsed.data.profileId, parsed.data.direction);
    return Response.json(outcome, { headers: NO_STORE_HEADERS });
  } catch (error) {
    if (error instanceof StoreError) {
      return jsonError(404, error.message);
    }
    console.error("[coy] POST /swipe failed", error);
    return jsonError(500, "Could not record the swipe");
  }
}
