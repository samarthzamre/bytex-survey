import { Card, MAX_MOMENTS } from "./data";

type Props = {
  moments: Card[];
  selMoments: string[];
  onToggleMoment: (text: string) => void;
  onBack: () => void;
  onSkip: () => void;
  onContinue: () => void;
};

export default function Step3Moments({
  moments,
  selMoments,
  onToggleMoment,
  onBack,
  onSkip,
  onContinue,
}: Props) {
  return (
    <section>
      <p className="mb-2 text-[11px] uppercase tracking-[0.6px] text-[#aaa]">Real impact</p>
      <h2 className="mb-2 text-[30px] leading-tight font-bold">Has your personal life ever pulled your focus away during work?</h2>
      <p className="mb-5 text-[15px] leading-relaxed text-[#666]">Pick up to 3 that have actually happened to you.</p>
      <div className="grid grid-cols-2 gap-2">
        {moments.map((m) => {
          const chosen = !!m.text && selMoments.includes(m.text);
          const disabled = !chosen && selMoments.length >= MAX_MOMENTS;
          return (
            <button key={m.text} type="button" onClick={() => m.text && !disabled && onToggleMoment(m.text)} className={`flex cursor-pointer items-start gap-2 rounded-xl border-2 p-3 text-left transition ${chosen ? "border-[#1D9E75] bg-[#f0fdf9]" : disabled ? "cursor-not-allowed border-[#e8e8e8] bg-white opacity-40" : "border-[#e8e8e8] bg-white hover:border-[#bbb] hover:bg-[#fafafa]"}`}>
              <span className="text-base">{m.icon}</span>
              <span className="flex-1 text-[12px] leading-relaxed">{m.text}</span>
              <span className={`mt-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 text-[8px] ${chosen ? "border-[#1D9E75] bg-[#1D9E75] text-white" : "border-[#ddd]"}`}>{chosen ? "✓" : ""}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 min-h-4 text-[11px] text-[#aaa]">
        {selMoments.length === 0
          ? "Select up to 3"
          : selMoments.length < 3
            ? `${selMoments.length} selected - you can pick ${3 - selMoments.length} more`
            : "3 selected - limit reached"}
      </p>
      <div className="mt-6 flex items-center justify-between">
        <button type="button" onClick={onBack} className="text-[13px] text-[#aaa] hover:text-[#333]">Back</button>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onSkip} className="text-[12px] text-[#bbb] underline">Skip</button>
          <button type="button" disabled={selMoments.length === 0} onClick={onContinue} className="rounded-[10px] bg-[#1D9E75] px-7 py-2.5 text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:bg-[#ddd] disabled:text-[#aaa]">Continue</button>
        </div>
      </div>
    </section>
  );
}
