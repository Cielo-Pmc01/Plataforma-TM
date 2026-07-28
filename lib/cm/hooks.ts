"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ContentItem } from "./types";

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"] as const;

interface ContentPipelineRow {
  id: number;
  marca: string;
  formato: string;
  estado: string;
  aprobado: boolean;
  owner: string | null;
  objective: string | null;
  hook: string;
  summary: string;
  cta: string | null;
  score: number | null;
  copy: string | null;
  slides: string[];
  media_candidatos: string[];
  fecha_publicacion: string | null;
  hora: string | null;
  origen: string;
  motivo_rechazo: string | null;
}

function toContentItem(row: ContentPipelineRow): ContentItem {
  const fecha = row.fecha_publicacion ? new Date(row.fecha_publicacion + "T00:00:00") : null;
  return {
    id: row.id,
    marca: row.marca as ContentItem["marca"],
    format: row.formato as ContentItem["format"],
    status: row.estado as ContentItem["status"],
    aprobado: row.aprobado,
    owner: row.owner ?? "Sin asignar",
    day: fecha ? DAY_NAMES[fecha.getDay()] : "Sin fecha",
    time: row.hora ?? "--:--",
    objective: row.objective ?? "—",
    hook: row.hook,
    summary: row.summary,
    cta: row.cta ?? "",
    score: row.score ?? 0,
    copy: row.copy,
    slides: row.slides ?? [],
    mediaCandidatos: row.media_candidatos ?? [],
    fechaPublicacion: row.fecha_publicacion,
    origen: row.origen as ContentItem["origen"],
    motivoRechazo: row.motivo_rechazo,
  };
}

export function usePipelineContent() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .schema("crm_cm")
      .from("content_pipeline")
      .select("*")
      .order("created_at", { ascending: false });
    if (err) {
      setError(err.message);
      setItems([]);
    } else {
      setItems((data as ContentPipelineRow[]).map(toContentItem));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { items, loading, error, refetch };
}

interface SummaryRow {
  marca: string;
  estado: string;
  total: number;
}

export interface PipelineSummary {
  total: number;
  porEstado: Record<string, number>;
  porMarca: Record<string, number>;
}

const EMPTY_SUMMARY: PipelineSummary = { total: 0, porEstado: {}, porMarca: {} };

export function usePipelineSummary() {
  const [summary, setSummary] = useState<PipelineSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase.schema("crm_cm").from("pipeline_summary").select("*");
    if (err) {
      setError(err.message);
      setSummary(EMPTY_SUMMARY);
    } else {
      const rows = data as SummaryRow[];
      const porEstado: Record<string, number> = {};
      const porMarca: Record<string, number> = {};
      let total = 0;
      for (const row of rows) {
        porEstado[row.estado] = (porEstado[row.estado] ?? 0) + row.total;
        porMarca[row.marca] = (porMarca[row.marca] ?? 0) + row.total;
        total += row.total;
      }
      setSummary({ total, porEstado, porMarca });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { summary, loading, error, refetch };
}

export interface ExcursionOption {
  id: number;
  nombre: string;
}

export function useExcursionCatalog() {
  const [excursiones, setExcursiones] = useState<ExcursionOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    (async () => {
      const { data, error } = await supabase
        .schema("crm_cm")
        .from("excursion_catalog")
        .select("id, nombre")
        .eq("activa", true)
        .eq("temporada", "invierno")
        .order("nombre", { ascending: true });
      if (!cancelled) {
        setExcursiones(error ? [] : (data as ExcursionOption[]));
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { excursiones, loading };
}
