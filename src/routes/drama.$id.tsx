import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { addHistory } from "@/lib/history";
import { AppShell } from "@/components/AppShell";
import { ArrowLeft, Loader2, Lock, Play } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/drama/$id")({
  component: DramaPage,
});

function DramaPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const q = useQuery({
    queryKey: ["drama", id],
    queryFn: () => api.drama(id),
  });

  useEffect(() => {
    if (q.data) {
      addHistory({
        shortPlayId: id,
        shortPlayName: q.data.shortPlayName ?? "",
        shortPlayCover: q.data.shortPlayCover ?? "",
      });
    }
  }, [q.data, id]);

  return (
    <AppShell>
      {q.isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      {q.data && (
        <>
          <div className="relative aspect-[3/4]">
            <img src={q.data.shortPlayCover} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <button
              onClick={() => router.history.back()}
              className="absolute left-3 top-3 rounded-full bg-black/50 p-2 backdrop-blur"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-xs text-muted-foreground">
                {q.data.shortPlayEpisodeList.length} episodes
              </p>
            </div>
          </div>

          <div className="px-4">
            <Link
              to="/watch/$id/$ep"
              params={{ id, ep: "1" }}
              className="mb-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
            >
              <Play className="h-4 w-4 fill-current" />
              Play Episode 1
            </Link>

            <h2 className="mb-3 text-sm font-semibold">Episodes</h2>
            <div className="grid grid-cols-4 gap-2 pb-4">
              {q.data.shortPlayEpisodeList.map((ep) => (
                <Link
                  to="/watch/$id/$ep"
                  params={{ id, ep: String(ep.episodeNo) }}
                  key={ep.episodeId}
                  className="relative flex aspect-square items-center justify-center rounded-lg bg-card text-sm font-medium transition hover:bg-accent"
                >
                  {ep.episodeNo}
                  {ep.isLock && (
                    <Lock className="absolute right-1 top-1 h-3 w-3 text-primary" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
