import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentPlatformUser } from "@/lib/platform";
import { isControlOwner } from "@/lib/control/owner";
import { createClient } from "@/lib/supabase/server";
import { ApiView, type ConexionApi, type RegistroApi } from "@/components/control/ApiView";

export const dynamic = "force-dynamic";

export default async function ApiPage() {
  const profile = await getCurrentPlatformUser();
  if (!isControlOwner(profile?.email)) redirect("/meta-ads");

  const supabase = await createClient();
  const db = supabase.schema("meta_ads");
  const [conexiones, registro] = await Promise.all([
    db.from("api_conexiones").select("id, nombre, prefijo, puede_escribir, creado_at, ultimo_uso, usos, vence_at, revocado_at").order("creado_at", { ascending: false }),
    db.from("api_registro").select("id, creado_at, conexion, accion, ok, detalle").order("creado_at", { ascending: false }).limit(40),
  ]);

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "tu-plataforma";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

  return (
    <ApiView
      base={`${proto}://${host}`}
      conexiones={(conexiones.data ?? []) as ConexionApi[]}
      registro={(registro.data ?? []) as RegistroApi[]}
      error={conexiones.error?.message ?? null}
    />
  );
}
