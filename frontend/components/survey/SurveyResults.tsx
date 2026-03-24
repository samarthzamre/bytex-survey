import { AWARENESS_LABELS, StageKey, WishKey, iconForEmotion, stageData, wishLabels } from "./data";

type Props = {
  selStages: StageKey[];
  selEmotions: string[];
  selMoments: string[];
  awareness: number | null;
  selWishes: WishKey[];
  emailState: "idle" | "sending" | "sent" | "error";
  submissionCount: number;
  /** After a successful submit — survey is locked for this browser */
  completedLocked?: boolean;
  /** Shown when email failed but survey is not yet locked */
  onRetryEmail?: () => void;
};

export default function SurveyResults({
  selStages,
  selEmotions,
  selMoments,
  awareness,
  selWishes,
  emailState,
  submissionCount,
  completedLocked = false,
  onRetryEmail,
}: Props) {
  return (
    <section>
      {completedLocked && (
        <div className="mb-4 rounded-xl border border-[#a7e8d0] bg-[#f0fdf9] px-4 py-3 text-center text-[13px] text-[#0a5c3e]">
          Your response is saved. This survey can only be completed once on this device.
        </div>
      )}
      <div className="py-4 text-center">
        <div className="mb-1.5 text-4xl">🌿</div>
        <h2 className="mb-1 text-[30px] font-bold">Your life outside work - mapped</h2>
        <p className="text-[15px] text-[#888]">This is what ByteX sees. Not your job title. Your real life.</p>
      </div>

      <p className="mt-5 mb-2 text-[11px] font-bold tracking-[0.5px] text-[#bbb] uppercase">Your life stages</p>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {selStages.map((s) => (
          <span key={s} className="inline-flex items-center gap-1 rounded-2xl px-2.5 py-1 text-[12px] font-bold" style={{ background: stageData[s].bg, color: stageData[s].color }}>
            {stageData[s].icon} {stageData[s].label}
          </span>
        ))}
      </div>

      {selEmotions.length > 0 && (
        <>
          <p className="mt-4 mb-2 text-[11px] font-bold tracking-[0.5px] text-[#bbb] uppercase">What runs in the background</p>
          <div className="grid gap-1.5">
            {selEmotions.slice(0, 5).map((e, i) => (
              <div key={e} className="flex items-center gap-2.5 rounded-[10px] bg-[#f8f8f8] px-3 py-2">
                <span>{iconForEmotion(e)}</span>
                <span className="flex-1 text-[12px]">{e}</span>
                <div className="h-[3px] w-[70px] rounded bg-[#e8e8e8]">
                  <div className="h-[3px] rounded bg-[#1D9E75]" style={{ width: `${Math.round(100 - i * 16)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selMoments.length > 0 && (
        <>
          <p className="mt-5 mb-2 text-[11px] font-bold tracking-[0.5px] text-[#bbb] uppercase">Real impact on work focus</p>
          <div className="rounded-xl bg-[#f8f8f8] px-4 py-3">
            <p className="mb-1 text-[22px] font-bold">{selMoments.length} moment{selMoments.length > 1 ? "s" : ""} where personal life interrupted work</p>
            <p className="text-[13px] text-[#777]">These are not productivity problems. They are life problems that spill into work hours - and they are measurable.</p>
          </div>
        </>
      )}

      <p className="mt-5 mb-2 text-[11px] font-bold tracking-[0.5px] text-[#bbb] uppercase">Employer awareness</p>
      <div className="rounded-xl bg-[#f8f8f8] px-4 py-3">
        <p className="mb-1 text-[11px] font-bold tracking-[0.4px] text-[#aaa] uppercase">How well your employer knows your life</p>
        <p className="mb-2 text-[32px] font-bold">{AWARENESS_LABELS[awareness ?? 0]}</p>
        <div className="h-1 rounded bg-[#e8e8e8]">
          <div className="h-1 rounded bg-[#1D9E75]" style={{ width: `${((awareness ?? 1) / 5) * 100}%` }} />
        </div>
      </div>

      {selWishes[0] !== "nothing" && selWishes.length > 0 ? (
        <>
          <p className="mt-5 mb-2 text-[11px] font-bold tracking-[0.5px] text-[#bbb] uppercase">Your pull signals</p>
          <div className="rounded-[14px] border border-[#a7e8d0] bg-[#f0fdf9] p-4">
            <h3 className="mb-2 text-[14px] font-bold text-[#0a5c3e]">What would genuinely make a difference</h3>
            <div className="mb-2 grid gap-1.5">
              {selWishes.map((w) => (
                <div key={w} className="flex items-center gap-2 text-[13px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1D9E75]" />
                  <span>{wishLabels[w]}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-xl bg-[#f8f8f8] px-4 py-3">
          <p className="mb-1 text-[16px] font-bold">Independent and self-sufficient</p>
          <p className="text-[13px] text-[#777]">Noted. ByteX respects that. If something changes, the platform is here.</p>
        </div>
      )}

      <div className="mt-6 rounded-[14px] bg-[#111] p-4 text-center">
        <p className="mb-2 text-[13px] leading-relaxed text-[#aaa]">One person&apos;s truth. When 500 employees complete this, the CHRO sees which life stages dominate and which stresses are most acute.</p>
        <button type="button" className="rounded-lg bg-[#1D9E75] px-5 py-2.5 text-[13px] font-bold text-white">See the CHRO stress map</button>
      </div>

      <div className="mt-4 rounded-lg border border-[#e8e8e8] bg-[#fafafa] p-3 text-[12px] text-[#555]">
        {emailState === "sending" && "Sending your response by email..."}
        {emailState === "sent" &&
          (submissionCount > 0
            ? `Survey emailed successfully. Submission #${submissionCount} (server count).`
            : "Survey emailed successfully.")}
        {emailState === "error" && (
          <div className="space-y-2">
            <p>
              Email send failed. Check .env / .env.local: SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, FROM_EMAIL, FROM_NAME (optional), SURVEY_TO_EMAIL — and ensure the server can reach your mail host.
            </p>
            {onRetryEmail && (
              <button
                type="button"
                onClick={onRetryEmail}
                className="rounded-lg bg-[#1D9E75] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#0e7a5a]"
              >
                Retry sending
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
