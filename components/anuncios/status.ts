// Etiquetas y colores de estado de los anuncios (en español).

const LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  PAUSED: "Pausado",
  CAMPAIGN_PAUSED: "Campaña pausada",
  ADSET_PAUSED: "Conjunto pausado",
  IN_PROCESS: "Procesando",
  PENDING_REVIEW: "En revisión",
  WITH_ISSUES: "Con problemas",
  DISAPPROVED: "Rechazado",
};

export function statusLabel(s: string): string {
  return LABELS[s] ?? (s || "—");
}

export function statusColor(s: string): string {
  if (s === "ACTIVE") return "var(--color-green)";
  if (s === "PENDING_REVIEW" || s === "IN_PROCESS") return "var(--color-violet)";
  if (s === "WITH_ISSUES" || s === "DISAPPROVED") return "var(--color-coral)";
  return "var(--color-amber)";
}
