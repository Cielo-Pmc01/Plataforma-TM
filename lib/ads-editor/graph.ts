// Cliente mínimo de la Graph API de Meta. SOLO SERVIDOR: usa tokens de variables de entorno sin prefijo NEXT_PUBLIC_.
// El token viaja en el encabezado Authorization (no en la URL) para que no quede en logs.

const API = "https://graph.facebook.com/v21.0";

export class MetaError extends Error {
  code?: number;
  subcode?: number;
  userMessage?: string;
  constructor(message: string, opts: { code?: number; subcode?: number; userMessage?: string } = {}) {
    super(message);
    this.name = "MetaError";
    this.code = opts.code;
    this.subcode = opts.subcode;
    this.userMessage = opts.userMessage;
  }

  /** Mensaje en español para mostrar en pantalla. */
  toFriendly(): string {
    if (this.code === 10) {
      return "El token no tiene rol de anunciante en la Página de este anuncio. Hay que asignarlo en Configuración del negocio → Usuarios del sistema.";
    }
    if (this.code === 190) return "El token de Meta venció o fue revocado.";
    if (this.code === 17 || this.code === 4 || this.code === 613) return "Meta pide esperar un momento por límite de uso. Probá de nuevo en unos minutos.";
    return this.userMessage || this.message;
  }
}

export async function graph<T = Record<string, unknown>>(
  token: string,
  method: "GET" | "POST",
  path: string,
  params: Record<string, string | undefined> = {},
): Promise<T> {
  const url = new URL(`${API}/${path}`);
  const clean = Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][];
  const init: RequestInit = {
    method,
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(30_000),
    cache: "no-store",
  };
  if (method === "GET") {
    for (const [k, v] of clean) url.searchParams.set(k, v);
  } else {
    init.body = new URLSearchParams(clean);
  }

  const res = await fetch(url, init);
  const body = (await res.json().catch(() => ({}))) as {
    error?: { message?: string; code?: number; error_subcode?: number; error_user_msg?: string };
  };
  if (!res.ok || body.error) {
    const e = body.error ?? {};
    throw new MetaError(e.message ?? `Error ${res.status} de Meta`, {
      code: e.code,
      subcode: e.error_subcode,
      userMessage: e.error_user_msg,
    });
  }
  return body as T;
}
