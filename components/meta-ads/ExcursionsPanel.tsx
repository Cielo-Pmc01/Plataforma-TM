"use client";

import { useState } from "react";
import { fmtN } from "@/lib/meta-ads/formatters";
import type { ExcursionData } from "@/lib/meta-ads/types";

const ROWS_INIT = 8;

interface Props {
  byExcursion: Record<string, ExcursionData>;
}

export function ExcursionsPanel({ byExcursion }: Props) {
  const [expanded, setExpanded] = useState(false);

  const all = Object.entries(byExcursion).sort((a, b) => b[1].msgs - a[1].msgs);
  const rows = expanded ? all : all.slice(0, ROWS_INIT);

  if (!rows.length) {
    return <div className="text-xs text-muted py-6 text-center">Sin datos</div>;
  }

  const maxMsgs = Math.max(...rows.map(([, v]) => v.msgs), 1);

  return (
    <div className="flex flex-col gap-2.5">
      {rows.map(([exc, v]) => {
        const pct = Math.round((v.msgs / maxMsgs) * 100);
        return (
          <div key={exc} className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-soft truncate" title={exc}>
                {exc}
              </span>
              <span className="font-mono text-xs font-bold text-cyan flex-shrink-0">{fmtN(v.msgs)}</span>
            </div>
            <div className="h-1 rounded-full bg-panel-3 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan to-lime" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
      {all.length > ROWS_INIT && (
        <button
          className="text-xs font-bold text-cyan mt-1 self-center cursor-pointer hover:underline"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? "Ver menos" : `Ver más (${all.length - ROWS_INIT} más)`}
        </button>
      )}
    </div>
  );
}
