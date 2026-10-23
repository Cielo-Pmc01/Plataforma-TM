import type { NextRequest } from "next/server";
import { applyEdit, getAdDetail } from "@/lib/ads-editor/ads";
import { logChange } from "@/lib/ads-editor/changes";
import { fail, guard, json, parseEdits, readBody } from "@/lib/ads-editor/http";

// POST /api/anuncios/[id]/aplicar  { account, edits, creativeId, confirm: true }
// Cambia el anuncio en Meta. Exige confirmación explícita y que la creatividad no haya cambiado desde que se abrió.
export async function POST(req: NextRequest, ctx: RouteContext<"/api/anuncios/[id]/aplicar">) {
  const { id } = await ctx.params;
  const body = await readBody(req);
  const g = await guard(typeof body.account === "string" ? body.account : null);
  if (!g.ok) return g.response;

  if (body.confirm !== true) return json({ error: "Falta la confirmación del cambio." }, 400);
  const creativeId = typeof body.creativeId === "string" ? body.creativeId : "";
  if (!creativeId) return json({ error: "Falta la creatividad que estabas viendo." }, 400);
  const edits = parseEdits(body.edits);

  let adName: string | null = null;
  try {
    adName = (await getAdDetail(g.token, g.account.id, id)).name;
    const result = await applyEdit(g.token, g.account.id, id, edits, creativeId);
    const changeId = await logChange({
      userId: g.user.id,
      userEmail: g.user.email,
      accountId: g.account.id,
      adId: id,
      adName,
      previousCreativeId: result.previousCreativeId,
      newCreativeId: result.newCreativeId,
      changes: result.changes,
      status: "applied",
    });
    return json({ ok: true, changeId, ...result });
  } catch (e) {
    await logChange({
      userId: g.user.id,
      userEmail: g.user.email,
      accountId: g.account.id,
      adId: id,
      adName,
      previousCreativeId: creativeId,
      newCreativeId: null,
      changes: { intento: edits },
      status: "failed",
      error: e instanceof Error ? e.message : "Error",
    });
    return fail(e);
  }
}
