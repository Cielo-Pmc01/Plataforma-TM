import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardSub } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const SWATCHES = [
  { name: "cyan", var: "var(--color-cyan)" },
  { name: "lime", var: "var(--color-lime)" },
  { name: "green", var: "var(--color-green)" },
  { name: "coral", var: "var(--color-coral)" },
  { name: "amber", var: "var(--color-amber)" },
  { name: "violet", var: "var(--color-violet)" },
  { name: "pink", var: "var(--color-pink)" },
];

export default function DesignSystemPage() {
  return (
    <main className="max-w-5xl mx-auto p-8 flex flex-col gap-8">
      <div>
        <p className="text-[12px] font-bold uppercase tracking-wide text-muted">
          Plataforma TM — Sistema de diseño
        </p>
        <h1 className="text-3xl font-extrabold mt-1">Meta Ads + Contenido CM, una sola plataforma</h1>
        <p className="text-soft text-sm mt-2 max-w-xl">
          Colores y degradés de crm-cm, tipografía y orden visual de crm-meta-ads.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Paleta de acentos</CardTitle>
            <CardSub>Heredada de crm-cm</CardSub>
          </div>
        </CardHeader>
        <div className="flex gap-3 flex-wrap">
          {SWATCHES.map((s) => (
            <div key={s.name} className="flex flex-col items-center gap-2">
              <div
                className="w-14 h-14 rounded-2xl border border-line-2"
                style={{ background: s.var }}
              />
              <span className="text-[11px] text-muted">{s.name}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Tipografía</CardTitle>
            <CardSub>Manrope (texto) + JetBrains Mono (números) — de crm-meta-ads</CardSub>
          </div>
        </CardHeader>
        <div className="flex flex-col gap-2">
          <span className="text-2xl font-extrabold">Título / Manrope 800</span>
          <span className="text-base font-semibold text-soft">Subtítulo / Manrope 600</span>
          <span className="text-sm text-muted">Texto secundario / Manrope 400</span>
          <span className="font-mono text-xl font-semibold text-cyan">$ 128.450 / JetBrains Mono</span>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Botones</CardTitle>
            <CardSub>Pill-shape, orden visual de crm-meta-ads</CardSub>
          </div>
        </CardHeader>
        <div className="flex gap-3 flex-wrap items-center">
          <Button variant="primary">Acción principal</Button>
          <Button variant="secondary">Acción secundaria</Button>
          <Button variant="secondary" disabled>
            Deshabilitado
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Badges</CardTitle>
          </div>
        </CardHeader>
        <div className="flex gap-2 flex-wrap">
          <Badge label="Activo" color="var(--color-green)" />
          <Badge label="Pendiente" color="var(--color-amber)" />
          <Badge label="Bloqueado" color="var(--color-coral)" />
          <Badge label="CM" color="var(--color-violet)" />
        </div>
      </Card>
    </main>
  );
}
