import { createClient } from "@/lib/supabase/server";

export type Nivel = "rojo" | "naranja" | "verde";
export type EstadoAlerta = "pendiente" | "aprobada" | "ejecutada" | "descartada";

export interface Alerta {
  id: number;
  creado_at: string;
  control: string;
  cuenta: string;
  campana: string;
  objeto_id: string;
  regla: string;
  nivel: Nivel;
  dato: string;
  propuesta: string;
  fase_aprendizaje: string | null;
  sin_resolver: boolean;
  estado: EstadoAlerta;
}

export interface SaludCampana {
  id: number;
  creado_at: string;
  cuenta: string;
  campana_id: string;
  campana: string;
  objetivo: string | null;
  gasto_7d: number;
  conversaciones_7d: number;
  costo_conv_7d: number | null;
  costo_referencia: number | null;
  frecuencia_7d: number | null;
  presupuesto_diario: number | null;
  piso_aprendizaje: number | null;
  fase_aprendizaje: string | null;
}

export interface Saldo {
  account_id: string;
  nombre: string;
  tipo: "prepago" | "postpago" | string;
  currency: string;
  valor: number | null;
  umbral_temprana: number | null;
  umbral_corte: number | null;
  nivel: string;
  con_entrega_hoy: boolean;
  revisado_at: string | null;
}

export interface AccionAgente {
  id: number;
  creado_at: string;
  cuenta: string;
  campana: string;
  accion: string;
  nivel_autonomia: number;
  motivo: string;
  dato_antes: string | null;
  dato_despues: string | null;
  revisar_el: string | null;
  funciono: boolean | null;
  nota_resultado: string | null;
}

export interface ControlData {
  alertas: Alerta[];
  salud: SaludCampana[];
  saldos: Saldo[];
  acciones: AccionAgente[];
  ultimoControl: string | null;
  errores: string[];
}

// Nombres de las cuentas (la tabla de saldos guarda el ID en el nombre de algunas)
const NOMBRES: Record<string, string> = {
  "946831613383716": "Ale Sopran",
  "585100972496931": "Sergio ADC",
  "681859433781194": "Alex Sopran BR",
  "488232131974230": "Rafting Adventure",
};

// Todas las filas de un mismo control se escriben en pocos segundos:
// tomamos las que están a menos de 15 minutos de la más reciente.
function ultimaTanda<T extends { creado_at: string }>(rows: T[]): T[] {
  if (!rows.length) return [];
  const top = new Date(rows[0].creado_at).getTime();
  return rows.filter((r) => top - new Date(r.creado_at).getTime() < 15 * 60 * 1000);
}

export async function loadControlData(): Promise<ControlData> {
  const supabase = await createClient();
  const db = supabase.schema("meta_ads");
  const errores: string[] = [];

  const [alertasRes, saludRes, saldosRes, accionesRes] = await Promise.all([
    db.from("monitoreo_alertas").select("*").order("creado_at", { ascending: false }).limit(400),
    db.from("salud_campanas").select("*").order("creado_at", { ascending: false }).limit(300),
    db.from("balance_alert_state").select("*"),
    db.from("acciones_agente").select("*").order("creado_at", { ascending: false }).limit(30),
  ]);

  if (alertasRes.error) errores.push("No se pudieron leer las alertas: " + alertasRes.error.message);
  if (saludRes.error) errores.push("No se pudo leer la salud de campañas: " + saludRes.error.message);
  if (saldosRes.error) errores.push("No se pudieron leer los saldos: " + saldosRes.error.message);
  if (accionesRes.error) errores.push("No se pudieron leer las acciones del agente: " + accionesRes.error.message);

  const alertas = ultimaTanda((alertasRes.data ?? []) as Alerta[]);
  const salud = ultimaTanda((saludRes.data ?? []) as SaludCampana[]).map((s) => ({
    ...s,
    gasto_7d: Number(s.gasto_7d),
    conversaciones_7d: Number(s.conversaciones_7d),
    costo_conv_7d: s.costo_conv_7d === null ? null : Number(s.costo_conv_7d),
    costo_referencia: s.costo_referencia === null ? null : Number(s.costo_referencia),
    frecuencia_7d: s.frecuencia_7d === null ? null : Number(s.frecuencia_7d),
    presupuesto_diario: s.presupuesto_diario === null ? null : Number(s.presupuesto_diario),
    piso_aprendizaje: s.piso_aprendizaje === null ? null : Number(s.piso_aprendizaje),
  }));

  type SaldoRow = {
    account_id: string;
    account_name: string | null;
    tipo: string;
    currency: string;
    last_value: number | string | null;
    umbral_temprana: number | string | null;
    umbral_corte: number | string | null;
    alert_level: string | null;
    has_delivery_today: boolean | null;
    last_checked_at: string | null;
  };
  const toNum = (v: number | string | null) => (v === null || v === undefined ? null : Number(v));
  const saldos: Saldo[] = ((saldosRes.data ?? []) as SaldoRow[])
    .map((r) => ({
      account_id: r.account_id,
      nombre: NOMBRES[r.account_id] ?? r.account_name ?? r.account_id,
      tipo: r.tipo,
      currency: r.currency,
      valor: toNum(r.last_value),
      umbral_temprana: toNum(r.umbral_temprana),
      umbral_corte: toNum(r.umbral_corte),
      nivel: r.alert_level ?? "none",
      con_entrega_hoy: !!r.has_delivery_today,
      revisado_at: r.last_checked_at,
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  return {
    alertas,
    salud,
    saldos,
    acciones: (accionesRes.data ?? []) as AccionAgente[],
    ultimoControl: alertas[0]?.creado_at ?? salud[0]?.creado_at ?? null,
    errores,
  };
}
