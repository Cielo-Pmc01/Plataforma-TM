const TZ = "America/Argentina/Buenos_Aires";

export function money(n: number | null | undefined, currency = "ARS"): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "sin dato";
  const s = Math.round(n).toLocaleString("es-AR");
  return currency === "BRL" ? `R$${s}` : currency === "USD" ? `US$${s}` : `$${s}`;
}

export function num(n: number | null | undefined, decimals = 0): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return n.toLocaleString("es-AR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function cuando(iso: string | null): string {
  if (!iso) return "sin dato";
  const d = new Date(iso);
  const hoy = new Date();
  const mismoDia = d.toLocaleDateString("es-AR", { timeZone: TZ }) === hoy.toLocaleDateString("es-AR", { timeZone: TZ });
  const hora = d.toLocaleTimeString("es-AR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
  if (mismoDia) return `hoy a las ${hora}`;
  const fecha = d.toLocaleDateString("es-AR", { timeZone: TZ, day: "numeric", month: "short" });
  return `${fecha}, ${hora}`;
}

export type Tono = "critico" | "atencion" | "ok" | "neutro";

export const TONO_COLOR: Record<Tono, string> = {
  critico: "var(--color-coral)",
  atencion: "var(--color-amber)",
  ok: "var(--color-green)",
  neutro: "var(--color-muted)",
};

export function tonoFase(fase: string | null): Tono {
  if (!fase) return "neutro";
  if (fase === "salió de aprendizaje") return "ok";
  if (fase === "aprendizaje limitado") return "critico";
  if (fase === "en aprendizaje" || fase.startsWith("cambio importante")) return "atencion";
  return "neutro";
}

export function textoFase(fase: string | null): string {
  if (!fase || fase === "fase de aprendizaje sin dato") return "Fase sin dato";
  if (fase === "salió de aprendizaje") return "Salió de aprendizaje";
  if (fase === "aprendizaje limitado") return "Aprendizaje limitado";
  if (fase === "en aprendizaje") return "En aprendizaje";
  return fase.charAt(0).toUpperCase() + fase.slice(1);
}
