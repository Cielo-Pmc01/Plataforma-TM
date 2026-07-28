export type PeriodKey = "today" | "week" | "month" | "ytd" | "custom";

export interface DateRange {
  since: string;
  until: string;
}
export type SortKey = "mensajes" | "inversion" | "cpl";
export type SortDir = "asc" | "desc";
export type StatusFilter = "active" | "all";

export interface AccountData {
  id: string;
  name: string;
  currency: string;
  color: string;
  status: string;
  statusLabel: string;
  statusNote: string | null;
  spend: number;
  msgs: number;
  impr: number;
  clicks: number;
}

export interface BrandStats {
  msgs: number;
  spend: number;
  impr: number;
  clicks: number;
}

export interface AccountDetail {
  msgs: number;
  spend: number;
  color: string;
}

export interface ExcursionData {
  msgs: number;
  spend: number;
  brand: string;
  accounts: Record<string, AccountDetail>;
}

export interface CampaignData {
  msgs: number;
  spend: number;
  brand: string | null;
  accounts: Record<string, AccountDetail>;
}

export interface LoadedData {
  accounts: AccountData[];
  byExcursion: Record<string, ExcursionData>;
  byBrandPeriod: Record<string, BrandStats>;
  byBrandYear: Record<string, number[]>;
  byCampaigns: Record<string, CampaignData>;
  byCampaignStatus: Record<string, string>;
  byCampaignObjective: Record<string, string>;
}
