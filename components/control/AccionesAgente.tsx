import type { AccionAgente } from "@/lib/control/data";
import { cuando } from "@/lib/control/format";

const NIVEL_TEXTO: Record<number, string> = {
  1: "Lo hizo solo",
  2: "Avisó antes",
  3: "Con tu sí",
};

interface Tanda {
  key: string;
  titulo: string;
  motivo: string;
  nivel: number;
  creado_at: string;
  items: AccionAgente[];
}

// "Bajar presupuesto diario 50% (campaña)" y "(conjunto)" son la misma acción
const base = (accion: string) => accion.replace(/\s*\((campaña|conjunto|anuncio)\)\s*$/i, "").trim();

// Las acciones que el agente hizo juntas (misma acción y motivo, con menos de 15 minutos entre una y otra) van en una tarjeta
function agrupar(acciones: AccionAgente[]): Tanda[] {
  const out: Tanda[] = [];
  for (const a of acciones) {
    const ult = out[out.length - 1];
    const cerca = ult && Math.abs(new Date(ult.items[ult.items.length - 1].creado_at).getTime() - new Date(a.creado_at).getTime()) < 15 * 60_000;
    if (ult && cerca && ult.titulo === base(a.accion) && ult.motivo === a.motivo) ult.items.push(a);
    else out.push({ key: String(a.id), titulo: base(a.accion), motivo: a.motivo, nivel: a.nivel_autonomia, creado_at: a.creado_at, items: [a] });
  }
  return out;
}

function resultado(a: AccionAgente): { texto: string; color: string } {
  if (a.funciono === null) return { texto: a.revisar_el ? `se evalúa el ${a.revisar_el.split("-").reverse().slice(0, 2).join("/")}` : "sin evaluar", color: "var(--color-muted)" };
  return a.funciono ? { texto: "funcionó", color: "var(--color-green)" } : { texto: "no funcionó", color: "var(--color-coral)" };
}

// "Antes: $40,000/día" y "Después: $20,000.00/día; reactivado si…" → "$40.000 → $20.000"
function cambio(a: AccionAgente): string | null {
  const limpiar = (t: string | null) =>
    t
      ? t
          .replace(/;.*$/, "")
          .replace(/\/día/g, "")
          .replace(/\.00\b/g, "")
          .replace(/(\d),(\d{3})/g, "$1.$2")
          .trim()
      : null;
  const antes = limpiar(a.dato_antes);
  const despues = limpiar(a.dato_despues);
  if (!antes && !despues) return null;
  return `${antes ?? "—"} → ${despues ?? "—"}`;
}

function TandaCard({ t }: { t: Tanda }) {
  const una = t.items.length === 1;
  const a0 = t.items[0];
  return (
    <li className="rounded-card border border-line bg-panel">
      <details className="group">
        <summary className="flex cursor-pointer list-none flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3">
          <span className="text-[14px] font-semibold">
            {t.titulo}
            {!una && <span className="font-normal text-muted"> · {t.items.length} campañas</span>}
          </span>
          <span className="text-[12px] text-muted">
            {NIVEL_TEXTO[t.nivel] ?? ""} · {cuando(t.creado_at)} <span aria-hidden className="inline-block transition-transform group-open:rotate-90">›</span>
          </span>
          <span className="w-full text-[12px] text-muted">
            {una ? `${a0.cuenta}${a0.campana ? ` / ${a0.campana}` : ""}` : t.motivo}
          </span>
        </summary>
        <div className="border-t border-line px-4 py-3">
          {una ? (
            <div className="flex flex-col gap-1 text-[13px]">
              <p className="text-soft">{t.motivo}</p>
              {cambio(a0) && <p className="tabular text-muted">{cambio(a0)}</p>}
              <p style={{ color: resultado(a0).color }} className="text-[12px] font-semibold first-letter:uppercase">
                {resultado(a0).texto}
                {a0.nota_resultado ? `: ${a0.nota_resultado}` : ""}
              </p>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-line/60 text-[13px]">
              {t.items.map((a) => (
                <li key={a.id} className="grid grid-cols-1 gap-x-4 py-1.5 sm:grid-cols-[1fr_auto_auto]">
                  <span className="truncate" title={a.campana}>
                    {a.campana || a.objeto_id}
                    <span className="text-muted"> · {a.cuenta.replace(/\s*\.\.\.\d+$/, "")}</span>
                  </span>
                  <span className="tabular text-muted">{cambio(a) ?? ""}</span>
                  <span className="text-[12px] font-semibold" style={{ color: resultado(a).color }}>{resultado(a).texto}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>
    </li>
  );
}

export function AccionesAgente({ acciones }: { acciones: AccionAgente[] }) {
  if (!acciones.length) {
    return (
      <p className="max-w-[60ch] text-[13px] text-muted">
        El agente todavía no registró acciones. Cada acción aparece acá con el dato antes y después y, a los 3 días, si funcionó.
      </p>
    );
  }
  const tandas = agrupar(acciones);
  const visibles = tandas.slice(0, 5);
  const resto = tandas.slice(5);
  return (
    <div className="flex flex-col gap-3">
      <ol className="flex flex-col gap-2">
        {visibles.map((t) => (
          <TandaCard key={t.key} t={t} />
        ))}
      </ol>
      {resto.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer list-none text-[13px] font-semibold text-cyan">
            <span className="group-open:hidden">Ver {resto.length} anteriores</span>
            <span className="hidden group-open:inline">Ocultar anteriores</span>
          </summary>
          <ol className="mt-2 flex flex-col gap-2">
            {resto.map((t) => (
              <TandaCard key={t.key} t={t} />
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}
