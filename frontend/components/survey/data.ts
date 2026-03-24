export const MAX_MOMENTS = 3;
export const ORG_SIZE_OPTIONS = [
  "1-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001-5000",
  "5001-10000",
  "10000+",
] as const;

export type StageKey = "parent" | "caregiver" | "pet" | "newjoiner" | "empty" | "solo";
export type WishKey = "peace" | "time" | "health" | "seen" | "setup" | "nothing";
export type Card = { icon: string; name?: string; desc?: string; text?: string };

export const stepMeta = [
  { l: "Life stages", n: "1 of 5" },
  { l: "What runs in your mind", n: "2 of 5" },
  { l: "Real impact at work", n: "3 of 5" },
  { l: "Employer awareness", n: "4 of 5" },
  { l: "What would help", n: "5 of 5" },
];

export const stageData: Record<
  StageKey,
  { label: string; icon: string; color: string; bg: string; title: string; description: string }
> = {
  parent: { label: "Young parent", icon: "👶", color: "#E85D24", bg: "#fff3ef", title: "Young children", description: "Raising kids under 12" },
  caregiver: { label: "Sandwich gen", icon: "🧓", color: "#185FA5", bg: "#edf4ff", title: "Aging parents", description: "Managing their health" },
  pet: { label: "Pet parent", icon: "🐾", color: "#0F6E56", bg: "#edfaf4", title: "Pet parent", description: "A pet who needs me" },
  newjoiner: { label: "New joiner", icon: "🌱", color: "#3B6D11", bg: "#f2f9ea", title: "New joiner", description: "Joined in last 6 months" },
  empty: { label: "Empty nester", icon: "🌅", color: "#854F0B", bg: "#fff8ee", title: "Empty nester", description: "Kids grown, focusing on me" },
  solo: { label: "Solo pro", icon: "💼", color: "#534AB7", bg: "#f4f3ff", title: "Just me", description: "No dependants" },
};

export const emotionsByStage: Record<StageKey, Card[]> = {
  parent: [{ icon: "😰", name: "Child safety", desc: "Is my child okay when I am not there?" }, { icon: "📱", name: "Screen time guilt", desc: "Too much device, not enough real connection" }, { icon: "😓", name: "Working parent guilt", desc: "Never feel fully present anywhere" }, { icon: "🏃", name: "Logistics stress", desc: "Pickup, dropoff, activity scheduling" }],
  caregiver: [{ icon: "❤️", name: "Parent health fear", desc: "What if something happens at work?" }, { icon: "🏠", name: "Parent home alone", desc: "No one checking on them during the day" }, { icon: "💊", name: "Medication worry", desc: "Did they remember to take their medicines?" }, { icon: "📞", name: "Emergency call dread", desc: "The call I fear receiving mid-meeting" }],
  pet: [{ icon: "🐶", name: "Pet alone all day", desc: "Are they anxious or okay right now?" }, { icon: "🏥", name: "Pet health worry", desc: "Cannot always tell when something is wrong" }, { icon: "🚪", name: "Safety and escape", desc: "What if they get out or get hurt?" }, { icon: "💰", name: "Unexpected vet cost", desc: "No warning and a very large bill" }],
  newjoiner: [{ icon: "💻", name: "WFH setup gap", desc: "Home office is not properly set up" }, { icon: "😬", name: "Proving myself", desc: "Still establishing trust in a new place" }, { icon: "📚", name: "Learning curve", desc: "A lot to absorb in very little time" }, { icon: "🔌", name: "Missing tools", desc: "Small gaps that slow me down every day" }],
  empty: [{ icon: "🌀", name: "Loss of purpose", desc: "Who am I now the kids do not need me daily?" }, { icon: "🏋️", name: "Health declining", desc: "Not prioritising myself the way I should" }, { icon: "✈️", name: "Postponed living", desc: "Travel and passions always get pushed back" }, { icon: "😴", name: "Energy and sleep", desc: "Not recovering the way I used to" }],
  solo: [{ icon: "⚖️", name: "No work boundary", desc: "Work bleeds into every personal hour" }, { icon: "🏠", name: "Home feels off", desc: "Setup and comfort - small things add up" }, { icon: "🧘", name: "Mental load", desc: "No one to share the daily burden with" }, { icon: "💪", name: "Fitness falling", desc: "Intention exists but follow through is hard" }],
};

export const momentsByStage: Record<StageKey, Card[]> = {
  parent: [{ icon: "📱", text: "Checked phone mid-meeting for school alert" }, { icon: "😶", text: "Was physically at work but mentally at home" }, { icon: "📞", text: "Took a personal call about my child at work" }, { icon: "🏃", text: "Had to leave early for a child related situation" }],
  caregiver: [{ icon: "🚶", text: "Stepped out of a meeting to check on a parent" }, { icon: "💔", text: "Got a health scare call during work hours" }, { icon: "📋", text: "Spent work time arranging a doctor visit" }, { icon: "😔", text: "Distracted all day after a difficult evening" }],
  pet: [{ icon: "🐾", text: "Worried about my pet the whole workday" }, { icon: "🏥", text: "Had to handle a vet situation during work" }, { icon: "🚪", text: "Left early or came late due to a pet situation" }, { icon: "💭", text: "Could not concentrate thinking about my pet" }],
  newjoiner: [{ icon: "💻", text: "Poor home setup affected my work quality" }, { icon: "😟", text: "Missed something important while still settling in" }, { icon: "📉", text: "Felt below par compared to what I should be" }, { icon: "🔇", text: "Technical issues embarrassed me in a meeting" }],
  empty: [{ icon: "🌀", text: "Felt empty in a way that followed me to work" }, { icon: "😓", text: "Realised mid-week I had done nothing for myself" }, { icon: "🔋", text: "Energy or focus noticeably lower than before" }, { icon: "⏳", text: "Kept postponing something I genuinely wanted to do" }],
  solo: [{ icon: "🌙", text: "Work followed me into every personal hour" }, { icon: "🧠", text: "Mental load of managing everything alone" }, { icon: "🔕", text: "No real off switch between work and personal time" }, { icon: "😶", text: "No one to decompress with after a hard day" }],
};

/** Index 1–5 = scale options (matches Step4 awareness values) */
export const AWARENESS_LABELS = ["", "Not at all", "Barely", "A little", "Fairly well", "Very well"] as const;

/** Human-readable label for the selected awareness value (1–5). */
export function awarenessLabel(value: number | null | undefined): string {
  if (value == null || value < 1 || value > 5) return "";
  return AWARENESS_LABELS[value] ?? "";
}

/**
 * For API / legacy payloads: if the field is only a digit 1–5, replace with its label;
 * otherwise keep as-is (already a label or empty).
 */
export function normalizeAwarenessField(raw: string | undefined): string {
  const t = (raw ?? "").trim();
  if (/^\d+$/.test(t)) {
    const n = parseInt(t, 10);
    if (n >= 1 && n <= 5) return AWARENESS_LABELS[n] ?? t;
  }
  return t;
}

export function normalizeOrgSize(value: string | null | undefined): string {
  const trimmed = (value ?? "").trim();
  return ORG_SIZE_OPTIONS.includes(trimmed as (typeof ORG_SIZE_OPTIONS)[number]) ? trimmed : "";
}

export const wishLabels: Record<WishKey, string> = {
  peace: "Peace of mind - safety of loved ones",
  time: "Time back from daily chores and logistics",
  health: "Health visibility for self or someone I care for",
  seen: "To feel seen and acknowledged at work",
  setup: "A better home and WFH setup",
  nothing: "I manage well on my own",
};

export function iconForEmotion(name: string): string {
  const all = Object.values(emotionsByStage).flat();
  return all.find((e) => e.name === name)?.icon ?? "💭";
}
