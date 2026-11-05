export type MarcaKey = "TB" | "BE" | "ADVC" | "CDR" | "TP" | "TC" | "PB" | "TBBR" | "PBRS" | "RA" | "RB" | "RV" | "RP" | "RVDM";

export interface MarcaConfig {
  key: MarcaKey;
  nombre: string;
  color: string;
  activa: boolean;
  idioma?: string;
}

export const MARCAS: MarcaConfig[] = [
  { key: "TB", nombre: "Turismo Bariloche", color: "var(--color-cyan)", activa: true },
  { key: "BE", nombre: "Bariloche Excursiones", color: "var(--color-lime)", activa: true },
  { key: "ADVC", nombre: "Adventure Center", color: "var(--color-coral)", activa: true },
  { key: "CDR", nombre: "Centro de Reservas", color: "var(--color-violet)", activa: true },
  { key: "TP", nombre: "Turismo Patagonia", color: "var(--color-green)", activa: true },
  { key: "TC", nombre: "Tur Central", color: "var(--color-amber)", activa: true },
  { key: "PB", nombre: "Patagonia Booking", color: "var(--color-pink)", activa: true },
  { key: "TBBR", nombre: "Turismo Bariloche BR", color: "var(--color-cyan)", activa: true, idioma: "pt" },
  { key: "PBRS", nombre: "Passeios Bariloche", color: "var(--color-green)", activa: true, idioma: "pt" },
  { key: "RA", nombre: "Rafting Adventure", color: "var(--color-coral)", activa: false },
  { key: "RB", nombre: "Rafting Bariloche", color: "var(--color-cyan)", activa: false },
  { key: "RV", nombre: "Rafting Villegas", color: "var(--color-amber)", activa: false },
  { key: "RP", nombre: "Rafting Patagonia", color: "var(--color-violet)", activa: false },
  { key: "RVDM", nombre: "Rafting Valle del Manso", color: "var(--color-green)", activa: false },
];

export const MARCA_MAP = Object.fromEntries(MARCAS.map((m) => [m.key, m])) as Record<MarcaKey, MarcaConfig>;

export const MARCAS_ACTIVAS = MARCAS.filter((m) => m.activa);
export const MARCAS_RAFTING = MARCAS.filter((m) => !m.activa);
