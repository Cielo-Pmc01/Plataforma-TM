import { NextResponse } from "next/server";
import { HERRAMIENTAS, llamarApi, tokenDe } from "@/lib/api/tm";

// Servidor MCP de la Plataforma TM (transporte HTTP «streamable», sin estado).
// Se conecta con la dirección https://<plataforma>/api/mcp y el encabezado
// Authorization: Bearer tm_...  (las conexiones se crean en Control › API y MCP).

export const dynamic = "force-dynamic";

const VERSIONES = ["2025-06-18", "2025-03-26", "2024-11-05"];

const INSTRUCCIONES = `Plataforma TM: centro de control de Meta Ads de Adventure Center (Bariloche).
Empezá por \`resumen\`. Antes de tocar una campaña revisá \`salud\` (fase de aprendizaje, presupuesto vs piso, objetivo de costo), \`historial\` y \`ventas\`.
Después de actuar en Meta, dejá la acción con \`registrar_accion\` (nivel 1 lo hizo solo, 2 avisó antes, 3 con el sí de Cielo).
Las fechas van en hora de Argentina.`;

type Rpc = { jsonrpc?: string; id?: string | number | null; method?: string; params?: Record<string, unknown> };

function resultado(id: Rpc["id"], result: unknown) {
  return { jsonrpc: "2.0", id: id ?? null, result };
}
function falla(id: Rpc["id"], code: number, message: string) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

const listaHerramientas = () =>
  HERRAMIENTAS.map((h) => ({
    name: h.accion,
    title: h.titulo,
    description: h.descripcion + (h.escribe ? " (Escribe: requiere una conexión con permiso de escritura.)" : ""),
    inputSchema: {
      type: "object",
      properties: Object.fromEntries(
        Object.entries(h.parametros).map(([k, p]) => [
          k,
          p.enum && p.type === "integer" ? { type: "integer", enum: p.enum.map(Number), description: p.description } : p,
        ]),
      ),
      ...(h.requeridos ? { required: h.requeridos } : {}),
    },
    annotations: { readOnlyHint: !h.escribe, destructiveHint: false, openWorldHint: false },
  }));

async function atender(m: Rpc, token: string) {
  switch (m.method) {
    case "initialize": {
      const pedida = String(m.params?.protocolVersion ?? "");
      return resultado(m.id, {
        protocolVersion: VERSIONES.includes(pedida) ? pedida : VERSIONES[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "plataforma-tm", title: "Plataforma TM", version: "1.0.0" },
        instructions: INSTRUCCIONES,
      });
    }
    case "ping":
      return resultado(m.id, {});
    case "tools/list":
      return resultado(m.id, { tools: listaHerramientas() });
    case "tools/call": {
      const nombre = String(m.params?.name ?? "");
      const args = (m.params?.arguments ?? {}) as Record<string, unknown>;
      if (!HERRAMIENTAS.some((h) => h.accion === nombre)) return falla(m.id, -32602, `Herramienta desconocida: ${nombre}`);
      const r = await llamarApi(token, nombre, args);
      return resultado(m.id, {
        content: [{ type: "text", text: JSON.stringify(r.ok ? r.datos : { error: r.error }, null, 2) }],
        isError: !r.ok,
      });
    }
    case "resources/list":
      return resultado(m.id, { resources: [] });
    case "prompts/list":
      return resultado(m.id, { prompts: [] });
    default:
      return falla(m.id, -32601, `Método no soportado: ${m.method}`);
  }
}

export async function POST(request: Request) {
  const token = tokenDe(request);
  if (!token) {
    return NextResponse.json(falla(null, -32001, "Falta el token: Authorization: Bearer tm_..."), {
      status: 401,
      headers: { "WWW-Authenticate": 'Bearer realm="plataforma-tm"' },
    });
  }
  // Valida el token antes de atender (también para initialize)
  const cuenta = await llamarApi(token, "cuenta");
  if (!cuenta.ok) {
    return NextResponse.json(falla(null, -32001, cuenta.error), {
      status: cuenta.status === 401 ? 401 : 500,
      headers: { "WWW-Authenticate": 'Bearer realm="plataforma-tm", error="invalid_token"' },
    });
  }

  let cuerpo: Rpc | Rpc[];
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json(falla(null, -32700, "JSON inválido"), { status: 400 });
  }

  const mensajes = Array.isArray(cuerpo) ? cuerpo : [cuerpo];
  const respuestas = [];
  for (const m of mensajes) {
    if (m.id === undefined || m.id === null) continue; // notificaciones: no llevan respuesta
    respuestas.push(await atender(m, token));
  }
  if (!respuestas.length) return new NextResponse(null, { status: 202 });
  return NextResponse.json(Array.isArray(cuerpo) ? respuestas : respuestas[0]);
}

export async function GET() {
  return new NextResponse("Este servidor MCP no usa flujo SSE: mandá los mensajes por POST.", {
    status: 405,
    headers: { Allow: "POST" },
  });
}

export async function DELETE() {
  return new NextResponse(null, { status: 405, headers: { Allow: "POST" } });
}
