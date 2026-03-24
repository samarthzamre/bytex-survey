import { StageKey, stageData } from "./data";

type Props = {
  selStages: StageKey[];
  onToggleStage: (key: StageKey) => void;
  onContinue: () => void;
};

export default function Step1LifeStages({ selStages, onToggleStage, onContinue }: Props) {
  const comboHint =
    selStages.length >= 2
      ? `${selStages.map((s) => stageData[s].icon).join(" ")} - ByteX sees the full picture`
      : selStages.length === 1
        ? `${stageData[selStages[0]].icon} ${stageData[selStages[0]].label}`
        : "";

  return (
    <section>
      <p className="mb-2 text-[11px] uppercase tracking-[0.6px] text-[#aaa]">About you</p>
      <h1 className="mb-2 text-[30px] leading-tight font-bold">Which of these are part of your life right now?</h1>
      <p className="mb-5 text-[15px] leading-relaxed text-[#666]">Select everything that is true. Life is rarely just one thing.</p>
      <div className="mb-2 grid grid-cols-2 gap-2">
        {(Object.keys(stageData) as StageKey[]).map((k) => {
          const active = selStages.includes(k);
          return (
            <button key={k} type="button" onClick={() => onToggleStage(k)} className={`relative flex cursor-pointer flex-col items-center gap-1 rounded-[14px] border-2 p-3 text-center transition ${active ? "border-[#1D9E75] bg-[#f0fdf9]" : "border-[#e8e8e8] bg-white hover:border-[#bbb] hover:bg-[#fafafa]"}`}>
              <span className={`absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full border-2 text-[8px] ${active ? "border-[#1D9E75] bg-[#1D9E75] text-white" : "border-[#ddd] text-transparent"}`}>{active ? "✓" : "."}</span>
              <span className="text-[26px]">{stageData[k].icon}</span>
              <span className="text-[13px] font-bold">{stageData[k].title}</span>
              <span className="text-[11px] text-[#aaa]">{stageData[k].description}</span>
            </button>
          );
        })}
      </div>
      <p className="min-h-[18px] text-[12px] font-semibold text-[#1D9E75]">{comboHint}</p>
      <div className="mt-6 flex justify-end">
        <button type="button" disabled={selStages.length === 0} onClick={onContinue} className="rounded-[10px] bg-[#1D9E75] px-7 py-2.5 text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:bg-[#ddd] disabled:text-[#aaa]">Continue</button>
      </div>
    </section>
  );
}
