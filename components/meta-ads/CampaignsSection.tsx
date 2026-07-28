"use client";

import { useState } from "react";
import { BRAND_COLORS, BRAND_CODES, MESSAGES_OBJECTIVES } from "@/lib/meta-ads/config";
import { fmtN, fmtARS } from "@/lib/meta-ads/formatters";
import type { AccountData, CampaignData, StatusFilter, PeriodKey, DateRange } from "@/lib/meta-ads/types";

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Activa", color: "#4ade80" },
  PAUSED: { label: "Pausada", color: "#facc15" },
  ACCOUNT_PAUSED: { label: "Cuenta pausada", color: "#f87171" },
  ACCOUNT_ISSUE: { label: "Error de cuenta", color: "#f87171" },
  WITH_ISSUES: { label: "Con errores", color: "#f97316" },
  DISAPPROVED: { label: "Desaprobada", color: "#f87171" },
  PENDING_REVIEW: { label: "En revisión", color: "#94a3b8" },
  IN_PROCESS: { label: "Procesando", color: "#94a3b8" },
  DELETED: { label: "Eliminada", color: "#64748b" },
  ARCHIVED: { label: "Archivada", color: "#64748b" },
};

interface Props {
  period: PeriodKey;
  customRange?: DateRange | null;
  accounts: AccountData[];
  byCampaigns: Record<string, CampaignData>;
  byCampaignStatus: Record<string, string>;
  byCampaignObjective: Record<string, string>;
}

export function CampaignsSection({
  period,
  customRange,
  accounts,
  byCampaigns,
  byCampaignStatus,
  byCampaignObjective,
}: Props) {
  const [openRows, setOpenRows] = useState<Set<string>>(new Set());
  const [campBrandFilter, setCampBrandFilter] = useState("all");
  const [campAccountFilter, setCampAccountFilter] = useState("all");
  const [campStatusFilter, setCampStatusFilter] = useState<StatusFilter>("all");
  const [campSearch, setCampSearch] = useState("");

  function isMessagesCampaign(name: string) {
    const obj = byCampaignObjective[name];
    if (obj) return MESSAGES_OBJECTIVES.has(obj);
    return (byCampaigns[name]?.msgs ?? 0) > 0;
  }

  function isActive(name: string) {
    return byCampaignStatus[name] === "ACTIVE";
  }

  function statusCfg(name: string) {
    const s = byCampaignStatus[name];
    return STATUS_CFG[s] ?? { label: s ?? "Sin datos", color: "#94a3b8" };
  }

  const allEntries = Object.entries(byCampaigns);
  const brandsWithData = [...new Set(allEntries.map(([, v]) => v.brand).filter(Boolean))].sort() as string[];
  const accountNamesWithData = [
    ...new Set(allEntries.flatMap(([, v]) => Object.keys(v.accounts ?? {}))),
  ].sort();
  const msgEntries = allEntries.filter(([name]) => isMessagesCampaign(name));
  const totalCount = msgEntries.length;
  const activeCount = msgEntries.filter(([name]) => isActive(name)).length;

  const filtered = msgEntries.filter(([name, v]) => {
    const matchBrand = campBrandFilter === "all" || v.brand === campBrandFilter;
    const matchAccount = campAccountFilter === "all" || Object.keys(v.accounts ?? {}).includes(campAccountFilter);
    const matchSearch = !campSearch || name.toLowerCase().includes(campSearch.toLowerCase());
    const matchStatus = campStatusFilter === "all" || isActive(name);
    return matchBrand && matchAccount && matchSearch && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => b[1].msgs - a[1].msgs);

  function toggleRow(id: string) {
    setOpenRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const periodLabel =
    period === "today"
      ? "Hoy"
      : period === "week"
        ? "Últimos 7 días"
        : period === "month"
          ? "Este mes"
          : period === "custom"
            ? customRange
              ? `${customRange.since} → ${customRange.until}`
              : "Personalizado"
            : "Este año";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Campañas</p>
          <h2 className="text-lg font-extrabold mt-0.5">Performance por campaña · {periodLabel}</h2>
        </div>
        <div className="flex gap-1 p-1 rounded-full bg-panel-2 border border-line">
          <button
            onClick={() => setCampStatusFilter("active")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer flex items-center gap-1.5 transition ${
              campStatusFilter === "active" ? "bg-panel-3 text-text" : "text-muted hover:text-soft"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green" />
            Activas <span className="font-mono">{activeCount}</span>
          </button>
          <button
            onClick={() => setCampStatusFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition ${
              campStatusFilter === "all" ? "bg-panel-3 text-text" : "text-muted hover:text-soft"
            }`}
          >
            Todas <span className="font-mono">{totalCount}</span>
          </button>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => setCampBrandFilter("all")}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer border transition ${
            campBrandFilter === "all" ? "bg-panel-3 text-text border-line-2" : "text-muted border-line hover:text-soft"
          }`}
        >
          Todas
        </button>
        {brandsWithData.map((brand) => {
          const col = BRAND_COLORS[brand] ?? "#7c827c";
          const code = BRAND_CODES[brand] ?? brand.slice(0, 3).toUpperCase();
          const active = campBrandFilter === brand;
          return (
            <button
              key={brand}
              onClick={() => setCampBrandFilter(brand)}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer border transition"
              style={active ? { background: `${col}20`, color: col, borderColor: `${col}40` } : { color: "var(--color-muted)", borderColor: "var(--color-line)" }}
            >
              <span className="font-extrabold mr-1">{code}</span>
              {brand}
            </button>
          );
        })}
      </div>

      {accountNamesWithData.length > 1 && (
        <div className="flex gap-1.5 flex-wrap items-center">
          <span className="text-[10px] font-bold uppercase text-muted mr-1">Cuenta</span>
          <button
            onClick={() => setCampAccountFilter("all")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer border transition ${
              campAccountFilter === "all" ? "bg-panel-3 text-text border-line-2" : "text-muted border-line hover:text-soft"
            }`}
          >
            Todas
          </button>
          {accountNamesWithData.map((accName) => {
            const acc = accounts.find((a) => a.name === accName);
            const col = acc?.color ?? "#7c827c";
            const active = campAccountFilter === accName;
            return (
              <button
                key={accName}
                onClick={() => setCampAccountFilter(accName)}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer border transition"
                style={active ? { background: `${col}20`, color: col, borderColor: `${col}40` } : { color: "var(--color-muted)", borderColor: "var(--color-line)" }}
              >
                {accName}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          type="search"
          placeholder="Buscar campaña…"
          value={campSearch}
          onChange={(e) => setCampSearch(e.target.value)}
          className="flex-1 rounded-full border border-line bg-panel-2 px-4 py-2 text-xs text-text"
        />
        <span className="text-[11px] text-muted flex-shrink-0">
          {sorted.length} campaña{sorted.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="rounded-card border border-line bg-panel overflow-hidden">
        <div className="grid grid-cols-[1fr_70px_120px_90px_90px_80px] gap-2 px-4 py-2.5 border-b border-line text-[10px] font-bold uppercase text-muted">
          <span>Campaña</span>
          <span>Marca</span>
          <span>Estado</span>
          <span className="text-right">Mensajes</span>
          <span className="text-right">Inversión</span>
          <span className="text-right">CPL</span>
        </div>
        {sorted.length === 0 ? (
          <div className="text-xs text-muted py-8 text-center">Sin campañas para este filtro y período</div>
        ) : (
          sorted.map(([name, v], i) => {
            const col = BRAND_COLORS[v.brand ?? ""] ?? "#7c827c";
            const code = BRAND_CODES[v.brand ?? ""] ?? "—";
            const cpl = v.msgs > 0 ? v.spend / v.msgs : 0;
            const rowId = `c${i}`;
            const hasAccounts = Object.keys(v.accounts ?? {}).length > 0;
            const isOpen = openRows.has(rowId);
            const sc = statusCfg(name);

            return (
              <div key={name}>
                <div
                  className={`grid grid-cols-[1fr_70px_120px_90px_90px_80px] gap-2 px-4 py-2.5 border-b border-line/50 items-center text-xs ${
                    hasAccounts ? "cursor-pointer hover:bg-panel-2" : ""
                  }`}
                  onClick={() => hasAccounts && toggleRow(rowId)}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    {hasAccounts ? (
                      <span
                        className="text-[9px] text-muted flex-shrink-0 transition-transform"
                        style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                      >
                        ▶
                      </span>
                    ) : (
                      <span className="w-2.5 flex-shrink-0" />
                    )}
                    <span className="truncate" title={name}>
                      {name}
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-bold rounded-full px-2 py-0.5 justify-self-start"
                    style={{ background: `${col}22`, color: col }}
                  >
                    {code}
                  </span>
                  <span
                    className="text-[10px] font-bold rounded-full px-2 py-0.5 justify-self-start flex items-center gap-1"
                    style={{ background: `${sc.color}22`, color: sc.color }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sc.color }} />
                    {sc.label}
                  </span>
                  <span className="font-mono text-right">{fmtN(v.msgs)}</span>
                  <span className="font-mono text-right">{fmtARS(v.spend)}</span>
                  <span className="font-mono text-right">{cpl > 0 ? fmtARS(cpl) : "—"}</span>
                </div>
                {hasAccounts && isOpen && (
                  <div className="flex flex-col gap-1.5 px-4 py-2.5 pl-10 bg-panel-2 border-b border-line/50">
                    {Object.entries(v.accounts ?? {}).map(([accName, av]) => (
                      <div key={accName} className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: av.color }} />
                        <span className="text-[11px] text-soft flex-1">{accName}</span>
                        <span className="font-mono text-[11px] text-text">{fmtN(av.msgs)} msgs</span>
                        <span className="font-mono text-[11px] text-muted w-20 text-right">{fmtARS(av.spend)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
