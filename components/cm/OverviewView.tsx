"use client";

import {
  igMetrics,
  growthData,
  engagementMix,
  reachByFormat,
  retention,
  funnel,
  heatmap,
  insights,
  content as mockContent,
} from "@/lib/cm/mock";
import { Card, CardTitle } from "@/components/ui/Card";

function lineChartSvg(values: number[]): string {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 92 - ((v - min) / (max - min)) * 78;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Growth trend">
    <defs>
      <linearGradient id="growthStroke" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stop-color="#58e6ff"/>
        <stop offset="55%" stop-color="#d8ff63"/>
        <stop offset="100%" stop-color="#ff77bc"/>
      </linearGradient>
      <linearGradient id="growthFill" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#58e6ff" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="#58e6ff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <polygon points="0,100 ${points} 100,100" fill="url(#growthFill)"/>
    <polyline points="${points}" fill="none" stroke="url(#growthStroke)" stroke-width="2.8" vector-effect="non-scaling-stroke"/>
  </svg>`;
}

export function OverviewView() {
  const topItems = [...mockContent].sort((a, b) => b.score - a.score).slice(0, 4);
  const alertItems = mockContent.filter((c) => c.score < 75);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-card border border-line bg-gradient-to-br from-panel-2 to-panel p-2 text-[10px] text-muted">
        Dashboard de referencia con métricas mock de Instagram — sin conexión a Meta API todavía. Ver pestaña
        &quot;IG Ready&quot; para el estado de esa conexión futura.
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {igMetrics.map((m) => (
          <Card key={m.label} className="!p-3 flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-muted">{m.label}</span>
            <strong className="text-lg font-extrabold" style={{ color: m.color }}>
              {m.value}
            </strong>
            <p className="text-[10px] text-muted">{m.detail}</p>
            <div className="text-[10px] font-bold" style={{ color: m.color }}>
              {m.delta}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-[11px] font-bold uppercase text-muted">Crecimiento 30 días</p>
              <CardTitle className="!text-base mt-1">Seguidores, alcance e interacción</CardTitle>
              <p className="text-[11px] text-muted mt-1">Mock de evolución diaria para ver tendencia, no data real.</p>
            </div>
            <div className="text-right flex-shrink-0">
              <strong className="text-lg font-extrabold text-cyan block">+4.812</strong>
              <span className="text-[10px] text-muted">net followers</span>
            </div>
          </div>
          <div className="h-[160px]" dangerouslySetInnerHTML={{ __html: lineChartSvg(growthData) }} />
        </Card>

        <Card>
          <div className="mb-3">
            <p className="text-[11px] font-bold uppercase text-muted">Mix engagement</p>
            <CardTitle className="!text-base mt-1">Qué está generando acción</CardTitle>
            <p className="text-[11px] text-muted mt-1">Likes, comentarios, saves, shares y DMs.</p>
          </div>
          <div className="flex items-center gap-6">
            <div
              className="w-28 h-28 rounded-full flex-shrink-0"
              style={{
                background:
                  "conic-gradient(#58e6ff 0% 54%, #d8ff63 54% 73%, #ff77bc 73% 87%, #ffc857 87% 95%, #ff6f61 95% 100%)",
              }}
              aria-label="Engagement rate 8.7%"
            />
            <div className="flex flex-col gap-2 flex-1">
              {engagementMix.map((e) => (
                <div key={e.label} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.color }} />
                  <span className="text-soft flex-1">{e.label}</span>
                  <b className="font-mono">{e.value}</b>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <div className="mb-3">
            <p className="text-[11px] font-bold uppercase text-muted">Alcance por formato</p>
            <CardTitle className="!text-base mt-1">Reels vs carruseles vs stories</CardTitle>
          </div>
          <div className="flex items-end justify-between gap-2 h-[140px]">
            {reachByFormat.map((r) => (
              <div key={r.label} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex flex-col justify-end h-[110px] rounded-t-sm overflow-hidden bg-panel-3">
                  <div style={{ height: `${r.value}%`, background: r.color }} />
                </div>
                <span className="text-[10px] text-muted">{r.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-3">
            <p className="text-[11px] font-bold uppercase text-muted">Retención reels</p>
            <CardTitle className="!text-base mt-1">Caída por tramo</CardTitle>
          </div>
          <div className="flex flex-col gap-2.5">
            {retention.map((r) => (
              <div key={r.label} className="flex items-center gap-2 text-xs">
                <span className="w-12 text-muted flex-shrink-0">{r.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-panel-3 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${r.value}%`, background: r.color }} />
                </div>
                <b className="font-mono w-9 text-right">{r.value}%</b>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-3">
            <p className="text-[11px] font-bold uppercase text-muted">CTR / perfil</p>
            <CardTitle className="!text-base mt-1">Ruta a DM y agenda</CardTitle>
          </div>
          <div className="flex flex-col gap-2.5">
            {funnel.map((f) => (
              <div key={f.label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-soft">{f.label}</span>
                  <b className="font-mono">{f.value}</b>
                </div>
                <div className="h-1.5 rounded-full bg-panel-3 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${f.pct}%`, background: f.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="mb-3">
            <p className="text-[11px] font-bold uppercase text-muted">Performance horario</p>
            <CardTitle className="!text-base mt-1">Heatmap de publicación</CardTitle>
            <p className="text-[11px] text-muted mt-1">Mock de intensidad por día/hora para decidir slots.</p>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {heatmap.map((h, i) => (
              <div
                key={i}
                className="rounded-lg px-2 py-3 text-center text-[10px] font-bold text-text"
                style={{ background: `color-mix(in srgb, var(--color-cyan) ${h.heat}%, transparent)` }}
              >
                {h.day}
                <span className="block text-[9px] font-normal text-muted mt-1">{h.hour}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-3">
            <p className="text-[11px] font-bold uppercase text-muted">Operación de contenido</p>
            <CardTitle className="!text-base mt-1">Lo que hay que mirar hoy</CardTitle>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Piezas activas", mockContent.length, "Semana mock"],
              ["Listas", mockContent.filter((c) => ["Aprobado", "Programado"].includes(c.status)).length, "Aprobadas/programadas"],
              ["Score medio", Math.round(mockContent.reduce((s, c) => s + c.score, 0) / mockContent.length), "Quality gate"],
              ["Reels", mockContent.filter((c) => c.format === "Reel").length, "Motor principal"],
              ["Bloqueos", mockContent.filter((c) => c.score < 70).length, "Score bajo 70"],
              ["Publicables hoy", 9, "Mock operativo"],
            ].map(([label, value, detail]) => (
              <div key={label as string} className="rounded-xl border border-line bg-panel-2 px-3 py-2.5">
                <div className="text-[10px] text-muted">{label}</div>
                <div className="font-mono text-xl font-bold text-text mt-1">{value}</div>
                <div className="text-[10px] text-muted mt-0.5">{detail}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="mb-3">
            <p className="text-[11px] font-bold uppercase text-muted">Piezas ganadoras</p>
            <CardTitle className="!text-base mt-1">Contenido con más señal comercial</CardTitle>
          </div>
          <div className="flex flex-col gap-2.5">
            {topItems.map((item, i) => (
              <div key={i} className="rounded-xl border border-line bg-panel-2 px-3 py-2.5">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-violet/20 text-violet">{item.format}</span>
                  <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-cyan/20 text-cyan">{item.marca}</span>
                  <span className="font-mono text-[10px] text-muted ml-auto">{item.score}</span>
                </div>
                <div className="text-xs font-bold text-text">{item.hook}</div>
                <p className="text-[11px] text-muted mt-0.5">{item.summary}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-3">
            <p className="text-[11px] font-bold uppercase text-muted">Alertas + insights</p>
            <CardTitle className="!text-base mt-1">Control de calidad</CardTitle>
          </div>
          <div className="flex flex-col gap-2 mb-4">
            {alertItems.length > 0 ? (
              alertItems.map((item, i) => (
                <div
                  key={i}
                  className="rounded-lg border-l-2 pl-3 py-1.5"
                  style={{ borderColor: item.score < 65 ? "var(--color-coral)" : "var(--color-amber)" }}
                >
                  <strong className="text-xs">{item.hook}</strong>
                  <p className="text-[11px] text-muted">Score {item.score}. Revisar tensión, CTA o grababilidad antes de aprobar.</p>
                </div>
              ))
            ) : (
              <div className="rounded-lg border-l-2 border-green pl-3 py-1.5">
                <strong className="text-xs">Sin rojos</strong>
                <p className="text-[11px] text-muted">El filtro actual no tiene bloqueos fuertes.</p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {insights.map(([title, text, color]) => (
              <div key={title} className="rounded-lg border-l-2 pl-3 py-1.5" style={{ borderColor: color }}>
                <strong className="text-xs">{title}</strong>
                <p className="text-[11px] text-muted">{text}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
