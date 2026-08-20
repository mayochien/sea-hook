// 海況、魚種、測驗等跨元件共用的型別定義。
export type RegionId = "north" | "west" | "east" | "south";

export type WaveLevel = "極小浪" | "小浪" | "中浪" | "大浪" | "巨浪";

export interface TideEvent {
  time: string;
  type: "high" | "low";
  heightCm: number;
}

export interface RegionSeaCondition {
  id: RegionId;
  name: string;
  locationName: string;
  waveHeightM?: number;
  waveLevel?: WaveLevel;
  waveHeightUpdatedAt?: string;
  waveStationCount?: number;
  tideSummary: string;
  nextHighTide: string;
  nextLowTide: string;
  tideRangeCm: number | null;
  tideEvents?: TideEvent[];
  reason: string;
}

export interface FishingDashboard {
  updatedAt: string;
  source: "cwa-live" | "mock";
  warningText: string;
  regions: RegionSeaCondition[];
}

export interface FishSpecies {
  id: string;
  name: string;
  alias: string;
  region: RegionId[];
  season: string;
  depth: string;
  tips: string;
  culture: string;
  sustain: string;
}

export interface FishQuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explain: string;
}
