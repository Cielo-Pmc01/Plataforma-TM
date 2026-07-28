import { Card, CardHeader, CardTitle, CardSub } from "@/components/ui/Card";

export function SettingsView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <div>
            <CardSub>Instagram connector</CardSub>
            <CardTitle className="!text-base mt-1">Preparado, no conectado</CardTitle>
          </div>
        </CardHeader>
        <div className="rounded-xl border border-line bg-panel-2 px-3 py-2.5 mb-4">
          <strong className="text-xs text-amber">OFFLINE MOCK</strong>
          <p className="text-xs text-muted mt-1">
            Esta versión no consulta Meta, no pide token y no usa IP/cuenta para APIs externas. El módulo solo
            muestra la estructura futura de conexión.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-xs font-bold text-soft">
            IG Business Account ID
            <input
              disabled
              defaultValue="mock_ig_business_account_id"
              className="rounded-lg border border-line bg-panel-3 px-3 py-2 text-xs font-normal text-muted"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-bold text-soft">
            Meta App ID
            <input
              disabled
              defaultValue="mock_meta_app_id"
              className="rounded-lg border border-line bg-panel-3 px-3 py-2 text-xs font-normal text-muted"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-bold text-soft">
            Publish queue
            <input
              disabled
              defaultValue="disabled_until_credentials_are_added"
              className="rounded-lg border border-line bg-panel-3 px-3 py-2 text-xs font-normal text-muted"
            />
          </label>
          <button disabled className="rounded-full bg-panel-2 border border-line px-4 py-2 text-xs font-bold text-muted self-start opacity-50">
            Conectar IG más adelante
          </button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardSub>Checklist técnico</CardSub>
            <CardTitle className="!text-base mt-1">Para conexión futura</CardTitle>
          </div>
        </CardHeader>
        <div className="flex flex-col gap-2.5">
          {[
            { done: true, label: "Adapter InstagramPublisher aislado" },
            { done: true, label: "Cola de publicación modelada" },
            { done: true, label: "Estados de error preparados" },
            { done: false, label: "Token real cargado" },
            { done: false, label: "Permisos Meta aprobados" },
            { done: false, label: "Webhooks activos" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs text-soft">
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
                  item.done ? "bg-green/20 text-green" : "border border-line"
                }`}
              >
                {item.done ? "✓" : ""}
              </span>
              {item.label}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
