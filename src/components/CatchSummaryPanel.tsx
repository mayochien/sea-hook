// 釣獲結果卡片與各海域累計釣獲統計：起竿成功後顯示魚種圖片與說明，並彙整今日各海域的釣獲次數。
import type { FishEntry } from "../data/fishInfo";
import type { RegionId } from "../types/fishing";

interface CatchSummaryPanelProps {
  lastCatchFish: string | null;
  caughtFish: FishEntry | undefined;
  activeCatchStats: Array<[RegionId, Record<string, number>]>;
  regionLabels: Record<RegionId, string>;
}

export function CatchSummaryPanel({
  lastCatchFish,
  caughtFish,
  activeCatchStats,
  regionLabels,
}: CatchSummaryPanelProps) {
  return (
    <>
      {lastCatchFish ? (
        <div className="mx-auto mt-4 w-[80%] rounded-2xl text-sm">
          {caughtFish ? (
            <div className="mx-auto flex items-center w-full max-w-140 gap-5">
              <img
                src={caughtFish.imageUrl}
                alt={caughtFish.name}
                className="aspect-4/3 w-27 shrink-0 rounded-xl object-contain"
              />
              <p className="min-w-0 flex-1 text-slate-200">
                {caughtFish.note || "這是臺灣海鮮指南收錄的魚種。"}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
      {activeCatchStats.length > 0 ? (
        <div className="mx-auto mt-4 grid w-full max-w-200 grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          {activeCatchStats.map(([region, fishStats]) => (
            <div
              key={region}
              className={`rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-300 ${activeCatchStats.length === 1 ? "sm:col-span-2 sm:mx-auto sm:w-1/2" : ""}`}
            >
              <p className="font-semibold text-cyan-100">
                {regionLabels[region]}
              </p>
              <p className="mt-1 text-slate-400">
                {Object.entries(fishStats)
                  .map(([fishName, count]) => `${fishName} ×${count}`)
                  .join("、")}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}
