// 海況地圖（TideMap）與潮汐詳情面板（TideDetail）：兩者皆訂閱 useSeaConditionStore 取得資料。
import { useEffect, useMemo, useState } from "react";
import type {
  RegionId,
  TideEvent,
  WaveLevel,
} from "../types/fishing";
import { waveLevelGuide } from "../data/waveLevels";
import { selectCurrentRegion, useSeaConditionStore } from "../store/useSeaConditionStore";

export interface TideMapRegion {
  id: RegionId | "islands";
  label: string;
  paths: string[];
  scoreX: number;
  scoreY: number;
}

interface TideMapProps {
  mapRegions: TideMapRegion[];
}

const visibleRegions: RegionId[] = ["north", "west", "east", "south"];
const visibleRegionSet = new Set<RegionId>(visibleRegions);
const waveTipPositions: Record<RegionId, string> = {
  north: "right-[6%] top-[5%]",
  east: "right-[14%] bottom-[30%]",
  west: "left-[13%] top-[22%]",
  south: "left-[10%] bottom-[12%]",
};
const waveLevelStyles: Record<WaveLevel, string> = {
  極小浪: "bg-sky-200 text-sky-900",
  小浪: "bg-emerald-200 text-emerald-900",
  中浪: "bg-amber-200 text-amber-900",
  大浪: "bg-orange-200 text-orange-900",
  巨浪: "bg-rose-200 text-rose-900",
};
const waveLevelTextStyles: Record<WaveLevel, string> = {
  極小浪: "text-sky-300",
  小浪: "text-emerald-300",
  中浪: "text-amber-300",
  大浪: "text-orange-300",
  巨浪: "text-rose-300",
};
function WaveLevelInfo() {
  return (
    <span className="group relative inline-flex">
      <span
        className="inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-cyan-100/60 text-[10px] font-bold text-cyan-100"
        aria-label="浪高分級說明"
      >
        i
      </span>
      <span className="pointer-events-none invisible absolute right-0 top-full z-[9999] mt-2 w-91 rounded-xl border border-cyan-100/20 bg-slate-950/95 p-3 text-left text-xs leading-5 text-slate-200 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-95">
        {Object.entries(waveLevelGuide).map(([level, description]) => (
          <span key={level} className="block">
            <strong className={waveLevelTextStyles[level as WaveLevel]}>
              {level}
            </strong>：
            {description}
          </span>
        ))}
      </span>
    </span>
  );
}
const tideThemes = {
  high: {
    line: "border-sky-300/90",
    tag: "bg-sky-300/80",
    timeline: "text-sky-300",
    value: "text-sky-300",
  },
  now: {
    line: "border-purple-200/90",
    tag: "bg-purple-200/80",
    timeline: "text-purple-200",
  },
  low: {
    line: "border-emerald-200/90",
    tag: "bg-emerald-200/80",
    timeline: "text-emerald-200",
    value: "text-emerald-200",
  },
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function buildWavePath(amplitude: number, period = 25, cycles = 4): string {
  const baseline = 14;
  let path = `M0 ${baseline}`;
  for (let index = 0; index < cycles; index += 1) {
    const x0 = index * period;
    const half = x0 + period / 2;
    const x1 = x0 + period;
    path += ` C ${x0 + period / 4} ${baseline - amplitude}, ${half - period / 4} ${baseline - amplitude}, ${half} ${baseline}`;
    path += ` C ${half + period / 4} ${baseline + amplitude}, ${x1 - period / 4} ${baseline + amplitude}, ${x1} ${baseline}`;
  }
  return path;
}

function getWaveAmplitude(waveHeightM?: number): number {
  const cappedHeight = clamp(waveHeightM ?? 0.3, 0, 3);
  if (cappedHeight < 0.6) {
    return 1.5;
  }
  if (cappedHeight <= 1) {
    return 2 + (cappedHeight - 0.5) * 3;
  }
  return 3 + ((cappedHeight - 1) / 2) * 4.5;
}

// Period must divide 100 evenly so the wave-flow loop (-50% shift) has no seam.
function getWavePeriod(): number {
  return 50;
}

function getWaveCycles(waveHeightM?: number): number {
  return (waveHeightM ?? 0.3) < 0.6 ? 2 : 4;
}

function getWaveAnimationDuration(waveHeightM?: number): string {
  if ((waveHeightM ?? 0.3) <= 0.5) return "5s";
  if ((waveHeightM ?? 0.3) <= 1) return "4s";
  return "2.4s";
}

function formatDateTime(value?: string): string {
  return value
    ? new Date(value).toLocaleString("zh-TW", {
        hour12: false,
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--";
}

function extractMinutes(value: string): number | null {
  const matched = value.match(/(\d{1,2}):(\d{2})/);
  return matched ? Number(matched[1]) * 60 + Number(matched[2]) : null;
}

function getClockMinutes(value: string): number | null {
  const matched = value.match(/T(\d{1,2}):(\d{2})/);
  return matched ? Number(matched[1]) * 60 + Number(matched[2]) : null;
}

function buildTidePath(events: TideEvent[]): string {
  if (events.length === 0) {
    return "M0 25 C25 8, 25 8, 50 25 C75 42, 75 42, 100 25";
  }

  const heights = events.map((event) => event.heightCm);
  const minimum = Math.min(...heights);
  const range = Math.max(Math.max(...heights) - minimum, 1);
  const points = events
    .map((event) => {
      const minutes = getClockMinutes(event.time) ?? 0;
      return {
        x: (minutes / 1440) * 100,
        y: 38 - ((event.heightCm - minimum) / range) * 30,
      };
    })
    .sort((first, second) => first.x - second.x);

  let path = `M0 ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const gap = Math.max(next.x - current.x, 4);
    path += ` C ${current.x + gap * 0.35} ${current.y}, ${next.x - gap * 0.35} ${next.y}, ${next.x} ${next.y}`;
  }

  const last = points[points.length - 1];
  path += ` C ${last.x + (100 - last.x) * 0.35} ${last.y}, ${last.x + (100 - last.x) * 0.7} 25, 100 25`;
  return path;
}

function getCurrentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function extractClock(value: string): string {
  return value.match(/\d{1,2}:\d{2}/)?.[0] ?? "--:--";
}

export function TideMap({ mapRegions }: TideMapProps) {
  const dashboard = useSeaConditionStore((state) => state.dashboard);
  const loading = useSeaConditionStore((state) => state.loading);
  const selectedRegion = useSeaConditionStore((state) => state.selectedRegion);
  const onSelectRegion = useSeaConditionStore((state) => state.setSelectedRegion);

  return (
    <article className="relative z-30 overflow-visible rounded-3xl border border-sky-200/20 bg-gradient-to-br from-cyan-500/14 via-sky-400/6 to-slate-900/14 p-6 backdrop-blur-md max-[420px]:border-0 max-[420px]:bg-none max-[420px]:backdrop-blur-none sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-xl text-amber-100">台灣海況地圖</h3>
        <WaveLevelInfo />
      </div>
      <p className="mt-1 text-xs text-cyan-100/80">
        目前展示台灣本島四大海域，點選可同步切換下方海況資料卡。
      </p>
      <div className="relative mt-4 overflow-hidden rounded-2xl border border-cyan-100/20 bg-slate-950/40 p-3 max-[420px]:border-0 max-[420px]:bg-transparent max-[420px]:p-0">
        <svg
          viewBox="450 240 460 730"
          role="img"
          aria-label="台灣海況互動地圖"
          className="relative left-[3%] mx-auto h-auto w-1/2"
        >
          <defs>
            <filter
              id="tide-region-outline"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feMorphology
                in="SourceAlpha"
                operator="dilate"
                radius="2.4"
                result="expanded"
              />
              <feComposite
                in="expanded"
                in2="SourceAlpha"
                operator="out"
                result="outline"
              />
              <feFlood
                floodColor="#ffffff"
                floodOpacity="0.95"
                result="outlineColor"
              />
              <feComposite
                in="outlineColor"
                in2="outline"
                operator="in"
                result="coloredOutline"
              />
              <feMerge>
                <feMergeNode in="coloredOutline" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {mapRegions
            .filter(
              (shape) =>
                shape.id !== "islands" && visibleRegionSet.has(shape.id),
            )
            .map((shape) => {
              const regionId = shape.id as RegionId;
              const active = selectedRegion === regionId;
              return (
                <g key={shape.id} filter="url(#tide-region-outline)">
                  {shape.paths.map((mapPath) => (
                    <path
                      key={mapPath.slice(0, 24)}
                      d={mapPath}
                      fill={active ? "#0dd9c4" : "#08a8b5"}
                      stroke="#ffffff"
                      strokeOpacity={active ? 1 : 0.78}
                      strokeWidth={active ? 1.9 : 1.2}
                      className="cursor-pointer transition"
                      onClick={() => onSelectRegion(regionId)}
                    />
                  ))}
                </g>
              );
            })}
        </svg>
        <div
          className="pointer-events-none absolute inset-0"
          aria-label="各海域平均浪高"
        >
          {dashboard?.regions
            .filter((region) => visibleRegionSet.has(region.id))
            .map((region) => {
              const path = buildWavePath(
                getWaveAmplitude(region.waveHeightM),
                getWavePeriod(),
                getWaveCycles(region.waveHeightM),
              );
              const active = selectedRegion === region.id;
              return (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => onSelectRegion(region.id)}
                  className={`pointer-events-auto absolute ${waveTipPositions[region.id]} cursor-pointer rounded-lg border px-2 pb-1 pt-2 text-center backdrop-blur-sm transition max-[420px]:!border-0 max-[420px]:!bg-transparent max-[420px]:backdrop-blur-none ${active ? "border-cyan-200 bg-cyan-200/15" : "border-white/10 bg-cyan-300/15"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12px] font-semibold text-cyan-100">
                      {region.name}
                    </p>
                    {region.waveLevel ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${waveLevelStyles[region.waveLevel]}`}
                      >
                        {region.waveLevel}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs font-bold text-white">
                    平均浪高{" "}
                    {region.waveHeightM !== undefined
                      ? `${region.waveHeightM.toFixed(1)} m`
                      : "—"}
                  </p>
                  <div className="mx-auto mt-1 h-6 w-16 overflow-hidden">
                    <svg
                      viewBox="0 0 200 28"
                      preserveAspectRatio="none"
                      className="wave-flow h-full w-[200%]"
                      style={{
                        animationDuration: getWaveAnimationDuration(
                          region.waveHeightM,
                        ),
                      }}
                    >
                      <path
                        d={path}
                        fill="none"
                        stroke="#5eead4"
                        strokeWidth={2.5}
                      />
                      <path
                        d={path}
                        fill="none"
                        stroke="#5eead4"
                        strokeWidth={2.5}
                        transform="translate(100 0)"
                      />
                    </svg>
                  </div>
                </button>
              );
            })}
        </div>
      </div>
      {loading ? (
        <p className="mt-5 text-sm text-cyan-100">正在整理各海域資料...</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {dashboard?.regions
            .filter((region) => visibleRegionSet.has(region.id))
            .map((region) => (
              <button
                key={region.id}
                type="button"
                onClick={() => onSelectRegion(region.id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${selectedRegion === region.id ? "border-cyan-200 bg-cyan-200/15" : "border-white/10 bg-white/5"}`}
              >
                <div className="flex items-center justify-between max-[420px]:flex-col max-[420px]:items-start max-[420px]:gap-1">
                  <strong className="text-cyan-50">{region.name}</strong>
                  {region.waveLevel ? (
                    <div className="flex items-center">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${waveLevelStyles[region.waveLevel]}`}
                      >
                        {region.waveLevel}
                      </span>
                    </div>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-slate-200">
                  {region.tideSummary}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  平均浪高：
                  {region.waveHeightM !== undefined
                    ? `${region.waveHeightM.toFixed(1)} m`
                    : "資料不足"}
                </p>
              </button>
            ))}
        </div>
      )}
    </article>
  );
}

export function TideDetail() {
  const currentRegion = useSeaConditionStore(selectCurrentRegion);
  const updatedAt = useSeaConditionStore((state) => state.dashboard?.updatedAt);
  const fetchError = useSeaConditionStore((state) => state.fetchError);
  const onRefresh = useSeaConditionStore((state) => state.loadDashboard);
  const [currentMinutes, setCurrentMinutes] = useState(getCurrentMinutes);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async (): Promise<void> => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentMinutes(getCurrentMinutes());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  const tideChart = useMemo(() => {
    if (!currentRegion) return null;
    const high = extractMinutes(currentRegion.nextHighTide);
    const low = extractMinutes(currentRegion.nextLowTide);
    const highPercent = high === null ? 30 : clamp((high / 1440) * 100, 6, 94);
    const lowPercent = low === null ? 68 : clamp((low / 1440) * 100, 6, 94);
    const tideEvents = currentRegion.tideEvents ?? [];
    return {
      high: highPercent,
      low: lowPercent,
      now: (currentMinutes / 1440) * 100,
      path: buildTidePath(tideEvents),
    };
  }, [currentMinutes, currentRegion]);
  return (
    <article className="relative z-0 rounded-3xl border border-sky-200/20 bg-gradient-to-br from-cyan-500/14 via-sky-400/6 to-slate-900/14 p-6 backdrop-blur-md sm:p-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-display text-xl text-amber-100">
          台灣海域即時參考
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            更新時間 {formatDateTime(updatedAt)}
          </span>
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={isRefreshing}
            aria-label="重新取得海況資料"
            title="重新取得海況資料"
            className="rounded-full p-1.5 text-cyan-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              aria-hidden="true"
            >
              <path d="M20 11a8 8 0 0 0-14.7-4L3 9" />
              <path d="M3 4v5h5" />
              <path d="M4 13a8 8 0 0 0 14.7 4L21 15" />
              <path d="M21 20v-5h-5" />
            </svg>
          </button>
        </div>
      </div>
      {currentRegion ? (
        <>
          <p className="text-slate-200">
            目前檢視：
            <strong className="text-cyan-100">{currentRegion.name}</strong>（
            {currentRegion.locationName}）
          </p>
          <p className="mt-2 text-slate-200">
            潮況摘要：{currentRegion.tideSummary}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-cyan-200/10 p-3">
              <p className="text-slate-400">平均浪高</p>
              <p className="mt-1 text-teal-100">
                {currentRegion.waveHeightM !== undefined
                  ? `${currentRegion.waveHeightM.toFixed(1)} m`
                  : "—"}
              </p>
            </div>
            <div className="rounded-2xl bg-cyan-200/10 p-3">
              <p className="text-slate-400">潮差</p>
              <p className="mt-1 text-emerald-100">
                {currentRegion.tideRangeCm !== null
                  ? `${currentRegion.tideRangeCm} cm`
                  : "資料不足"}
              </p>
            </div>
            <div className="rounded-2xl bg-cyan-200/10 p-3">
              <p className="text-slate-400">下一次滿潮</p>
              <p className={`mt-1 ${tideThemes.high.value}`}>
                {currentRegion.nextHighTide}
              </p>
            </div>
            <div className="rounded-2xl bg-cyan-200/10 p-3">
              <p className="text-slate-400">下一次低潮</p>
              <p className={`mt-1 ${tideThemes.low.value}`}>
                {currentRegion.nextLowTide}
              </p>
            </div>
          </div>
          {tideChart ? (
            <div className="mt-4 rounded-2xl border border-sky-200/20 bg-sky-400/10 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-cyan-100">
                  潮汐示意圖
                </p>
                <p className="text-xs text-cyan-100/80">潮高單位：公分 (cm)</p>
              </div>
              <div className="relative mx-1 mb-1 h-4 text-[10px] text-slate-400">
                <span className="absolute left-0 top-0">00:00</span>
                <span className="absolute right-0 top-0">24:00</span>
              </div>
              <div className="relative h-36 overflow-hidden rounded-xl border border-cyan-100/20 bg-gray-900/60">
                <svg
                  viewBox="0 0 100 40"
                  className="h-full w-full"
                  preserveAspectRatio="none"
                >
                  <path
                    d={tideChart.path}
                    fill="none"
                    stroke="rgba(180,205,220,0.75)"
                    strokeLinecap="round"
                    strokeWidth="1"
                  />
                  <path
                    d={`${tideChart.path} L100 40 L0 40 Z`}
                    fill="rgba(80,220,255,0.4)"
                  />
                </svg>
                <div
                  className={`pointer-events-none absolute inset-y-0 border-l border-dashed tide-now-pulse ${tideThemes.now.line}`}
                  style={{ left: `${tideChart.now}%` }}
                  aria-label="目前時間位置"
                >
                  <span
                    className={`absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center justify-center whitespace-nowrap rounded tide-now-label-pulse ${tideThemes.now.tag} px-1.5 py-1 text-[10px] font-semibold leading-none text-slate-900`}
                  >
                    現在
                  </span>
                </div>
                <div
                  className={`pointer-events-none absolute inset-y-0 border-l border-dashed ${tideThemes.high.line}`}
                  style={{ left: `${tideChart.high}%` }}
                  aria-label="滿潮時間位置"
                />
                <div
                  className={`pointer-events-none absolute inset-y-0 border-l border-dashed ${tideThemes.low.line}`}
                  style={{ left: `${tideChart.low}%` }}
                  aria-label="低潮時間位置"
                />
                <div
                  className={`absolute top-6 w-10 -translate-x-1/2 rounded-full ${tideThemes.high.tag} px-2 py-0.5 text-center text-[10px] font-semibold text-slate-900`}
                  style={{ left: `${tideChart.high}%` }}
                >
                  滿潮
                </div>
                <div
                  className={`absolute bottom-5 w-10 -translate-x-1/2 rounded-full ${tideThemes.low.tag} px-2 py-0.5 text-center text-[10px] font-semibold text-slate-900`}
                  style={{ left: `${tideChart.low}%` }}
                >
                  低潮
                </div>
              </div>
              <div className="relative mx-1 h-4 text-[10px] text-slate-400">
                <span
                  className={`absolute top-1 -translate-x-1/2 whitespace-nowrap ${tideThemes.high.timeline}`}
                  style={{ left: `${tideChart.high}%` }}
                >
                  滿潮 {extractClock(currentRegion.nextHighTide)}
                </span>
                <span
                  className={`absolute top-1 -translate-x-1/2 whitespace-nowrap ${tideThemes.low.timeline}`}
                  style={{ left: `${tideChart.low}%` }}
                >
                  低潮 {extractClock(currentRegion.nextLowTide)}
                </span>
              </div>
            </div>
          ) : null}
          <p className="mt-4 rounded-2xl border border-cyan-100/20 bg-cyan-100/10 p-3 text-sm text-cyan-50">
            {currentRegion.reason}
          </p>
          {fetchError ? (
            <p className="mt-3 text-sm text-rose-200">{fetchError}</p>
          ) : null}
        </>
      ) : (
        <p className="text-sm text-slate-300">尚未取得海況資料。</p>
      )}
    </article>
  );
}
