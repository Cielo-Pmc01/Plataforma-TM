"use client";

import { useState } from "react";
import { OverviewView } from "./OverviewView";
import { PipelineView } from "./PipelineView";
import { GeneratorView } from "./GeneratorView";
import { CalendarView } from "./CalendarView";
import { SourcesView } from "./SourcesView";
import { SettingsView } from "./SettingsView";

type Tab = "overview" | "pipeline" | "generator" | "calendar" | "sources" | "settings";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Resumen" },
  { key: "pipeline", label: "Pipeline" },
  { key: "generator", label: "Generador" },
  { key: "calendar", label: "Calendario" },
  { key: "sources", label: "Fuentes" },
  { key: "settings", label: "IG Ready" },
];

export function ContenidoTabs() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <header className="flex flex-col gap-2">
        <p className="flex items-center gap-2 text-[13px] text-muted">
          Contenido
          <span className="rounded-full bg-amber/15 px-2 py-0.5 text-[11px] font-semibold text-amber" title="Métricas de ejemplo: todavía sin conexión a la API de Instagram (ver IG Ready)">
            Datos de ejemplo
          </span>
        </p>
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] sm:text-[34px]">Centro de contenido</h1>
      </header>
      <nav aria-label="Vistas de Contenido" className="-mt-2 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            aria-current={tab === t.key ? "page" : undefined}
            className={`-mb-px shrink-0 cursor-pointer border-b-2 px-3 py-2.5 text-[14px] font-semibold transition-colors ${
              tab === t.key ? "border-cyan text-text" : "border-transparent text-muted hover:text-soft"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "overview" && <OverviewView />}
      {tab === "pipeline" && <PipelineView />}
      {tab === "generator" && <GeneratorView />}
      {tab === "calendar" && <CalendarView />}
      {tab === "sources" && <SourcesView />}
      {tab === "settings" && <SettingsView />}
    </div>
  );
}
