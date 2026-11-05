import type { Saldo } from "@/lib/control/data";
import { TONO_COLOR, cuando, money, type Tono } from "@/lib/control/format";

function tonoSaldo(s: Saldo): { tono: Tono; texto: string } {
  if (s.nivel === "pausada_meta") return { tono: "critico", texto: "Pausada por falta de pago" };
  if (s.nivel === "corte") return s.con_entrega_hoy
    ? { tono: "critico", texto: "A punto de cortarse" }
    : { tono: "atencion", texto: "Saldo bajo, sin campañas corriendo" };
  if (s.nivel === "gracia") return { tono: "atencion", texto: "Pago pendiente (gracia)" };
  if (s.nivel === "temprana") return { tono: "atencion", texto: "Conviene pagar pronto" };
  return { tono: "ok", texto: "Sin riesgo" };
}

export function SaldosStrip({ saldos }: { saldos: Saldo[] }) {
  if (!saldos.length) {
    return <p className="text-[13px] text-muted">Todavía no hay saldos registrados por el flujo de alertas de saldo.</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {saldos.map((s) => {
        const { tono, texto } = tonoSaldo(s);
        const color = TONO_COLOR[tono];
        const etiqueta = s.tipo === "prepago" ? "Fondos disponibles" : "Deuda acumulada";
        return (
          <div
            key={s.account_id}
            className="rounded-card border bg-panel p-4"
            style={{ borderColor: tono === "ok" ? "var(--color-line)" : `color-mix(in srgb, ${color} 45%, var(--color-line))` }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-[14px] font-semibold">{s.nombre}</h3>
              <span className="text-[11px] text-muted">{s.tipo === "prepago" ? "Prepago" : "Postpago"}</span>
            </div>
            <p className="tabular mt-2 text-[24px] font-semibold leading-none">{money(s.valor, s.currency)}</p>
            <p className="mt-1 text-[12px] text-muted">{etiqueta}</p>
            <p className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold" style={{ color }}>
              <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
              {texto}
            </p>
            <p className="mt-1 text-[11px] text-muted">Revisado {cuando(s.revisado_at)}</p>
          </div>
        );
      })}
    </div>
  );
}
