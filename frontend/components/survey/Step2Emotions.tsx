import { Card } from "./data";

type Props = {
  emotions: Card[];
  selEmotions: string[];
  onToggleEmotion: (name: string) => void;
  onBack: () => void;
  onSkip: () => void;
  onContinue: () => void;
};

export default function Step2Emotions({
  emotions,
  selEmotions,
  onToggleEmotion,
  onBack,
  onSkip,
  onContinue,
}: Props) {
  return (
    <section>
      <p className="mb-2 text-[11px] uppercase tracking-[0.6px] text-[#aaa]">What runs in your mind</p>
      <h2 className="mb-2 text-[30px] leading-tight font-bold">When you leave work — what is still running in the back of your mind?</h2>
      <p className="mb-5 text-[15px] leading-relaxed text-[#666]">Personal life only. Pick everything that feels honest.</p>
      <div className="grid grid-cols-2 gap-2">
        {emotions.map((e) => {
          const selected = !!e.name && selEmotions.includes(e.name);
          return (
            <button key={e.name} type="button" onClick={() => e.name && onToggleEmotion(e.name)} className={`cursor-pointer rounded-xl border-2 p-3 text-left transition ${selected ? "border-[#1D9E75] bg-[#f0fdf9]" : "border-[#e8e8e8] bg-white hover:border-[#bbb] hover:bg-[#fafafa]"}`}>
              <div className="mb-1 text-xl">{e.icon}</div>
              <div className="mb-1 text-[12px] font-bold">{e.name}</div>
              <div className="text-[11px] text-[#aaa]">{e.desc}</div>
            </button>
          );
        })}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <button type="button" onClick={onBack} className="text-[13px] text-[#aaa] hover:text-[#333]">Back</button>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onSkip} className="text-[12px] text-[#bbb] underline">Skip</button>
          <button type="button" disabled={selEmotions.length === 0} onClick={onContinue} className="rounded-[10px] bg-[#1D9E75] px-7 py-2.5 text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:bg-[#ddd] disabled:text-[#aaa]">Continue</button>
        </div>
      </div>
    </section>
  );
}
