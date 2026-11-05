import Link from "next/link";
import type { Activos, Chequeo, EstadoChequeo, MapaPortafolio, MarcaMapa, NumeroWsp, Pendiente } from "@/lib/control/portafolio";
import { cuando, money } from "@/lib/control/format";

const COLUMNAS: { clave: string; titulo: string }[] = [
  { clave: "pagina", titulo: "Página" },
  { clave: "ig", titulo: "Instagram" },
  { clave: "wsp", titulo: "WhatsApp API" },
  { clave: "wsp_nombre", titulo: "Nombre WA" },
  { clave: "wsp_calidad", titulo: "Calidad WA" },
  { clave: "pixel", titulo: "Píxel" },
];

const PRIORIDAD: Record<number, string> = {
  1: "Marcas en foco",
  2: "Marcas activas",
  3: "Orden del portafolio",
};

function color(ok: EstadoChequeo | undefined): string {
  if (ok === true) return "var(--color-green)";
  if (ok === "parcial") return "var(--color-amber)";
  if (ok === false) return "var(--color-coral)";
  return "var(--color-line-2)";
}

// Los estados de Meta llegan en inglés desde el flujo
function limpiar(t: string): string {
  return t.replace("CONNECTED", "conectado").replace("DISCONNECTED", "desconectado").replace("PENDING", "pendiente");
}

function Estado({ ch }: { ch?: Chequeo }) {
  if (!ch) return <span className="text-[12px] text-muted" aria-label="No aplica">—</span>;
  const simbolo = ch.ok === true ? "✓" : ch.ok === "parcial" ? "!" : "✕";
  const texto = ch.ok === true ? "Listo" : ch.ok === "parcial" ? "A revisar" : "Falta";
  return (
    <span className="inline-flex items-center gap-1.5" title={limpiar(ch.detalle)}>
      <span
        aria-hidden
        className="grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold"
        style={{ background: `color-mix(in srgb, ${color(ch.ok)} 18%, transparent)`, color: color(ch.ok) }}
      >
        {simbolo}
      </span>
      <span className="sr-only">
        {texto}: {limpiar(ch.detalle)}
      </span>
    </span>
  );
}

function Barra({ valor, alto = 6 }: { valor: number; alto?: number }) {
  const c = valor >= 90 ? "var(--color-green)" : valor >= 60 ? "var(--color-amber)" : "var(--color-coral)";
  return (
    <div className="w-full rounded-full bg-panel-3" style={{ height: alto }} role="img" aria-label={`${valor}% alineado`}>
      <div className="h-full rounded-full" style={{ width: `${Math.max(2, valor)}%`, background: c }} />
    </div>
  );
}

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

function PendientesLista({ pendientes }: { pendientes: Pendiente[] }) {
  if (!pendientes.length) return <p className="text-[13px] text-muted">No hay nada pendiente. El portafolio está al 100 %.</p>;
  const grupos = [1, 2, 3].map((p) => ({ p, items: pendientes.filter((x) => x.prioridad === p) })).filter((g) => g.items.length);
  return (
    <div className="flex flex-col gap-6">
      {grupos.map((g) => (
        <div key={g.p} className="flex flex-col gap-2">
          <h3 className="text-[13px] font-semibold text-soft">
            {PRIORIDAD[g.p]} <span className="font-normal text-muted">· {g.items.length}</span>
          </h3>
          <ol className="flex flex-col divide-y divide-line overflow-hidden rounded-card border border-line bg-panel">
            {g.items.map((x, i) => (
              <li key={i} className="flex gap-3 px-4 py-3">
                <span
                  aria-hidden
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ background: x.nivel === "rojo" ? "var(--color-coral)" : "var(--color-amber)" }}
                />
                <div className="min-w-0">
                  <p className="text-[14px]">
                    <span className="font-semibold">{x.sujeto}</span>
                    <span className="sr-only">{x.nivel === "rojo" ? " (falta)" : " (a revisar)"}</span>
                    <span className="text-soft"> — {x.problema}</span>
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted">Qué hacer: {x.accion}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

function MatrizMarcas({ marcas }: { marcas: MarcaMapa[] }) {
  const porClave = (m: MarcaMapa, k: string) => m.chequeos.find((c) => c.clave === k);
  return (
    <>
      <div className="hidden overflow-hidden rounded-card border border-line bg-panel lg:block">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-line text-[12px] text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Marca</th>
              {COLUMNAS.map((c) => (
                <th key={c.clave} scope="col" className="px-3 py-3 text-center font-semibold">{c.titulo}</th>
              ))}
              <th scope="col" className="w-[150px] px-4 py-3 font-semibold">Alineación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {marcas.map((m) => (
              <tr key={m.page_id}>
                <th scope="row" className="px-4 py-2.5 font-normal">
                  <span className="font-semibold">{m.marca}</span>
                  <span className="block text-[11px] text-muted">
                    {m.portafolio}
                    {m.notas ? ` · ${m.notas}` : ""}
                  </span>
                </th>
                {COLUMNAS.map((c) => (
                  <td key={c.clave} className="px-3 py-2.5 text-center">
                    <Estado ch={porClave(m, c.clave)} />
                  </td>
                ))}
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Barra valor={m.puntaje} />
                    <span className="tabular w-9 text-right text-[12px] text-soft">{m.puntaje}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-3 lg:hidden">
        {marcas.map((m) => (
          <li key={m.page_id} className="rounded-card border border-line bg-panel p-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-semibold">{m.marca}</span>
              <span className="tabular text-[13px] text-soft">{m.puntaje}%</span>
            </div>
            <p className="text-[11px] text-muted">
              {m.portafolio}
              {m.notas ? ` · ${m.notas}` : ""}
            </p>
            <div className="mt-2">
              <Barra valor={m.puntaje} />
            </div>
            <ul className="mt-3 flex flex-col gap-1.5">
              {m.chequeos.map((c) => (
                <li key={c.clave} className="flex items-start gap-2 text-[12px]">
                  <Estado ch={c} />
                  <span>
                    <span className="text-soft">{COLUMNAS.find((x) => x.clave === c.clave)?.titulo ?? c.etiqueta ?? c.clave}</span>
                    <span className="text-muted"> — {limpiar(c.detalle)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </>
  );
}

const ESTADO_CUENTA: Record<number, string> = {
  1: "Activa",
  2: "Deshabilitada",
  3: "Deuda sin saldar",
  7: "En revisión",
  8: "Pago pendiente",
  9: "Período de gracia",
  100: "Cierre pendiente",
  101: "Cerrada",
};
const NOMBRE_WA: Record<string, string> = {
  APPROVED: "Aprobado",
  AVAILABLE_WITHOUT_REVIEW: "Habilitado",
  PENDING_REVIEW: "En revisión",
  DECLINED: "Rechazado",
  NON_EXISTS: "Sin nombre",
};
const CALIDAD: Record<string, string> = { GREEN: "Alta", YELLOW: "Media", RED: "Baja", UNKNOWN: "Sin datos" };

function Detalle({ titulo, cantidad, children }: { titulo: string; cantidad: number; children: React.ReactNode }) {
  return (
    <details className="group rounded-card border border-line bg-panel">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[14px] font-semibold">
        <span>
          {titulo} <span className="font-normal text-muted">· {cantidad}</span>
        </span>
        <span aria-hidden className="text-muted transition-transform group-open:rotate-90">›</span>
      </summary>
      <div className="overflow-x-auto border-t border-line">{children}</div>
    </details>
  );
}

function Inventario({ mapa }: { mapa: MapaPortafolio }) {
  const a = mapa.activos;
  type FilaWsp = { w: Activos["whatsapp"][number]; n: NumeroWsp | null };
  const numeros: FilaWsp[] = a.whatsapp.flatMap((w): FilaWsp[] => (w.numeros.length ? w.numeros.map((n) => ({ w, n })) : [{ w, n: null }]));
  const celda = "px-4 py-2 align-top";
  return (
    <div className="flex flex-col gap-3">
      <Detalle titulo="Números de WhatsApp API" cantidad={numeros.length}>
        <table className="w-full min-w-[620px] text-left text-[13px]">
          <thead className="text-[12px] text-muted">
            <tr>
              <th scope="col" className={celda}>Cuenta</th>
              <th scope="col" className={celda}>Número</th>
              <th scope="col" className={celda}>Nombre visible</th>
              <th scope="col" className={celda}>Calidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {numeros.map(({ w, n }, i) => (
              <tr key={i}>
                <td className={celda}>
                  {w.nombre}
                  <span className="block text-[11px] text-muted">{w.relacion === "compartida" ? "Compartida con Turismo Patagonia" : "Propia"}</span>
                </td>
                <td className={`${celda} tabular`}>{n ? n.numero : <span className="text-muted">sin número</span>}</td>
                <td className={celda}>
                  {n ? (
                    <>
                      {n.nombre_verificado}
                      <span
                        className="block text-[11px]"
                        style={{
                          color:
                            n.estado_nombre === "DECLINED" || n.estado_nombre === "NON_EXISTS"
                              ? "var(--color-coral)"
                              : n.estado_nombre === "PENDING_REVIEW"
                                ? "var(--color-amber)"
                                : "var(--color-green)",
                        }}
                      >
                        {NOMBRE_WA[n.estado_nombre] ?? n.estado_nombre}
                      </span>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className={celda}>{n ? CALIDAD[n.calidad] ?? n.calidad : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Detalle>

      <Detalle titulo="Píxeles" cantidad={a.pixeles.length}>
        <table className="w-full min-w-[520px] text-left text-[13px]">
          <thead className="text-[12px] text-muted">
            <tr>
              <th scope="col" className={celda}>Píxel</th>
              <th scope="col" className={celda}>Último evento</th>
              <th scope="col" className={celda}>Dónde está</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {[...a.pixeles]
              .sort((x, y) => (y.ultimo_evento ?? "").localeCompare(x.ultimo_evento ?? ""))
              .map((p) => (
                <tr key={p.id}>
                  <td className={celda}>
                    {p.nombre}
                    <span className="tabular block text-[11px] text-muted">{p.id}</span>
                  </td>
                  <td className={celda}>{p.ultimo_evento ? cuando(p.ultimo_evento) : <span className="text-muted">nunca</span>}</td>
                  <td className={`${celda} text-[12px] text-muted`}>{p.origen.join(", ")}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </Detalle>

      <Detalle titulo="Cuentas publicitarias" cantidad={a.cuentas.length}>
        <table className="w-full min-w-[520px] text-left text-[13px]">
          <thead className="text-[12px] text-muted">
            <tr>
              <th scope="col" className={celda}>Cuenta</th>
              <th scope="col" className={celda}>Estado</th>
              <th scope="col" className={celda}>Portafolio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {a.cuentas.map((c) => (
              <tr key={c.id}>
                <td className={celda}>
                  {c.nombre === c.id.replace("act_", "") ? <span className="text-muted">Sin nombre</span> : c.nombre}
                  <span className="tabular block text-[11px] text-muted">{c.id.replace("act_", "")}</span>
                </td>
                <td className={celda} style={{ color: c.estado === 1 ? "var(--color-green)" : "var(--color-coral)" }}>
                  {ESTADO_CUENTA[c.estado] ?? `Estado ${c.estado}`}
                  {c.deuda > 0 && c.estado !== 1 && <span className="tabular block text-[11px]">Adeuda {money(c.deuda, c.moneda)}</span>}
                </td>
                <td className={`${celda} text-[12px] text-muted`}>{c.portafolio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Detalle>

      <Detalle titulo="Apps" cantidad={a.apps.length}>
        <ul className="divide-y divide-line text-[13px]">
          {a.apps.map((x) => (
            <li key={x.id} className="flex justify-between gap-3 px-4 py-2">
              <span>
                {x.nombre}
                <span className="block text-[11px] text-muted">
                  {x.relacion === "compartida" ? "Compartida con " : x.relacion === "propia" ? "Propia de " : ""}
                  {(x.portafolios ?? ["Turismo Patagonia"]).join(" y ")}
                </span>
              </span>
              <span className="tabular text-[11px] text-muted">{x.id}</span>
            </li>
          ))}
        </ul>
      </Detalle>
    </div>
  );
}

export function ConexionesView({ mapa, error }: { mapa: MapaPortafolio | null; error: string | null }) {
  if (!mapa) {
    return (
      <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <Link href="/control" className="text-[13px] text-muted hover:text-soft">← Control</Link>
        <h1 className="text-[34px] font-semibold tracking-[-0.02em]">Conexiones del portafolio</h1>
        <p className="text-[14px] text-soft">{error ?? "Todavía no hay un mapa. Se genera todos los días a las 7:40."}</p>
      </div>
    );
  }

  const activas = mapa.marcas.filter((m) => m.activa);
  const inactivas = mapa.marcas.filter((m) => !m.activa);
  const rojos = mapa.pendientes.filter((p) => p.nivel === "rojo").length;
  const amarillos = mapa.pendientes.length - rojos;
  const completas = activas.filter((m) => m.puntaje === 100).length;

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-10 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <header className="flex flex-col gap-3">
        <Link href="/control" className="text-[13px] text-muted hover:text-soft">← Control</Link>
        <p className="text-[13px] text-muted">
          Conexiones del portafolio · foto del {cuando(mapa.creado_at)} · se actualiza todos los días a las 7:40
        </p>
        <h1 className="text-[34px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[44px]">
          <span className="tabular">{mapa.puntaje}%</span> alineado
        </h1>
        <div className="max-w-[560px]">
          <Barra valor={mapa.puntaje} alto={10} />
        </div>
        <p className="text-[15px] text-soft">
          {completas} de {activas.length} marcas completas. Para llegar al 100 % faltan {rojos}{" "}
          {rojos === 1 ? "conexión" : "conexiones"} y hay {amarillos} {amarillos === 1 ? "punto" : "puntos"} a revisar.
        </p>
        {error && (
          <p role="alert" className="rounded-lg border border-coral/40 bg-coral/10 px-3 py-2 text-[13px] text-coral">{error}</p>
        )}
      </header>

      <Seccion id="portafolios" titulo="Portafolios" bajada="El principal concentra las páginas, Instagram y WhatsApp; el de respaldo tiene que quedar listo por si algo le pasa al principal.">
        <div className="grid gap-3 md:grid-cols-3">
          {mapa.portafolios.map((p) => (
            <article key={p.id} className="rounded-card border border-line bg-panel p-4">
              <p className="text-[12px] text-muted">{p.rol}</p>
              <h3 className="mt-0.5 text-[16px] font-semibold">{p.nombre}</h3>
              <ul className="mt-3 flex flex-col gap-1.5 text-[13px]">
                {p.chequeos.map((c) => (
                  <li key={c.clave} className="flex items-start gap-2">
                    <Estado ch={c} />
                    <span className="text-soft">{limpiar(c.detalle)}</span>
                  </li>
                ))}
              </ul>
              {p.conteo && (
                <p className="tabular mt-3 text-[12px] text-muted">
                  {p.conteo.paginas} páginas · {p.conteo.cuentas} cuentas publicitarias
                </p>
              )}
            </article>
          ))}
        </div>
      </Seccion>

      <Seccion
        id="pendientes"
        titulo="Para llegar al 100 %"
        bajada="Ordenado por prioridad. Rojo es una conexión que falta; amarillo, algo a revisar o que está esperando a Meta."
      >
        <PendientesLista pendientes={mapa.pendientes} />
      </Seccion>

      <Seccion
        id="marcas"
        titulo="Marcas"
        bajada="Cada marca chequea su página, Instagram, número de WhatsApp API (conectado, nombre aprobado y calidad) y su píxel si tiene. Pasá el mouse por un ícono para ver el detalle."
      >
        <MatrizMarcas marcas={activas} />
        {inactivas.length > 0 && (
          <details className="text-[13px]">
            <summary className="cursor-pointer text-muted hover:text-soft">
              {inactivas.length} {inactivas.length === 1 ? "página" : "páginas"} fuera del puntaje ({inactivas.map((m) => m.marca).join(", ")})
            </summary>
            <p className="mt-2 max-w-[70ch] text-muted">
              Son páginas secundarias que no cuentan para la alineación. Si alguna pasa a usarse, se activa en la tabla de marcas y entra al puntaje.
            </p>
          </details>
        )}
      </Seccion>

      <Seccion id="inventario" titulo="Inventario" bajada="Todo lo que el sistema ve hoy en los portafolios.">
        <Inventario mapa={mapa} />
      </Seccion>
    </div>
  );
}
