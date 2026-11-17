export const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;

export function jsonError(status: number, message: string): Response {
  return Response.json({ error: message }, { status, headers: NO_STORE_HEADERS });
}
