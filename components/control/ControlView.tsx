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

export type PestanaControl = "hoy" | "campanas" | "agente";

const PESTANAS: { id: PestanaControl; texto: string }[] = [
  { id: "hoy", texto: "Hoy" },
  { id: "campanas", texto: "Campañas" },
  { id: "agente", texto: "Agente" },
];

export function ControlView({ data, alineacion, ver = "hoy" }: { data: ControlData; alineacion: ResumenAlineacion | null; ver?: PestanaControl }) {

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
        <h1 className={`max-w-[24ch] font-semibold leading-[1.08] tracking-[-0.02em] ${ver === "hoy" ? "text-[34px] sm:text-[44px]" : "text-[26px] sm:text-[30px]"}`}>{titular}</h1>
        {partes.length > 0 && <p className="text-[15px] text-soft">{partes.join(" y ")}.</p>}
        {data.errores.map((e) => (
          <p key={e} role="alert" className="rounded-lg border border-coral/40 bg-coral/10 px-3 py-2 text-[13px] text-coral">
            {e}
          </p>
        ))}
      </header>

      <nav aria-label="Vistas de Control" className="-mt-6 flex gap-1 border-b border-line">
        {PESTANAS.map((p) => {
          const n =
            p.id === "hoy" ? total : p.id === "campanas" ? data.salud.length : 0;
          return (
            <Link
              key={p.id}
              href={p.id === "hoy" ? "/control" : `/control?ver=${p.id}`}
              aria-current={ver === p.id ? "page" : undefined}
              className={`-mb-px border-b-2 px-3 py-2.5 text-[14px] font-semibold transition-colors ${
                ver === p.id ? "border-cyan text-text" : "border-transparent text-muted hover:text-soft"
              }`}
            >
              {p.texto}
              {n > 0 && <span className="tabular ml-1.5 text-[12px] font-normal text-muted">{n}</span>}
            </Link>
          );
        })}
      </nav>

      {ver === "hoy" && (
        <>
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

          <Seccion id="saldos" titulo="Saldos">
            <SaldosStrip saldos={data.saldos} />
          </Seccion>
          <Seccion id="alertas" titulo="Alertas del último control" bajada="Aprobá lo que el agente puede ejecutar o descartá lo que no corresponde.">
            <AlertasPanel alertas={data.alertas} />
          </Seccion>
        </>
      )}

      {ver === "campanas" && (
        <Seccion
          id="salud"
          titulo="Salud de las campañas activas"
          bajada="Costo por conversación contra su objetivo (o su promedio de 30 días). La marca en la barra es el presupuesto mínimo para que Meta aprenda."
        >
          <SaludTabla salud={data.salud} />
        </Seccion>
      )}

      {ver === "agente" && (
        <>
          <Seccion id="agente" titulo="Acciones del agente" bajada="Las que hizo juntas van en una sola tarjeta: tocá para ver el detalle.">
            <AccionesAgente acciones={data.acciones.slice(0, 60)} />
          </Seccion>
          <Seccion id="cambios" titulo="Cambios en las cuentas" bajada="Historial de Meta de las últimas 48 horas. Un cambio sin registro del agente lo hizo una persona a mano.">
            <HistorialCambios cambios={data.cambios} acciones={data.acciones} />
          </Seccion>
        </>
      )}
    </div>
  );
}
