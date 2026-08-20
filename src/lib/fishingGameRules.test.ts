// 測試海釣起竿規則：咬鉤時機、浪況上鉤機率與魚兒脫鉤判定。
import { describe, expect, it } from "vitest";
import { getCatchRate, resolveFishingAttempt } from "./fishingGameRules";

describe("海釣遊戲起竿規則", () => {
  it("依浪況回傳對應的上鉤機率", () => {
    expect(getCatchRate("極小浪")).toBe(1);
    expect(getCatchRate("中浪")).toBe(0.5);
    expect(getCatchRate("巨浪")).toBe(0.33);
    expect(getCatchRate(undefined)).toBe(1);
  });

  it("魚尚未咬鉤時起竿會太早失敗", () => {
    expect(resolveFishingAttempt(false, "極小浪", 0)).toBe("early");
  });

  it("咬鉤後依隨機結果判斷成功或脫鉤", () => {
    expect(resolveFishingAttempt(true, "中浪", 0.5)).toBe("caught");
    expect(resolveFishingAttempt(true, "中浪", 0.51)).toBe("escaped");
    expect(resolveFishingAttempt(true, "巨浪", 0.33)).toBe("caught");
    expect(resolveFishingAttempt(true, "巨浪", 0.34)).toBe("escaped");
  });
});
