"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Alerta, EstadoAlerta, Nivel } from "@/lib/control/data";
import { TONO_COLOR } from "@/lib/control/format";
import { FaseChip } from "./FaseChip";

// Mismo orden de prioridad que el mensaje de WhatsApp del monitoreo
const PRIORIDAD = ["R5", "R4", "R8", "R6", "R7", "R3", "R11", "R9", "R10"];
const prio = (regla: string) => {
  const i = PRIORIDAD.indexOf(regla.split(" ")[0]);
  return i < 0 ? 99 : i;
};

interface Grupo {
  key: string;
  ids: number[];
  nivel: Nivel;
  cuenta: string;
  campana: string;
  regla: string;
  dato: string;
  propuesta: string;
  fase: string | null;
  sinResolver: boolean;
  estado: EstadoAlerta;
}

const REGLA_TEXTO: Record<string, string> = {
  R3: "Anuncios con error o rechazados",
  R4: "Optimiza a clics en vez de conversaciones",
  R5: "Medición de ventas",
  R6: "Costo por conversación alto",
  R7: "Frecuencia alta",
  R8: "Anuncio gasta sin resultados",
  R9: "Campañas activas sin gasto",
  R10: "Lista para escalar",
  R11: "Presupuesto bajo para aprender",
};

function limpiarDato(dato: string): string {
  // la fase va en su propia etiqueta
  return dato.replace(/ · (en aprendizaje|aprendizaje limitado|salió de aprendizaje|fase de aprendizaje sin dato|cambio importante hace \d+ d)$/, "");
}

function agrupar(alertas: Alerta[]): Grupo[] {
  const out: Grupo[] = [];
  const r3: Record<string, Grupo & { nombres: string[] }> = {};
  for (const a of alertas) {
    const codigo = a.regla.split(" ")[0];
    if (codigo === "R3" && a.dato.startsWith("Anuncio")) {
      const k = `${a.nivel}|${a.cuenta}|${a.campana}`;
      if (!r3[k]) {
        r3[k] = {
          key: "r3-" + k,
          ids: [],
          nivel: a.nivel,
          cuenta: a.cuenta,
          campana: a.campana,
          regla: "R3",
          dato: "",
          propuesta: "Revisar el motivo en Ads Manager y corregir o reemplazar",
          fase: null,
          sinResolver: false,
          estado: a.estado,
          nombres: [],
        };
        out.push(r3[k]);
      }
      const g = r3[k];
      g.ids.push(a.id);
      g.sinResolver = g.sinResolver || a.sin_resolver;
      if (a.estado === "pendiente") g.estado = "pendiente";
      const m = a.dato.match(/"(.*)"/);
      if (m) g.nombres.push(m[1]);
    } else {
      out.push({
        key: String(a.id),
        ids: [a.id],
        nivel: a.nivel,
        cuenta: a.cuenta,
        campana: a.campana,
        regla: codigo,
        dato: limpiarDato(a.dato),
        propuesta: a.propuesta,
        fase: a.fase_aprendizaje,
        sinResolver: a.sin_resolver,
        estado: a.estado,
      });
    }
  }
  for (const g of Object.values(r3)) {
    const n = g.nombres.length;
    g.dato = `${n} ${n === 1 ? "anuncio" : "anuncios"}: ${g.nombres.slice(0, 4).join(", ")}${n > 4 ? "…" : ""}`;
  }
  return out.sort((a, b) => prio(a.regla) - prio(b.regla));
}

const SECCIONES: { nivel: Nivel; titulo: string; vacio: string }[] = [
  { nivel: "rojo", titulo: "Crítico", vacio: "Nada crítico en el último control." },
  { nivel: "naranja", titulo: "Atención", vacio: "Nada para vigilar en el último control." },
  { nivel: "verde", titulo: "Para escalar", vacio: "Las candidatas a escalar aparecen en el control de los lunes." },
];

const ESTADO_TEXTO: Record<EstadoAlerta, string> = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  ejecutada: "Ejecutada",
  descartada: "Descartada",
};

export function AlertasPanel({ alertas }: { alertas: Alerta[] }) {
  const [estados, setEstados] = useState<Record<number, EstadoAlerta>>({});
  const [guardando, setGuardando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verResueltas, setVerResueltas] = useState(false);

  const conEstado = useMemo(
    () => alertas.map((a) => ({ ...a, estado: estados[a.id] ?? a.estado })),
    [alertas, estados],
  );
  const grupos = useMemo(() => agrupar(conEstado), [conEstado]);

  async function cambiar(g: Grupo, estado: EstadoAlerta) {
    setGuardando(g.key);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.schema("meta_ads").from("monitoreo_alertas").update({ estado }).in("id", g.ids);
    setGuardando(null);
    if (err) {
      setError("No se guardó el cambio: " + err.message);
      return;
    }
    setEstados((prev) => {
      const next = { ...prev };
      g.ids.forEach((id) => (next[id] = estado));
      return next;
    });
  }

  const resueltas = grupos.filter((g) => g.estado !== "pendiente").length;

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p role="alert" className="rounded-lg border border-coral/40 bg-coral/10 px-3 py-2 text-[13px] text-coral">
          {error}
        </p>
      )}
      {SECCIONES.map((sec) => {
        const color = sec.nivel === "rojo" ? TONO_COLOR.critico : sec.nivel === "naranja" ? TONO_COLOR.atencion : TONO_COLOR.ok;
        const lista = grupos.filter((g) => g.nivel === sec.nivel && (verResueltas || g.estado === "pendiente"));
        return (
          <section key={sec.nivel} aria-labelledby={`sec-${sec.nivel}`}>
            <h3 id={`sec-${sec.nivel}`} className="mb-2 flex items-center gap-2 text-[14px] font-semibold">
              <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: color }} />
              {sec.titulo}
              <span className="tabular text-muted font-normal">{lista.length}</span>
            </h3>
            {lista.length === 0 ? (
              <p className="text-[13px] text-muted">{sec.vacio}</p>
            ) : (
              <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-panel">
                {lista.map((g) => (
                  <li key={g.key} className="flex flex-col gap-3 p-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[14px] font-semibold">{REGLA_TEXTO[g.regla] ?? g.regla}</span>
                        {g.fase && <FaseChip fase={g.fase} />}
                        {g.sinResolver && (
                          <span className="rounded-full bg-coral/15 px-2 py-0.5 text-[11px] font-semibold text-coral">
                            Sin resolver desde hace 3 controles
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[12px] text-muted">
                        {g.cuenta}
                        {g.campana ? ` / ${g.campana}` : ""}
                      </p>
                      <p className="mt-2 text-[13px] text-soft">{g.dato}</p>
                      <p className="mt-1 text-[13px]">
                        <span className="text-muted">Propuesta: </span>
                        {g.propuesta}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {g.estado === "pendiente" ? (
                        <>
                          <button
                            type="button"
                            disabled={guardando === g.key}
                            onClick={() => cambiar(g, "aprobada")}
                            className="rounded-lg bg-cyan px-3 py-1.5 text-[12px] font-semibold text-[#0c2026] hover:brightness-110 disabled:opacity-50 cursor-pointer"
                          >
                            Aprobar
                          </button>
                          <button
                            type="button"
                            disabled={guardando === g.key}
                            onClick={() => cambiar(g, "descartada")}
                            className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-semibold text-soft hover:border-line-2 disabled:opacity-50 cursor-pointer"
                          >
                            Descartar
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-[12px] font-semibold text-muted">{ESTADO_TEXTO[g.estado]}</span>
                          <button
                            type="button"
                            disabled={guardando === g.key}
                            onClick={() => cambiar(g, "pendiente")}
                            className="rounded-lg px-2 py-1 text-[12px] text-muted underline-offset-2 hover:underline cursor-pointer"
                          >
                            Deshacer
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
      {resueltas > 0 && (
        <button
          type="button"
          onClick={() => setVerResueltas((v) => !v)}
          className="self-start text-[13px] font-semibold text-cyan underline-offset-2 hover:underline cursor-pointer"
        >
          {verResueltas ? "Ocultar las resueltas" : `Mostrar ${resueltas} resueltas`}
        </button>
      )}
    </div>
  );
}
