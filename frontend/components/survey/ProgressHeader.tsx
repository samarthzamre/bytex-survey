import { stepMeta } from "./data";

type Props = {
  step: number;
};

export default function ProgressHeader({ step }: Props) {
  const stepInfo = stepMeta[Math.max(step - 1, 0)];
  const progress = step === 6 ? 100 : (step / 5) * 100;

  return (
    <div className="mb-6">
      <div className="mb-1.5 flex items-center justify-between text-[11px] text-[#999]">
        <span>{step === 6 ? "Your snapshot" : stepInfo?.l}</span>
        <span>{step === 6 ? "Complete" : stepInfo?.n}</span>
      </div>
      <div className="h-[3px] rounded bg-[#eee]">
        <div className="h-[3px] rounded bg-[#1D9E75] transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
