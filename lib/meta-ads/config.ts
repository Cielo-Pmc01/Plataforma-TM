import type { PeriodKey } from "./types";

export const TABLE_ROWS_INIT = 8;

export const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"] as const;

export const BRAND_COLORS: Record<string, string> = {
  "Centro de Reservas": "#c2f74b",
  "Turismo Bariloche": "#2fe6b0",
  "Adventure Center": "#ff8a4c",
  "Passeios Bariloche": "#5b9dff",
  "Bariloche Excursiones": "#b388ff",
  "TB Brasil": "#ffd166",
  "Turismo Patagonia": "#ff6b5e",
  "Patagonia Booking": "#4ade80",
  "Rafting Adventure": "#38bdf8",
  "Tur Central": "#e9c46a",
};

export const BRAND_CODES: Record<string, string> = {
  "Centro de Reservas": "CDR",
  "Turismo Bariloche": "TB",
  "Adventure Center": "ADV",
  "Passeios Bariloche": "PAS",
  "Bariloche Excursiones": "BE",
  "TB Brasil": "TB BR",
  "Turismo Patagonia": "TP",
  "Patagonia Booking": "PB",
  "Rafting Adventure": "RA",
  "Tur Central": "TC",
};

export const MESSAGES_OBJECTIVES = new Set(["MESSAGES", "OUTCOME_ENGAGEMENT", "OUTCOME_LEADS"]);

export const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "today", label: "Hoy" },
  { key: "week", label: "7 días" },
  { key: "month", label: "Este mes" },
  { key: "ytd", label: "Este año" },
  { key: "custom", label: "Personalizado" },
];
