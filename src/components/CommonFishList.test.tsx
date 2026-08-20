// 測試魚種列表元件：初始分頁、搜尋過濾、頁面切換與圖片來源連結。
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CommonFishList } from "./CommonFishList";
import type { FishEntry } from "../data/fishInfo";

const testEntries: FishEntry[] = Array.from({ length: 6 }, (_, index) => ({
  id: `test-fish-${index + 1}`,
  name: `測試魚${index + 1}`,
  imageUrl: `/test-fish-${index + 1}.jpg`,
  region: ["north"],
  note: `測試魚種說明${index + 1}`,
}));

afterEach(() => {
  document.body.innerHTML = "";
});

describe("CommonFishList", () => {
  it("初始顯示四筆魚種與正確分頁狀態", () => {
    render(<CommonFishList entries={testEntries} />);

    expect(screen.getByRole("heading", { name: "測試魚1" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "測試魚4" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "測試魚5" })).not.toBeInTheDocument();
    expect(screen.getByText("第 1 / 2 頁")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "上一頁" })).toBeDisabled();
  });

  it("輸入魚種名稱後只顯示符合結果並回到第一頁", () => {
    render(<CommonFishList entries={testEntries} />);
    const searchBox = screen.getByRole("searchbox", { name: "搜尋魚的名稱" });

    fireEvent.change(searchBox, { target: { value: "測試魚5" } });

    expect(screen.getByRole("heading", { name: "測試魚5" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "測試魚1" })).not.toBeInTheDocument();
    expect(screen.getByText("第 1 / 1 頁")).toBeInTheDocument();
  });

  it("可以切換頁面並在最後一頁停用下一頁", () => {
    render(<CommonFishList entries={testEntries} />);

    fireEvent.click(screen.getByRole("button", { name: "下一頁" }));

    expect(screen.getByRole("heading", { name: "測試魚5" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "測試魚6" })).toBeInTheDocument();
    expect(screen.getByText("第 2 / 2 頁")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "下一頁" })).toBeDisabled();
  });

  it("顯示圖片資料來源連結", () => {
    render(<CommonFishList entries={testEntries} />);

    const sourceLink = screen.getByRole("link", {
      name: "圖片資料來源：臺灣海鮮選擇指南",
    });

    expect(sourceLink).toHaveAttribute(
      "href",
      "https://fishdb.sinica.edu.tw/seafoodguide/",
    );
    expect(sourceLink).toHaveAttribute("target", "_blank");
  });
});
