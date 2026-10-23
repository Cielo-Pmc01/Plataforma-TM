"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdDetail, Preview } from "@/lib/ads-editor/ads";
import type { ChangeRow } from "@/lib/ads-editor/changes";
import { MAX_ICE_BREAKERS, type Edits, type FieldChange } from "@/lib/ads-editor/welcome";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardSub, CardTitle } from "@/components/ui/Card";
import { statusColor, statusLabel } from "./status";

const FIELD_LABELS: Record<string, string> = {
  welcomeText: "Saludo de bienvenida",
  iceBreakers: "Respuestas rápidas",
  primaryText: "Texto principal",
  headline: "Titular",
};

interface Props {
  accountId: string;
  adId: string;
  onClose: () => void;
  onApplied: () => void;
}

type Loaded = { ad: AdDetail; history: ChangeRow[] };

async function api<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Error ${res.status}`);
  return data as T;
}

function renderValue(v: string | string[] | null) {
  if (v === null || v === "") return <span className="text-muted italic">(vacío)</span>;
  if (Array.isArray(v)) {
    return v.length === 0 ? (
      <span className="text-muted italic">(sin respuestas)</span>
    ) : (
      <ul className="list-disc pl-4 space-y-0.5">
        {v.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    );
  }
  return <span className="whitespace-pre-wrap">{v}</span>;
}

export function AdEditor({ accountId, adId, onClose, onApplied }: Props) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [welcomeText, setWelcomeText] = useState("");
  const [iceBreakers, setIceBreakers] = useState<string[]>([]);
  const [primaryText, setPrimaryText] = useState("");
  const [headline, setHeadline] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);

  const applyLoaded = useCallback((data: Loaded) => {
    setLoaded(data);
    const c = data.ad.current;
    setWelcomeText(c.welcomeText ?? "");
    setIceBreakers([...c.iceBreakers, ...Array(Math.max(0, MAX_ICE_BREAKERS - c.iceBreakers.length)).fill("")]);
    setPrimaryText(c.primaryText ?? "");
    setHeadline(c.headline ?? "");
    setPreview(null);
  }, []);

  // Recarga manual (después de aplicar o deshacer).
  const load = useCallback(async () => {
    try {
      applyLoaded(await api<Loaded>(`/api/anuncios/${adId}?account=${accountId}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar el anuncio.");
    }
  }, [accountId, adId, applyLoaded]);

  // Carga inicial: el estado se actualiza solo dentro de los callbacks de la promesa.
  useEffect(() => {
    let cancelled = false;
    api<Loaded>(`/api/anuncios/${adId}?account=${accountId}`)
      .then((data) => {
        if (!cancelled) applyLoaded(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "No se pudo cargar el anuncio.");
      });
    return () => {
      cancelled = true;
    };
  }, [accountId, adId, applyLoaded]);

  // Solo se envían los campos que el anuncio realmente tiene.
  const edits: Edits = useMemo(() => {
    if (!loaded) return {};
    const c = loaded.ad.current;
    const e: Edits = {};
    if (c.welcomeText !== null) {
      e.welcomeText = welcomeText;
      e.iceBreakers = iceBreakers;
    }
    if (c.primaryText !== null) e.primaryText = primaryText;
    if (c.headline !== null) e.headline = headline;
    return e;
  }, [loaded, welcomeText, iceBreakers, primaryText, headline]);

  async function onPreview() {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      setPreview(await api<Preview>(`/api/anuncios/${adId}/preview`, { account: accountId, edits }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo calcular los cambios.");
    } finally {
      setBusy(false);
    }
  }

  async function onApply() {
    if (!loaded?.ad.creativeId) return;
    setBusy(true);
    setError(null);
    try {
      await api(`/api/anuncios/${adId}/aplicar`, {
        account: accountId,
        edits,
        creativeId: loaded.ad.creativeId,
        confirm: true,
      });
      setNotice("Cambio aplicado y verificado en Meta. Podés deshacerlo desde el historial.");
      await load();
      onApplied();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo aplicar el cambio.");
    } finally {
      setBusy(false);
    }
  }

  async function onUndo(changeId: string) {
    if (!window.confirm("¿Deshacer este cambio y volver a la versión anterior del anuncio?")) return;
    setBusy(true);
    setError(null);
    try {
      await api(`/api/anuncios/${adId}/deshacer`, { account: accountId, changeId, confirm: true });
      setNotice("Se volvió a la versión anterior.");
      await load();
      onApplied();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo deshacer.");
    } finally {
      setBusy(false);
    }
  }

  const ad = loaded?.ad;
  const latestApplied = loaded?.history.find((h) => h.status === "applied");

  return (
    <Card className="gap-4">
      <CardHeader>
        <div className="min-w-0">
          <CardTitle>{ad?.name ?? "Cargando anuncio…"}</CardTitle>
          {ad && (
            <CardSub>
              {ad.campaignName} · {ad.adsetName}
            </CardSub>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {ad && <Badge label={statusLabel(ad.effectiveStatus)} color={statusColor(ad.effectiveStatus)} />}
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </CardHeader>

      {error && <div className="rounded-xl border border-coral/40 bg-coral/10 px-3 py-2 text-xs text-coral">{error}</div>}
      {notice && <div className="rounded-xl border border-green/40 bg-green/10 px-3 py-2 text-xs text-green">{notice}</div>}

      {ad && !ad.editable && (
        <div className="rounded-xl border border-amber/40 bg-amber/10 px-3 py-2 text-xs text-amber">{ad.notEditableReason}</div>
      )}

      {ad && ad.editable && (
        <>
          {ad.multiDestination && (
            <p className="text-[11px] text-muted">
              Anuncio de varios destinos (WhatsApp, Messenger e Instagram): el editor conserva esa configuración.
            </p>
          )}

          {ad.current.welcomeText !== null ? (
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase text-muted">{FIELD_LABELS.welcomeText}</span>
                <textarea
                  value={welcomeText}
                  onChange={(e) => setWelcomeText(e.target.value)}
                  rows={4}
                  className="rounded-xl border border-line bg-panel-2 px-3 py-2 text-sm text-text outline-none focus:border-cyan"
                />
              </label>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase text-muted">
                  {FIELD_LABELS.iceBreakers} (hasta {MAX_ICE_BREAKERS})
                </span>
                {iceBreakers.map((t, i) => (
                  <input
                    key={i}
                    value={t}
                    onChange={(e) => setIceBreakers((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
                    placeholder={`Respuesta rápida ${i + 1}`}
                    className="rounded-xl border border-line bg-panel-2 px-3 py-2 text-sm text-text outline-none focus:border-cyan"
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-muted">Este anuncio no tiene un mensaje de bienvenida personalizado.</p>
          )}

          {ad.current.primaryText !== null && (
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase text-muted">{FIELD_LABELS.primaryText}</span>
              <textarea
                value={primaryText}
                onChange={(e) => setPrimaryText(e.target.value)}
                rows={5}
                className="rounded-xl border border-line bg-panel-2 px-3 py-2 text-sm text-text outline-none focus:border-cyan"
              />
            </label>
          )}
          {ad.current.headline !== null && (
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase text-muted">{FIELD_LABELS.headline}</span>
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="rounded-xl border border-line bg-panel-2 px-3 py-2 text-sm text-text outline-none focus:border-cyan"
              />
            </label>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary" disabled={busy} onClick={onPreview}>
              Ver cambios
            </Button>
            <span className="text-[11px] text-muted">Primero se muestra el antes y el después; nada se modifica hasta que confirmes.</span>
          </div>

          {preview && (
            <div className="rounded-xl border border-line bg-panel-2 p-3 flex flex-col gap-3">
              {preview.error && <div className="text-xs text-coral">{preview.error}</div>}
              {!preview.error && !preview.hasChanges && <div className="text-xs text-muted">No hay diferencias con la versión actual.</div>}
              {Object.entries(preview.changes).map(([field, ch]) => {
                const change = ch as FieldChange;
                return (
                  <div key={field} className="grid gap-2 sm:grid-cols-2 text-xs">
                    <div className="sm:col-span-2 text-[11px] font-bold uppercase text-soft">{FIELD_LABELS[field] ?? field}</div>
                    <div className="rounded-lg border border-line px-2.5 py-2">
                      <div className="text-[10px] font-bold uppercase text-muted mb-1">Antes</div>
                      {renderValue(change.antes)}
                    </div>
                    <div className="rounded-lg border border-cyan/40 px-2.5 py-2">
                      <div className="text-[10px] font-bold uppercase text-cyan mb-1">Después</div>
                      {renderValue(change.despues)}
                    </div>
                  </div>
                );
              })}
              {preview.hasChanges && (
                <div className="flex flex-col gap-2 border-t border-line pt-3">
                  <p className="text-[11px] text-amber">
                    Al guardar se crea una versión nueva del anuncio y Meta puede volver a revisarlo (puede quedar “En revisión” un rato). La versión anterior se conserva para poder deshacer.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="primary" disabled={busy} onClick={onApply}>
                      Confirmar y aplicar en Meta
                    </Button>
                    <Button disabled={busy} onClick={() => setPreview(null)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {loaded && loaded.history.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-line pt-3">
          <span className="text-[11px] font-bold uppercase text-muted">Historial de cambios</span>
          {loaded.history.map((h) => (
            <div key={h.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-panel-2 px-3 py-2 text-xs">
              <div className="min-w-0">
                <div className="text-soft">
                  {new Date(h.created_at).toLocaleString("es-AR")} · {h.user_email ?? "—"}
                </div>
                <div className="text-muted">
                  {h.status === "applied" && "Aplicado: " + Object.keys(h.changes).map((k) => FIELD_LABELS[k] ?? k).join(", ")}
                  {h.status === "undone" && "Deshecho"}
                  {h.status === "failed" && "Falló: " + (h.error ?? "")}
                </div>
              </div>
              {h.status === "applied" && latestApplied?.id === h.id && (
                <Button disabled={busy} onClick={() => onUndo(h.id)}>
                  Deshacer
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
