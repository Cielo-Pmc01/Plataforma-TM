"use client";

import { BRAND_COLORS, BRAND_CODES } from "@/lib/meta-ads/config";
import { fmtN } from "@/lib/meta-ads/formatters";
import type { BrandStats } from "@/lib/meta-ads/types";

interface Props {
  byBrandPeriod: Record<string, BrandStats>;
  onBrandClick?: (brand: string) => void;
}

export function BrandsRanking({ byBrandPeriod, onBrandClick }: Props) {
  const all = Object.entries(byBrandPeriod);
  const active = all.filter(([, v]) => v.msgs > 0 || v.spend > 0).sort((a, b) => b[1].msgs - a[1].msgs);
  const inactive = all.filter(([, v]) => v.msgs === 0 && v.spend === 0);
  const maxMsgs = Math.max(...active.map(([, v]) => v.msgs), 1);
  const total = active.reduce((s, [, v]) => s + v.msgs, 0);

  if (active.length === 0) {
    return <div className="text-xs text-muted py-6 text-center">Sin actividad este período</div>;
  }

  return (
    <div className="flex flex-col gap-1.5">
      {active.map(([brand, v], i) => {
        const col = BRAND_COLORS[brand] ?? "#7c827c";
        const code = BRAND_CODES[brand] ?? brand.slice(0, 3).toUpperCase();
        const pct = Math.round((v.msgs / maxMsgs) * 100);
        return (
          <div
            key={brand}
            className={`flex items-center gap-2.5 py-1.5 ${onBrandClick ? "cursor-pointer hover:opacity-80" : ""}`}
            onClick={() => onBrandClick?.(brand)}
          >
            <span className="text-[10px] font-mono text-muted w-3.5 text-right">{i + 1}</span>
            <span
              className="text-[10px] font-bold rounded-full px-2 py-0.5 flex-shrink-0"
              style={{ background: `${col}22`, color: col }}
            >
              {code}
            </span>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold truncate">{brand}</span>
                <span className="font-mono text-xs font-bold" style={{ color: col }}>
                  {fmtN(v.msgs)}
                </span>
              </div>
              <div className="h-1 rounded-full bg-panel-3 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: col }} />
              </div>
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-between pt-2 mt-1 border-t border-line">
        <span className="text-[11px] font-bold text-muted uppercase">Total mensajes</span>
        <span className="font-mono text-sm font-bold text-cyan">{fmtN(total)}</span>
      </div>

      {inactive.length > 0 && (
        <details className="mt-2">
          <summary className="text-[11px] text-muted cursor-pointer hover:text-soft">
            {inactive.length} marca{inactive.length !== 1 ? "s" : ""} sin actividad este período
          </summary>
          <div className="flex flex-col gap-1 mt-2 opacity-40">
            {inactive.map(([brand]) => {
              const code = BRAND_CODES[brand] ?? brand.slice(0, 3).toUpperCase();
              return (
                <div key={brand} className="flex items-center gap-2.5 py-1">
                  <span className="text-[10px] w-3.5 text-right">—</span>
                  <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-panel-3">{code}</span>
                  <span className="text-xs">{brand}</span>
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}
