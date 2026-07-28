import type { ContentItem, Source } from "./types";

export interface IGMetric {
  label: string;
  value: string;
  delta: string;
  detail: string;
  color: string;
}

export interface EngagementEntry {
  label: string;
  value: string;
  color: string;
}

export interface FormatReachEntry {
  label: string;
  value: number;
  color: string;
}

export interface RetentionEntry {
  label: string;
  value: number;
  color: string;
}

export interface FunnelEntry {
  label: string;
  value: string;
  pct: number;
  color: string;
}

export interface HeatCell {
  day: string;
  hour: string;
  heat: number;
}

export const PALETTE: [string, string][] = [
  ["#58e6ff", "#9b7cff"],
  ["#d8ff63", "#58e6ff"],
  ["#ff77bc", "#ffc857"],
  ["#ff6f61", "#9b7cff"],
  ["#80ffb5", "#ffc857"],
  ["#9b7cff", "#58e6ff"],
];

export const content: ContentItem[] = [
  {
    marca: "TB", format: "Reel", status: "Aprobado", owner: "Jonatan",
    day: "Lun", time: "10:00", objective: "Consulta",
    hook: "El Circuito Chico que nadie te muestra en las fotos de Google.",
    summary: "Reel POV desde el auto mostrando vistas reales del Circuito Chico — sin filtros, sin drones.",
    cta: "Reservá tu lugar", score: 92,
  },
  {
    marca: "TC", format: "Reel", status: "Guion", owner: "Jonatan",
    day: "Lun", time: "18:00", objective: "Consulta",
    hook: "¿Nunca pisaste nieve? Esto es lo que sentís el primer día en Bariloche.",
    summary: "Reel de reacción de turistas tocando la nieve por primera vez en Laguna Congelada.",
    cta: "Comentá NIEVE", score: 88,
  },
  {
    marca: "BE", format: "Carrusel", status: "Editado", owner: "Mariano",
    day: "Mar", time: "11:00", objective: "Reserva",
    hook: "Puerto Blest: el destino más exclusivo de la Patagonia que no aparece en los rankings.",
    summary: "Carrusel 8 slides con fotos premium de Puerto Blest + precio y cómo reservar.",
    cta: "Guardalo para tu próximo viaje", score: 85,
  },
  {
    marca: "ADVC", format: "Reel", status: "Grabado", owner: "Jonatan",
    day: "Mar", time: "15:00", objective: "WhatsApp",
    hook: "El día que bajamos el río Limay y nadie quería que terminara.",
    summary: "Reel GoPro del rafting con GoPro — agua, adrenalina, risas del grupo.",
    cta: "Escribinos por WhatsApp", score: 90,
  },
  {
    marca: "TP", format: "Carrusel", status: "Programado", owner: "Luciana",
    day: "Mie", time: "09:00", objective: "Consulta",
    hook: "5 excursiones en Bariloche que podés hacer con menos de $30 USD.",
    summary: "Carrusel de opciones económicas para temporada invierno con precios reales.",
    cta: "Pedí el listado completo", score: 80,
  },
  {
    marca: "PBRS", format: "Reel", status: "Idea", owner: "Luciana",
    day: "Mie", time: "19:00", objective: "Consulta",
    hook: "Tudo que você precisa saber antes de vir a Bariloche no inverno. 🇧🇷❄️",
    summary: "Reel en portugués con tips de equipaje, clima y qué hacer en Bariloche en invierno.",
    cta: "Manda mensagem", score: 75,
  },
  {
    marca: "TB", format: "Stories", status: "Aprobado", owner: "Luciana",
    day: "Jue", time: "10:00", objective: "Reserva",
    hook: "¿Subiste al Cerro Campanario alguna vez?",
    summary: "Stories con encuesta + precio + CTA directo a WhatsApp para reservar.",
    cta: "Reservá hoy", score: 87,
  },
  {
    marca: "PB", format: "Ad", status: "Aprobado", owner: "Mariano",
    day: "Jue", time: "14:00", objective: "Reserva",
    hook: "Patagonia is calling. Are you ready to answer?",
    summary: "Ad en inglés para mercado internacional con foto de lago Nahuel Huapi y CTA a booking.",
    cta: "Book Now", score: 83,
  },
  {
    marca: "CDR", format: "Carrusel", status: "Guion", owner: "Luciana",
    day: "Vie", time: "11:00", objective: "Consulta",
    hook: "Cómo reservar tu excursión en Bariloche paso a paso (sin errores).",
    summary: "Carrusel educativo explicando el proceso de reserva en 6 pasos claros.",
    cta: "Guardalo y reservá cuando llegues", score: 78,
  },
  {
    marca: "ADVC", format: "Reel", status: "Editado", owner: "Jonatan",
    day: "Vie", time: "16:00", objective: "WhatsApp",
    hook: "Esto pasa cuando llevás a tu grupo de amigos a hacer rafting en Bariloche.",
    summary: "Reel grupal con risas, caídas al agua y celebración al final del río.",
    cta: "Traé a tu grupo", score: 91,
  },
  {
    marca: "TC", format: "Stories", status: "Idea", owner: "Luciana",
    day: "Sab", time: "12:00", objective: "Consulta",
    hook: "¿Sabés qué es la Laguna Congelada? El plan de nieve más extremo de Bariloche.",
    summary: "Stories revelando el destino con teaser + encuesta + CTA.",
    cta: "Mandá NIEVE", score: 72,
  },
  {
    marca: "TBBR", format: "Reel", status: "Grabado", owner: "Jonatan",
    day: "Dom", time: "18:00", objective: "Consulta",
    hook: "A neve de Bariloche de perto: o que realmente acontece no Circuito Chico.",
    summary: "Reel en portugués mostrando nieve real del Circuito Chico para turistas brasileños.",
    cta: "Fale conosco", score: 82,
  },
];

export const sources: Source[] = [
  {
    name: "Reseñas de clientes Google",
    type: "Reseñas reales",
    summary: "Frases textuales de turistas satisfechos — dolor antes / transformación después.",
    tags: ["testimonios", "prueba social", "Circuito Chico", "familias"],
  },
  {
    name: "WhatsApp consultas frecuentes",
    type: "Chats reales",
    summary: "Preguntas recurrentes: precios, clima, qué llevar, cuánto dura cada excursión.",
    tags: ["objeciones", "FAQs", "precio", "clima", "equipaje"],
  },
  {
    name: "Videos de Jonatan en campo",
    type: "Material original",
    summary: "Tomas GoPro de excursiones reales: rafting, nieve, paisajes, grupos.",
    tags: ["GoPro", "rafting", "nieve", "Circuito Chico", "grupos"],
  },
  {
    name: "Temporada Invierno 2025",
    type: "Catálogo de excursiones",
    summary: "Lista completa de excursiones activas, precios y disponibilidad de invierno.",
    tags: ["invierno", "precios", "nieve", "Catedral", "Laguna Congelada"],
  },
  {
    name: "Comentarios de IG",
    type: "Placeholder",
    summary: "Pendiente de conexión oficial a Instagram Business API.",
    tags: ["offline", "Meta API", "pendiente"],
  },
  {
    name: "Quality Bar TM",
    type: "Protocolo interno",
    summary: "Comunicación positiva, sin negatividad, primer persona, cierre con acción.",
    tags: ["protocolo", "tono", "copy", "quality gate"],
  },
];

export const insights: [string, string, string][] = [
  ["Pregunta más frecuente", "Los turistas brasileños preguntan primero por el clima y qué ropa llevar.", "#58e6ff"],
  ["Objeción caliente", "El precio en USD frena al turista nacional — mostrar valor antes que costo.", "#ff6f61"],
  ["Frase de cliente real", '"Nunca pensé que Bariloche en invierno iba a ser tan increíble."', "#d8ff63"],
  ["Creencia a romper", "Bariloche no es solo para esquiadores — hay opciones para todos los presupuestos.", "#ff77bc"],
];

export const igMetrics: IGMetric[] = [
  { label: "Vistas", value: "3.8M", delta: "+31%", detail: "Reels + stories 30d", color: "#58e6ff" },
  { label: "Reach", value: "1.42M", delta: "+18%", detail: "Cuentas alcanzadas", color: "#d8ff63" },
  { label: "Seguidores", value: "187.4K", delta: "+4.8K", detail: "Crecimiento neto", color: "#80ffb5" },
  { label: "Interacción", value: "8.7%", delta: "+2.1pp", detail: "ER promedio 14 marcas", color: "#ff77bc" },
  { label: "Comentarios", value: "18.2K", delta: "+44%", detail: "Señal de conversación", color: "#ffc857" },
  { label: "Retención", value: "42%", delta: "+7pp", detail: "Reels completion avg", color: "#9b7cff" },
  { label: "CTR bio", value: "3.9%", delta: "+0.8pp", detail: "Clicks desde perfil", color: "#ff6f61" },
  { label: "Saves", value: "31.6K", delta: "+26%", detail: "Guardados", color: "#58e6ff" },
  { label: "Shares", value: "12.9K", delta: "+19%", detail: "Compartidos", color: "#d8ff63" },
  { label: "DMs / Consultas", value: "2.184", delta: "+38%", detail: "Conversaciones iniciadas", color: "#80ffb5" },
  { label: "Visitas perfil", value: "96.7K", delta: "+22%", detail: "Tráfico al perfil", color: "#ff77bc" },
  { label: "Frecuencia", value: "3.1x", delta: "-0.4", detail: "Exposición por cuenta", color: "#ffc857" },
];

export const growthData = [
  42, 46, 51, 49, 58, 61, 64, 70, 68, 76, 81, 78, 86, 93, 91, 96, 104, 112, 108, 118, 124, 132, 129, 141, 148, 153, 161,
  170, 178, 186,
];

export const reachByFormat: FormatReachEntry[] = [
  { label: "Reels", value: 92, color: "#58e6ff" },
  { label: "Carrusel", value: 63, color: "#d8ff63" },
  { label: "Stories", value: 48, color: "#ff77bc" },
  { label: "Ads", value: 36, color: "#ffc857" },
  { label: "Lives", value: 24, color: "#80ffb5" },
];

export const engagementMix: EngagementEntry[] = [
  { label: "Likes", value: "54%", color: "#58e6ff" },
  { label: "Comentarios", value: "19%", color: "#d8ff63" },
  { label: "Saves", value: "14%", color: "#ff77bc" },
  { label: "Shares", value: "8%", color: "#ffc857" },
  { label: "DMs", value: "5%", color: "#ff6f61" },
];

export const retention: RetentionEntry[] = [
  { label: "0-3s", value: 100, color: "#58e6ff" },
  { label: "3-8s", value: 78, color: "#80ffb5" },
  { label: "8-15s", value: 57, color: "#d8ff63" },
  { label: "15-30s", value: 42, color: "#ffc857" },
  { label: "Final", value: 31, color: "#ff6f61" },
];

export const funnel: FunnelEntry[] = [
  { label: "Reach", value: "1.42M", pct: 100, color: "#58e6ff" },
  { label: "Visitas perfil", value: "96.7K", pct: 68, color: "#d8ff63" },
  { label: "Clicks bio", value: "3.772", pct: 42, color: "#ffc857" },
  { label: "Consultas DM", value: "2.184", pct: 31, color: "#ff77bc" },
  { label: "Reservas", value: "248", pct: 18, color: "#80ffb5" },
];

export const heatmap: HeatCell[] = [
  { day: "Lun", hour: "10h", heat: 78 }, { day: "Mar", hour: "12h", heat: 64 },
  { day: "Mie", hour: "15h", heat: 86 }, { day: "Jue", hour: "11h", heat: 92 },
  { day: "Vie", hour: "17h", heat: 74 }, { day: "Sab", hour: "20h", heat: 58 },
  { day: "Dom", hour: "19h", heat: 69 }, { day: "Lun", hour: "18h", heat: 71 },
  { day: "Mar", hour: "21h", heat: 52 }, { day: "Mie", hour: "09h", heat: 66 },
  { day: "Jue", hour: "19h", heat: 81 }, { day: "Vie", hour: "12h", heat: 88 },
  { day: "Sab", hour: "11h", heat: 62 }, { day: "Dom", hour: "20h", heat: 73 },
];
