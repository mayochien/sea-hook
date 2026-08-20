// 呼叫中央氣象署開放資料平台的浪高／潮汐 API，並整理成畫面可直接使用的 FishingDashboard；
// 若請求失敗或資料不足，會以 mockRegions 假資料補齊，確保畫面永遠有內容可顯示。
import type {
  FishingDashboard,
  RegionId,
  RegionSeaCondition,
  TideEvent,
  WaveLevel,
} from "../types/fishing";

const BASE_URL = "https://opendata.cwa.gov.tw/api/v1/rest/datastore";

type WaveRegionId = RegionId;

interface CwaWaveObservation {
  DateTime?: string;
  WeatherElements?: {
    WaveHeight?: unknown;
  };
}

interface CwaWaveLocation {
  Station?: {
    StationID?: string;
  };
  StationObsTimes?: {
    StationObsTime?: CwaWaveObservation[];
  };
}

// O-B0075-001 uses the uppercase `Records` key in the CWA API response.
interface CwaWaveResponse {
  Records?: {
    SeaSurfaceObs?: {
      Location?: CwaWaveLocation[];
    };
  };
}

interface LatestStationWave {
  stationId: string;
  waveHeightM: number;
  observedAt: string;
}

interface CwaTideEvent {
  DateTime?: string;
  Tide?: string;
  TideHeights?: {
    AboveChartDatum?: unknown;
  };
}

interface CwaTideDaily {
  Date?: string;
  TideRange?: string;
  Time?: CwaTideEvent[];
}

interface CwaTideLocation {
  LocationId?: string;
  LocationName?: string;
  TimePeriods?: {
    Daily?: CwaTideDaily[];
  };
}

// F-A0021-001 uses the lowercase `records` key in the CWA API response.
interface CwaTideResponse {
  records?: {
    TideForecasts?: Array<{
      Location?: CwaTideLocation;
    }>;
  };
}

const stationRegionMap: Record<string, WaveRegionId> = {
  C6A01: "north",
  C6A02: "north",
  C6A03: "north",
  C6A05: "north",
  C6A06: "north",
  C6B01: "north",
  C6D01: "north",
  C6F01: "west",
  C6G01: "west",
  C6N01: "south",
  "46694A": "north",
  "46699A": "east",
  "46706A": "east",
  "46708A": "north",
  "46714D": "south",
  "46759A": "south",
  "46761F": "east",
  "46778A": "south",
};

const regionMeta: Array<{ id: RegionId; name: string; locationName: string; tideLocationId: string }> = [
  { id: "north", name: "北部海域", locationName: "新北市瑞芳區", tideLocationId: "65000120" },
  { id: "west", name: "西部海域", locationName: "雲林縣臺西鄉", tideLocationId: "10009160" },
  { id: "east", name: "東部海域", locationName: "花蓮縣花蓮市", tideLocationId: "10015010" },
  { id: "south", name: "南部海域", locationName: "嘉義縣東石鄉", tideLocationId: "10010090" },
];

const mockRegions: RegionSeaCondition[] = [
  {
    id: "north",
    name: "北部海域",
    locationName: "新北市瑞芳區",
    waveHeightM: 0.5,
    waveLevel: "極小浪",
    tideSummary: "潮差中等，適合規劃晨昏短時段作釣。",
    nextHighTide: "今日 06:40",
    nextLowTide: "今日 12:58",
    tideRangeCm: 126,
    reason: "潮差中等且轉潮節奏清楚，建議抓轉潮前後 1 小時。",
  },
  {
    id: "west",
    name: "西部海域",
    locationName: "雲林縣臺西鄉",
    waveHeightM: 0.8,
    waveLevel: "小浪",
    tideSummary: "潮差中等，適合安排近岸作釣。",
    nextHighTide: "今日 07:08",
    nextLowTide: "今日 13:29",
    tideRangeCm: 134,
    reason: "潮流轉換明確，建議把握滿潮前後的時段。",
  },
  {
    id: "east",
    name: "東部海域",
    locationName: "花蓮縣花蓮市",
    waveHeightM: 1.2,
    waveLevel: "小浪",
    tideSummary: "潮差偏大，活性窗口較明顯。",
    nextHighTide: "今日 05:52",
    nextLowTide: "今日 12:11",
    tideRangeCm: 182,
    reason: "潮差偏大，建議優先安排滿潮前後與黃昏時段。",
  },
  {
    id: "south",
    name: "南部海域",
    locationName: "嘉義縣東石鄉",
    waveHeightM: 0.6,
    waveLevel: "小浪",
    tideSummary: "潮差穩定，適合船釣與近岸都可安排。",
    nextHighTide: "今日 07:18",
    nextLowTide: "今日 13:44",
    tideRangeCm: 138,
    reason: "潮差穩定且節奏規律，建議分段安排早晚兩次窗口。",
  },
];

async function fetchWaveObservation(apiKey: string): Promise<unknown> {
  const url = new URL(`${BASE_URL}/O-B0075-001`);
  url.searchParams.set("Authorization", apiKey);
  url.searchParams.set("WeatherElement", "WaveHeight");
  url.searchParams.set("format", "JSON");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`CWA request failed with status ${response.status}`);
  }

  return response.json();
}

export function getWaveLevel(waveHeightM: number | undefined): WaveLevel | undefined {
  if (waveHeightM === undefined) {
    return undefined;
  }

  if (waveHeightM < 0.6) return "極小浪";
  if (waveHeightM < 1.5) return "小浪";
  if (waveHeightM < 2.5) return "中浪";
  if (waveHeightM < 6) return "大浪";
  return "巨浪";
}

export async function fetchTideObservation(apiKey: string): Promise<unknown> {
  const url = new URL(`${BASE_URL}/F-A0021-001`);
  url.searchParams.set("Authorization", apiKey);
  url.searchParams.set("format", "JSON");
  regionMeta.forEach((region) => {
    url.searchParams.append("LocationId", region.tideLocationId);
  });

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`CWA tide request failed with status ${response.status}`);
  }

  return response.json();
}

function parseWaveHeight(value: unknown): number | undefined {
  if (typeof value !== "string" && typeof value !== "number") {
    return undefined;
  }

  const parsed = typeof value === "number" ? value : Number.parseFloat(value.trim());
  return Number.isFinite(parsed) ? parsed : undefined;
}

function extractLatestStationWaves(dataset: unknown): LatestStationWave[] {
  const response = dataset as CwaWaveResponse;
  const locations = response.Records?.SeaSurfaceObs?.Location ?? [];
  const latestWaves: LatestStationWave[] = [];

  for (const location of locations) {
    const stationId = location.Station?.StationID;
    if (!stationId || !stationRegionMap[stationId]) {
      continue;
    }

    const observations = location.StationObsTimes?.StationObsTime ?? [];
    const validObservations = observations
      .map((observation) => {
        const waveHeightM = parseWaveHeight(observation.WeatherElements?.WaveHeight);
        const observedAt = observation.DateTime;
        if (waveHeightM === undefined || !observedAt) {
          return null;
        }

        const timestamp = new Date(observedAt).getTime();
        return Number.isFinite(timestamp) ? { waveHeightM, observedAt, timestamp } : null;
      })
      .filter((observation): observation is { waveHeightM: number; observedAt: string; timestamp: number } => observation !== null)
      .sort((a, b) => b.timestamp - a.timestamp);

    const newest = validObservations[0];
    if (newest) {
      latestWaves.push({ stationId, waveHeightM: newest.waveHeightM, observedAt: newest.observedAt });
    }
  }

  return latestWaves;
}

function formatTideDateTime(value: string | undefined): string {
  if (!value) {
    return "資料不足";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "資料不足";
  }

  return date.toLocaleString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function parseTideHeight(value: unknown): number | undefined {
  if (typeof value !== "string" && typeof value !== "number") {
    return undefined;
  }

  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function extractTideConditions(dataset: unknown): Partial<Record<RegionId, Pick<RegionSeaCondition, "nextHighTide" | "nextLowTide" | "tideRangeCm" | "tideEvents" | "tideSummary" | "reason">>> {
  const response = dataset as CwaTideResponse;
  const locations = response.records?.TideForecasts?.map((forecast) => forecast.Location).filter((location): location is CwaTideLocation => location !== undefined) ?? [];
  const now = Date.now();
  const tideConditions: Partial<Record<RegionId, Pick<RegionSeaCondition, "nextHighTide" | "nextLowTide" | "tideRangeCm" | "tideEvents" | "tideSummary" | "reason">>> = {};

  for (const meta of regionMeta) {
    const location = locations.find(
      (item) => item.LocationId === meta.tideLocationId && item.LocationName === meta.locationName,
    );
    if (!location) {
      continue;
    }

    const allEvents = (location.TimePeriods?.Daily ?? [])
      .flatMap((daily) => daily.Time ?? [])
      .filter((event) => event.DateTime)
      .sort((first, second) => new Date(first.DateTime ?? 0).getTime() - new Date(second.DateTime ?? 0).getTime());
    const events = allEvents.filter(
      (event) => new Date(event.DateTime ?? 0).getTime() >= now,
    );
    const nextHighTide = events.find((event) => event.Tide === "滿潮");
    const nextLowTide = events.find((event) => event.Tide === "乾潮");
    const firstDate = events[0]?.DateTime?.slice(0, 10);
    const dailyEvents = allEvents.filter(
      (event) => event.DateTime?.startsWith(firstDate ?? ""),
    );
    const tideEvents = dailyEvents
      .map((event): TideEvent | null => {
        const heightCm = parseTideHeight(event.TideHeights?.AboveChartDatum);
        if (!event.DateTime || heightCm === undefined) {
          return null;
        }

        return {
          time: event.DateTime,
          type: event.Tide === "滿潮" ? "high" : "low",
          heightCm,
        };
      })
      .filter((event): event is TideEvent => event !== null);
    const dailyHeights = dailyEvents
      .filter((event) => event.DateTime?.startsWith(firstDate ?? ""))
      .map((event) => parseTideHeight(event.TideHeights?.AboveChartDatum))
      .filter((height): height is number => height !== undefined);
    const tideRangeCm = dailyHeights.length > 1 ? Math.max(...dailyHeights) - Math.min(...dailyHeights) : null;
    const tideSummary =
      tideRangeCm === null
        ? "潮差資料不足，暫時無法判斷潮汐變化。"
        : tideRangeCm >= 180
          ? "潮差偏大，潮流交換較明顯。"
          : tideRangeCm >= 100
            ? "潮差中等，適合掌握轉潮時段。"
            : "潮差較小，建議搭配晨昏時段作釣。";

    tideConditions[meta.id] = {
      tideSummary,
      nextHighTide: formatTideDateTime(nextHighTide?.DateTime),
      nextLowTide: formatTideDateTime(nextLowTide?.DateTime),
      tideRangeCm,
      tideEvents,
      reason: `${location.LocationName}潮汐預報：${tideSummary}`,
    };
  }

  return tideConditions;
}

function deriveWaveCondition(
  waveHeightM: number | undefined,
  stationCount: number,
  regionName: string,
  updatedAt?: string,
): Omit<RegionSeaCondition, "id" | "name" | "locationName"> {
  if (waveHeightM === undefined) {
    return {
      waveStationCount: 0,
      tideSummary: "目前沒有可用浪高觀測。",
      nextHighTide: "資料不足",
      nextLowTide: "資料不足",
      tideRangeCm: null,
      reason: `${regionName}尚未取得有效浪高資料，請稍後重新整理。`,
    };
  }

  const tideSummary =
    waveHeightM <= 0.8 ? "浪高偏低，近岸作釣條件穩定。" : waveHeightM <= 1.5 ? "浪高適中，出航前留意風浪變化。" : "浪高偏高，建議審慎評估出航條件。";

  return {
    waveHeightM,
    waveLevel: getWaveLevel(waveHeightM),
    waveHeightUpdatedAt: updatedAt,
    waveStationCount: stationCount,
    tideSummary,
    nextHighTide: "未提供潮汐資料",
    nextLowTide: "未提供潮汐資料",
    tideRangeCm: null,
    reason: `${regionName}目前平均浪高 ${waveHeightM.toFixed(1)} m，採計 ${stationCount} 個有效站點。`,
  };
}

export async function getFishingDashboard(apiKey: string | undefined): Promise<FishingDashboard> {
  if (!apiKey) {
    return {
      updatedAt: new Date().toISOString(),
      source: "mock",
      warningText: "未設定 CWA API 金鑰，目前使用潮汐展示資料",
      regions: mockRegions,
    };
  }

  try {
    const [waveDataset, tideDataset] = await Promise.all([fetchWaveObservation(apiKey), fetchTideObservation(apiKey)]);
    const latestStationWaves = extractLatestStationWaves(waveDataset);
    const tideConditions = extractTideConditions(tideDataset);

    const regions = regionMeta.map((meta) => {
      const regionWaves = latestStationWaves.filter((station) => stationRegionMap[station.stationId] === meta.id);
      const waveHeightM = regionWaves.length > 0
        ? regionWaves.reduce((sum, station) => sum + station.waveHeightM, 0) / regionWaves.length
        : undefined;
      const updatedAt = regionWaves
        .map((station) => station.observedAt)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
      const condition = deriveWaveCondition(waveHeightM, regionWaves.length, meta.name, updatedAt);
      const tideCondition = tideConditions[meta.id];

      return {
        id: meta.id,
        name: meta.name,
        locationName: meta.locationName,
        ...condition,
        ...tideCondition,
        reason: tideCondition ? `${condition.reason} ${tideCondition.reason}` : condition.reason,
      } satisfies RegionSeaCondition;
    });

    const warningText = "浪高資料：O-B0075-001；潮汐預報：F-A0021-001";

    return {
      updatedAt: new Date().toISOString(),
      source: "cwa-live",
      warningText,
      regions,
    };
  } catch {
    return {
      updatedAt: new Date().toISOString(),
      source: "mock",
      warningText: "潮汐資料讀取失敗，已切換展示資料",
      regions: mockRegions,
    };
  }
}
