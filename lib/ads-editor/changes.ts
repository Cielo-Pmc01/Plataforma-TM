// Registro de cambios del editor de anuncios (tabla platform.ad_changes, con RLS solo para admins).
// Cada edición queda anotada y alimenta el botón "Deshacer".

import { createClient } from "@/lib/supabase/server";
import type { Changes } from "./welcome";

export interface ChangeRow {
  id: string;
  created_at: string;
  user_email: string | null;
  ad_account_id: string;
  ad_id: string;
  ad_name: string | null;
  previous_creative_id: string;
  new_creative_id: string | null;
  changes: Changes | Record<string, unknown>;
  status: "applied" | "failed" | "undone";
  error: string | null;
  undone_at: string | null;
}

const COLUMNS =
  "id, created_at, user_email, ad_account_id, ad_id, ad_name, previous_creative_id, new_creative_id, changes, status, error, undone_at";

export async function logChange(row: {
  userId: string;
  userEmail: string;
  accountId: string;
  adId: string;
  adName: string | null;
  previousCreativeId: string;
  newCreativeId: string | null;
  changes: Record<string, unknown>;
  status: "applied" | "failed";
  error?: string;
}): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("platform")
    .from("ad_changes")
    .insert({
      user_id: row.userId,
      user_email: row.userEmail,
      ad_account_id: row.accountId,
      ad_id: row.adId,
      ad_name: row.adName,
      previous_creative_id: row.previousCreativeId,
      new_creative_id: row.newCreativeId,
      changes: row.changes,
      status: row.status,
      error: row.error ?? null,
    })
    .select("id")
    .single();
  if (error) {
    console.error("[ads-editor] no se pudo registrar el cambio:", error.message);
    return null;
  }
  return data.id as string;
}

export async function listChanges(adId: string, limit = 20): Promise<ChangeRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("platform")
    .from("ad_changes")
    .select(COLUMNS)
    .eq("ad_id", adId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error("No se pudo leer el historial de cambios.");
  return (data ?? []) as ChangeRow[];
}

export async function getChange(id: string): Promise<ChangeRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.schema("platform").from("ad_changes").select(COLUMNS).eq("id", id).maybeSingle();
  return (data as ChangeRow | null) ?? null;
}

export async function markUndone(id: string, userId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .schema("platform")
    .from("ad_changes")
    .update({ status: "undone", undone_at: new Date().toISOString(), undone_by: userId })
    .eq("id", id);
  if (error) console.error("[ads-editor] no se pudo marcar el cambio como deshecho:", error.message);
}
