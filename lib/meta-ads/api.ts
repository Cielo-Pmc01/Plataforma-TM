import type { DateRange, LoadedData, PeriodKey } from "./types";

const N8N_URL = process.env.NEXT_PUBLIC_N8N_META_ADS_URL!;
const N8N_REFRESH_URL = process.env.NEXT_PUBLIC_N8N_META_ADS_REFRESH_URL!;

export async function refreshMetaAds(accessToken: string): Promise<void> {
  const res = await fetch(N8N_REFRESH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`No se pudo disparar la actualización (${res.status})`);
}

export async function loadMetaAds(
  period: PeriodKey,
  accessToken: string,
  range?: DateRange,
): Promise<LoadedData> {
  const res = await fetch(N8N_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(range ? { period, since: range.since, until: range.until } : { period }),
  });
  if (!res.ok) throw new Error(`Error al cargar datos de Meta Ads (${res.status})`);
  const json = await res.json();
  if (!json.ok) throw new Error("El backend de n8n devolvió un error");

  return {
    accounts: json.accounts,
    byExcursion: json.byExcursion ?? {},
    byBrandPeriod: json.byBrandPeriod,
    byBrandYear: json.byBrandYear,
    byCampaigns: json.byCampaigns,
    byCampaignStatus: json.byCampaignStatus ?? {},
    byCampaignObjective: json.byCampaignObjective ?? {},
  };
}
