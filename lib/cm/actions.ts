import { createClient } from "@/lib/supabase/client";

export async function approveItem(id: number) {
  const supabase = createClient();
  const { error } = await supabase
    .schema("crm_cm")
    .from("content_pipeline")
    .update({ estado: "Aprobado", aprobado: true, motivo_rechazo: null })
    .eq("id", id);
  if (error) throw error;
}

export async function editItem(id: number, fields: { hook?: string; summary?: string; copy?: string; cta?: string }) {
  const supabase = createClient();
  const { error } = await supabase
    .schema("crm_cm")
    .from("content_pipeline")
    .update({ ...fields, estado: "Guion" })
    .eq("id", id);
  if (error) throw error;
}

export async function rejectWithReason(id: number, motivo: string) {
  const supabase = createClient();
  const { error } = await supabase
    .schema("crm_cm")
    .from("content_pipeline")
    .update({ estado: "Idea", aprobado: false, motivo_rechazo: motivo })
    .eq("id", id);
  if (error) throw error;
}
