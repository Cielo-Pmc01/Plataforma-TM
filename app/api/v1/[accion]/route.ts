import { NextResponse } from "next/server";
import { HERRAMIENTAS, llamarApi, tokenDe } from "@/lib/api/tm";

// API REST de la Plataforma TM.
//   GET  /api/v1/<accion>?param=valor   para leer
//   POST /api/v1/<accion>  { ...json }   para leer o escribir
// Autenticación: Authorization: Bearer tm_...

export const dynamic = "force-dynamic";

function sinToken() {
  return NextResponse.json({ ok: false, error: "Falta el token: Authorization: Bearer tm_..." }, { status: 401 });
}

function convertir(valor: string): unknown {
  if (valor === "true") return true;
  if (valor === "false") return false;
  if (/^-?\d+$/.test(valor)) return Number(valor);
  if (valor.includes(",")) return valor.split(",").map((v) => (/^\d+$/.test(v) ? Number(v) : v));
  return valor;
}

async function responder(request: Request, accion: string, args: Record<string, unknown>) {
  const token = tokenDe(request);
  if (!token) return sinToken();
  if (!HERRAMIENTAS.some((h) => h.accion === accion)) {
    return NextResponse.json(
      { ok: false, error: `Acción desconocida. Usar: ${HERRAMIENTAS.map((h) => h.accion).join(", ")}` },
      { status: 404 },
    );
  }
  const r = await llamarApi(token, accion, args);
  return NextResponse.json(r, { status: r.ok ? 200 : r.status });
}

export async function GET(request: Request, ctx: { params: Promise<{ accion: string }> }) {
  const { accion } = await ctx.params;
  const herramienta = HERRAMIENTAS.find((h) => h.accion === accion);
  if (herramienta?.escribe) {
    return NextResponse.json({ ok: false, error: "Esta acción escribe: usá POST" }, { status: 405 });
  }
  const args: Record<string, unknown> = {};
  new URL(request.url).searchParams.forEach((v, k) => {
    args[k] = convertir(v);
  });
  return responder(request, accion, args);
}

export async function POST(request: Request, ctx: { params: Promise<{ accion: string }> }) {
  const { accion } = await ctx.params;
  let args: Record<string, unknown> = {};
  try {
    const texto = await request.text();
    args = texto ? JSON.parse(texto) : {};
  } catch {
    return NextResponse.json({ ok: false, error: "El cuerpo no es JSON válido" }, { status: 400 });
  }
  return responder(request, accion, args);
}
