"use client";

import { usePipelineSummary } from "@/lib/cm/hooks";
import { MARCAS_ACTIVAS } from "@/lib/cm/brands";
import { Card, CardHeader, CardTitle, CardSub } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const STATUSES = ["Idea", "Guion", "Grabado", "Editado", "Aprobado", "Programado"] as const;

export function SPSummaryView() {
  const { summary, loading, error, refetch } = usePipelineSummary();

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      <div>
        <p className="text-[12px] font-bold uppercase tracking-wide text-muted">Content Command Center</p>
        <h1 className="text-2xl font-extrabold mt-1">Resumen de contenido CM</h1>
        <p className="text-sm text-soft mt-2 max-w-xl">
          Vista de solo lectura — cantidad de piezas por estado y por marca. El detalle y el copy completo lo
          maneja el equipo de CM.
        </p>
      </div>

      {loading && <div className="text-sm text-muted">Cargando resumen…</div>}
      {error && (
        <div className="text-sm text-coral flex items-center gap-2">
          Error cargando datos: {error}
          <Button variant="secondary" className="!px-3 !py-1 !text-[11px]" onClick={refetch}>
            Reintentar
          </Button>
        </div>
      )}

      {!loading && !error && (
        <>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Piezas por estado</CardTitle>
                <CardSub>{summary.total} en total</CardSub>
              </div>
            </CardHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {STATUSES.map((estado) => (
                <div key={estado} className="rounded-xl border border-line bg-panel-2 px-3 py-2.5">
                  <div className="text-[10px] font-bold uppercase text-muted">{estado}</div>
                  <div className="font-mono text-xl font-semibold text-text mt-1">{summary.porEstado[estado] ?? 0}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Piezas por marca</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {MARCAS_ACTIVAS.map((m) => (
                <div key={m.key} className="rounded-xl border border-line bg-panel-2 px-3 py-2.5">
                  <div className="text-[10px] font-bold uppercase text-muted">{m.nombre}</div>
                  <div className="font-mono text-xl font-semibold mt-1" style={{ color: m.color }}>
                    {summary.porMarca[m.key] ?? 0}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
