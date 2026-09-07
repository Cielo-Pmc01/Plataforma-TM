"use client";

import { useState } from "react";
import { MESES, BRAND_COLORS } from "@/lib/meta-ads/config";
import { fmtN } from "@/lib/meta-ads/formatters";

interface Props {
  byBrandYear: Record<string, number[]>;
}

interface HoveredSeg {
  month: number;
  brand: string;
}

export function BrandsYearChart({ byBrandYear }: Props) {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [hoveredSeg, setHoveredSeg] = useState<HoveredSeg | null>(null);
  const [expanded, setExpanded] = useState(false);

  const brands = Object.keys(byBrandYear);
  const monthTotals = new Array(12).fill(0) as number[];
  for (const brand of brands) {
    for (let m = 0; m < 12; m++) {
      monthTotals[m] += byBrandYear[brand]?.[m] ?? 0;
    }
  }
  const maxMonth = Math.max(...monthTotals, 1);
  const curMonth = new Date().getMonth();

  const allBrandsWithData = Object.entries(byBrandYear)
    .filter(([, v]) => v.reduce((s, n) => s + n, 0) > 0)
    .sort((a, b) => b[1].reduce((s, n) => s + n, 0) - a[1].reduce((s, n) => s + n, 0));
  const topBrands = allBrandsWithData.slice(0, 6);

  if (monthTotals.every((v) => v === 0)) {
    return <div className="text-xs text-muted py-6 text-center">Sin datos del año</div>;
  }

  function renderBars(heightPx: number, big: boolean) {
    return (
      <div className={`flex items-end gap-2 ${big ? "h-[340px]" : "h-[180px]"}`}>
        {MESES.map((mes, m) => {
          const total = monthTotals[m];
          const isCur = m === curMonth;
          const isFuture = m > curMonth;
          const segBrands = brands.filter((b) => (byBrandYear[b]?.[m] ?? 0) > 0);

          // Altura mínima por franja para que las marcas con pocos mensajes
          // (meses bajos como sep) sigan siendo hoveables — si no, quedan de 1-2px
          // y el mouse "engancha" la franja de al lado en vez de la que se ve.
          const MIN_SEG = big ? 4 : 2;
          const segHeights = segBrands.map((b) =>
            Math.max(Math.round((byBrandYear[b][m] / maxMonth) * heightPx), MIN_SEG),
          );
          const barH =
            segBrands.length > 0
              ? Math.max(segHeights.reduce((s, h) => s + h, 0), Math.round((total / maxMonth) * heightPx))
              : Math.round((total / maxMonth) * heightPx);

          return (
            <div
              key={mes}
              className="flex-1 flex flex-col items-center gap-1.5 relative"
              style={{ opacity: isFuture ? 0.35 : 1 }}
              onMouseEnter={() => setHoveredMonth(m)}
              onMouseLeave={() => {
                setHoveredMonth(null);
                setHoveredSeg(null);
              }}
            >
              <div className={`w-full flex flex-col justify-end relative`} style={{ height: heightPx }}>
                {hoveredMonth === m && !hoveredSeg && (
                  <div
                    className={`absolute -top-6 left-1/2 -translate-x-1/2 font-mono font-bold text-text bg-panel-3 border border-line rounded px-1.5 py-0.5 whitespace-nowrap z-10 pointer-events-none ${big ? "text-xs" : "text-[10px]"}`}
                  >
                    {fmtN(total)}
                  </div>
                )}
                <div
                  className="w-full flex flex-col-reverse rounded-t-sm overflow-hidden"
                  style={{ height: barH, boxShadow: isCur ? "0 0 12px rgba(194,247,75,.3)" : undefined }}
                >
                  {segBrands.length > 0 ? (
                    segBrands.map((b, segIdx) => {
                      const segH = segHeights[segIdx];
                      const col = BRAND_COLORS[b] ?? "#7c827c";
                      const isHovered = hoveredSeg?.month === m && hoveredSeg?.brand === b;
                      return (
                        <div
                          key={b}
                          className="relative w-full flex-shrink-0"
                          style={{ height: segH }}
                          onMouseEnter={() => setHoveredSeg({ month: m, brand: b })}
                          onMouseLeave={() => setHoveredSeg(null)}
                        >
                          <div
                            className="w-full h-full"
                            style={{ background: col, filter: isHovered ? "brightness(1.3)" : undefined }}
                          />
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ height: Math.max(barH, 2), background: "rgba(255,255,255,.06)" }} />
                  )}
                </div>
              </div>
              <span className={`${big ? "text-xs" : "text-[10px]"} ${isCur ? "font-bold text-lime" : "text-muted"}`}>
                {mes}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  function renderSidePanel(big: boolean) {
    const width = big ? "w-[170px]" : "w-[110px]";
    const heightClass = big ? "h-[340px]" : "h-[180px]";

    if (!hoveredSeg) {
      return (
        <div className={`${width} ${heightClass} flex items-center justify-center border-l border-line pl-4`}>
          <span className={`text-muted text-center leading-snug ${big ? "text-xs" : "text-[10px]"}`}>
            Pasá el mouse sobre una marca del gráfico
          </span>
        </div>
      );
    }

    const { month, brand } = hoveredSeg;
    const value = byBrandYear[brand]?.[month] ?? 0;
    const col = BRAND_COLORS[brand] ?? "#7c827c";

    return (
      <div className={`${width} ${heightClass} flex flex-col justify-center gap-2 border-l border-line pl-4`}>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: col }} />
          <span className={`font-bold leading-tight ${big ? "text-sm" : "text-[11px]"}`} style={{ color: col }}>
            {brand}
          </span>
        </div>
        <div className={`${big ? "text-xs" : "text-[10px]"} text-muted`}>{MESES[month]} · 2026</div>
        <div className={`font-mono font-bold text-text ${big ? "text-2xl" : "text-lg"}`}>{fmtN(value)}</div>
        <div className={`${big ? "text-xs" : "text-[10px]"} text-muted`}>mensajes</div>
      </div>
    );
  }

  function renderLegend(brandList: [string, number[]][]) {
    return (
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 pt-2 border-t border-line">
        {brandList.map(([brand]) => {
          const col = BRAND_COLORS[brand] ?? "#7c827c";
          return (
            <span key={brand} className="inline-flex items-center gap-1.5 text-[10px] text-muted">
              <span className="w-2 h-2 rounded-full" style={{ background: col }} />
              {brand}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex justify-end -mt-1 -mb-1">
          <button
            onClick={() => setExpanded(true)}
            className="text-[11px] font-bold text-cyan cursor-pointer hover:underline flex items-center gap-1"
          >
            ⤢ Ampliar
          </button>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 min-w-0">{renderBars(160, false)}</div>
          {renderSidePanel(false)}
        </div>
        {renderLegend(topBrands)}
      </div>

      {expanded && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6"
          onClick={(e) => e.target === e.currentTarget && setExpanded(false)}
        >
          <div className="w-full max-w-4xl bg-panel border border-line rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-sm font-bold text-text">Mensajes por mes</div>
                <div className="text-[11px] text-muted">Todas las marcas — año en curso</div>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="w-7 h-7 rounded-full border border-line text-muted hover:text-soft cursor-pointer flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 min-w-0">{renderBars(300, true)}</div>
              {renderSidePanel(true)}
            </div>
            {renderLegend(allBrandsWithData)}
          </div>
        </div>
      )}
    </>
  );
}
