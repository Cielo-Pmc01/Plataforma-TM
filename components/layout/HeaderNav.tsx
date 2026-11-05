"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  hint: string;
}

const BASE: NavItem[] = [
  { href: "/meta-ads", label: "Resultados", hint: "Marcas, campañas y excursiones" },
  { href: "/contenido", label: "Contenido", hint: "Pipeline editorial" },
];

const CONTROL: NavItem[] = [
  { href: "/control", label: "Control", hint: "Alertas, salud y agente" },
  { href: "/control/conexiones", label: "Conexiones", hint: "Portafolios, IG y WhatsApp" },
  { href: "/control/api", label: "API y MCP", hint: "Conectar agentes y sistemas" },
];

export function HeaderNav({ showControl = false }: { showControl?: boolean }) {
  const pathname = usePathname();
  const items = showControl ? [...CONTROL, ...BASE] : BASE;

  return (
    <nav aria-label="Secciones" className="flex gap-1 lg:flex-col lg:gap-0.5">
      {items.map((s) => {
        // "/control" no se marca cuando estás en una subsección como "/control/conexiones"
        const active = s.href === "/control" ? pathname === "/control" : pathname.startsWith(s.href);
        return (
          <Link
            key={s.href}
            href={s.href}
            aria-current={active ? "page" : undefined}
            className={`group rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors lg:py-2.5 ${
              active ? "bg-panel-3 text-text" : "text-muted hover:bg-panel-2 hover:text-soft"
            }`}
          >
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className={`h-4 w-[3px] rounded-full ${active ? "bg-cyan" : "bg-transparent"}`}
              />
              {s.label}
            </span>
            <span className="hidden lg:block pl-[11px] text-[11px] font-normal text-muted">{s.hint}</span>
          </Link>
        );
      })}
    </nav>
  );
}
