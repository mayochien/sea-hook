// 台灣沿海常見魚種圖鑑：提供搜尋與分頁瀏覽。
import { useMemo, useState } from "react";
import type { FishEntry, FishRegion } from "../data/fishInfo";

interface CommonFishListProps {
  entries: FishEntry[];
}

const PAGE_SIZE = 4;
const regionLabels: Record<FishRegion, string> = {
  north: "北部",
  east: "東部",
  west: "西部",
  south: "南部",
  all: "全台",
};

export function CommonFishList({ entries }: CommonFishListProps) {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredEntries = useMemo(
    () =>
      entries.filter((entry) =>
        entry.name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()),
      ),
    [entries, searchTerm],
  );
  const pageCount = Math.ceil(filteredEntries.length / PAGE_SIZE);
  const visibleEntries = filteredEntries.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE,
  );
  const paginationItems: Array<number | "ellipsis"> = [];
  let previousPage = -1;

  for (let currentPage = 0; currentPage < pageCount; currentPage += 1) {
    const isBoundary = currentPage === 0 || currentPage === pageCount - 1;
    const isNearCurrent = Math.abs(currentPage - page) <= 2;

    if (!isBoundary && !isNearCurrent) {
      continue;
    }

    if (currentPage - previousPage > 1) {
      paginationItems.push("ellipsis");
    }
    paginationItems.push(currentPage);
    previousPage = currentPage;
  }

  return (
    <article className="rounded-3xl border border-sky-200/20 bg-gradient-to-br from-cyan-500/14 via-sky-400/6 to-slate-900/14 p-6 backdrop-blur-md sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-display text-xl text-amber-100">
          台灣沿海常見物種
        </h3>
        <label className="relative ml-auto w-full sm:w-52">
          <span className="sr-only">搜尋魚的名稱</span>
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-100/70"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setPage(0);
            }}
            placeholder="搜尋魚名稱"
            className="w-full rounded-full border border-white/15 bg-slate-950/35 py-1 pl-9 pr-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-200/60 focus:ring-2 focus:ring-cyan-200/20"
          />
        </label>
      </div>
      {visibleEntries.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
        {visibleEntries.map((entry) => (
          <article
            key={entry.id}
            className="overflow-hidden p-3 rounded-2xl border border-white/10 bg-white/5"
          >
            <img
              src={entry.imageUrl}
              alt={entry.name}
              loading="lazy"
              className="p-6 rounded-sm aspect-4/3 w-full bg-slate-950/40 object-contain"
            />
            <div className="pt-3">
              <h4 className="text-sm font-semibold text-cyan-50">
                {entry.name}
              </h4>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-sm text-sky-200">出沒海域：</span>
                {entry.region.map((region) => (
                  <span
                    key={region}
                    className="rounded-full bg-cyan-200/15 px-2 py-0.5 text-xs text-cyan-100/80"
                  >
                    {regionLabels[region]}
                  </span>
                ))}
              </div>
              {entry.note ? (
                <p className="mt-2 text-[13px] leading-5 text-slate-400">
                  {entry.note}
                </p>
              ) : null}
            </div>
          </article>
        ))}
        </div>
      ) : (
        <p className="mt-5 py-8 text-center text-sm text-slate-400">
          找不到符合的魚種名稱。
        </p>
      )}
      {pageCount > 0 ? <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 0))}
          disabled={page === 0}
          className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          上一頁
        </button>
        <nav
          className="flex flex-wrap items-center justify-center gap-1"
          aria-label="物種分頁"
        >
          {paginationItems.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-1 text-sm text-slate-500"
              >
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                aria-current={page === item ? "page" : undefined}
                className={`min-w-8 rounded-full px-2 py-1.5 text-sm transition ${
                  page === item
                    ? "bg-cyan-300 font-semibold text-slate-900"
                    : "text-slate-300 hover:bg-white/10"
                }`}
              >
                {item + 1}
              </button>
            ),
          )}
        </nav>
        <button
          type="button"
          onClick={() =>
            setPage((currentPage) => Math.min(currentPage + 1, pageCount - 1))
          }
          disabled={page >= pageCount - 1}
          className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          下一頁
        </button>
      </div> : null}
      {pageCount > 0 ? <p className="mt-2 text-center text-xs text-slate-500">
        第 {page + 1} / {pageCount} 頁
      </p> : null}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <a
          href="https://fishdb.sinica.edu.tw/seafoodguide/"
          target="_blank"
          rel="noreferrer"
          className="ml-auto text-xs text-cyan-100/70 transition hover:text-cyan-100 hover:underline"
        >
          圖片資料來源：臺灣海鮮選擇指南
        </a>
      </div>
    </article>
  );
}
