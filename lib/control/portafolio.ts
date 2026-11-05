import { createClient } from "@/lib/supabase/server";

// Foto diaria del flujo de n8n «MetaAds - Mapa del Portafolio» (7:40 hora AR).
// Lee los 3 portafolios: Turismo Patagonia (principal), Rafting Adventure (secundario)
// y turcentralpatagonia (respaldo).

export type EstadoChequeo = true | false | "parcial";

export interface Chequeo {
  clave: string;
  etiqueta?: string;
  ok: EstadoChequeo;
  detalle: string;
  accion?: string | null;
}

export interface Portafolio {
  id: string;
  nombre: string;
  rol: string;
  verificacion: string | null;
  chequeos: Chequeo[];
  conteo?: { paginas: number; cuentas: number };
}

export interface MarcaMapa {
  page_id: string;
  marca: string;
  portafolio: string;
  prioridad: number;
  activa: boolean;
  notas: string | null;
  puntaje: number;
  chequeos: Chequeo[];
}

export interface Pendiente {
  nivel: "rojo" | "amarillo";
  prioridad: number;
  sujeto: string;
  problema: string;
  accion: string;
}

export interface NumeroWsp {
  id: string;
  numero: string;
  nombre_verificado: string;
  estado_nombre: string;
  calidad: string;
  estado: string;
}

export interface Activos {
  paginas: { id: string; nombre: string; ig?: string; vistas_en: string[] }[];
  instagram: { id: string; usuario: string; portafolio: string }[];
  whatsapp: { id: string; nombre: string; relacion: string; numeros: NumeroWsp[] }[];
  pixeles: { id: string; nombre: string; ultimo_evento?: string; origen: string[] }[];
  cuentas: { id: string; nombre: string; estado: number; deuda: number; moneda: string; portafolio: string }[];
  apps: { id: string; nombre: string }[];
}

export interface MapaPortafolio {
  creado_at: string;
  puntaje: number;
  portafolios: Portafolio[];
  marcas: MarcaMapa[];
  pendientes: Pendiente[];
  activos: Activos;
}

export async function loadMapa(): Promise<{ mapa: MapaPortafolio | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("meta_ads")
    .from("mapa_portafolio")
    .select("creado_at, puntaje, portafolios, marcas, pendientes, activos")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return { mapa: null, error: "No se pudo leer el mapa del portafolio: " + error.message };
  if (!data) return { mapa: null, error: null };
  return { mapa: { ...(data as MapaPortafolio), puntaje: Number(data.puntaje) }, error: null };
}

export interface ResumenAlineacion {
  puntaje: number;
  creado_at: string;
  rojos: number;
  amarillos: number;
}

export async function loadResumenAlineacion(): Promise<ResumenAlineacion | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .schema("meta_ads")
    .from("mapa_portafolio")
    .select("creado_at, puntaje, pendientes")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const p = (data.pendientes ?? []) as Pendiente[];
  return {
    puntaje: Number(data.puntaje),
    creado_at: data.creado_at,
    rojos: p.filter((x) => x.nivel === "rojo").length,
    amarillos: p.filter((x) => x.nivel === "amarillo").length,
  };
}
