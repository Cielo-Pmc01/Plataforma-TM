import type { NextRequest } from "next/server";
import { listAccountsPublic } from "@/lib/ads-editor/accounts";
import { listAds } from "@/lib/ads-editor/ads";
import { fail, guard, guardAdmin, json } from "@/lib/ads-editor/http";

// GET /api/anuncios                     -> cuentas disponibles (y si tienen token configurado)
// GET /api/anuncios?account=ID[&after=] -> anuncios de esa cuenta (solo los que abren mensajes por defecto)
export async function GET(req: NextRequest) {
  const accountId = req.nextUrl.searchParams.get("account");
  if (!accountId) {
    const admin = await guardAdmin();
    if (!admin.ok) return admin.response;
    return json({ accounts: listAccountsPublic() });
  }

  const g = await guard(accountId);
  if (!g.ok) return g.response;
  try {
    const after = req.nextUrl.searchParams.get("after") ?? undefined;
    const todos = req.nextUrl.searchParams.get("todos") === "1";
    const result = await listAds(g.token, g.account.id, { after, soloMensajes: !todos });
    return json(result);
  } catch (e) {
    return fail(e);
  }
}
