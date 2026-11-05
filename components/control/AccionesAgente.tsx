import type { AccionAgente } from "@/lib/control/data";
import { cuando } from "@/lib/control/format";

const NIVEL_TEXTO: Record<number, string> = {
  1: "Nivel 1: lo hizo solo",
  2: "Nivel 2: avisó antes",
  3: "Nivel 3: con tu sí",
};

export function AccionesAgente({ acciones }: { acciones: AccionAgente[] }) {
  if (!acciones.length) {
    return (
      <p className="max-w-[60ch] text-[13px] text-muted">
        El agente todavía no registró acciones. Cuando actúe por nivel 1 o 2, cada acción aparece acá con el dato antes y
        después, y a los 3 días, si funcionó.
      </p>
    );
  }
  return (
    <ol className="flex flex-col gap-3">
      {acciones.map((a) => {
        const resultado =
          a.funciono === null ? (a.revisar_el ? `Se evalúa el ${a.revisar_el}` : "Sin evaluar") : a.funciono ? "Funcionó" : "No funcionó";
        const colorRes = a.funciono === null ? "var(--color-muted)" : a.funciono ? "var(--color-green)" : "var(--color-coral)";
        return (
          <li key={a.id} className="rounded-card border border-line bg-panel p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-[14px] font-semibold">{a.accion}</span>
              <span className="text-[12px] text-muted">{cuando(a.creado_at)}</span>
            </div>
            <p className="mt-1 text-[12px] text-muted">
              {a.cuenta}
              {a.campana ? ` / ${a.campana}` : ""}. {NIVEL_TEXTO[a.nivel_autonomia] ?? ""}
            </p>
            <p className="mt-2 text-[13px] text-soft">{a.motivo}</p>
            {(a.dato_antes || a.dato_despues) && (
              <p className="tabular mt-1 text-[12px] text-muted">
                Antes: {a.dato_antes ?? "sin dato"}. Después: {a.dato_despues ?? "sin dato"}.
              </p>
            )}
            <p className="mt-2 text-[12px] font-semibold" style={{ color: colorRes }}>
              {resultado}
              {a.nota_resultado ? `: ${a.nota_resultado}` : ""}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
