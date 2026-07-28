"use client";

import { useState } from "react";
import { usePipelineContent } from "@/lib/cm/hooks";
import { filteredContent } from "@/lib/cm/helpers";
import { PostCard } from "./PostCard";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const STATUSES = ["Idea", "Guion", "Grabado", "Editado", "Aprobado", "Programado"] as const;

export function PipelineView() {
  const [owner, setOwner] = useState("all");
  const { items: allContent, loading, error, refetch } = usePipelineContent();

  const owners = ["all", ...Array.from(new Set(allContent.map((c) => c.owner))).sort()];
  const items = filteredContent(allContent, owner);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Workflow editorial</p>
          <h2 className="text-lg font-extrabold mt-0.5">Pipeline de producción</h2>
        </div>
        <select
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          className="rounded-full border border-line bg-panel-2 px-3 py-1.5 text-xs font-bold text-soft"
        >
          {owners.map((o) => (
            <option key={o} value={o}>
              {o === "all" ? "Todos" : o}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="text-sm text-muted">Cargando contenido real…</div>}
      {error && (
        <div className="text-sm text-coral flex items-center gap-2">
          Error cargando datos: {error}
          <Button variant="secondary" className="!px-3 !py-1 !text-[11px]" onClick={refetch}>
            Reintentar
          </Button>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3 items-start">
          {STATUSES.map((status) => {
            const laneItems = items.filter((c) => c.status === status);
            return (
              <Card key={status} className="!p-3">
                <CardHeader className="!mb-2">
                  <CardTitle className="!text-xs">{status}</CardTitle>
                  <span className="text-[10px] font-mono font-bold text-muted">{laneItems.length}</span>
                </CardHeader>
                <div className="flex flex-col gap-2">
                  {laneItems.length > 0 ? (
                    laneItems.map((item) => <PostCard key={item.id} item={item} onChanged={refetch} />)
                  ) : (
                    <div className="text-[11px] text-muted py-3 text-center">Vacío</div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
