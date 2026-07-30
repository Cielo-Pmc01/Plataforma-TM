"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { loadMetaAds, refreshMetaAds } from "@/lib/meta-ads/api";
import { exportCSV } from "@/lib/meta-ads/csv";
import { fmtN, fmtARS, fmtBRL } from "@/lib/meta-ads/formatters";
import { BRAND_COLORS, PERIODS, TABLE_ROWS_INIT } from "@/lib/meta-ads/config";
import type { DateRange, LoadedData, PeriodKey, SortKey, SortDir } from "@/lib/meta-ads/types";
import { Card, CardHeader, CardTitle, CardSub } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BrandsYearChart } from "./BrandsYearChart";
import { BrandsRanking } from "./BrandsRanking";
import { ExcursionsPanel } from "./ExcursionsPanel";
import { BrandDrawer } from "./BrandDrawer";
import { CampaignsSection } from "./CampaignsSection";

type Tab = "dashboard" | "campaigns";

function KPICard({ label, val, color, sub }: { label: string; val: string; color: string; sub: string }) {
  return (
    <Card className="flex flex-col gap-2">
      <span className="text-[11px] font-bold uppercase text-muted">{label}</span>
      <span className="font-mono text-2xl font-semibold" style={{ color }}>
        {val}
      </span>
      <span className="text-[11px] text-muted">{sub}</span>
    </Card>
  );
}

function AccountRow({ acc }: { acc: LoadedData["accounts"][number] }) {
  const spendFmt = acc.currency === "BRL" ? fmtBRL(acc.spend) : fmtARS(acc.spend);
  const statusColor =
    acc.status === "ACTIVE"
      ? "var(--color-green)"
      : acc.status === "PAUSED"
        ? "var(--color-amber)"
        : acc.status === "DISABLED"
          ? "var(--color-coral)"
          : "var(--color-muted)";

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-line bg-panel-2 px-3 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-extrabold flex-shrink-0"
            style={{ background: `${acc.color}22`, color: acc.color }}
          >
            {acc.name.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <div className="text-xs font-bold text-text truncate">{acc.name}</div>
            <div className="text-[10px] text-muted">{acc.currency}</div>
          </div>
        </div>
        <span
          className="text-[10px] font-bold rounded-full px-2 py-0.5 flex items-center gap-1 flex-shrink-0"
          style={{ background: `${statusColor}22`, color: statusColor }}
          title={acc.statusNote ?? undefined}
        >
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusColor }} />
          {acc.statusLabel}
        </span>
      </div>
      <div className="flex items-center gap-4 pl-[42px]">
        <div>
          <div className="text-[10px] text-muted">Inversión</div>
          <div className="font-mono text-sm font-semibold" style={{ color: acc.color }}>
            {spendFmt}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-muted">Mensajes</div>
          <div className="font-mono text-sm">{fmtN(acc.msgs)}</div>
        </div>
      </div>
    </div>
  );
}

export function MetaAdsView() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [data, setData] = useState<LoadedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("mensajes");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expanded, setExpanded] = useState(false);
  const [openCampRows, setOpenCampRows] = useState<Set<string>>(new Set());
  const [drawerBrand, setDrawerBrand] = useState<string | null>(null);
  const [customSince, setCustomSince] = useState("");
  const [customUntil, setCustomUntil] = useState("");
  const [customRange, setCustomRange] = useState<DateRange | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async (p: PeriodKey, range?: DateRange) => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Sesión no encontrada");
      const result = await loadMetaAds(p, session.access_token, range);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // El período "custom" espera a que se confirme el rango con "Aplicar" —
    // no dispara fetch solo con seleccionar el botón.
    if (period === "custom") return;
    void refresh(period);
  }, [period, refresh]);

  async function handleRefresh() {
    setRefreshing(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Sesión no encontrada");
      await refreshMetaAds(session.access_token);
      // El sync real en n8n tarda unos segundos en escribir en Supabase —
      // esperamos antes de volver a pedir los datos, si no llegamos primero.
      await new Promise((resolve) => setTimeout(resolve, 20000));
      await refresh(period, period === "custom" && customRange ? customRange : undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error actualizando datos");
    } finally {
      setRefreshing(false);
    }
  }

  function applyCustomRange() {
    if (!customSince || !customUntil) {
      setCustomError("Elegí ambas fechas");
      return;
    }
    if (customSince > customUntil) {
      setCustomError("La fecha 'desde' no puede ser posterior a 'hasta'");
      return;
    }
    setCustomError(null);
    const range = { since: customSince, until: customUntil };
    setCustomRange(range);
    void refresh("custom", range);
  }

  const accounts = data?.accounts ?? [];
  const totalMsgs = accounts.reduce((s, a) => s + a.msgs, 0);
  const totalSpendARS = accounts.filter((a) => a.currency === "ARS").reduce((s, a) => s + a.spend, 0);
  const totalSpendBRL = accounts.filter((a) => a.currency === "BRL").reduce((s, a) => s + a.spend, 0);
  const totalImpr = accounts.reduce((s, a) => s + a.impr, 0);
  const totalClicks = accounts.reduce((s, a) => s + a.clicks, 0);
  const ctr = totalImpr > 0 ? ((totalClicks / totalImpr) * 100).toFixed(1) : "0.0";

  const campEntries = Object.entries(data?.byCampaigns ?? {});
  const rows = (
    campEntries.length > 0
      ? campEntries.map(([name, v]) => ({
          name,
          brand: v.brand ?? "—",
          mensajes: v.msgs,
          inversion: v.spend,
          cpl: v.msgs > 0 ? v.spend / v.msgs : 0,
          accounts: v.accounts,
        }))
      : Object.entries(data?.byBrandPeriod ?? {}).map(([brand, v]) => ({
          name: brand,
          brand,
          mensajes: v.msgs,
          inversion: v.spend,
          cpl: v.msgs > 0 ? v.spend / v.msgs : 0,
          accounts: undefined,
        }))
  ).sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    return (a[sortKey] < b[sortKey] ? -1 : a[sortKey] > b[sortKey] ? 1 : 0) * dir;
  });
  const visibleRows = expanded ? rows : rows.slice(0, TABLE_ROWS_INIT);

  function toggleCampRow(name: string) {
    setOpenCampRows((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wide text-muted">Meta Ads</p>
          <h1 className="text-2xl font-extrabold mt-1">Performance de campañas</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="secondary" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? "Actualizando…" : "↻ Actualizar"}
          </Button>
          {data && (
            <Button variant="secondary" onClick={() => exportCSV(data, period)}>
              ↓ Exportar CSV
            </Button>
          )}
          <div className="flex gap-1 p-1 rounded-full bg-panel-2 border border-line">
            <button
              onClick={() => setTab("dashboard")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition ${
                tab === "dashboard" ? "bg-panel-3 text-violet" : "text-muted hover:text-soft"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setTab("campaigns")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition ${
                tab === "campaigns" ? "bg-panel-3 text-violet" : "text-muted hover:text-soft"
              }`}
            >
              Campañas
            </button>
          </div>
          <div className="flex gap-1 p-1 rounded-full bg-panel-2 border border-line overflow-x-auto max-w-full">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition ${
                  period === p.key ? "bg-panel-3 text-cyan" : "text-muted hover:text-soft"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {period === "custom" && (
        <div className="flex items-center gap-2 flex-wrap -mt-2">
          <label className="flex items-center gap-1.5 text-xs font-bold text-soft">
            Desde
            <input
              type="date"
              value={customSince}
              max={customUntil || undefined}
              onChange={(e) => setCustomSince(e.target.value)}
              className="rounded-xl border border-line bg-panel-2 px-2.5 py-1.5 text-xs text-text font-sans outline-none focus:border-line-2"
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs font-bold text-soft">
            Hasta
            <input
              type="date"
              value={customUntil}
              min={customSince || undefined}
              onChange={(e) => setCustomUntil(e.target.value)}
              className="rounded-xl border border-line bg-panel-2 px-2.5 py-1.5 text-xs text-text font-sans outline-none focus:border-line-2"
            />
          </label>
          <Button variant="primary" onClick={applyCustomRange} className="py-1.5">
            Aplicar
          </Button>
          {customError && <span className="text-xs font-bold text-coral">{customError}</span>}
          {customRange && !customError && (
            <span className="text-xs text-muted">
              Mostrando {customRange.since} → {customRange.until}
            </span>
          )}
        </div>
      )}

      {loading && <div className="text-sm text-muted">Cargando…</div>}
      {error && <div className="text-sm text-coral font-bold">{error}</div>}

      {!loading && !error && data && tab === "dashboard" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard label="Mensajes totales" val={fmtN(totalMsgs)} color="var(--color-green)" sub="Período seleccionado" />
            <KPICard
              label="Inversión ARS"
              val={fmtARS(totalSpendARS)}
              color="var(--color-lime)"
              sub={totalSpendBRL > 0 ? `+ ${fmtBRL(totalSpendBRL)} BR` : "Período seleccionado"}
            />
            <KPICard label="Impresiones" val={fmtN(totalImpr)} color="var(--color-cyan)" sub="Período seleccionado" />
            <KPICard label="CTR" val={`${ctr}%`} color="var(--color-coral)" sub={`${fmtN(totalClicks)} clicks`} />
          </div>

          {/* Columna del ranking en fr (no px fijo) a propósito: mantiene la misma
              proporción 2:1 con el gráfico sin importar el ancho del contenedor, así
              esta fila queda alineada con el resto (KPIs, cuentas/excursiones/campañas)
              en vez de quedar más angosta y desalineada a la derecha. */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 items-start">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Mensajes por mes</CardTitle>
                  <CardSub>Todas las marcas — año en curso</CardSub>
                </div>
              </CardHeader>
              <BrandsYearChart byBrandYear={data.byBrandYear ?? {}} />
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Ranking de marcas</CardTitle>
                  <CardSub>Período seleccionado</CardSub>
                </div>
              </CardHeader>
              <BrandsRanking byBrandPeriod={data.byBrandPeriod ?? {}} onBrandClick={setDrawerBrand} />
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Cuentas publicitarias</CardTitle>
                  <CardSub>Estado y gasto por cuenta</CardSub>
                </div>
                <Badge label={String(accounts.length)} color="var(--color-cyan)" />
              </CardHeader>
              <div className="flex flex-col gap-2">
                {accounts.length === 0 && <div className="text-xs text-muted">Sin datos</div>}
                {accounts.map((acc) => (
                  <AccountRow key={acc.id} acc={acc} />
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Top excursiones</CardTitle>
                  <CardSub>Por mensajes generados</CardSub>
                </div>
              </CardHeader>
              <ExcursionsPanel byExcursion={data.byExcursion ?? {}} />
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Detalle de campañas</CardTitle>
                  <CardSub>Mensajes · Inversión · CPL</CardSub>
                </div>
              </CardHeader>

              {visibleRows.length === 0 ? (
                <div className="text-xs text-muted py-6 text-center">Sin datos para el período</div>
              ) : (
                <div className="flex flex-col">
                  <div className="grid grid-cols-[1fr_50px_60px] gap-2 px-2 pb-2 border-b border-line text-[10px] font-bold uppercase text-muted">
                    <span>Campaña</span>
                    <button className="text-right cursor-pointer hover:text-soft" onClick={() => toggleSort("mensajes")}>
                      Msj {sortKey === "mensajes" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </button>
                    <button className="text-right cursor-pointer hover:text-soft" onClick={() => toggleSort("inversion")}>
                      Inv {sortKey === "inversion" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </button>
                  </div>
                  {visibleRows.map((row) => {
                    const color = BRAND_COLORS[row.brand] ?? "#7c827c";
                    const accEntries = Object.entries(row.accounts ?? {});
                    const hasAccounts = accEntries.length > 0;
                    const isOpen = openCampRows.has(row.name);
                    return (
                      <div key={row.name}>
                        <div
                          className={`grid grid-cols-[1fr_50px_60px] gap-2 px-2 py-2 border-b border-line/50 items-center text-xs ${
                            hasAccounts ? "cursor-pointer hover:bg-panel-2" : ""
                          }`}
                          onClick={() => hasAccounts && toggleCampRow(row.name)}
                        >
                          <span className="truncate flex items-center gap-1.5 min-w-0" title={row.name}>
                            {hasAccounts ? (
                              <span
                                className="text-[8px] text-muted flex-shrink-0 transition-transform"
                                style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                              >
                                ▶
                              </span>
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                            )}
                            <span className="truncate">{row.name}</span>
                          </span>
                          <span className="font-mono text-right">{fmtN(row.mensajes)}</span>
                          <span className="font-mono text-right text-[10px]">{fmtARS(row.inversion)}</span>
                        </div>
                        {hasAccounts && isOpen && (
                          <div className="flex flex-col gap-1 px-2 py-2 pl-6 bg-panel-2 border-b border-line/50">
                            {accEntries.map(([accName, av]) => (
                              <div key={accName} className="flex items-center gap-2 text-[10px]">
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: av.color }} />
                                <span className="text-soft flex-1 truncate">{accName}</span>
                                <span className="font-mono text-text">{fmtN(av.msgs)} msgs</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {rows.length > TABLE_ROWS_INIT && (
                    <button
                      className="text-xs font-bold text-cyan mt-3 self-center cursor-pointer hover:underline"
                      onClick={() => setExpanded((e) => !e)}
                    >
                      {expanded ? "Ver menos" : `Ver más (${rows.length - TABLE_ROWS_INIT} más)`}
                    </button>
                  )}
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      {!loading && !error && data && tab === "campaigns" && (
        <CampaignsSection
          period={period}
          customRange={customRange}
          accounts={accounts}
          byCampaigns={data.byCampaigns ?? {}}
          byCampaignStatus={data.byCampaignStatus ?? {}}
          byCampaignObjective={data.byCampaignObjective ?? {}}
        />
      )}

      {drawerBrand && data && (
        <BrandDrawer
          brand={drawerBrand}
          data={data.byBrandPeriod[drawerBrand] ?? { msgs: 0, spend: 0, impr: 0, clicks: 0 }}
          byExcursion={data.byExcursion ?? {}}
          onClose={() => setDrawerBrand(null)}
        />
      )}
    </div>
  );
}
