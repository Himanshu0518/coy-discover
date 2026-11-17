import { NO_STORE_HEADERS, jsonError } from "@/lib/http";
import { StoreError, getStore } from "@/lib/store";
import type { SwipeDirection } from "@/lib/types";

interface SwipePayload {
  profileId: string;
  direction: SwipeDirection;
}

function parsePayload(body: unknown): SwipePayload | null {
  if (typeof body !== "object" || body === null) return null;

  const { profileId, direction } = body as Record<string, unknown>;
  const id = typeof profileId === "string" ? profileId.trim() : "";

  if (!id || id.length > 64) return null;
  if (direction !== "like" && direction !== "pass") return null;

  return { profileId: id, direction };
}

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

  const payload = parsePayload(body);
  if (!payload) {
    return jsonError(400, 'Expected { profileId: string, direction: "like" | "pass" }');
  }

  try {
    const outcome = getStore().recordSwipe(payload.profileId, payload.direction);
    return Response.json(outcome, { headers: NO_STORE_HEADERS });
  } catch (error) {
    if (error instanceof StoreError) {
      return jsonError(404, error.message);
    }
    console.error("[coy] POST /swipe failed", error);
    return jsonError(500, "Could not record the swipe");
  }
}
