"use client";

import { useMemo, useState } from "react";
import type { AccionAgente, CambioCuenta } from "@/lib/control/data";

const TZ = "America/Argentina/Buenos_Aires";
const VENTANA_MS = 3 * 3600 * 1000; // una acción del agente "explica" un cambio si ocurrió dentro de 3 h

type Filtro = "personas" | "todo";

// En el historial de Meta los nombres son los internos: CAMPAIGN_GROUP es la campaña,
// CAMPAIGN es el conjunto y ADGROUP es el anuncio.
const TIPO_TEXTO: Record<string, string> = {
  CAMPAIGN_GROUP: "Campaña",
  CAMPAIGN: "Conjunto",
  ADGROUP: "Anuncio",
  AD: "Anuncio",
  AD_ACCOUNT: "Cuenta",
  ACCOUNT: "Cuenta",
};

// Los cambios de creatividad traen enlaces largos de imágenes: se resumen
function limpiarDetalle(d: string | null): string | null {
  if (!d) return null;
  let t = d.replace(/\[?\s*"?https?:\/\/[^\s"\]]+"?\s*\]?/g, "(imagen)");
  t = t.replace(/(\(imagen\)[,\s]*){2,}/g, "(imágenes) ").replace(/\s+/g, " ").trim();
  if (/^antes: \(im[aá]gen(es)?\)/.test(t) || t === "(imagen)") return "Se cambió la imagen o el video del anuncio";
  // Presupuestos: Meta los informa en centavos
  if (/budget/i.test(t)) {
    t = t
      .replace(/(daily|lifetime)_budget:?\s*/i, (_m, k) => (k.toLowerCase() === "daily" ? "Presupuesto diario: " : "Presupuesto total: "))
      .replace(/\b(\d{4,})\b/g, (n) => "$" + Math.round(Number(n) / 100).toLocaleString("es-AR"));
  }
  return t.length > 180 ? t.slice(0, 177) + "…" : t;
}

function dia(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });
}
function hora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
}

export function HistorialCambios({ cambios, acciones }: { cambios: CambioCuenta[]; acciones: AccionAgente[] }) {
  const [filtro, setFiltro] = useState<Filtro>("personas");
  const [limite, setLimite] = useState(12);

  const conRegistro = useMemo(() => {
    return cambios.map((c) => {
      const t = new Date(c.event_time).getTime();
      const registrado =
        !!c.objeto_id &&
        acciones.some((a) => a.objeto_id === c.objeto_id && Math.abs(new Date(a.creado_at).getTime() - t) < VENTANA_MS);
      return { ...c, deMeta: (c.actor ?? "").trim().toLowerCase() === "meta", registrado };
    });
  }, [cambios, acciones]);

  const personas = conRegistro.filter((c) => !c.deMeta);
  const sinRegistro = personas.filter((c) => !c.registrado).length;
  const lista = (filtro === "personas" ? personas : conRegistro).slice(0, limite);
  const total = filtro === "personas" ? personas.length : conRegistro.length;

  if (!cambios.length) {
    return (
      <p className="max-w-[60ch] text-[13px] text-muted">
        No hay cambios registrados en las últimas 48 horas. El historial se actualiza en cada control del monitoreo.
      </p>
    );
  }

  const grupos: { dia: string; items: typeof lista }[] = [];
  for (const c of lista) {
    const d = dia(c.event_time);
    const g = grupos[grupos.length - 1];
    if (g && g.dia === d) g.items.push(c);
    else grupos.push({ dia: d, items: [c] });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] text-soft">
          {personas.length} {personas.length === 1 ? "cambio hecho" : "cambios hechos"} por personas o por el agente;{" "}
          <span style={{ color: sinRegistro ? "var(--color-amber)" : "var(--color-green)" }}>
            {sinRegistro === 0 ? "todos registrados por el agente" : `${sinRegistro} sin registro del agente`}
          </span>
          .
        </p>
        <div role="group" aria-label="Qué cambios mostrar" className="flex gap-1 rounded-lg border border-line bg-panel-2 p-1">
          {(
            [
              ["personas", "Personas y agente"],
              ["todo", "Todo, también Meta"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              aria-pressed={filtro === k}
              onClick={() => {
                setFiltro(k);
                setLimite(12);
              }}
              className={`rounded-md px-3 py-1.5 text-[12px] font-semibold cursor-pointer ${
                filtro === k ? "bg-panel-3 text-text" : "text-muted hover:text-soft"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {grupos.map((g) => (
        <section key={g.dia} aria-label={g.dia}>
          <h3 className="mb-2 text-[13px] font-semibold text-muted first-letter:uppercase">{g.dia}</h3>
          <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-panel">
            {g.items.map((c) => (
              <li key={c.id} className="grid grid-cols-[52px_1fr] gap-3 px-4 py-2.5 sm:grid-cols-[60px_1fr_auto]">
                <span className="tabular pt-0.5 text-[12px] text-muted">{hora(c.event_time)}</span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold">{c.evento}</p>
                  <p className="mt-0.5 truncate text-[12px] text-muted" title={c.objeto_nombre ?? undefined}>
                    {c.cuenta}
                    {c.objeto_tipo && TIPO_TEXTO[c.objeto_tipo] ? ` / ${TIPO_TEXTO[c.objeto_tipo]}` : ""}
                    {c.objeto_nombre && c.objeto_nombre !== c.objeto_id ? `: ${c.objeto_nombre}` : ""}
                  </p>
                  {limpiarDetalle(c.detalle) && <p className="mt-1 break-words text-[12px] text-soft">{limpiarDetalle(c.detalle)}</p>}
                </div>
                <div className="col-start-2 sm:col-start-auto sm:text-right">
                  {c.deMeta ? (
                    <span className="text-[11px] text-muted">Automático de Meta</span>
                  ) : c.registrado ? (
                    <span className="rounded-full bg-green/15 px-2 py-0.5 text-[11px] font-semibold text-green">Registrado por el agente</span>
                  ) : (
                    <span className="rounded-full bg-amber/15 px-2 py-0.5 text-[11px] font-semibold text-amber">
                      Sin registro del agente
                    </span>
                  )}
                  {c.actor && !c.deMeta && <p className="mt-1 text-[11px] text-muted">Perfil: {c.actor}</p>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {total > limite && (
        <button
          type="button"
          onClick={() => setLimite((l) => l + 20)}
          className="self-start text-[13px] font-semibold text-cyan underline-offset-2 hover:underline cursor-pointer"
        >
          Mostrar más ({total - limite} restantes)
        </button>
      )}
    </div>
  );
}
