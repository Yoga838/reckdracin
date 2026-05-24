import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { addHistory } from "@/lib/history";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/watch/$id/$ep")({
  component: WatchPage,
});

function WatchPage() {
  const { id, ep } = Route.useParams();
  const epNo = parseInt(ep, 10);
  const router = useRouter();

  const drama = useQuery({
    queryKey: ["drama", id],
    queryFn: () => api.drama(id),
  });

  const episode = drama.data?.shortPlayEpisodeList.find((e) => e.episodeNo === epNo);

  // Record history when we have drama data
  useEffect(() => {
    if (drama.data) {
      addHistory({
        shortPlayId: id,
        shortPlayName: drama.data.shortPlayName ?? "",
        shortPlayCover: drama.data.shortPlayCover ?? "",
        episodeNo: epNo,
      });
    }
  }, [drama.data, id, epNo]);

  const videoUrl = episode?.playVoucher;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-black">
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4">
        <button
          onClick={() => router.history.back()}
          className="rounded-full bg-black/50 p-2 backdrop-blur"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <span className="rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur">
          EP {epNo}
        </span>
      </header>

      <div className="relative flex aspect-[9/16] w-full items-center justify-center bg-black">
        {drama.isLoading || (needsFetch && watchQ.isLoading) ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : videoUrl ? (
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            autoPlay
            playsInline
            poster={episode?.episodeCover}
            className="h-full w-full object-contain"
          />
        ) : locked ? (
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <Lock className="h-10 w-10 text-primary" />
            <p className="text-sm text-white">This episode is locked.</p>
            {!token ? (
              <Link
                to="/settings"
                className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                Add your token
              </Link>
            ) : (
              <p className="text-xs text-white/60">
                {watchQ.error instanceof Error ? watchQ.error.message : "Token invalid or no coins."}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-white/60">No video available.</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="mb-3 text-sm font-semibold text-white">Episodes</h3>
        <div className="grid grid-cols-5 gap-2">
          {drama.data?.shortPlayEpisodeList.map((e) => {
            const active = e.episodeNo === epNo;
            return (
              <Link
                to="/watch/$id/$ep"
                params={{ id, ep: String(e.episodeNo) }}
                key={e.episodeId}
                className={`relative flex aspect-square items-center justify-center rounded-lg text-sm font-medium ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/10 text-white"
                }`}
              >
                {e.episodeNo}
                {e.isLock && <Lock className="absolute right-0.5 top-0.5 h-2.5 w-2.5" />}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
