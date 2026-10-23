// Cuentas publicitarias que el editor puede tocar y la variable de entorno (SOLO SERVIDOR) con el token de cada una.
// Un token solo sirve para editar anuncios de las Páginas donde su usuario del sistema tiene rol de anunciante.

export interface AdAccountConfig {
  id: string;
  label: string;
  /** Nombre de la variable de entorno con el token (sin prefijo NEXT_PUBLIC_). */
  tokenEnv: string;
}

export const AD_ACCOUNTS: AdAccountConfig[] = [
  { id: "585100972496931", label: "Sergio ADC", tokenEnv: "META_TOKEN_TURCENTRALPATAGONIA" },
  { id: "946831613383716", label: "Ale Sopran", tokenEnv: "META_TOKEN_ADS_TURISMOPATAGONIA" },
  { id: "681859433781194", label: "Alex Sopran BR", tokenEnv: "META_TOKEN_BRASIL" },
  { id: "488232131974230", label: "Rafting Adventure", tokenEnv: "META_TOKEN_RAFTING" },
];

export function getAccount(id: string | null | undefined): AdAccountConfig | null {
  return AD_ACCOUNTS.find((a) => a.id === id) ?? null;
}

export function getToken(account: AdAccountConfig): string | null {
  const t = process.env[account.tokenEnv];
  return t && t.trim() ? t.trim() : null;
}

/** Para la lista del selector: qué cuentas tienen token configurado (nunca se envía el token). */
export function listAccountsPublic() {
  return AD_ACCOUNTS.map((a) => ({ id: a.id, label: a.label, configured: getToken(a) !== null }));
}
