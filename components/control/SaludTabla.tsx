import type { SaludCampana } from "@/lib/control/data";
import { TONO_COLOR, money, num } from "@/lib/control/format";
import { FaseChip } from "./FaseChip";

function Delta({ actual, referencia }: { actual: number | null; referencia: number | null }) {
  if (actual === null || referencia === null || referencia === 0) return <span className="text-muted">sin referencia</span>;
  const d = actual / referencia - 1;
  const color = d > 0.6 ? TONO_COLOR.critico : d > 0.3 ? TONO_COLOR.atencion : d <= 0 ? TONO_COLOR.ok : "var(--color-soft)";
  const signo = d > 0 ? "+" : "";
  return (
    <span className="tabular" style={{ color }}>
      {signo}
      {Math.round(d * 100)}% vs {money(referencia)}
    </span>
  );
}

// La barra muestra el presupuesto diario contra el piso que Meta necesita para aprender
// (unas 7 conversaciones por día al costo actual). La marca vertical es el piso.
function PisoBar({ presupuesto, piso }: { presupuesto: number | null; piso: number | null }) {
  if (!presupuesto || !piso) {
    return <span className="text-[12px] text-muted">{presupuesto ? money(presupuesto) + " por día" : "sin dato"}</span>;
  }
  const max = Math.max(presupuesto, piso) * 1.15;
  const bajo = presupuesto < piso;
  const color = bajo ? TONO_COLOR.critico : TONO_COLOR.ok;
  return (
    <div className="min-w-[150px]">
      <div className="relative h-2 rounded-full bg-panel-3" role="img" aria-label={`Presupuesto ${money(presupuesto)} por día; piso de aprendizaje ${money(piso)}`}>
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(presupuesto / max) * 100}%`, background: color }} />
        <div className="absolute -top-1 -bottom-1 w-[2px] rounded bg-text" style={{ left: `${(piso / max) * 100}%` }} />
      </div>
      <div className="tabular mt-1.5 flex justify-between gap-3 text-[11px]">
        <span style={{ color: bajo ? color : "var(--color-soft)" }}>{money(presupuesto)}/día</span>
        <span className="text-muted">piso {money(piso)}</span>
      </div>
    </div>
  );
}

export function SaludTabla({ salud }: { salud: SaludCampana[] }) {
  if (!salud.length) {
    return <p className="text-[13px] text-muted">Todavía no hay una foto de salud. Se genera en cada control del monitoreo (9:00, 18:00 y lunes 10:00).</p>;
  }
  const filas = [...salud].sort((a, b) => b.gasto_7d - a.gasto_7d);
  return (
    <>
      <div className="hidden overflow-hidden rounded-card border border-line bg-panel lg:block">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-line text-[12px] text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Campaña</th>
              <th scope="col" className="px-3 py-3 font-semibold">Fase</th>
              <th scope="col" className="px-3 py-3 text-right font-semibold">Gasto 7 días</th>
              <th scope="col" className="px-3 py-3 text-right font-semibold">Conversaciones</th>
              <th scope="col" className="px-3 py-3 font-semibold">Costo por conversación</th>
              <th scope="col" className="px-3 py-3 text-right font-semibold">Frecuencia</th>
              <th scope="col" className="px-4 py-3 font-semibold">Presupuesto vs piso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filas.map((s) => {
              const freqColor = (s.frecuencia_7d ?? 0) >= 3 ? TONO_COLOR.critico : (s.frecuencia_7d ?? 0) >= 2.5 ? TONO_COLOR.atencion : undefined;
              return (
                <tr key={s.id} className="align-top">
                  <td className="max-w-[280px] px-4 py-3">
                    <div className="truncate font-semibold" title={s.campana}>{s.campana}</div>
                    <div className="text-[12px] text-muted">{s.cuenta}</div>
                  </td>
                  <td className="px-3 py-3"><FaseChip fase={s.fase_aprendizaje} /></td>
                  <td className="tabular px-3 py-3 text-right">{money(s.gasto_7d)}</td>
                  <td className="tabular px-3 py-3 text-right">{num(s.conversaciones_7d)}</td>
                  <td className="px-3 py-3">
                    <div className="tabular font-semibold">{s.costo_conv_7d === null ? "sin conversaciones" : money(s.costo_conv_7d)}</div>
                    <div className="text-[12px]"><Delta actual={s.costo_conv_7d} referencia={s.costo_referencia} /></div>
                  </td>
                  <td className="tabular px-3 py-3 text-right" style={{ color: freqColor }}>{num(s.frecuencia_7d, 2)}</td>
                  <td className="px-4 py-3"><PisoBar presupuesto={s.presupuesto_diario} piso={s.piso_aprendizaje} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-3 lg:hidden">
        {filas.map((s) => (
          <li key={s.id} className="rounded-card border border-line bg-panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-[14px] break-words">{s.campana}</div>
                <div className="text-[12px] text-muted">{s.cuenta}</div>
              </div>
              <FaseChip fase={s.fase_aprendizaje} />
            </div>
            <dl className="tabular mt-3 grid grid-cols-3 gap-2 text-[12px]">
              <div><dt className="text-muted">Gasto 7 días</dt><dd className="mt-0.5 font-semibold text-[13px]">{money(s.gasto_7d)}</dd></div>
              <div><dt className="text-muted">Conversaciones</dt><dd className="mt-0.5 font-semibold text-[13px]">{num(s.conversaciones_7d)}</dd></div>
              <div><dt className="text-muted">Frecuencia</dt><dd className="mt-0.5 font-semibold text-[13px]">{num(s.frecuencia_7d, 2)}</dd></div>
            </dl>
            <p className="mt-3 text-[13px]">
              <span className="tabular font-semibold">{s.costo_conv_7d === null ? "Sin conversaciones" : money(s.costo_conv_7d)}</span>
              <span className="text-muted"> por conversación, </span>
              <Delta actual={s.costo_conv_7d} referencia={s.costo_referencia} />
            </p>
            <div className="mt-3"><PisoBar presupuesto={s.presupuesto_diario} piso={s.piso_aprendizaje} /></div>
          </li>
        ))}
      </ul>
    </>
  );
}
