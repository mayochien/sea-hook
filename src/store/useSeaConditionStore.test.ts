// 測試 Zustand 海況 store：海域切換、目前海況 selector 與 dashboard 載入狀態。
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  RegionId,
  RegionSeaCondition,
} from "../types/fishing";
import { selectCurrentRegion, useSeaConditionStore } from "./useSeaConditionStore";

const createRegion = (id: RegionId): RegionSeaCondition => ({
  id,
  name: id,
  locationName: "測試地點",
  tideSummary: "測試潮況",
  nextHighTide: "資料不足",
  nextLowTide: "資料不足",
  tideRangeCm: null,
  reason: "測試原因",
});

const { testDashboard } = vi.hoisted(() => ({
  testDashboard: {
    updatedAt: "2026-08-20T00:00:00.000Z",
    source: "mock" as const,
    warningText: "測試資料",
    regions: [] as RegionSeaCondition[],
  },
}));

testDashboard.regions.push(createRegion("north"), createRegion("east"));

vi.mock("../lib/cwa", () => ({
  getFishingDashboard: vi.fn().mockResolvedValue(testDashboard),
}));

describe("useSeaConditionStore", () => {
  beforeEach(() => {
    useSeaConditionStore.setState({
      dashboard: null,
      loading: true,
      fetchError: "",
      selectedRegion: "north",
    });
  });

  it("可以切換目前選取的海域", () => {
    useSeaConditionStore.getState().setSelectedRegion("east");

    expect(useSeaConditionStore.getState().selectedRegion).toBe("east");
  });

  it("selector 會依選取海域找出目前海況", () => {
    useSeaConditionStore.setState({ dashboard: testDashboard });

    expect(selectCurrentRegion(useSeaConditionStore.getState())?.id).toBe("north");
    useSeaConditionStore.getState().setSelectedRegion("east");
    expect(selectCurrentRegion(useSeaConditionStore.getState())?.id).toBe("east");
  });

  it("loadDashboard 成功後會更新資料並結束 loading", async () => {
    await useSeaConditionStore.getState().loadDashboard();

    const state = useSeaConditionStore.getState();
    expect(state.dashboard?.source).toBe("mock");
    expect(state.dashboard?.regions).toHaveLength(2);
    expect(state.loading).toBe(false);
    expect(state.fetchError).toBe("");
  });
});
