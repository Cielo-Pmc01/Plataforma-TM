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
  { key: "overview", label: "Control" },
  { key: "pipeline", label: "Pipeline" },
  { key: "generator", label: "Generador" },
  { key: "calendar", label: "Calendario" },
  { key: "sources", label: "Fuentes" },
  { key: "settings", label: "IG Ready" },
];

export function ContenidoTabs() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="max-w-7xl mx-auto p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wide text-muted">Contenido (CM)</p>
          <h1 className="text-2xl font-extrabold mt-1">Content Command Center</h1>
        </div>
        <div className="flex gap-1 p-1 rounded-full bg-panel-2 border border-line flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition ${
                tab === t.key ? "bg-panel-3 text-violet" : "text-muted hover:text-soft"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && <OverviewView />}
      {tab === "pipeline" && <PipelineView />}
      {tab === "generator" && <GeneratorView />}
      {tab === "calendar" && <CalendarView />}
      {tab === "sources" && <SourcesView />}
      {tab === "settings" && <SettingsView />}
    </div>
  );
}
