export type MarcaKey = "TB" | "BE" | "ADVC" | "CDR" | "TP" | "TC" | "PB" | "TBBR" | "PBRS" | "RA" | "RB" | "RV" | "RP" | "RVDM";

export interface MarcaConfig {
  key: MarcaKey;
  nombre: string;
  color: string;
  activa: boolean;
  idioma?: string;
}

export const MARCAS: MarcaConfig[] = [
  { key: "TB", nombre: "Turismo Bariloche", color: "#58e6ff", activa: true },
  { key: "BE", nombre: "Bariloche Excursiones", color: "#d8ff63", activa: true },
  { key: "ADVC", nombre: "Adventure Center", color: "#ff6f61", activa: true },
  { key: "CDR", nombre: "Centro de Reservas", color: "#9b7cff", activa: true },
  { key: "TP", nombre: "Turismo Patagonia", color: "#80ffb5", activa: true },
  { key: "TC", nombre: "Tur Central", color: "#ffc857", activa: true },
  { key: "PB", nombre: "Patagonia Booking", color: "#ff77bc", activa: true },
  { key: "TBBR", nombre: "Turismo Bariloche BR", color: "#58e6ff", activa: true, idioma: "pt" },
  { key: "PBRS", nombre: "Passeios Bariloche", color: "#80ffb5", activa: true, idioma: "pt" },
  { key: "RA", nombre: "Rafting Adventure", color: "#ff6f61", activa: false },
  { key: "RB", nombre: "Rafting Bariloche", color: "#58e6ff", activa: false },
  { key: "RV", nombre: "Rafting Villegas", color: "#ffc857", activa: false },
  { key: "RP", nombre: "Rafting Patagonia", color: "#9b7cff", activa: false },
  { key: "RVDM", nombre: "Rafting Valle del Manso", color: "#80ffb5", activa: false },
];

export const MARCA_MAP = Object.fromEntries(MARCAS.map((m) => [m.key, m])) as Record<MarcaKey, MarcaConfig>;

export const MARCAS_ACTIVAS = MARCAS.filter((m) => m.activa);
export const MARCAS_RAFTING = MARCAS.filter((m) => !m.activa);
