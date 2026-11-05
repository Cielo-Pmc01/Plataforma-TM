// El centro de control lo ve solo Cielo (decisión 2026-11-05).
// La base de datos aplica la misma regla con meta_ads.es_duena_control().
export const OWNER_EMAIL = "patagoniamediacenter01@gmail.com";

export function isControlOwner(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase() === OWNER_EMAIL;
}
