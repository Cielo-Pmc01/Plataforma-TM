"use client";

import { useState } from "react";
import { MESES, BRAND_COLORS } from "@/lib/meta-ads/config";
import { fmtN } from "@/lib/meta-ads/formatters";

interface Props {
  byBrandYear: Record<string, number[]>;
}

export function BrandsYearChart({ byBrandYear }: Props) {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const brands = Object.keys(byBrandYear);
  const monthTotals = new Array(12).fill(0) as number[];
  for (const brand of brands) {
    for (let m = 0; m < 12; m++) {
      monthTotals[m] += byBrandYear[brand]?.[m] ?? 0;
    }
  }
  const maxMonth = Math.max(...monthTotals, 1);
  const curMonth = new Date().getMonth();

  const topBrands = Object.entries(byBrandYear)
    .filter(([, v]) => v.reduce((s, n) => s + n, 0) > 0)
    .sort((a, b) => b[1].reduce((s, n) => s + n, 0) - a[1].reduce((s, n) => s + n, 0))
    .slice(0, 6);

  if (monthTotals.every((v) => v === 0)) {
    return <div className="text-xs text-muted py-6 text-center">Sin datos del año</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-2 h-[180px]">
        {MESES.map((mes, m) => {
          const total = monthTotals[m];
          const barH = Math.round((total / maxMonth) * 160);
          const isCur = m === curMonth;
          const isFuture = m > curMonth;

          const segs = brands
            .filter((b) => (byBrandYear[b]?.[m] ?? 0) > 0)
            .map((b) => {
              const v = byBrandYear[b][m];
              const segH = Math.round((v / maxMonth) * 160);
              const col = BRAND_COLORS[b] ?? "#7c827c";
              return <div key={b} style={{ height: segH, background: col, flexShrink: 0 }} />;
            });

          return (
            <div
              key={mes}
              className="flex-1 flex flex-col items-center gap-1.5 relative"
              style={{ opacity: isFuture ? 0.35 : 1 }}
              onMouseEnter={() => setHoveredMonth(m)}
              onMouseLeave={() => setHoveredMonth(null)}
            >
              <div className="w-full flex flex-col justify-end h-[160px] relative">
                {hoveredMonth === m && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-text bg-panel-3 border border-line rounded px-1.5 py-0.5 whitespace-nowrap z-10">
                    {fmtN(total)}
                  </div>
                )}
                <div
                  className="w-full flex flex-col-reverse rounded-t-sm overflow-hidden"
                  style={{ height: barH, boxShadow: isCur ? "0 0 12px rgba(194,247,75,.3)" : undefined }}
                >
                  {segs.length > 0 ? segs : <div style={{ height: Math.max(barH, 2), background: "rgba(255,255,255,.06)" }} />}
                </div>
              </div>
              <span className={`text-[10px] ${isCur ? "font-bold text-lime" : "text-muted"}`}>{mes}</span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1.5 pt-2 border-t border-line">
        {topBrands.map(([brand]) => {
          const col = BRAND_COLORS[brand] ?? "#7c827c";
          return (
            <span key={brand} className="inline-flex items-center gap-1.5 text-[10px] text-muted">
              <span className="w-2 h-2 rounded-full" style={{ background: col }} />
              {brand}
            </span>
          );
        })}
      </div>
    </div>
  );
}
