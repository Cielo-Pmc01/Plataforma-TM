"use client";

import { useState } from "react";
import { MARCA_MAP } from "@/lib/cm/brands";
import { scoreColor } from "@/lib/cm/helpers";
import { approveItem, editItem, rejectWithReason } from "@/lib/cm/actions";
import type { ContentItem } from "@/lib/cm/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface Props {
  item: ContentItem;
  onChanged?: () => void;
}

export function PostCard({ item, onChanged }: Props) {
  const marca = MARCA_MAP[item.marca];
  const [mode, setMode] = useState<"view" | "edit" | "reject">("view");
  const [editHook, setEditHook] = useState(item.hook);
  const [editSummary, setEditSummary] = useState(item.summary);
  const [motivo, setMotivo] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleApprove() {
    if (!item.id) return;
    setBusy(true);
    await approveItem(item.id);
    setBusy(false);
    onChanged?.();
  }

  async function handleSaveEdit() {
    if (!item.id) return;
    setBusy(true);
    await editItem(item.id, { hook: editHook, summary: editSummary });
    setBusy(false);
    setMode("view");
    onChanged?.();
  }

  async function handleReject() {
    if (!item.id || !motivo.trim()) return;
    setBusy(true);
    await rejectWithReason(item.id, motivo);
    setBusy(false);
    setMode("view");
    setMotivo("");
    onChanged?.();
  }

  return (
    <article className="rounded-card border border-line bg-panel-2 p-3 flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge label={item.format} color="var(--color-violet)" />
        <Badge label={item.status} color="var(--color-cyan)" />
        {marca && <Badge label={item.marca} color={marca.color} />}
      </div>

      {mode === "edit" ? (
        <div className="flex flex-col gap-2">
          <input
            className="rounded-lg border border-line bg-panel-3 px-2.5 py-1.5 text-xs text-text"
            value={editHook}
            onChange={(e) => setEditHook(e.target.value)}
          />
          <textarea
            className="rounded-lg border border-line bg-panel-3 px-2.5 py-1.5 text-xs text-text"
            value={editSummary}
            onChange={(e) => setEditSummary(e.target.value)}
            rows={3}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-bold text-text">{item.hook}</h3>
          <p className="text-xs text-soft">{item.summary}</p>
        </div>
      )}

      {item.motivoRechazo && mode === "view" && (
        <p className="text-[11px] text-coral">Rechazado: {item.motivoRechazo}</p>
      )}

      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted">
        <span>{item.owner}</span>
        <span>
          {item.day} {item.time}
        </span>
        <span>{item.objective}</span>
        {item.cta && <span>{item.cta}</span>}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full bg-panel-3 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${item.score}%`, background: scoreColor(item.score) }} />
        </div>
        <span className="text-[10px] font-mono font-bold text-muted">{item.score}</span>
      </div>

      {mode === "reject" ? (
        <div className="flex flex-col gap-2">
          <input
            className="rounded-lg border border-line bg-panel-3 px-2.5 py-1.5 text-xs text-text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo (ej: cambiar el ángulo, muy largo)"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" className="!px-3 !py-1 !text-[11px]" disabled={busy} onClick={() => setMode("view")}>
              Cancelar
            </Button>
            <Button variant="primary" className="!px-3 !py-1 !text-[11px]" disabled={busy || !motivo.trim()} onClick={handleReject}>
              Confirmar rechazo
            </Button>
          </div>
        </div>
      ) : mode === "edit" ? (
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" className="!px-3 !py-1 !text-[11px]" disabled={busy} onClick={() => setMode("view")}>
            Cancelar
          </Button>
          <Button variant="primary" className="!px-3 !py-1 !text-[11px]" disabled={busy} onClick={handleSaveEdit}>
            Guardar
          </Button>
        </div>
      ) : (
        <div className="flex gap-2 justify-end flex-wrap">
          <Button variant="primary" className="!px-3 !py-1 !text-[11px]" disabled={busy || item.status === "Aprobado"} onClick={handleApprove}>
            Aprobar
          </Button>
          <Button variant="secondary" className="!px-3 !py-1 !text-[11px]" disabled={busy} onClick={() => setMode("edit")}>
            Editar a mano
          </Button>
          <Button variant="secondary" className="!px-3 !py-1 !text-[11px]" disabled={busy} onClick={() => setMode("reject")}>
            Rechazar
          </Button>
        </div>
      )}
    </article>
  );
}
