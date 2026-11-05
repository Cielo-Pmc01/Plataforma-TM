import { createClient } from "@supabase/supabase-js";

// API de la Plataforma TM: todo pasa por la función meta_ads.api(token, accion, args) de Supabase,
// que valida el token, revisa si la conexión puede escribir, ejecuta y deja registro.
// Así la plataforma no necesita la clave de servicio de Supabase.

export type RespuestaApi = { ok: true; datos: unknown } | { ok: false; status: number; error: string };

export interface Herramienta {
  accion: string;
  titulo: string;
  descripcion: string;
  escribe: boolean;
  parametros: Record<string, { type: string; description: string; enum?: string[]; items?: { type: string } }>;
  requeridos?: string[];
}

export const HERRAMIENTAS: Herramienta[] = [
  {
    accion: "cuenta",
    titulo: "Mi conexión",
    descripcion: "Qué conexión es esta y si puede escribir. Llamalo primero.",
    escribe: false,
    parametros: {},
  },
  {
    accion: "resumen",
    titulo: "Resumen del centro de control",
    descripcion:
      "Panorama rápido: alertas pendientes por nivel, alertas aprobadas por Cielo, acciones a evaluar, puntaje de alineación del portafolio, gasto y retorno de los últimos 7 días y hora del último control.",
    escribe: false,
    parametros: {},
  },
  {
    accion: "alertas",
    titulo: "Alertas del monitoreo",
    descripcion: "Alertas del monitoreo de campañas (reglas R3 a R11), las más nuevas primero.",
    escribe: false,
    parametros: {
      estado: { type: "string", enum: ["pendiente", "aprobada", "ejecutada", "descartada"], description: "Solo las de este estado." },
      dias: { type: "integer", description: "Cuántos días hacia atrás (por defecto 2, máximo 30)." },
      limite: { type: "integer", description: "Cuántas (por defecto 50, máximo 500)." },
    },
  },
  {
    accion: "pendientes",
    titulo: "Pendientes del agente",
    descripcion: "Alertas que Cielo aprobó para ejecutar y acciones del agente que ya hay que evaluar (a los 3 días).",
    escribe: false,
    parametros: {},
  },
  {
    accion: "salud",
    titulo: "Salud de campañas activas",
    descripcion:
      "Última foto de las campañas con entrega: gasto, conversaciones y costo por conversación de 7 días, objetivo de costo, frecuencia, presupuesto, piso de aprendizaje y fase de aprendizaje.",
    escribe: false,
    parametros: {},
  },
  {
    accion: "conexiones",
    titulo: "Conexiones del portafolio",
    descripcion:
      "Mapa de los 3 portafolios de Meta (Turismo Patagonia, Rafting Adventure, turcentralpatagonia): puntaje de alineación, chequeos por marca (página, Instagram, WhatsApp API, píxel) y pendientes para llegar al 100 %.",
    escribe: false,
    parametros: { completo: { type: "boolean", description: "true suma el inventario: números de WhatsApp, píxeles, cuentas y apps." } },
  },
  {
    accion: "ventas",
    titulo: "Ventas vs inversión",
    descripcion:
      "Ventas reales de pb2 por marca de los últimos 7 días (por fecha de venta) cruzadas con el gasto de las campañas activas de Meta: retorno, % de inversión, costo por voucher. Las ventas incluyen todos los canales, no solo los anuncios.",
    escribe: false,
    parametros: {},
  },
  {
    accion: "historial",
    titulo: "Historial de cambios en Meta",
    descripcion: "Cambios hechos en las cuentas publicitarias (quién, qué y cuándo), del registro de actividad de Meta.",
    escribe: false,
    parametros: {
      horas: { type: "integer", description: "Cuántas horas hacia atrás (por defecto 48, máximo 720)." },
      limite: { type: "integer", description: "Cuántos (por defecto 50, máximo 500)." },
    },
  },
  {
    accion: "acciones",
    titulo: "Acciones del agente",
    descripcion: "Acciones que registró el agente, con el dato antes y después y si funcionaron.",
    escribe: false,
    parametros: { limite: { type: "integer", description: "Cuántas (por defecto 50, máximo 500)." } },
  },
  {
    accion: "registrar_accion",
    titulo: "Registrar una acción",
    descripcion:
      "Deja registrada una acción hecha en Meta Ads (después de hacerla). Si trae alerta_ids, esas alertas quedan como ejecutadas. Se evalúa a los 3 días salvo que se indique revisar_el.",
    escribe: true,
    parametros: {
      cuenta: { type: "string", description: "Cuenta publicitaria (por ejemplo «Sergio ADC»)." },
      campana: { type: "string", description: "Nombre de la campaña." },
      objeto_id: { type: "string", description: "ID de la campaña, conjunto o anuncio tocado." },
      accion: { type: "string", description: "Qué se hizo, en una línea." },
      nivel_autonomia: { type: "integer", enum: ["1", "2", "3"], description: "1 = lo hizo solo, 2 = avisó antes, 3 = con el sí de Cielo." },
      motivo: { type: "string", description: "Por qué (regla y dato)." },
      dato_antes: { type: "string", description: "El dato antes del cambio." },
      dato_despues: { type: "string", description: "El dato esperado o nuevo." },
      revision_360: { type: "string", description: "Qué se revisó antes de actuar (aprendizaje, presupuesto, historial)." },
      alerta_ids: { type: "array", items: { type: "integer" }, description: "Alertas que resuelve esta acción." },
      revisar_el: { type: "string", description: "Fecha AAAA-MM-DD para evaluar el resultado." },
    },
    requeridos: ["cuenta", "accion", "nivel_autonomia", "motivo"],
  },
  {
    accion: "actualizar_alerta",
    titulo: "Cambiar el estado de alertas",
    descripcion: "Pasa alertas a pendiente, aprobada, ejecutada o descartada, con un resultado opcional.",
    escribe: true,
    parametros: {
      ids: { type: "array", items: { type: "integer" }, description: "IDs de las alertas." },
      estado: { type: "string", enum: ["pendiente", "aprobada", "ejecutada", "descartada"], description: "Nuevo estado." },
      resultado: { type: "string", description: "Qué se hizo o por qué se descarta." },
    },
    requeridos: ["ids", "estado"],
  },
  {
    accion: "evaluar_accion",
    titulo: "Evaluar una acción",
    descripcion: "Marca si una acción del agente funcionó, con una nota del resultado.",
    escribe: true,
    parametros: {
      id: { type: "integer", description: "ID de la acción." },
      funciono: { type: "boolean", description: "true si funcionó." },
      nota_resultado: { type: "string", description: "Qué pasó con el dato." },
    },
    requeridos: ["id", "funciono"],
  },
];

export function tokenDe(request: Request): string | null {
  const h = request.headers.get("authorization") ?? "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

export async function llamarApi(token: string, accion: string, args: Record<string, unknown> = {}): Promise<RespuestaApi> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.schema("meta_ads").rpc("api", { p_token: token, p_accion: accion, p_args: args });
  if (error) return { ok: false, status: 502, error: "No se pudo llegar a la base: " + error.message };
  const r = data as { ok: boolean; datos?: unknown; status?: number; error?: string };
  if (!r?.ok) return { ok: false, status: r?.status ?? 500, error: r?.error ?? "Error desconocido" };
  return { ok: true, datos: r.datos ?? null };
}
