import { createFileRoute, Link } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell, PosterCard } from "@/components/AppShell";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/browse")({
  component: BrowsePage,
  head: () => ({ meta: [{ title: "Browse — NetShort" }] }),
});

function BrowsePage() {
  const q = useInfiniteQuery({
    queryKey: ["list"],
    queryFn: ({ pageParam = 1 }) => api.list(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last, all) => (last.completed ? undefined : all.length + 1),
    staleTime: 5 * 60 * 1000,
  });

  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sentinel.current) return;
    const obs = new IntersectionObserver((es) => {
      if (es[0].isIntersecting && q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage();
    });
    obs.observe(sentinel.current);
    return () => obs.disconnect();
  }, [q]);

  const items = q.data?.pages.flatMap((p) => p.dataList) ?? [];

  return (
    <AppShell>
      <header className="sticky top-0 z-30 bg-background/80 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-bold">Browse</h1>
        <p className="text-xs text-muted-foreground">
          {q.data?.pages[0]?.count.toLocaleString()} dramas
        </p>
      </header>

      {q.isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 px-4">
          {items.map((it) => (
            <Link
              to="/drama/$id"
              params={{ id: it.shortPlayId }}
              key={it.shortPlayId}
            >
              <PosterCard
                cover={it.shortPlayCover}
                title={it.shortPlayName}
                label={it.scriptName}
                heat={it.heatScoreShow}
              />
            </Link>
          ))}
        </div>
      )}
      <div ref={sentinel} className="flex justify-center py-6">
        {q.isFetchingNextPage && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
      </div>
    </AppShell>
  );
}
