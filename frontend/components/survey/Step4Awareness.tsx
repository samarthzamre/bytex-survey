type Props = {
  awareness: number | null;
  onSelect: (value: number) => void;
  onBack: () => void;
  onContinue: () => void;
};

export default function Step4Awareness({ awareness, onSelect, onBack, onContinue }: Props) {
  return (
    <section>
      <p className="mb-2 text-[11px] uppercase tracking-[0.6px] text-[#aaa]">Your workplace</p>
      <h2 className="mb-2 text-[30px] leading-tight font-bold">Does your employer know any of this about your life?</h2>
      <p className="mb-5 text-[15px] leading-relaxed text-[#666]">Not your performance - your actual personal situation outside work.</p>
      <div className="mb-2 flex gap-1.5">
        {[{ f: "😶", l: "Not at all", v: 1 }, { f: "🤷", l: "Barely", v: 2 }, { f: "🙂", l: "A little", v: 3 }, { f: "😊", l: "Fairly well", v: 4 }, { f: "🤗", l: "Very well", v: 5 }].map((item) => (
          <button key={item.v} type="button" onClick={() => onSelect(item.v)} className={`flex-1 cursor-pointer rounded-xl border-2 px-1 py-2.5 text-center transition ${awareness === item.v ? "border-[#1D9E75] bg-[#f0fdf9]" : "border-[#e8e8e8] bg-white hover:border-[#bbb] hover:bg-[#fafafa]"}`}>
            <span className="mb-0.5 block text-xl">{item.f}</span>
            <span className="text-[10px] text-[#aaa]">{item.l}</span>
          </button>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <button type="button" onClick={onBack} className="text-[13px] text-[#aaa] hover:text-[#333]">Back</button>
        <button type="button" disabled={!awareness} onClick={onContinue} className="rounded-[10px] bg-[#1D9E75] px-7 py-2.5 text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:bg-[#ddd] disabled:text-[#aaa]">Continue</button>
      </div>
    </section>
  );
}
