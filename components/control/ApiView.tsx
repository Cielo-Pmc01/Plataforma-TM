"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { crearConexion, revocarConexion, type NuevaConexion } from "@/app/(dashboard)/control/api/actions";
import { cuando } from "@/lib/control/format";

export interface ConexionApi {
  id: string;
  nombre: string;
  prefijo: string;
  puede_escribir: boolean;
  creado_at: string;
  ultimo_uso: string | null;
  usos: number;
  vence_at: string | null;
  revocado_at: string | null;
}

export interface RegistroApi {
  id: number;
  creado_at: string;
  conexion: string | null;
  accion: string;
  ok: boolean;
  detalle: string | null;
}

function Copiar({ texto, etiqueta = "Copiar" }: { texto: string; etiqueta?: string }) {
  const [hecho, setHecho] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(texto).then(() => {
          setHecho(true);
          setTimeout(() => setHecho(false), 1500);
        });
      }}
      className="shrink-0 rounded-lg border border-line px-2.5 py-1 text-[12px] text-soft hover:border-line-2 hover:text-text"
    >
      {hecho ? "Copiado" : etiqueta}
    </button>
  );
}

function Bloque({ titulo, codigo }: { titulo: string; codigo: string }) {
  return (
    <div className="rounded-card border border-line bg-panel">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <span className="text-[13px] font-semibold">{titulo}</span>
        <Copiar texto={codigo} />
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-[12px] leading-relaxed text-soft">
        <code>{codigo}</code>
      </pre>
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

const HERRAMIENTAS = [
  ["resumen", "Panorama: alertas, alineación, ventas vs gasto"],
  ["alertas", "Alertas del monitoreo"],
  ["pendientes", "Alertas aprobadas y acciones a evaluar"],
  ["salud", "Campañas activas: costo, fase, presupuesto"],
  ["conexiones", "Mapa de los 3 portafolios"],
  ["ventas", "Ventas de pb2 cruzadas con el gasto"],
  ["historial", "Cambios hechos en Meta"],
  ["acciones", "Acciones del agente"],
  ["registrar_accion", "Registrar una acción (escribe)"],
  ["actualizar_alerta", "Cambiar estado de alertas (escribe)"],
  ["evaluar_accion", "Evaluar una acción (escribe)"],
];

export function ApiView({
  base,
  conexiones,
  registro,
  error,
}: {
  base: string;
  conexiones: ConexionApi[];
  registro: RegistroApi[];
  error: string | null;
}) {
  const [estado, crear, creando] = useActionState<NuevaConexion | null, FormData>(crearConexion, null);
  const activas = conexiones.filter((c) => !c.revocado_at && (!c.vence_at || new Date(c.vence_at) > new Date()));
  const token = estado?.token ?? "tm_TU_TOKEN";

  const claudeCode = JSON.stringify(
    { mcpServers: { "plataforma-tm": { type: "http", url: `${base}/api/mcp`, headers: { Authorization: `Bearer ${token}` } } } },
    null,
    2,
  );
  const curl = `curl -H "Authorization: Bearer ${token}" ${base}/api/v1/resumen`;

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-10 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <header className="flex flex-col gap-3">
        <Link href="/control" className="text-[13px] text-muted hover:text-soft">← Control</Link>
        <h1 className="text-[34px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[44px]">API y MCP</h1>
        <p className="max-w-[68ch] text-[15px] text-soft">
          Conectá tu agente, Claude o cualquier sistema directo a la plataforma, sin pasar por n8n. Cada conexión tiene su
          propio token, puede ser de solo lectura y queda registrada.
        </p>
        {error && <p role="alert" className="rounded-lg border border-coral/40 bg-coral/10 px-3 py-2 text-[13px] text-coral">{error}</p>}
      </header>

      <Seccion id="direcciones" titulo="Direcciones">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["MCP", `${base}/api/mcp`, "Para Claude Code, tu agente o cualquier cliente MCP"],
            ["API REST", `${base}/api/v1/<herramienta>`, "GET para leer, POST con JSON para escribir"],
          ].map(([t, url, d]) => (
            <div key={t} className="rounded-card border border-line bg-panel p-4">
              <p className="text-[12px] text-muted">{t}</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <code className="truncate text-[14px] text-text">{url}</code>
                <Copiar texto={url.replace("/<herramienta>", "")} />
              </div>
              <p className="mt-1 text-[12px] text-muted">{d}</p>
            </div>
          ))}
        </div>
      </Seccion>

      <Seccion id="nueva" titulo="Nueva conexión" bajada="Creá una por cada sistema que se conecte, así podés cortar una sin tocar las demás.">
        <form action={crear} className="flex flex-col gap-4 rounded-card border border-line bg-panel p-4 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex min-w-[220px] flex-1 flex-col gap-1.5 text-[13px]">
            <span className="text-soft">Nombre</span>
            <input
              name="nombre"
              required
              placeholder="Agente evo-mk"
              className="rounded-lg border border-line bg-bg-2 px-3 py-2 text-[14px] text-text placeholder:text-muted focus:border-cyan"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px]">
            <span className="text-soft">Vence</span>
            <select name="vence" defaultValue="0" className="rounded-lg border border-line bg-bg-2 px-3 py-2 text-[14px] text-text">
              <option value="0">Nunca</option>
              <option value="30">En 30 días</option>
              <option value="90">En 90 días</option>
              <option value="365">En un año</option>
            </select>
          </label>
          <label className="flex items-center gap-2 py-2 text-[13px] text-soft">
            <input type="checkbox" name="escribir" className="h-4 w-4 accent-[var(--color-cyan)]" />
            Puede registrar acciones y cambiar alertas
          </label>
          <button
            type="submit"
            disabled={creando}
            className="rounded-lg bg-cyan px-4 py-2 text-[14px] font-semibold text-bg disabled:opacity-60"
          >
            {creando ? "Creando…" : "Crear conexión"}
          </button>
        </form>
        {estado?.error && <p role="alert" className="text-[13px] text-coral">{estado.error}</p>}
        {estado?.token && (
          <div className="flex flex-col gap-2 rounded-card border border-cyan/50 bg-cyan/10 p-4">
            <p className="text-[14px] font-semibold">Copiá el token ahora: no se vuelve a mostrar.</p>
            <div className="flex items-center gap-3">
              <code className="min-w-0 flex-1 break-all rounded-lg bg-bg-2 px-3 py-2 text-[13px]">{estado.token}</code>
              <Copiar texto={estado.token} />
            </div>
            <p className="text-[12px] text-muted">Los ejemplos de abajo ya lo tienen puesto.</p>
          </div>
        )}
      </Seccion>

      <Seccion id="activas" titulo="Conexiones" bajada={`${activas.length} ${activas.length === 1 ? "activa" : "activas"}.`}>
        {conexiones.length === 0 ? (
          <p className="text-[13px] text-muted">Todavía no hay conexiones.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-card border border-line bg-panel">
            {conexiones.map((c) => {
              const vencida = !!c.vence_at && new Date(c.vence_at) <= new Date();
              const cortada = !!c.revocado_at || vencida;
              return (
                <li key={c.id} className={`flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${cortada ? "opacity-55" : ""}`}>
                  <div>
                    <p className="text-[14px] font-semibold">
                      {c.nombre} <span className="font-normal text-muted">· {c.prefijo}…</span>
                    </p>
                    <p className="text-[12px] text-muted">
                      {c.puede_escribir ? "Lee y escribe" : "Solo lectura"} · {c.usos} {c.usos === 1 ? "uso" : "usos"}
                      {c.ultimo_uso ? ` · último ${cuando(c.ultimo_uso)}` : " · sin usar"}
                      {c.revocado_at ? ` · cortada ${cuando(c.revocado_at)}` : vencida ? " · vencida" : c.vence_at ? ` · vence ${cuando(c.vence_at)}` : ""}
                    </p>
                  </div>
                  {!cortada && (
                    <form action={revocarConexion}>
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className="rounded-lg border border-line px-3 py-1.5 text-[12px] text-coral hover:border-coral/60">
                        Cortar
                      </button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Seccion>

      <Seccion id="conectar" titulo="Cómo conectarse">
        <Bloque titulo="Claude Code o tu agente (.mcp.json)" codigo={claudeCode} />
        <Bloque titulo="Probar desde la terminal" codigo={curl} />
        <div className="rounded-card border border-line bg-panel p-4">
          <p className="text-[13px] font-semibold">n8n</p>
          <p className="mt-1 text-[13px] text-soft">
            Nodo HTTP Request a <code>{base}/api/v1/&lt;herramienta&gt;</code> con una credencial «Header Auth»: nombre{" "}
            <code>Authorization</code>, valor <code>Bearer tm_…</code>. O el nodo «MCP Client» con la dirección del MCP y el mismo
            encabezado.
          </p>
        </div>
      </Seccion>

      <Seccion id="herramientas" titulo="Herramientas">
        <ul className="grid gap-x-6 gap-y-1.5 text-[13px] sm:grid-cols-2">
          {HERRAMIENTAS.map(([n, d]) => (
            <li key={n}>
              <code className="text-cyan">{n}</code> <span className="text-muted">— {d}</span>
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion id="registro" titulo="Registro" bajada="Las últimas llamadas, con qué conexión y si salieron bien.">
        {registro.length === 0 ? (
          <p className="text-[13px] text-muted">Sin llamadas todavía.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-card border border-line bg-panel text-[13px]">
            {registro.map((r) => (
              <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2">
                <span>
                  <span aria-hidden style={{ color: r.ok ? "var(--color-green)" : "var(--color-coral)" }}>●</span>{" "}
                  <span className="sr-only">{r.ok ? "Bien" : "Error"}: </span>
                  <code>{r.accion}</code> <span className="text-muted">· {r.conexion ?? "sin conexión"}</span>
                  {r.detalle && <span className="text-coral"> · {r.detalle}</span>}
                </span>
                <span className="text-[12px] text-muted">{cuando(r.creado_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Seccion>
    </div>
  );
}
