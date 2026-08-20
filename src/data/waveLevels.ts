// 浪高分級對照說明文字，給海況地圖的說明提示（WaveLevelInfo）使用。
import type { WaveLevel } from "../types/fishing";

export const waveLevelGuide: Record<WaveLevel, string> = {
  極小浪: "小於 0.6 公尺，水面平靜或僅有輕微漣漪。",
  小浪: "0.6 至 1.5 公尺，適合部分水上活動，初學者仍需注意。",
  中浪: "1.5 至 2.5 公尺，風浪開始明顯。",
  大浪: "2.5 至 6 公尺，海況危險，應審慎評估。",
  巨浪: "6 公尺以上，極具破壞性與危險性。",
};
