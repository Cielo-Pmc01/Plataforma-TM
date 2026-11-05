import { TONO_COLOR, textoFase, tonoFase } from "@/lib/control/format";

export function FaseChip({ fase }: { fase: string | null }) {
  const color = TONO_COLOR[tonoFase(fase)];
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {textoFase(fase)}
    </span>
  );
}
