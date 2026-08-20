// 海釣遊戲的純規則函式，讓上鉤判定可以脫離 React 與計時器獨立測試。
import type { WaveLevel } from "../types/fishing";

const catchRateByWaveLevel: Record<WaveLevel, number> = {
  極小浪: 1,
  小浪: 1,
  中浪: 0.5,
  大浪: 0.33,
  巨浪: 0.33,
};

export type FishingAttemptResult = "early" | "escaped" | "caught";

export function getCatchRate(waveLevel?: WaveLevel): number {
  return waveLevel ? catchRateByWaveLevel[waveLevel] : 1;
}

export function resolveFishingAttempt(
  isFishBiting: boolean,
  waveLevel: WaveLevel | undefined,
  roll: number,
): FishingAttemptResult {
  if (!isFishBiting) {
    return "early";
  }

  return roll <= getCatchRate(waveLevel) ? "caught" : "escaped";
}
