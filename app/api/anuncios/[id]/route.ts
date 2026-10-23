import type { NextRequest } from "next/server";
import { getAdDetail } from "@/lib/ads-editor/ads";
import { listChanges } from "@/lib/ads-editor/changes";
import { fail, guard, json } from "@/lib/ads-editor/http";

// GET /api/anuncios/[id]?account=ID -> detalle del anuncio (valores editables actuales) + historial de cambios
export async function GET(req: NextRequest, ctx: RouteContext<"/api/anuncios/[id]">) {
  const { id } = await ctx.params;
  const g = await guard(req.nextUrl.searchParams.get("account"));
  if (!g.ok) return g.response;
  try {
    const [ad, history] = await Promise.all([getAdDetail(g.token, g.account.id, id), listChanges(id)]);
    return json({ ad, history });
  } catch (e) {
    return fail(e);
  }
}
