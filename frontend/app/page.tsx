"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import ProgressHeader from "@/components/survey/ProgressHeader";
import Step1LifeStages from "@/components/survey/Step1LifeStages";
import Step2Emotions from "@/components/survey/Step2Emotions";
import Step3Moments from "@/components/survey/Step3Moments";
import Step4Awareness from "@/components/survey/Step4Awareness";
import Step5Wishes from "@/components/survey/Step5Wishes";
import SurveyResults from "@/components/survey/SurveyResults";
import {
  Card,
  MAX_MOMENTS,
  StageKey,
  WishKey,
  awarenessLabel,
  emotionsByStage,
  momentsByStage,
  stageData,
  wishLabels,
} from "@/components/survey/data";
import { loadSurveyFromStorage, saveSurveyToStorage } from "@/lib/survey-storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function Home() {
  const [step, setStep] = useState(1);
  const [selStages, setSelStages] = useState<StageKey[]>([]);
  const [selEmotions, setSelEmotions] = useState<string[]>([]);
  const [selMoments, setSelMoments] = useState<string[]>([]);
  const [awareness, setAwareness] = useState<number | null>(null);
  const [selWishes, setSelWishes] = useState<WishKey[]>([]);
  const [submissionCount, setSubmissionCount] = useState<number>(0);
  const [emailState, setEmailState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  /** After successful submit — cannot answer or submit again (this browser) */
  const [submitted, setSubmitted] = useState(false);

  // Optional contact info
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [orgSize, setOrgSize] = useState("");

  const skipSave = useRef(true);

  useLayoutEffect(() => {
    const p = loadSurveyFromStorage();
    if (p) {
      if (p.submitted) {
        setSubmitted(true);
        setStep(6);
      } else if (typeof p.step === "number" && p.step >= 1 && p.step <= 6) {
        setStep(p.step);
      }
      if (p.selStages) setSelStages(p.selStages);
      if (p.selEmotions) setSelEmotions(p.selEmotions);
      if (p.selMoments) setSelMoments(p.selMoments);
      if ("awareness" in p) setAwareness(p.awareness ?? null);
      if (p.selWishes) setSelWishes(p.selWishes);
      if (typeof p.submissionNumber === "number") setSubmissionCount(p.submissionNumber);
      if (p.emailState) setEmailState(p.emailState);
      if (p.email) setEmail(p.email);
      if (p.name) setName(p.name);
      if (p.orgSize) setOrgSize(p.orgSize);
    }
    skipSave.current = false;
  }, []);

  useEffect(() => {
    if (skipSave.current) return;
    saveSurveyToStorage({
      step: submitted ? 6 : step,
      selStages,
      selEmotions,
      selMoments,
      awareness,
      selWishes,
      submitted,
      submissionNumber: submissionCount,
      emailState,
      email,
      name,
      orgSize,
    });
  }, [step, selStages, selEmotions, selMoments, awareness, selWishes, submitted, submissionCount, emailState, email, name, orgSize]);

  const emotions = useMemo(() => {
    const seen = new Set<string>();
    const merged: Card[] = [];
    selStages.forEach((s) => {
      emotionsByStage[s].forEach((e) => {
        if (e.name && !seen.has(e.name)) {
          seen.add(e.name);
          merged.push(e);
        }
      });
    });
    return merged;
  }, [selStages]);

  const moments = useMemo(() => {
    const seen = new Set<string>();
    const merged: Card[] = [];
    selStages.forEach((s) => {
      let added = 0;
      momentsByStage[s].forEach((m) => {
        if (m.text && !seen.has(m.text) && added < 2) {
          seen.add(m.text);
          merged.push(m);
          added += 1;
        }
      });
    });
    return merged.slice(0, 6);
  }, [selStages]);

  function toggleStage(key: StageKey) {
    if (submitted) return;
    setSelStages((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
    setSelEmotions([]);
    setSelMoments([]);
  }

  function toggleEmotion(name: string) {
    if (submitted) return;
    setSelEmotions((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]));
  }

  function toggleMoment(text: string) {
    if (submitted) return;
    setSelMoments((prev) => {
      if (prev.includes(text)) return prev.filter((x) => x !== text);
      if (prev.length >= MAX_MOMENTS) return prev;
      return [...prev, text];
    });
  }

  function toggleWish(key: WishKey) {
    if (submitted) return;
    if (key === "nothing") {
      setSelWishes(["nothing"]);
      return;
    }
    setSelWishes((prev) => {
      const withoutNothing = prev.filter((x) => x !== "nothing");
      if (withoutNothing.includes(key)) return withoutNothing.filter((x) => x !== key);
      return [...withoutNothing, key];
    });
  }

  async function showResults() {
    if (submitted) return;
    setStep(6);
    await sendSurveyToBackend();
  }

  async function sendSurveyToBackend() {
    if (submitted) return;

    setEmailState("sending");

    const payload = {
      life_stages: selStages.map((s) => stageData[s].title).join(", "),
      emotions: selEmotions.join(", "),
      moments: selMoments.join(", "),
      awareness: awarenessLabel(awareness),
      wishes: selWishes.map((w) => wishLabels[w]).join(", "),
      email: email.trim() || null,
      name: name.trim() || null,
      org_size: orgSize.trim() || null,
    };

    try {
      const res = await fetch(`${API_URL}/api/submit-survey`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok?: boolean; submissionNumber?: number; error?: string };

      if (!res.ok || !data.ok) {
        setEmailState("error");
        return;
      }

      setSubmissionCount(typeof data.submissionNumber === "number" ? data.submissionNumber : 0);
      setEmailState("sent");
      setSubmitted(true);
    } catch {
      setEmailState("error");
    }
  }

  const showForm = !submitted;

  return (
    <main className="mx-auto w-full max-w-[620px] bg-white px-5 py-6 text-[#111]">
      <ProgressHeader step={submitted ? 6 : step} />

      {showForm && (
        <>
          {step === 1 && <Step1LifeStages selStages={selStages} onToggleStage={toggleStage} onContinue={() => setStep(2)} />}
          {step === 2 && (
            <Step2Emotions
              emotions={emotions}
              selEmotions={selEmotions}
              onToggleEmotion={toggleEmotion}
              onBack={() => setStep(1)}
              onSkip={() => setStep(3)}
              onContinue={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <Step3Moments
              moments={moments}
              selMoments={selMoments}
              onToggleMoment={toggleMoment}
              onBack={() => setStep(2)}
              onSkip={() => setStep(4)}
              onContinue={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <Step4Awareness
              awareness={awareness}
              onSelect={(v) => {
                if (!submitted) setAwareness(v);
              }}
              onBack={() => setStep(3)}
              onContinue={() => setStep(5)}
            />
          )}
          {step === 5 && (
            <Step5Wishes
              selWishes={selWishes}
              onToggleWish={toggleWish}
              onBack={() => setStep(4)}
              onSubmit={showResults}
              email={email}
              name={name}
              orgSize={orgSize}
              onEmailChange={setEmail}
              onNameChange={setName}
              onOrgSizeChange={setOrgSize}
            />
          )}
        </>
      )}

      {(submitted || step === 6) && (
        <SurveyResults
          selStages={selStages}
          selEmotions={selEmotions}
          selMoments={selMoments}
          awareness={awareness}
          selWishes={selWishes}
          emailState={emailState}
          submissionCount={submissionCount}
          completedLocked={submitted}
          onRetryEmail={!submitted && emailState === "error" ? () => void sendSurveyToBackend() : undefined}
        />
      )}
    </main>
  );
}
