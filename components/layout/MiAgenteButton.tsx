"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Acceso directo al chat con el agente, fijo arriba del usuario
export function MiAgenteButton({ compacto = false }: { compacto?: boolean }) {
  const activo = usePathname().startsWith("/control/agente");
  return (
    <Link
      href="/control/agente"
      aria-current={activo ? "page" : undefined}
      className={`flex items-center gap-2.5 rounded-xl border transition-colors ${
        compacto ? "px-3 py-1.5" : "px-3 py-2.5"
      } ${activo ? "border-cyan/60 bg-cyan/15 text-text" : "border-line bg-panel text-soft hover:border-cyan/50 hover:text-text"}`}
    >
      <span aria-hidden className="relative grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-cyan/20 text-cyan">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-green ring-2 ring-bg" />
      </span>
      <span className="leading-tight">
        <span className="block text-[13px] font-semibold">Mi Agente</span>
        {!compacto && <span className="block text-[11px] text-muted">Chateá con tu agente</span>}
      </span>
    </Link>
  );
}
