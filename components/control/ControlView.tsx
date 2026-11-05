import Link from "next/link";
import type { ControlData } from "@/lib/control/data";
import type { ResumenAlineacion } from "@/lib/control/portafolio";
import { cuando } from "@/lib/control/format";
import { SaldosStrip } from "./SaldosStrip";
import { AlertasPanel } from "./AlertasPanel";
import { SaludTabla } from "./SaludTabla";
import { AccionesAgente } from "./AccionesAgente";
import { HistorialCambios } from "./HistorialCambios";

function Seccion({ id, titulo, bajada, children }: { id: string; titulo: string; bajada?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <div>
        <h2 id={id} className="text-[18px] font-semibold tracking-tight">{titulo}</h2>
        {bajada && <p className="mt-1 max-w-[70ch] text-[13px] text-muted">{bajada}</p>}
      </div>
      {children}
    </section>
  );
}

export function ControlView({ data, alineacion }: { data: ControlData; alineacion: ResumenAlineacion | null }) {

  const pendientesCriticas = data.alertas.filter((a) => a.nivel === "rojo" && a.estado === "pendiente");
  // Las alertas de anuncios rechazados se cuentan una vez por campaña, como en el panel
  const decisiones = new Set(
    pendientesCriticas.map((a) => (a.regla.startsWith("R3") && a.dato.startsWith("Anuncio") ? `r3|${a.cuenta}|${a.campana}` : String(a.id))),
  ).size;
  // Un saldo bajo solo es urgente si hay campañas entregando (mismo criterio que las alertas de saldo)
  const saldosEnRiesgo = data.saldos.filter((s) => s.nivel === "pausada_meta" || (s.nivel === "corte" && s.con_entrega_hoy)).length;
  const total = decisiones + saldosEnRiesgo;

  const titular =
    total === 0
      ? "Todo en orden por ahora."
      : total === 1
        ? "Hay 1 cosa que necesita tu atención."
        : `Hay ${total} cosas que necesitan tu atención.`;

  const partes: string[] = [];
  if (decisiones) partes.push(`${decisiones} ${decisiones === 1 ? "alerta crítica" : "alertas críticas"} sin resolver`);
  if (saldosEnRiesgo) partes.push(`${saldosEnRiesgo} ${saldosEnRiesgo === 1 ? "cuenta" : "cuentas"} pausada o a punto de cortarse por saldo`);

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-10 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <header className="flex flex-col gap-3">
        <p className="text-[13px] text-muted">
          Último control del monitoreo {cuando(data.ultimoControl)}. {data.salud.length} campañas con entrega en los últimos 7 días.
        </p>
        <h1 className="max-w-[24ch] text-[34px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[44px]">{titular}</h1>
        {partes.length > 0 && <p className="text-[15px] text-soft">{partes.join(" y ")}.</p>}
        {data.errores.map((e) => (
          <p key={e} role="alert" className="rounded-lg border border-coral/40 bg-coral/10 px-3 py-2 text-[13px] text-coral">
            {e}
          </p>
        ))}
      </header>

      {alineacion && (
        <Link
          href="/control/conexiones"
          className="group flex flex-col gap-3 rounded-card border border-line bg-panel p-4 transition-colors hover:border-line-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-[12px] text-muted">Conexiones del portafolio</p>
            <p className="mt-0.5 text-[16px] font-semibold">
              <span className="tabular">{alineacion.puntaje}%</span> alineado
              <span className="font-normal text-soft">
                {" "}· faltan {alineacion.rojos} {alineacion.rojos === 1 ? "conexión" : "conexiones"} y {alineacion.amarillos} a revisar
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3 sm:w-[260px]">
            <div className="h-2 flex-1 rounded-full bg-panel-3" aria-hidden>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${alineacion.puntaje}%`,
                  background: alineacion.puntaje >= 90 ? "var(--color-green)" : alineacion.puntaje >= 60 ? "var(--color-amber)" : "var(--color-coral)",
                }}
              />
            </div>
            <span className="text-[13px] text-muted group-hover:text-soft">Ver →</span>
          </div>
        </Link>
      )}

      <Seccion id="saldos" titulo="Saldos" bajada="Dato del flujo de alertas de saldo, que revisa Meta cada 15 minutos.">
        <SaldosStrip saldos={data.saldos} />
      </Seccion>

      <Seccion
        id="alertas"
        titulo="Alertas del último control"
        bajada="Aprobá lo que el agente puede ejecutar o descartá lo que no corresponde. Antes de actuar, el agente hace la revisión 360° del playbook."
      >
        <AlertasPanel alertas={data.alertas} />
      </Seccion>

      <Seccion
        id="salud"
        titulo="Salud de las campañas activas"
        bajada="Cada campaña se compara con su objetivo de costo por conversación (o con su promedio de 30 días si todavía no tiene). El piso de aprendizaje es el presupuesto diario mínimo para unas 50 conversaciones por semana."
      >
        <SaludTabla salud={data.salud} />
      </Seccion>

      <Seccion id="agente" titulo="Acciones del agente">
        <AccionesAgente acciones={data.acciones.slice(0, 30)} />
      </Seccion>

      <Seccion
        id="cambios"
        titulo="Cambios en las cuentas"
        bajada="Historial de Meta de las últimas 48 horas en Ale Sopran y Sergio ADC. Un cambio sin registro del agente lo hizo una persona a mano o el agente se olvidó de anotarlo."
      >
        <HistorialCambios cambios={data.cambios} acciones={data.acciones} />
      </Seccion>
    </div>
  );
}
