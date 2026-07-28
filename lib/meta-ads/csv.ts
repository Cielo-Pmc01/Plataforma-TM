import type { LoadedData, PeriodKey } from "./types";

export function exportCSV(data: LoadedData, period: PeriodKey): void {
  const rows: string[][] = [["Tipo", "Nombre", "Marca", "Mensajes", "Inversión", "CPL", "Período"]];

  for (const [brand, v] of Object.entries(data.byBrandPeriod)) {
    const cpl = v.msgs > 0 ? (v.spend / v.msgs).toFixed(0) : "";
    rows.push(["Marca", brand, brand, String(v.msgs), v.spend.toFixed(0), cpl, period]);
  }
  for (const [name, v] of Object.entries(data.byCampaigns)) {
    const cpl = v.msgs > 0 ? (v.spend / v.msgs).toFixed(0) : "";
    rows.push(["Campaña", name, v.brand ?? "", String(v.msgs), v.spend.toFixed(0), cpl, period]);
  }

  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `meta-ads-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
