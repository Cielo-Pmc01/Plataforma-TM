import type { ContentItem } from "./types";
import type { MarcaFilter } from "./types";

export function scoreColor(score: number): string {
  if (score >= 86) return "linear-gradient(90deg, var(--color-green), var(--color-lime))";
  if (score >= 74) return "linear-gradient(90deg, var(--color-amber), var(--color-green))";
  return "linear-gradient(90deg, var(--color-coral), var(--color-amber))";
}

export function filteredContent(items: ContentItem[], owner: string, marca: MarcaFilter = "all"): ContentItem[] {
  return items.filter((c) => {
    if (owner !== "all" && c.owner !== owner) return false;
    if (marca !== "all" && c.marca !== marca) return false;
    return true;
  });
}
