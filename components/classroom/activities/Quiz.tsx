"use client";

import { useState } from "react";
import type { QuizScene } from "@/lib/types";
import { sfx } from "@/lib/sfx";
import { ActivityHeader, praise, ResultBanner, type ActivityProps } from "./common";

export function Quiz({ scene, onDone, teacherSay }: ActivityProps<QuizScene>) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const q = scene.questions[idx];

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const ok = i === q.answer;
    if (ok) {
      sfx.correct();
      setScore((s) => s + 1);
      teacherSay(praise() + (q.explain ? " " + q.explain : ""));
    } else {
      sfx.wrong();
      teacherSay(`Chưa đúng rồi. Đáp án là \`${q.options[q.answer]}\`. ${q.explain ?? ""}`);
    }
  }

  function next() {
    if (idx + 1 < scene.questions.length) {
      setIdx(idx + 1);
      setPicked(null);
    } else {
      setFinished(true);
      sfx.win();
      onDone(score / scene.questions.length);
    }
  }

  function retry() {
    setIdx(0);
    setPicked(null);
    setScore(0);
    setFinished(false);
  }

  return (
    <div>
      <ActivityHeader title={scene.title} intro={scene.intro} icon="❓" />
      {!finished ? (
        <div key={idx} className="anim-in">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
            <span>
              Câu {idx + 1}/{scene.questions.length}
            </span>
            <span>⭐ {score}</span>
          </div>
          <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full bg-orange-500 transition-all" style={{ width: `${(idx / scene.questions.length) * 100}%` }} />
          </div>
          <p className="my-5 text-xl font-semibold text-slate-900">{q.q}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {q.options.map((opt, i) => {
              const state = picked === null ? "idle" : i === q.answer ? "right" : i === picked ? "wrong" : "dim";
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  className={`rounded-xl border-2 px-4 py-3 text-left font-medium transition ${
                    state === "idle"
                      ? "border-slate-200 bg-white hover:border-orange-400 hover:bg-orange-50"
                      : state === "right"
                        ? "anim-pop border-emerald-500 bg-emerald-50 text-emerald-800"
                        : state === "wrong"
                          ? "anim-shake border-rose-400 bg-rose-50 text-rose-800"
                          : "border-slate-200 bg-white opacity-50"
                  }`}
                >
                  <span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div className="anim-in mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-100 px-4 py-3">
              <span className="text-sm text-slate-700">{q.explain ?? (picked === q.answer ? "Chính xác!" : `Đáp án: ${q.options[q.answer]}`)}</span>
              <button onClick={next} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
                {idx + 1 < scene.questions.length ? "Câu tiếp →" : "Xem kết quả"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <ResultBanner score={score} total={scene.questions.length} onRetry={retry} />
      )}
    </div>
  );
}
