import type { NextRequest } from "next/server";
import { previewEdit } from "@/lib/ads-editor/ads";
import { fail, guard, json, parseEdits, readBody } from "@/lib/ads-editor/http";

// POST /api/anuncios/[id]/preview  { account, edits } -> "antes / después" SIN tocar Meta
export async function POST(req: NextRequest, ctx: RouteContext<"/api/anuncios/[id]/preview">) {
  const { id } = await ctx.params;
  const body = await readBody(req);
  const g = await guard(typeof body.account === "string" ? body.account : null);
  if (!g.ok) return g.response;
  try {
    return json(await previewEdit(g.token, g.account.id, id, parseEdits(body.edits)));
  } catch (e) {
    return fail(e);
  }
}
