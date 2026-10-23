"use client";

import { useEffect, useState } from "react";
import type { AdSummary } from "@/lib/ads-editor/ads";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardSub, CardTitle } from "@/components/ui/Card";
import { AdEditor } from "./AdEditor";
import { statusColor, statusLabel } from "./status";

type AccountOption = { id: string; label: string; configured: boolean };
type AdsPage = { ads: AdSummary[]; next: string | null };
type Result = { key: string; ads: AdSummary[]; next: string | null; error: string | null };

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Error ${res.status}`);
  return data as T;
}

function adsUrl(accountId: string, todos: boolean, after?: string) {
  const q = new URLSearchParams({ account: accountId });
  if (after) q.set("after", after);
  if (todos) q.set("todos", "1");
  return `/api/anuncios?${q}`;
}

export function AnunciosView() {
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string>("");
  const [todos, setTodos] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    getJson<{ accounts: AccountOption[] }>("/api/anuncios")
      .then((d) => setAccounts(d.accounts))
      .catch((e: Error) => setAccountsError(e.message));
  }, []);

  // "Cargando" se deriva: hay cuenta elegida y todavía no llegó el resultado de esta combinación.
  const key = `${accountId}|${todos}|${reloadCount}`;
  const loading = accountId !== "" && result?.key !== key;

  useEffect(() => {
    if (!accountId) return;
    let cancelled = false;
    getJson<AdsPage>(adsUrl(accountId, todos))
      .then((d) => {
        if (!cancelled) setResult({ key, ads: d.ads, next: d.next, error: null });
      })
      .catch((e: unknown) => {
        if (!cancelled) setResult({ key, ads: [], next: null, error: e instanceof Error ? e.message : "No se pudieron cargar los anuncios." });
      });
    return () => {
      cancelled = true;
    };
  }, [accountId, todos, key]);

  async function loadMore() {
    if (!result?.next || !accountId) return;
    setLoadingMore(true);
    try {
      const d = await getJson<AdsPage>(adsUrl(accountId, todos, result.next));
      setResult({ ...result, ads: [...result.ads, ...d.ads], next: d.next });
    } catch (e) {
      setResult({ ...result, error: e instanceof Error ? e.message : "No se pudieron cargar más anuncios." });
    } finally {
      setLoadingMore(false);
    }
  }

  const current = result?.key === key ? result : null;
  const ads = current?.ads ?? [];
  const error = accountsError ?? current?.error ?? null;
  const filtered = ads.filter((a) =>
    `${a.name} ${a.campaignName ?? ""} ${a.adsetName ?? ""}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-extrabold text-text">Editor de anuncios</h1>
        <p className="text-xs text-muted mt-1">
          Editá el mensaje de bienvenida y los textos de un anuncio ya creado. Cada cambio se confirma antes de aplicarse y se puede deshacer.
        </p>
      </div>

      <Card className="gap-3">
        <CardHeader>
          <div>
            <CardTitle>Cuenta publicitaria</CardTitle>
            <CardSub>Solo se pueden editar anuncios de Páginas donde el token tiene rol de anunciante.</CardSub>
          </div>
        </CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={accountId}
            onChange={(e) => {
              setSelected(null);
              setAccountId(e.target.value);
            }}
            className="rounded-xl border border-line bg-panel-2 px-3 py-2 text-sm text-text outline-none focus:border-cyan"
          >
            <option value="">Elegí una cuenta…</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id} disabled={!a.configured}>
                {a.label} ({a.id.slice(-4)}){a.configured ? "" : " — sin token configurado"}
              </option>
            ))}
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por anuncio, campaña o conjunto"
            className="min-w-[240px] flex-1 rounded-xl border border-line bg-panel-2 px-3 py-2 text-sm text-text outline-none focus:border-cyan"
          />
          <label className="flex items-center gap-2 text-xs text-soft cursor-pointer">
            <input
              type="checkbox"
              checked={todos}
              onChange={(e) => {
                setSelected(null);
                setTodos(e.target.checked);
              }}
            />
            Mostrar también anuncios que no abren mensajes
          </label>
        </div>
      </Card>

      {error && <div className="rounded-xl border border-coral/40 bg-coral/10 px-3 py-2 text-xs text-coral">{error}</div>}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="flex flex-col gap-2">
          {!accountId && <p className="text-xs text-muted">Elegí una cuenta para ver sus anuncios.</p>}
          {accountId && !loading && filtered.length === 0 && !error && (
            <p className="text-xs text-muted">No hay anuncios para mostrar.</p>
          )}
          {filtered.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelected(a.id)}
              className={`text-left rounded-xl border px-3 py-2.5 transition cursor-pointer ${
                selected === a.id ? "border-cyan bg-panel-3" : "border-line bg-panel-2 hover:border-line-2"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-text truncate">{a.name}</span>
                <Badge label={statusLabel(a.effectiveStatus)} color={statusColor(a.effectiveStatus)} />
              </div>
              <div className="text-[11px] text-muted truncate">
                {a.campaignName} · {a.adsetName}
              </div>
            </button>
          ))}
          {(loading || loadingMore) && <p className="text-xs text-muted">Cargando…</p>}
          {current?.next && !loading && !loadingMore && (
            <button onClick={loadMore} className="text-xs font-bold text-cyan text-left cursor-pointer">
              Cargar más anuncios
            </button>
          )}
        </div>

        <div>
          {selected && accountId ? (
            <AdEditor
              key={selected}
              accountId={accountId}
              adId={selected}
              onClose={() => setSelected(null)}
              onApplied={() => setReloadCount((n) => n + 1)}
            />
          ) : (
            <Card>
              <p className="text-xs text-muted">Elegí un anuncio de la lista para editarlo.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
