import { sources } from "@/lib/cm/mock";
import { Card } from "@/components/ui/Card";

export function SourcesView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {sources.map((s) => (
        <Card key={s.name} className="flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase text-muted">{s.type}</p>
          <h3 className="text-sm font-bold text-text">{s.name}</h3>
          <p className="text-xs text-soft">{s.summary}</p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {s.tags.map((tag) => (
              <span key={tag} className="text-[10px] rounded-full px-2 py-0.5 bg-panel-3 text-muted">
                {tag}
              </span>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
