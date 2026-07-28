import type { MarcaKey } from "./brands";

export type FormatKey = "all" | "Reel" | "Carrusel" | "Stories" | "Ad";
export type MarcaFilter = "all" | MarcaKey;

export interface Source {
  name: string;
  type: string;
  summary: string;
  tags: string[];
}

export interface ContentItem {
  id?: number;
  marca: MarcaKey;
  format: "Reel" | "Carrusel" | "Stories" | "Ad";
  status: "Idea" | "Guion" | "Grabado" | "Editado" | "Aprobado" | "Programado";
  aprobado?: boolean;
  owner: string;
  day: string;
  time: string;
  objective: string;
  hook: string;
  summary: string;
  cta: string;
  score: number;
  copy?: string | null;
  slides?: string[];
  mediaCandidatos?: string[];
  fechaPublicacion?: string | null;
  origen?: "catalogo" | "brief_manual" | "consulta_chatwoot" | "tendencia";
  motivoRechazo?: string | null;
}
