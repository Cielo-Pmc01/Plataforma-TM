"use client";

import { useState } from "react";
import { usePipelineContent } from "@/lib/cm/hooks";
import { filteredContent } from "@/lib/cm/helpers";
import { MARCAS_ACTIVAS } from "@/lib/cm/brands";
import type { MarcaFilter } from "@/lib/cm/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

const DAYS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"] as const;

export function CalendarView() {
  const { items: allContent, loading } = usePipelineContent();
  const [marcaCal, setMarcaCal] = useState<MarcaFilter>("all");

  const items = filteredContent(allContent, "all", marcaCal);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Por marca</p>
          <h2 className="text-lg font-extrabold mt-0.5">Calendario editorial</h2>
        </div>
        <select
          value={marcaCal}
          onChange={(e) => setMarcaCal(e.target.value as MarcaFilter)}
          className="rounded-full border border-line bg-panel-2 px-3 py-1.5 text-xs font-bold text-soft"
        >
          <option value="all">Todas las marcas</option>
          {MARCAS_ACTIVAS.map((m) => (
            <option key={m.key} value={m.key}>
              {m.nombre}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="text-sm text-muted">Cargando…</div>}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 items-start">
          {DAYS.map((day) => {
            const dayItems = items.filter((c) => c.day === day);
            return (
              <Card key={day} className="!p-3">
                <CardHeader className="!mb-2">
                  <CardTitle className="!text-xs">{day}</CardTitle>
                </CardHeader>
                <div className="flex flex-col gap-2">
                  {dayItems.length === 0 && <div className="text-[11px] text-muted">Sin piezas</div>}
                  {dayItems.map((item) => (
                    <div key={item.id} className="rounded-lg border border-line bg-panel-2 px-2.5 py-2">
                      <div className="text-[10px] font-bold text-cyan">
                        {item.time} · {item.format} · {item.marca}
                      </div>
                      <p className="text-[11px] text-soft mt-1">{item.hook}</p>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
