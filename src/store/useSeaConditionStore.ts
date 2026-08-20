import { create } from "zustand";
import { getFishingDashboard } from "../lib/cwa";
import type {
  FishingDashboard,
  RegionId,
  RegionSeaCondition,
} from "../types/fishing";

// 集中管理 dashboard、loading、fetchError、selectedRegion，
// 並提供 loadDashboard、setSelectedRegion actions 與 selectCurrentRegion selector；

// TideMap、TideDetail、FishingGame 皆直接用 useSeaConditionStore(selector) 訂閱所需狀態，
// 取代 props 傳遞。

interface SeaConditionState {
  dashboard: FishingDashboard | null;
  loading: boolean;
  fetchError: string;
  selectedRegion: RegionId;
  setSelectedRegion: (region: RegionId) => void;
  loadDashboard: () => Promise<void>;
}

export const useSeaConditionStore = create<SeaConditionState>((set) => ({
  dashboard: null,
  loading: true,
  fetchError: "",
  selectedRegion: "north",
  setSelectedRegion: (region) => set({ selectedRegion: region }),
  loadDashboard: async () => {
    set({ loading: true, fetchError: "" });
    try {
      const data = await getFishingDashboard(import.meta.env.VITE_CWA_API_KEY);
      set({ dashboard: data });
    } catch {
      set({ fetchError: "海況資料讀取失敗，請稍後再試。" });
    } finally {
      set({ loading: false });
    }
  },
}));

// 依 selectedRegion 從 dashboard 內找出對應海域資料，給子組件當作 selector 使用
export const selectCurrentRegion = (
  state: SeaConditionState,
): RegionSeaCondition | null =>
  state.dashboard?.regions.find((item) => item.id === state.selectedRegion) ??
  null;
