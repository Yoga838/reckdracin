import { createFileRoute, Link } from "@tanstack/react-router";
import { getHistory, removeHistoryItem, clearHistory } from "@/lib/history";
import { AppShell, PosterCard } from "@/components/AppShell";
import { Clock, Trash2 } from "lucide-react";
import { useState, useCallback } from "react";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
  head: () => ({ meta: [{ title: "History — Reckdracin" }] }),
});

function HistoryPage() {
  const [history, setHistory] = useState(() => getHistory());

  const refresh = useCallback(() => setHistory(getHistory()), []);

  const handleRemove = (id: string, ep?: number) => {
    removeHistoryItem(id, ep);
    refresh();
  };

  const handleClear = () => {
    if (confirm("Clear all history?")) {
      clearHistory();
      refresh();
    }
  };

  // Group by drama, keeping the most recent episode per drama at top
  const dramaMap = new Map<string, typeof history>();
  for (const h of history) {
    if (!dramaMap.has(h.shortPlayId)) dramaMap.set(h.shortPlayId, []);
    dramaMap.get(h.shortPlayId)!.push(h);
  }
  const dramas = Array.from(dramaMap.entries()).map(([id, items]) => ({
    id,
    name: items[0].shortPlayName,
    cover: items[0].shortPlayCover,
    episodes: items,
  }));

  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex items-center justify-between bg-background/80 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-bold">History</h1>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </header>

      {history.length === 0 && (
        <div className="flex flex-col items-center gap-3 px-4 py-20 text-muted-foreground">
          <Clock className="h-10 w-10 opacity-40" />
          <p className="text-sm">No watch history yet.</p>
          <Link
            to="/browse"
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
          >
            Browse Dramas
          </Link>
        </div>
      )}

      <div className="space-y-6 px-4 pb-4">
        {dramas.map((d) => (
          <section key={d.id}>
            <Link
              to="/drama/$id"
              params={{ id: d.id }}
              className="mb-2 flex items-center gap-3"
            >
              <img
                src={d.cover}
                alt={d.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
              <h2 className="text-sm font-semibold">{d.name}</h2>
            </Link>
            <div className="grid grid-cols-3 gap-3">
              {d.episodes.map((ep) => (
                <div key={`${ep.shortPlayId}-${ep.episodeNo ?? "drama"}`} className="relative">
                  <Link
                    to={ep.episodeNo ? "/watch/$id/$ep" : "/drama/$id"}
                    params={
                      ep.episodeNo
                        ? { id: ep.shortPlayId, ep: String(ep.episodeNo) }
                        : { id: ep.shortPlayId }
                    }
                  >
                    <PosterCard
                      cover={ep.shortPlayCover}
                      title={ep.episodeNo ? `EP ${ep.episodeNo}` : d.name}
                    />
                  </Link>
                  <button
                    onClick={() => handleRemove(ep.shortPlayId, ep.episodeNo)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
