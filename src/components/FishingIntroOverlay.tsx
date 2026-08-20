// 下竿前的「確認作釣海域」蓋板：顯示預覽動畫、遊戲流程與目前浪況，確認後才能開始遊戲。
import { FishingIntroPreview } from "./FishingIntroPreview";

interface FishingIntroOverlayProps {
  hasConfirmedFishingArea: boolean;
  regionLabel: string;
  waveOutlook: string;
  onConfirm: () => void;
}

export function FishingIntroOverlay({
  hasConfirmedFishingArea,
  regionLabel,
  waveOutlook,
  onConfirm,
}: FishingIntroOverlayProps) {
  return (
    <div
      className={`absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-slate-950/90 p-6 backdrop-blur-lg transition-opacity duration-500 ${hasConfirmedFishingArea ? "pointer-events-none opacity-0" : "opacity-100"}`}
      aria-hidden={hasConfirmedFishingArea}
    >
      <div className="max-w-md text-center">
        <div className="mx-auto mb-2 flex h-20 w-40 items-center justify-center">
          <FishingIntroPreview />
        </div>
        <h4 className="mt-5 font-display text-2xl text-amber-100">
          前往 {regionLabel} 作釣？
        </h4>
        <div className="mt-5 flex items-center justify-center gap-2 text-sm text-cyan-100/60">
          <span className="rounded-full border border-cyan-100/20 px-2 py-1 text-cyan-100/85">
            下竿
          </span>
          <span aria-hidden="true">→</span>
          <span className="rounded-full border border-cyan-100/20 px-2 py-1">
            等咬鉤
          </span>
          <span aria-hidden="true">→</span>
          <span className="rounded-full border border-cyan-100/20 px-2 py-1">
            起竿
          </span>
        </div>
        <p className="mt-3 text-base leading-6 text-cyan-100/85">
          {regionLabel}目前浪況：{waveOutlook}
        </p>
        <button
          type="button"
          className="mt-5 tracking-wider rounded-full bg-emerald-400 px-6 py-2.5 text-md font-semibold text-slate-800 shadow-[0_0_18px_rgba(94,234,212,0.45)] transition hover:bg-emerald-300 hover:shadow-[0_0_24px_rgba(94,234,212,0.65)]"
          onClick={onConfirm}
        >
          立即開始
        </button>
      </div>
    </div>
  );
}
