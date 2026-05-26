import "server-only";

import { NextResponse } from "next/server";
import { resolveWywoActorFromRequest } from "./auth";
import type { WywoActor } from "./types";

export async function withWywoActor<T>(
  req: Request,
  handler: (actor: WywoActor) => Promise<T>,
): Promise<Response> {
  const actor = await resolveWywoActorFromRequest(req);
  if (!actor) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await handler(actor);
    if (result instanceof Response) return result;
    return NextResponse.json({ ok: true, ...(result as object) });
  } catch (err) {
    const message = (err as Error).message || "Server error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}
