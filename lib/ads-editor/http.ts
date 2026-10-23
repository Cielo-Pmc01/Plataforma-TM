// Ayudas comunes de las rutas /api/anuncios (SOLO SERVIDOR): permisos, cuenta/token y respuestas de error.
// Todas las rutas exigen sesión de Supabase con rol admin; el token de Meta nunca sale del servidor.

import { NextResponse } from "next/server";
import { getCurrentPlatformUser, type PlatformUser } from "@/lib/platform";
import { getAccount, getToken, type AdAccountConfig } from "./accounts";
import { MetaError } from "./graph";
import type { Edits } from "./welcome";

export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export type Guarded =
  | { ok: true; user: PlatformUser; account: AdAccountConfig; token: string }
  | { ok: false; response: NextResponse };

export type AdminGuard = { ok: true; user: PlatformUser } | { ok: false; response: NextResponse };

/** Solo exige sesión y rol admin (sin cuenta de Meta). */
export async function guardAdmin(): Promise<AdminGuard> {
  const user = await getCurrentPlatformUser();
  if (!user) return { ok: false, response: json({ error: "Tenés que iniciar sesión." }, 401) };
  if (user.role !== "admin") return { ok: false, response: json({ error: "Solo administradores." }, 403) };
  return { ok: true, user };
}

export async function guard(accountId: string | null | undefined): Promise<Guarded> {
  const admin = await guardAdmin();
  if (!admin.ok) return admin;
  const user = admin.user;

  const account = getAccount(accountId);
  if (!account) return { ok: false, response: json({ error: "Cuenta publicitaria no permitida." }, 400) };

  const token = getToken(account);
  if (!token) {
    return {
      ok: false,
      response: json({ error: `Falta configurar el token de esta cuenta en el servidor (${account.tokenEnv}).` }, 503),
    };
  }
  return { ok: true, user, account, token };
}

export function fail(e: unknown) {
  if (e instanceof MetaError) return json({ error: e.toFriendly(), metaCode: e.code ?? null }, 502);
  return json({ error: e instanceof Error ? e.message : "Error inesperado." }, 400);
}

const MAX_TEXT = 2000;

/** Acepta solo los campos editables, con el tipo correcto y un largo razonable. */
export function parseEdits(raw: unknown): Edits {
  const out: Edits = {};
  if (!raw || typeof raw !== "object") return out;
  const r = raw as Record<string, unknown>;
  for (const key of ["welcomeText", "primaryText", "headline"] as const) {
    const v = r[key];
    if (typeof v === "string") out[key] = v.slice(0, MAX_TEXT);
  }
  if (Array.isArray(r.iceBreakers)) {
    out.iceBreakers = r.iceBreakers.filter((t): t is string => typeof t === "string").map((t) => t.slice(0, 200));
  }
  return out;
}

export async function readBody(req: Request): Promise<Record<string, unknown>> {
  try {
    const b = await req.json();
    return b && typeof b === "object" ? (b as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
