"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPlatformUser } from "@/lib/platform";
import { isControlOwner } from "@/lib/control/owner";

async function soloDuena() {
  const profile = await getCurrentPlatformUser();
  if (!isControlOwner(profile?.email)) throw new Error("Solo la dueña puede administrar las conexiones");
}

export interface NuevaConexion {
  ok: boolean;
  token?: string;
  error?: string;
}

export async function crearConexion(_prev: NuevaConexion | null, form: FormData): Promise<NuevaConexion> {
  await soloDuena();
  const nombre = String(form.get("nombre") ?? "").trim();
  if (nombre.length < 3) return { ok: false, error: "Poné un nombre que diga quién la va a usar (por ejemplo «Agente evo-mk»)." };
  const puedeEscribir = form.get("escribir") === "on";
  const dias = Number(form.get("vence") ?? 0);

  // El token se muestra una sola vez; en la base queda solo su huella (sha256)
  const token = "tm_" + randomBytes(24).toString("base64url");
  const hash = createHash("sha256").update(token, "utf8").digest("hex");

  const supabase = await createClient();
  const { error } = await supabase
    .schema("meta_ads")
    .from("api_conexiones")
    .insert({
      nombre,
      prefijo: token.slice(0, 7),
      token_hash: hash,
      puede_escribir: puedeEscribir,
      vence_at: dias > 0 ? new Date(Date.now() + dias * 86400000).toISOString() : null,
    });
  if (error) return { ok: false, error: "No se pudo crear: " + error.message };
  revalidatePath("/control/api");
  return { ok: true, token };
}

export async function revocarConexion(form: FormData) {
  await soloDuena();
  const id = String(form.get("id") ?? "");
  const supabase = await createClient();
  await supabase.schema("meta_ads").from("api_conexiones").update({ revocado_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/control/api");
}
