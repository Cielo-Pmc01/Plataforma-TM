interface BadgeProps {
  label: string;
  color?: string;
}

export function Badge({ label, color = "var(--color-cyan)" }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
      style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
