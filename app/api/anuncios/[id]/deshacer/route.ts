import type { NextRequest } from "next/server";
import { undoEdit } from "@/lib/ads-editor/ads";
import { getChange, markUndone } from "@/lib/ads-editor/changes";
import { fail, guard, json, readBody } from "@/lib/ads-editor/http";

// POST /api/anuncios/[id]/deshacer  { account, changeId, confirm: true }
// Vuelve a apuntar el anuncio a la creatividad anterior a ese cambio.
export async function POST(req: NextRequest, ctx: RouteContext<"/api/anuncios/[id]/deshacer">) {
  const { id } = await ctx.params;
  const body = await readBody(req);
  const g = await guard(typeof body.account === "string" ? body.account : null);
  if (!g.ok) return g.response;
  if (body.confirm !== true) return json({ error: "Falta la confirmación." }, 400);

  const changeId = typeof body.changeId === "string" ? body.changeId : "";
  const change = changeId ? await getChange(changeId) : null;
  if (!change || change.ad_id !== id || change.ad_account_id !== g.account.id) {
    return json({ error: "No encontré ese cambio en el historial." }, 404);
  }
  if (change.status !== "applied" || !change.new_creative_id) {
    return json({ error: "Ese cambio no se puede deshacer (ya fue deshecho o no se aplicó)." }, 400);
  }

  try {
    const res = await undoEdit(g.token, g.account.id, id, change.previous_creative_id, change.new_creative_id);
    await markUndone(change.id, g.user.id);
    return json({ ok: true, ...res });
  } catch (e) {
    return fail(e);
  }
}
