// 海釣遊戲主邏輯：管理下竿／咬鉤／起竿狀態，並依浪況決定上鉤機率；畫面拆給 FishingIntroOverlay、FishingScene、CatchSummaryPanel。
import { useEffect, useMemo, useState } from "react";
import type { FishEntry } from "../data/fishInfo";
import type { RegionId, WaveLevel } from "../types/fishing";
import { CatchSummaryPanel } from "./CatchSummaryPanel";
import { FishingIntroOverlay } from "./FishingIntroOverlay";
import { FishingScene } from "./FishingScene";
import { selectCurrentRegion, useSeaConditionStore } from "../store/useSeaConditionStore";

interface FishingGameProps {
  fishEntries: FishEntry[];
}

// 海浪越大，就算咬鉤時機抓準了，魚也更容易脫鉤
const catchRateByWaveLevel: Record<WaveLevel, number> = {
  極小浪: 1,
  小浪: 1,
  中浪: 0.5,
  大浪: 0.33,
  巨浪: 0.33,
};

const waveFishingOutlookByLevel: Record<WaveLevel, string> = {
  極小浪: "適合作釣，咬鉤的機率大！",
  小浪: "適合作釣，咬鉤的機率大！",
  中浪: "尚可作釣，但咬鉤的機率不高哦。",
  大浪: "極具挑戰，撲空的機率不小⋯",
  巨浪: "極具挑戰，撲空的機率不小⋯",
};

const regionLabels: Record<RegionId, string> = {
  north: "北部海域",
  west: "西部海域",
  east: "東部海域",
  south: "南部海域",
};
type CatchStatsByRegion = Record<RegionId, Record<string, number>>;

export function FishingGame({ fishEntries }: FishingGameProps) {
  const currentRegion = useSeaConditionStore(selectCurrentRegion);
  const selectedRegion = useSeaConditionStore((state) => state.selectedRegion);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [marker, setMarker] = useState(0);
  const [isFishBiting, setIsFishBiting] = useState(false);
  const [gameResult, setGameResult] =
    useState("下竿後，等待魚竿尾端晃動再起竿。");
  const [lastCatchFish, setLastCatchFish] = useState<string | null>(null);
  const [catchCount, setCatchCount] = useState(0);
  const [catchStats, setCatchStats] = useState<CatchStatsByRegion>({
    north: {},
    west: {},
    east: {},
    south: {},
  });
  const [hasStartedFishing, setHasStartedFishing] = useState(false);
  const [hasConfirmedFishingArea, setHasConfirmedFishingArea] = useState(false);

  const availableFish = useMemo(
    () =>
      fishEntries.filter(
        (entry) =>
          entry.region.includes(selectedRegion) || entry.region.includes("all"),
      ),
    [fishEntries, selectedRegion],
  );

  useEffect(() => {
    setLastCatchFish(null);
    setIsGameRunning(false);
    setIsFishBiting(false);
    setHasConfirmedFishingArea(false);
    setGameResult("下竿後，等待魚竿尾端晃動再起竿。");
  }, [selectedRegion]);

  useEffect(() => {
    if (!isGameRunning) {
      return;
    }

    let frame = 0;
    const startTime = performance.now();
    const travelDuration = 1500;

    const update = (timestamp: number): void => {
      const elapsed = timestamp - startTime;
      const cycleProgress = (elapsed % (travelDuration * 2)) / travelDuration;
      const linearProgress =
        cycleProgress <= 1 ? cycleProgress : 2 - cycleProgress;
      setMarker(Math.round(linearProgress * 100));
      frame = window.requestAnimationFrame(update);
    };

    frame = window.requestAnimationFrame(update);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [isGameRunning]);

  useEffect(() => {
    if (!isGameRunning) {
      setIsFishBiting(false);
      return;
    }

    let biteTimeout: number;
    let endTimeout: number;

    const scheduleBite = (): void => {
      const delay = 1200 + Math.random() * 2200; // 不抖動(等待咬鉤)平均約 2.3s
      biteTimeout = window.setTimeout(() => {
        setIsFishBiting(true);
        const biteDuration = 700 + Math.random() * 500; // 抖動(咬鉤中)平均約 0.95s
        endTimeout = window.setTimeout(() => {
          setIsFishBiting(false);
          scheduleBite();
        }, biteDuration);
      }, delay);
    };

    scheduleBite();

    return () => {
      window.clearTimeout(biteTimeout);
      window.clearTimeout(endTimeout);
    };
  }, [isGameRunning]);

  const caughtFish = fishEntries.find((entry) => entry.name === lastCatchFish);
  const activeCatchStats = (Object.entries(catchStats) as Array<[
    RegionId,
    Record<string, number>,
  ]>).filter(([, fishStats]) => Object.keys(fishStats).length > 0);

  const handleGameAction = (): void => {
    if (!hasConfirmedFishingArea) {
      return;
    }

    if (isGameRunning) {
      if (!currentRegion) {
        return;
      }

      const success = isFishBiting;
      setIsGameRunning(false);
      setIsFishBiting(false);

      if (!success) {
        setLastCatchFish(null);
        setGameResult("還沒咬鉤，出手太早了，再下一次！");
        return;
      }

      const catchRate = currentRegion.waveLevel
        ? catchRateByWaveLevel[currentRegion.waveLevel]
        : 1;

      if (Math.random() > catchRate) {
        setLastCatchFish(null);
        setGameResult("浪太大，魚在拉起前脫鉤了！");
        return;
      }

      const caughtEntry =
        availableFish[Math.floor(Math.random() * availableFish.length)];
      const fishName = caughtEntry.name;

      setCatchCount((previousCount) => previousCount + 1);
      setCatchStats((previousStats) => ({
        ...previousStats,
        [selectedRegion]: {
          ...previousStats[selectedRegion],
          [fishName]: (previousStats[selectedRegion][fishName] ?? 0) + 1,
        },
      }));
      setLastCatchFish(fishName);
      setGameResult(`成功！你釣到：${fishName}`);
      return;
    }

    setHasStartedFishing(true);
    setLastCatchFish(null);
    setIsFishBiting(false);
    setIsGameRunning(true);
    setGameResult("緊盯竿尾的晃動，等待魚咬鉤！");
  };

  return (
    <section className="mb-8">
      <article className="relative rounded-3xl border border-sky-200/20 bg-gradient-to-br from-cyan-500/14 via-sky-400/6 to-slate-900/14 p-6 backdrop-blur-md sm:p-8">
        <FishingIntroOverlay
          hasConfirmedFishingArea={hasConfirmedFishingArea}
          regionLabel={regionLabels[selectedRegion]}
          waveOutlook={
            currentRegion?.waveLevel
              ? waveFishingOutlookByLevel[currentRegion.waveLevel]
              : ""
          }
          onConfirm={() => setHasConfirmedFishingArea(true)}
        />
        <p className="mt-2 text-center text-md text-cyan-100/80">
          目前作釣海域：{regionLabels[selectedRegion]}
        </p>

        <div className="mt-5 rounded-2xl border border-cyan-100/20 bg-black/20 p-4">
          <div className="relative overflow-hidden rounded-2xl bg-slate-950/60">
            <FishingScene
              marker={marker}
              isGameRunning={isGameRunning}
              isFishBiting={isFishBiting}
              lastCatchFish={lastCatchFish}
            />
          </div>
          <p
            className={`mt-3 text-md text-center ${lastCatchFish ? "animate-pulse font-bold text-amber-200" : hasStartedFishing ? "text-slate-200" : "text-slate-500"}`}
          >
            {gameResult}
          </p>
        </div>

        <div className="mt-5 flex flex-col items-center gap-3">
          <button
            type="button"
            disabled={!hasConfirmedFishingArea}
            className={`rounded-full px-8 py-3 text-base font-semibold ${hasConfirmedFishingArea ? `bg-emerald-400 text-slate-800 shadow-[0_0_18px_rgba(94,234,212,0.45)] transition hover:bg-emerald-300 hover:shadow-[0_0_24px_rgba(94,234,212,0.65)] ${isGameRunning ? "" : "hook-pulse"}` : "cursor-not-allowed bg-slate-500/50 text-slate-400 opacity-50"}`}
            onClick={handleGameAction}
          >
            {isGameRunning ? "起竿" : "下竿"}
          </button>
          {hasStartedFishing ? (
            <p className="mt-2 text-sm text-slate-300">
              今日成功 <strong className="text-cyan-100">{catchCount}</strong>{" "}
              尾
            </p>
          ) : null}
        </div>
        <CatchSummaryPanel
          lastCatchFish={lastCatchFish}
          caughtFish={caughtFish}
          activeCatchStats={activeCatchStats}
          regionLabels={regionLabels}
        />
      </article>
    </section>
  );
}
