import { WishKey } from "./data";

type Props = {
  selWishes: WishKey[];
  onToggleWish: (key: WishKey) => void;
  onBack: () => void;
  onSubmit: () => void;
  email: string;
  name: string;
  orgSize: string;
  onEmailChange: (v: string) => void;
  onNameChange: (v: string) => void;
  onOrgSizeChange: (v: string) => void;
};

const wishes: { i: string; t: string; s: string; k: WishKey }[] = [
  { i: "😌", t: "Peace of mind", s: "Knowing the people or pets I love are safe", k: "peace" },
  { i: "⏰", t: "Time back", s: "Help with things that eat my evenings and weekends", k: "time" },
  { i: "💪", t: "Health visibility", s: "For me or someone I care for", k: "health" },
  { i: "🤝", t: "To feel seen at work", s: "My employer acknowledges I have a whole life", k: "seen" },
  { i: "🏠", t: "A better home setup", s: "Tools that make working from home less stressful", k: "setup" },
  { i: "🙅", t: "Nothing really", s: "I manage fine on my own", k: "nothing" },
];

const ORG_SIZE_OPTIONS = [
  "1–10",
  "11–50",
  "51–200",
  "201–500",
  "501–1000",
  "1000+",
];

export default function Step5Wishes({
  selWishes,
  onToggleWish,
  onBack,
  onSubmit,
  email,
  name,
  orgSize,
  onEmailChange,
  onNameChange,
  onOrgSizeChange,
}: Props) {
  return (
    <section>
      <p className="mb-2 text-[11px] uppercase tracking-[0.6px] text-[#aaa]">What would genuinely help</p>
      <h2 className="mb-2 text-[30px] leading-tight font-bold">If your employer wanted to make your life outside work a little easier - what would actually matter to you?</h2>
      <p className="mb-5 text-[15px] leading-relaxed text-[#666]">Select all that apply. No right or wrong answer here.</p>
      <div className="grid gap-2">
        {wishes.map((w) => {
          const selected = selWishes.includes(w.k);
          return (
            <button key={w.k} type="button" onClick={() => onToggleWish(w.k)} className={`flex cursor-pointer items-center gap-3 rounded-[14px] border-2 p-3 text-left transition ${selected ? "border-[#1D9E75] bg-[#f0fdf9]" : "border-[#e8e8e8] bg-white hover:border-[#bbb] hover:bg-[#fafafa]"}`}>
              <span className="text-xl">{w.i}</span>
              <span className="flex-1">
                <strong className="mb-0.5 block text-[13px]">{w.t}</strong>
                <span className="text-[11px] text-[#888]">{w.s}</span>
              </span>
              <span className={`flex h-4 w-4 items-center justify-center rounded-[4px] border-2 text-[9px] ${selected ? "border-[#1D9E75] bg-[#1D9E75] text-white" : "border-[#ddd]"}`}>{selected ? "✓" : ""}</span>
            </button>
          );
        })}
      </div>

      {/* Optional contact info */}
      <div className="mt-6 rounded-[14px] border border-[#e8e8e8] bg-[#fafafa] p-4">
        <p className="mb-1 text-[11px] uppercase tracking-[0.6px] text-[#aaa]">Optional — Tell us about yourself</p>
        <p className="mb-4 text-[12px] text-[#888]">These fields are completely optional. Your survey answers are saved regardless.</p>
        <div className="grid gap-3">
          <div>
            <label htmlFor="survey-name" className="mb-1 block text-[12px] font-semibold text-[#555]">Name</label>
            <input
              id="survey-name"
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-[10px] border border-[#ddd] bg-white px-3 py-2 text-[13px] outline-none transition focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]"
            />
          </div>
          <div>
            <label htmlFor="survey-email" className="mb-1 block text-[12px] font-semibold text-[#555]">Email</label>
            <input
              id="survey-email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-[10px] border border-[#ddd] bg-white px-3 py-2 text-[13px] outline-none transition focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]"
            />
          </div>
          <div>
            <label htmlFor="survey-org-size" className="mb-1 block text-[12px] font-semibold text-[#555]">Organization size</label>
            <select
              id="survey-org-size"
              value={orgSize}
              onChange={(e) => onOrgSizeChange(e.target.value)}
              className="w-full rounded-[10px] border border-[#ddd] bg-white px-3 py-2 text-[13px] outline-none transition focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]"
            >
              <option value="">Select size (optional)</option>
              {ORG_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt} employees</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button type="button" onClick={onBack} className="text-[13px] text-[#aaa] hover:text-[#333]">Back</button>
        <button type="button" disabled={selWishes.length === 0} onClick={onSubmit} className="rounded-[10px] bg-[#1D9E75] px-7 py-2.5 text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:bg-[#ddd] disabled:text-[#aaa]">See my snapshot</button>
      </div>
    </section>
  );
}
