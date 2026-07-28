"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { href: "/meta-ads", label: "Meta Ads", activeClass: "bg-panel-3 text-cyan" },
  { href: "/contenido", label: "Contenido CM", activeClass: "bg-panel-3 text-violet" },
];

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 p-1 rounded-full bg-panel-2 border border-line">
      {SECTIONS.map((s) => {
        const active = pathname.startsWith(s.href);
        return (
          <Link
            key={s.href}
            href={s.href}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
              active ? s.activeClass : "text-muted hover:text-soft"
            }`}
          >
            {s.label}
          </Link>
        );
      })}
    </div>
  );
}
