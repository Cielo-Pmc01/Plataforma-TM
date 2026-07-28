"use client";

import { BRAND_COLORS, BRAND_CODES } from "@/lib/meta-ads/config";
import { fmtN, fmtARS } from "@/lib/meta-ads/formatters";
import type { BrandStats, ExcursionData } from "@/lib/meta-ads/types";

interface Props {
  brand: string;
  data: BrandStats;
  byExcursion: Record<string, ExcursionData>;
  onClose: () => void;
}

export function BrandDrawer({ brand, data, byExcursion, onClose }: Props) {
  const col = BRAND_COLORS[brand] ?? "#7c827c";
  const code = BRAND_CODES[brand] ?? brand.slice(0, 3).toUpperCase();

  const excRows = Object.entries(byExcursion)
    .filter(([, v]) => v.brand === brand && v.msgs > 0)
    .sort((a, b) => b[1].msgs - a[1].msgs);

  const maxExcMsgs = Math.max(...excRows.map(([, v]) => v.msgs), 1);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex justify-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md h-full bg-panel border-l border-line p-6 overflow-y-auto flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold rounded-full px-2.5 py-1" style={{ background: `${col}22`, color: col }}>
            {code}
          </span>
          <div className="flex-1">
            <div className="text-sm font-bold text-text">{brand}</div>
            <div className="text-[11px] text-muted">Detalle de marca</div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-line text-muted hover:text-soft cursor-pointer flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-line bg-panel-2 px-3 py-2.5">
            <div className="text-[10px] text-muted">Mensajes</div>
            <div className="font-mono text-lg font-bold" style={{ color: col }}>
              {fmtN(data.msgs)}
            </div>
          </div>
          <div className="rounded-xl border border-line bg-panel-2 px-3 py-2.5">
            <div className="text-[10px] text-muted">Inversión</div>
            <div className="font-mono text-lg font-bold text-text">{fmtARS(data.spend)}</div>
          </div>
          <div className="rounded-xl border border-line bg-panel-2 px-3 py-2.5">
            <div className="text-[10px] text-muted">CPL</div>
            <div className="font-mono text-lg font-bold text-text">
              {data.msgs > 0 ? fmtARS(data.spend / data.msgs) : "—"}
            </div>
          </div>
        </div>

        {excRows.length > 0 ? (
          <div className="flex flex-col gap-2">
            <div className="text-[11px] font-bold uppercase text-muted">Top excursiones</div>
            {excRows.map(([exc, v]) => {
              const pct = Math.round((v.msgs / maxExcMsgs) * 100);
              return (
                <div key={exc} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-soft truncate">{exc}</span>
                    <span className="font-mono text-xs font-bold" style={{ color: col }}>
                      {fmtN(v.msgs)}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-panel-3 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: col }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-muted">Sin excursiones detalladas para este período</div>
        )}
      </div>
    </div>
  );
}
