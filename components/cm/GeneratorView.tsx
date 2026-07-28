"use client";

import { useState } from "react";
import { MARCAS_ACTIVAS } from "@/lib/cm/brands";
import { usePipelineContent, useExcursionCatalog } from "@/lib/cm/hooks";
import { Card, CardHeader, CardTitle, CardSub } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Modo = "brief" | "catalogo" | "tendencia" | "chatwoot";

const WEBHOOK_BY_MODO: Record<Modo, string> = {
  brief: process.env.NEXT_PUBLIC_CM_WEBHOOK_URL!,
  catalogo: process.env.NEXT_PUBLIC_CM_CATALOG_WEBHOOK_URL!,
  tendencia: process.env.NEXT_PUBLIC_CM_TREND_WEBHOOK_URL!,
  chatwoot: process.env.NEXT_PUBLIC_CM_CHATWOOT_WEBHOOK_URL!,
};

const CHIPS: { key: Modo; label: string }[] = [
  { key: "brief", label: "Brief manual" },
  { key: "catalogo", label: "Desde catálogo" },
  { key: "tendencia", label: "Desde tendencia" },
  { key: "chatwoot", label: "Desde Chatwoot" },
];

export function GeneratorView() {
  const [modo, setModo] = useState<Modo>("brief");
  const [brief, setBrief] = useState("");
  const [excursionId, setExcursionId] = useState<string>("azar");
  const [formato, setFormato] = useState<"Reel" | "Carrusel" | "Stories" | "Ad">("Reel");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultCount, setResultCount] = useState<number | null>(null);
  const [resultLabel, setResultLabel] = useState<string | null>(null);
  const { refetch } = usePipelineContent();
  const { excursiones, loading: loadingExcursiones } = useExcursionCatalog();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (modo === "brief" && !brief.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setResultCount(null);
    setResultLabel(null);
    try {
      const body =
        modo === "brief"
          ? { brief, formato }
          : modo === "catalogo"
            ? { formato, ...(excursionId !== "azar" ? { excursion_id: Number(excursionId) } : {}) }
            : { formato };
      const res = await fetch(WEBHOOK_BY_MODO[modo], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`El generador respondió ${res.status}`);
      const data = await res.json();
      if (modo === "catalogo") {
        setResultCount(data.count ?? null);
        setResultLabel(data.excursion_nombre ?? null);
      } else if (modo === "tendencia" || modo === "chatwoot") {
        setResultCount(data.count ?? null);
        setResultLabel(data.tema ?? null);
      } else {
        const rows = Array.isArray(data) ? data : [data];
        setResultCount(rows.length);
      }
      await refetch();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error generando contenido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Generador TM</CardTitle>
            <CardSub>Crear piezas para las {MARCAS_ACTIVAS.length} marcas</CardSub>
          </div>
        </CardHeader>

        <div className="flex gap-1.5 flex-wrap mb-4">
          {CHIPS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setModo(c.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition border ${
                modo === c.key ? "bg-panel-3 text-cyan border-line-2" : "text-muted border-line hover:text-soft"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          {modo === "brief" && (
            <label className="flex flex-col gap-1.5 text-xs font-bold text-soft">
              Brief
              <textarea
                className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-xs font-normal text-text"
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Ej: Promocionar la excursión a Piedras Blancas para la temporada de nieve"
                rows={4}
                required
              />
            </label>
          )}
          {modo === "catalogo" && (
            <label className="flex flex-col gap-1.5 text-xs font-bold text-soft">
              Excursión
              <select
                className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-xs font-normal text-text"
                value={excursionId}
                onChange={(e) => setExcursionId(e.target.value)}
                disabled={loadingExcursiones}
              >
                <option value="azar">Cualquiera (al azar)</option>
                {excursiones.map((exc) => (
                  <option key={exc.id} value={exc.id}>
                    {exc.nombre}
                  </option>
                ))}
              </select>
            </label>
          )}
          {modo === "tendencia" && (
            <p className="text-xs text-muted">
              El generador busca en la web qué tema de nieve/invierno en Bariloche está generando interés esta
              semana y arma el contenido sobre eso — no hace falta elegir nada más.
            </p>
          )}
          {modo === "chatwoot" && (
            <p className="text-xs text-muted">
              El generador revisa las preguntas reales que hicieron los clientes por WhatsApp esta semana y arma
              contenido que responde la duda que más se repite — no hace falta elegir nada más.
            </p>
          )}
          <label className="flex flex-col gap-1.5 text-xs font-bold text-soft">
            Formato
            <select
              className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-xs font-normal text-text"
              value={formato}
              onChange={(e) => setFormato(e.target.value as typeof formato)}
            >
              <option>Reel</option>
              <option>Carrusel</option>
              <option>Stories</option>
              <option>Ad</option>
            </select>
          </label>
          <Button variant="primary" type="submit" disabled={loading} className="self-start">
            {loading
              ? modo === "tendencia" || modo === "chatwoot"
                ? "Investigando y generando…"
                : "Generando para las 9 marcas…"
              : "Generar contenido"}
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Resultado</CardTitle>
            <CardSub>Estado de la generación</CardSub>
          </div>
        </CardHeader>
        {errorMsg && <div className="text-xs text-coral">{errorMsg}</div>}
        {resultCount !== null && !errorMsg && (
          <div className="text-xs text-soft">
            Se generaron {resultCount} piezas{resultLabel ? ` sobre "${resultLabel}"` : ""} — revisalas en la
            pestaña Pipeline, columna &quot;Idea&quot;.
          </div>
        )}
        {!errorMsg && resultCount === null && !loading && (
          <div className="text-xs text-muted">
            {modo === "brief" && 'Completá el brief y hacé click en "Generar contenido".'}
            {modo === "catalogo" && 'Elegí una excursión (o dejá "al azar") y hacé click en "Generar contenido".'}
            {modo === "tendencia" && 'Hacé click en "Generar contenido" — puede tardar un poco más porque primero investiga en la web.'}
            {modo === "chatwoot" && 'Hacé click en "Generar contenido" — puede tardar un poco más porque primero revisa las conversaciones recientes de WhatsApp.'}
          </div>
        )}
      </Card>
    </div>
  );
}
