import { redirect } from "next/navigation";
import { getCurrentPlatformUser } from "@/lib/platform";
import { isControlOwner } from "@/lib/control/owner";
import { createClient } from "@/lib/supabase/server";
import { ChatAgente, type MensajeChat } from "@/components/control/ChatAgente";

export const dynamic = "force-dynamic";

export default async function AgentePage() {
  const profile = await getCurrentPlatformUser();
  if (!isControlOwner(profile?.email)) redirect("/meta-ads");

  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("meta_ads")
    .from("chat_agente")
    .select("id, creado_at, rol, texto, estado, en_respuesta_a, tipo, permiso_id")
    .order("id", { ascending: false })
    .limit(100);

  return <ChatAgente inicial={((data ?? []) as MensajeChat[]).reverse()} error={error?.message ?? null} />;
}
