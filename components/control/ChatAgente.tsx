"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cuando } from "@/lib/control/format";
import { Markdown } from "./Markdown";

export interface MensajeChat {
  id: number;
  creado_at: string;
  rol: "cielo" | "agente";
  texto: string;
  estado: "nuevo" | "tomado" | "respondido" | "error";
  en_respuesta_a: number | null;
  tipo?: "mensaje" | "permiso" | "aviso";
  permiso_id?: string | null;
}

const VEREDICTO = /^\s*(si|no)\s+([a-km-z]{5})\s*$/i;

const SUGERENCIAS = [
  "¿Cómo vienen las campañas hoy?",
  "¿Qué alertas rojas hay sin resolver?",
  "Revisá ventas vs inversión de la semana y decime qué ajustarías",
  "¿Qué falta para llegar al 100 % en Conexiones?",
];

export function ChatAgente({ inicial, error }: { inicial: MensajeChat[]; error: string | null }) {
  const [mensajes, setMensajes] = useState<MensajeChat[]>(inicial);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [falla, setFalla] = useState<string | null>(error);
  const [ahora, setAhora] = useState(() => Date.now());
  const fin = useRef<HTMLDivElement>(null);
  const supabase = useRef(createClient());

  const refrescar = useCallback(async () => {
    const { data, error: e } = await supabase.current
      .schema("meta_ads")
      .from("chat_agente")
      .select("id, creado_at, rol, texto, estado, en_respuesta_a, tipo, permiso_id")
      .order("id", { ascending: false })
      .limit(100);
    if (e) return setFalla(e.message);
    setFalla(null);
    setMensajes(((data ?? []) as MensajeChat[]).reverse());
    setAhora(Date.now());
  }, []);

  // Mientras haya algo sin respuesta se consulta seguido; si no, cada 15 segundos
  const esperando = mensajes.some((m) => m.rol === "cielo" && (m.estado === "nuevo" || m.estado === "tomado"));
  useEffect(() => {
    const t = setInterval(refrescar, esperando ? 2500 : 15000);
    return () => clearInterval(t);
  }, [refrescar, esperando]);

  const ultimoId = mensajes.at(-1)?.id;
  useEffect(() => {
    fin.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [ultimoId, esperando]);

  async function enviar(t: string) {
    const limpio = t.trim();
    if (!limpio || enviando) return;
    setEnviando(true);
    const { error: e } = await supabase.current.schema("meta_ads").from("chat_agente").insert({ rol: "cielo", texto: limpio });
    setEnviando(false);
    if (e) return setFalla("No se pudo enviar: " + e.message);
    setTexto("");
    await refrescar();
  }

  // Un permiso está resuelto si después hubo un sí/no con su código o el agente avisó que venció
  const resueltos = new Set<string>();
  let ultimoPermiso: string | null = null;
  for (const m of mensajes) {
    if (m.tipo === "permiso" && m.permiso_id) ultimoPermiso = m.permiso_id;
    // Si lo respondió por WhatsApp, el agente avisa «Autorizado» o «Rechazado» sin código: cierra el último pedido
    if (m.tipo === "aviso" && /Autorizado|Rechazado/.test(m.texto) && ultimoPermiso) resueltos.add(ultimoPermiso);
    const v = m.rol === "cielo" ? VEREDICTO.exec(m.texto) : null;
    if (v) resueltos.add(v[2].toLowerCase());
    const vencido = m.tipo === "aviso" ? /Venci[oó] el pedido \*?([a-km-z]{5})/i.exec(m.texto) : null;
    if (vencido) resueltos.add(vencido[1].toLowerCase());
  }
  const permisoAbierto = (m: MensajeChat) =>
    !!m.permiso_id && !resueltos.has(m.permiso_id) && ahora - new Date(m.creado_at).getTime() < 30 * 60_000;

  const pendiente = [...mensajes].reverse().find((m) => m.rol === "cielo" && (m.estado === "nuevo" || m.estado === "tomado"));
  const minutos = pendiente ? (ahora - new Date(pendiente.creado_at).getTime()) / 60000 : 0;
  let aviso: string | null = null;
  if (pendiente?.estado === "nuevo") aviso = minutos > 2 ? "El agente todavía no tomó tu mensaje. Puede estar apagado o sin el chat instalado." : "Enviado. El agente lo toma en unos segundos…";
  if (mensajes.some((m) => m.tipo === "permiso" && permisoAbierto(m))) aviso = "Esperando tu permiso para seguir.";
  else if (pendiente?.estado === "tomado") aviso = minutos > 10 ? "Sigue trabajando (lleva más de 10 minutos). Si pidió un permiso, revisá WhatsApp." : "El agente está trabajando…";

  return (
    <div className="mx-auto flex h-[calc(100dvh-64px)] max-w-[900px] flex-col px-4 sm:px-6 lg:h-dvh lg:px-10">
      <header className="flex flex-col gap-1 pb-4 pt-6 lg:pt-10">
        <Link href="/control" className="text-[13px] text-muted hover:text-soft">← Control</Link>
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] sm:text-[34px]">Agente</h1>
        <p className="max-w-[64ch] text-[13px] text-muted">
          Es la misma conversación que tenés por WhatsApp, con la misma memoria. Si necesita un permiso, lo aprobás acá o por WhatsApp.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto rounded-card border border-line bg-panel" aria-live="polite">
        <div className="flex flex-col gap-3 p-4">
          {mensajes.length === 0 && (
            <div className="flex flex-col gap-3 py-6">
              <p className="text-[14px] text-soft">Escribile lo que necesites. Algunas ideas:</p>
              <div className="flex flex-wrap gap-2">
                {SUGERENCIAS.map((s) => (
                  <button key={s} type="button" onClick={() => enviar(s)} className="rounded-full border border-line px-3 py-1.5 text-[13px] text-soft hover:border-line-2 hover:text-text">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {mensajes.map((m) => {
            const v = m.rol === "cielo" ? VEREDICTO.exec(m.texto) : null;
            if (v) {
              const si = v[1].toLowerCase() === "si";
              return (
                <p key={m.id} className="self-end text-[12px] font-semibold" style={{ color: si ? "var(--color-green)" : "var(--color-coral)" }}>
                  {si ? "Aprobaste" : "Rechazaste"} el permiso {v[2].toLowerCase()} · {cuando(m.creado_at)}
                </p>
              );
            }
            if (m.rol === "agente" && m.tipo === "aviso") {
              return (
                <p key={m.id} className="self-center rounded-full bg-panel-2 px-3 py-1 text-[12px] text-muted">
                  {m.texto.replace(/\*/g, "")}
                </p>
              );
            }
            if (m.rol === "agente" && m.tipo === "permiso") {
              const abierto = permisoAbierto(m);
              return (
                <div key={m.id} className="flex flex-col items-start gap-1">
                  <div className="w-full max-w-[92%] rounded-2xl rounded-bl-md border border-amber/50 bg-amber/10 px-4 py-3 text-[14px] leading-relaxed text-soft">
                    <Markdown texto={m.texto.replace(/\n\nRespondé[\s\S]*$/, "").replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1**$2**")} />
                    {abierto ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={enviando}
                          onClick={() => enviar(`si ${m.permiso_id}`)}
                          className="cursor-pointer rounded-lg bg-cyan px-4 py-1.5 text-[13px] font-semibold text-bg disabled:opacity-50"
                        >
                          Aprobar
                        </button>
                        <button
                          type="button"
                          disabled={enviando}
                          onClick={() => enviar(`no ${m.permiso_id}`)}
                          className="cursor-pointer rounded-lg border border-line px-4 py-1.5 text-[13px] font-semibold text-soft hover:border-coral/60 hover:text-coral disabled:opacity-50"
                        >
                          Rechazar
                        </button>
                      </div>
                    ) : (
                      <p className="mt-2 text-[12px] text-muted">{m.permiso_id && resueltos.has(m.permiso_id) ? "Respondido" : "Ya no está abierto"}</p>
                    )}
                  </div>
                  <span className="text-[11px] text-muted">Pedido de permiso · {cuando(m.creado_at)}</span>
                </div>
              );
            }
            return m.rol === "cielo" ? (
              <div key={m.id} className="flex flex-col items-end gap-1">
                <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-cyan/15 px-4 py-2.5 text-[14px] text-text">{m.texto}</div>
                <span className="text-[11px] text-muted">
                  {cuando(m.creado_at)}
                  {m.estado === "error" ? " · terminó con error" : ""}
                </span>
              </div>
            ) : (
              <div key={m.id} className="flex flex-col items-start gap-1">
                <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-line bg-bg-2 px-4 py-3 text-[14px] leading-relaxed text-soft">
                  <Markdown texto={m.texto} />
                </div>
                <span className="text-[11px] text-muted">Agente · {cuando(m.creado_at)}</span>
              </div>
            );
          })}
          {aviso && (
            <p className="flex items-center gap-2 text-[13px] text-muted">
              <span aria-hidden className="inline-block h-2 w-2 animate-pulse rounded-full bg-cyan" />
              {aviso}
            </p>
          )}
          <div ref={fin} />
        </div>
      </div>

      {falla && <p role="alert" className="mt-2 text-[13px] text-coral">{falla}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void enviar(texto);
        }}
        className="flex items-end gap-2 py-4"
      >
        <label htmlFor="mensaje" className="sr-only">Mensaje para el agente</label>
        <textarea
          id="mensaje"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void enviar(texto);
            }
          }}
          rows={Math.min(6, Math.max(1, texto.split("\n").length))}
          placeholder="Escribile al agente… (Enter envía, Shift+Enter baja de línea)"
          className="min-h-[46px] flex-1 resize-none rounded-xl border border-line bg-panel px-4 py-3 text-[14px] text-text placeholder:text-muted focus:border-cyan"
        />
        <button type="submit" disabled={enviando || !texto.trim()} className="h-[46px] rounded-xl bg-cyan px-5 text-[14px] font-semibold text-bg disabled:opacity-50">
          Enviar
        </button>
      </form>
    </div>
  );
}
