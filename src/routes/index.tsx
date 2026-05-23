import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueries } from "@tanstack/react-query";
import { api, type HomeSection } from "@/lib/api";
import { AppShell, PosterCard } from "@/components/AppShell";
import { ChevronRight, Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "NetShort — Short Dramas" },
      { name: "description", content: "Tonton drama pendek terbaik dari berbagai genre." },
    ],
  }),
});

function HomePage() {
  const sections = useQueries({
    queries: [1, 2, 3, 4, 5, 6].map((p) => ({
      queryKey: ["home", p],
      queryFn: () => api.home(p),
      retry: 1,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const loaded = sections.filter((s) => s.data).map((s) => s.data as HomeSection);
  const firstLoading = sections[0].isLoading;
  const hero = loaded[0]?.contentInfos[0];

  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex items-center justify-between bg-background/80 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-bold tracking-tight">
          <span className="bg-[var(--gradient-hero)] bg-clip-text text-transparent">NetShort</span>
        </h1>
        <Link to="/search" className="text-sm text-muted-foreground">
          Search
        </Link>
      </header>

      {firstLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {hero && (
        <Link
          to="/drama/$id"
          params={{ id: hero.shortPlayId }}
          className="mx-4 mb-6 block overflow-hidden rounded-2xl"
        >
          <div className="relative aspect-[4/5]">
            <img
              src={hero.shortPlayCover}
              alt={hero.shortPlayName}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[var(--gradient-fade)]" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              {hero.labelArray?.[0] && (
                <span className="mb-2 inline-block rounded-md bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  {hero.labelArray[0]}
                </span>
              )}
              <h2 className="text-xl font-bold leading-tight">{hero.shortPlayName}</h2>
              {hero.heatScoreShow && (
                <p className="mt-1 text-xs text-muted-foreground">🔥 {hero.heatScoreShow} views</p>
              )}
            </div>
          </div>
        </Link>
      )}

      {loaded.map((section, i) => (
        <section key={section.groupId ?? i} className="mb-6">
          <div className="flex items-center justify-between px-4 pb-3">
            <h2 className="text-base font-semibold">{section.contentName}</h2>
            <Link
              to="/browse"
              className="flex items-center text-xs text-muted-foreground"
            >
              More <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="scrollbar-hide flex gap-3 overflow-x-auto px-4 pb-1">
            {section.contentInfos.slice(0, 12).map((item) => (
              <Link
                to="/drama/$id"
                params={{ id: item.shortPlayId }}
                key={item.shortPlayId}
                className="w-28 shrink-0"
              >
                <PosterCard
                  cover={item.shortPlayCover}
                  title={item.shortPlayName}
                  label={item.scriptName}
                  heat={item.heatScoreShow}
                />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </AppShell>
  );
}
