# SEA HOOK 開發備查

> 備註：本文件為展示專案的備查資料。此專案目前不規劃持續開發或多人協作，僅在需要說明執行流程時使用。

## 文件導覽

- [README.md](README.md)：對外技術說明，給面試者／訪客快速認識專案的技術架構。
- [README_DEV_GUIDE.md](README_DEV_GUIDE.md)：本文件，開發流程的備查筆記。

## 開發環境需求

- Node.js（建議使用近期 LTS 版本）
- npm

## 初始化與本機啟動

```bash
npm install
npm run dev
```

啟動後，使用 `http://localhost:7777` 開啟網站。Vite 的開發伺服器已在 `vite.config.ts` 固定使用 `7777` port。

## 環境設定

海況資料需要中央氣象署的 API 金鑰，可在 [開放資料平台](https://opendata.cwa.gov.tw/index) 免費申請後，複製 `.env.example` 為 `.env`：

```bash
copy .env.example .env
```

Linux 或 macOS 可使用：

```bash
cp .env.example .env
```

在 `.env` 中設定：

```bash
VITE_CWA_API_KEY=你的金鑰
```

沒有金鑰、或請求失敗時，畫面會自動改用內建假資料（`mockRegions`），不影響操作體驗。

## 常用指令

| 指令 | 用途 |
| --- | --- |
| `npm run dev` | 啟動 Vite 開發伺服器 |
| `npm run lint` | 執行 Oxlint 程式碼檢查 |
| `npm test` | 執行 Vitest 核心邏輯測試 |
| `npm run build` | 執行 `tsc -b` 並建立最佳化 bundle |
| `npm run preview` | 預覽本機 build 結果 |

建議提交變更前依序執行：

```bash
npm run lint
npm test
npx tsc -b
npm run build
```

## 專案結構

```text
src/
  components/   海況地圖、潮汐面板、海釣遊戲、魚種圖鑑、知識測驗等畫面元件
  store/        zustand 全域狀態（海況 dashboard、選取的海域）
  data/         魚種圖鑑、測驗題庫、浪況分級說明等靜態資料
  lib/          呼叫中央氣象署開放資料 API 並整理成畫面可用的格式
  types/        跨元件共用的型別定義
```

## 開發注意事項

- 不要將 `.env` 或任何含金鑰的設定提交至版本控制（已在 `.gitignore` 中排除）。
- 修改海況 API 串接（`src/lib/cwa.ts`）時，同時確認金鑰缺失／請求失敗時的假資料退回邏輯是否仍正常運作。
- 修改海釣遊戲邏輯時，留意海域切換會重置遊戲狀態，避免殘留上一個海域的下竿／咬鉤狀態。
- 送出變更前執行 `npm run lint` 與 `npx tsc -b`。

## 閱讀順序建議

- 第一次來到專案：先看 [README.md](README.md)
- 要理解架構與技術選型：持續看 [README.md](README.md)
- 若要補充執行細節：最後看 [README_DEV_GUIDE.md](README_DEV_GUIDE.md)
