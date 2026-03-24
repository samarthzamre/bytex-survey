import type { StageKey, WishKey } from "@/components/survey/data";

export const SURVEY_STORAGE_KEY = "bytex_survey_state_v3";

export type PersistedSurvey = {
  v: 3;
  step: number;
  selStages: StageKey[];
  selEmotions: string[];
  selMoments: string[];
  awareness: number | null;
  selWishes: WishKey[];
  /** True only after successful API submit — user cannot submit again */
  submitted: boolean;
  submissionNumber: number;
  emailState: "idle" | "sending" | "sent" | "error";
  // Optional contact info
  email: string;
  name: string;
  orgSize: string;
};

const VALID_STAGES: StageKey[] = ["parent", "caregiver", "pet", "newjoiner", "empty", "solo"];
const VALID_WISHES: WishKey[] = ["peace", "time", "health", "seen", "setup", "nothing"];

function isStageKey(x: unknown): x is StageKey {
  return typeof x === "string" && VALID_STAGES.includes(x as StageKey);
}

function isWishKey(x: unknown): x is WishKey {
  return typeof x === "string" && VALID_WISHES.includes(x as WishKey);
}

export function loadSurveyFromStorage(): Partial<PersistedSurvey> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SURVEY_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Record<string, unknown>;
    if (p.v !== 3) return null;

    const stages = Array.isArray(p.selStages) ? p.selStages.filter(isStageKey) : [];
    const wishes = Array.isArray(p.selWishes) ? p.selWishes.filter(isWishKey) : [];
    const emotions = Array.isArray(p.selEmotions) ? p.selEmotions.filter((x): x is string => typeof x === "string") : [];
    const moments = Array.isArray(p.selMoments) ? p.selMoments.filter((x): x is string => typeof x === "string") : [];

    let awareness: number | null = null;
    if (typeof p.awareness === "number" && p.awareness >= 1 && p.awareness <= 5) awareness = p.awareness;
    else if (p.awareness === null) awareness = null;

    let step = typeof p.step === "number" ? p.step : 1;
    if (step < 1 || step > 6) step = 1;

    const submitted = p.submitted === true;
    if (submitted) step = 6;

    const submissionNumber = typeof p.submissionNumber === "number" ? p.submissionNumber : 0;
    const es = p.emailState;
    const emailState =
      es === "sending" || es === "sent" || es === "error" || es === "idle" ? es : "idle";

    const email = typeof p.email === "string" ? p.email : "";
    const name = typeof p.name === "string" ? p.name : "";
    const orgSize = typeof p.orgSize === "string" ? p.orgSize : "";

    return {
      v: 3,
      step,
      selStages: stages,
      selEmotions: emotions,
      selMoments: moments,
      awareness,
      selWishes: wishes,
      submitted,
      submissionNumber,
      emailState,
      email,
      name,
      orgSize,
    };
  } catch {
    return null;
  }
}

export function saveSurveyToStorage(data: Omit<PersistedSurvey, "v">): void {
  if (typeof window === "undefined") return;
  try {
    const payload: PersistedSurvey = { v: 3, ...data };
    localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // quota / private mode
  }
}
