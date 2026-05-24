import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { AppShell, PosterCard } from "@/components/AppShell";
import { Loader2, Search as SearchIcon } from "lucide-react";

export const Route = createFileRoute("/search")({
  component: SearchPage,
  head: () => ({ meta: [{ title: "Search — Reckdracin" }] }),
});

function SearchPage() {
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");

  const query = useQuery({
    queryKey: ["search", q],
    queryFn: () => api.search(q, 1),
    enabled: q.length > 0,
  });

  return (
    <AppShell>
      <header className="sticky top-0 z-30 bg-background/80 px-4 py-3 backdrop-blur">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQ(input.trim());
          }}
          className="flex items-center gap-2 rounded-full bg-input px-4 py-2.5"
        >
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search dramas..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </form>
      </header>

      {query.isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {!q && (
        <p className="px-4 py-12 text-center text-sm text-muted-foreground">
          Type something to discover dramas.
        </p>
      )}

      {query.data && (
        <div className="grid grid-cols-3 gap-3 px-4">
          {(query.data.searchCodeSearchResult ?? []).map((it) => (
            <Link
              to="/drama/$id"
              params={{ id: it.shortPlayId }}
              key={it.shortPlayId}
            >
              <PosterCard cover={it.shortPlayCover} title={it.shortPlayName} />
            </Link>
          ))}
        </div>
      )}
      {query.data && (query.data.searchCodeSearchResult ?? []).length === 0 && (
        <p className="px-4 py-12 text-center text-sm text-muted-foreground">No results.</p>
      )}
    </AppShell>
  );
}
