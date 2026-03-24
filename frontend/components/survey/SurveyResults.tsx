import { StageKey, WishKey } from "./data";

type Props = {
  selStages: StageKey[];
  selEmotions: string[];
  selMoments: string[];
  awareness: number | null;
  selWishes: WishKey[];
  submitState: "idle" | "sending" | "sent" | "error";
  submissionCount: number;
  /** After a successful submit — survey is locked for this browser */
  completedLocked?: boolean;
  /** Shown when submission failed but survey is not yet locked */
  onRetrySubmit?: () => void;
};

export default function SurveyResults({
  selStages,
  selEmotions,
  selMoments,
  awareness,
  selWishes,
  submitState,
  submissionCount,
  completedLocked = false,
  onRetrySubmit,
}: Props) {
  return (
    <section className="py-12 text-center">
      <div className="mb-4 text-4xl">✅</div>
      <h2 className="mb-2 text-[24px] font-bold">Successfully Submitted</h2>
      <p className="text-[15px] text-[#555]">
        Your response has been successfully submitted.
      </p>



      <div className="mx-auto mt-8 max-w-md rounded-lg border border-[#e8e8e8] bg-[#fafafa] p-3 text-[12px] text-[#555]">
        {submitState === "sending" && "Sending your response..."}
        {submitState === "sent" &&
          (submissionCount > 0
            ? `Survey saved successfully. Submission #${submissionCount} (server count).`
            : "Survey saved successfully.")}
        {submitState === "error" && (
          <div className="space-y-2">
            <p>
              Submission failed. Please check your network connection or try again later.
            </p>
            {onRetrySubmit && (
              <button
                type="button"
                onClick={onRetrySubmit}
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

