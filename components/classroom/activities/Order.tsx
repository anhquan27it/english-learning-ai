"use client";

import { useMemo, useState } from "react";
import type { OrderScene } from "@/lib/types";
import { sfx } from "@/lib/sfx";
import { ActivityHeader, normalize, praise, ResultBanner, shuffle, type ActivityProps } from "./common";

/** Sắp xếp các từ thành câu đúng. */
export function Order({ scene, onDone, teacherSay, speakEn }: ActivityProps<OrderScene>) {
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<number[]>([]);
  const [status, setStatus] = useState<"idle" | "right" | "wrong">("idle");
  const [firstTry, setFirstTry] = useState(true);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const s = scene.sentences[idx];
  const words = useMemo(() => shuffle(s.answer.split(/\s+/), idx + s.answer.length), [s, idx]);

  function check() {
    const built = chosen.map((i) => words[i]).join(" ");
    if (normalize(built) === normalize(s.answer)) {
      sfx.correct();
      setStatus("right");
      if (firstTry) setScore((x) => x + 1);
      teacherSay(praise());
      speakEn(s.answer);
    } else {
      sfx.wrong();
      setStatus("wrong");
      setFirstTry(false);
      teacherSay("Chưa đúng thứ tự. Bạn thử lại nhé, chạm vào từ đã chọn để bỏ ra.");
    }
  }

  function next() {
    if (idx + 1 < scene.sentences.length) {
      setIdx(idx + 1);
      setChosen([]);
      setStatus("idle");
      setFirstTry(true);
    } else {
      setFinished(true);
      sfx.win();
      onDone(score / scene.sentences.length);
    }
  }

  function retry() {
    setIdx(0);
    setChosen([]);
    setStatus("idle");
    setFirstTry(true);
    setScore(0);
    setFinished(false);
  }

  if (finished)
    return (
      <div>
        <ActivityHeader title={scene.title} intro={scene.intro} icon="🧱" />
        <ResultBanner score={score} total={scene.sentences.length} onRetry={retry} />
      </div>
    );

  return (
    <div>
      <ActivityHeader title={scene.title} intro={scene.intro ?? "Chạm vào các từ theo đúng thứ tự để tạo câu."} icon="🧱" />
      <div className="mb-2 text-sm text-slate-500">
        Câu {idx + 1}/{scene.sentences.length} {s.vi && <>· Nghĩa: “{s.vi}”</>}
      </div>
      <div
        className={`flex min-h-16 flex-wrap items-center gap-2 rounded-2xl border-2 p-3 transition ${
          status === "right" ? "border-emerald-400 bg-emerald-50" : status === "wrong" ? "anim-shake border-rose-300 bg-rose-50" : "border-orange-200 bg-orange-50/50"
        }`}
      >
        {chosen.length === 0 && <span className="text-sm text-slate-400">Câu của bạn sẽ hiện ở đây…</span>}
        {chosen.map((wi, k) => (
          <button
            key={k}
            disabled={status === "right"}
            onClick={() => {
              setChosen(chosen.filter((_, j) => j !== k));
              setStatus("idle");
            }}
            className="anim-pop rounded-lg bg-orange-600 px-3 py-1.5 font-semibold text-white shadow"
          >
            {words[wi]}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {words.map((w, i) =>
          chosen.includes(i) ? (
            <span key={i} className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold text-transparent">
              {w}
            </span>
          ) : (
            <button
              key={i}
              onClick={() => {
                sfx.pop();
                setChosen([...chosen, i]);
                setStatus("idle");
              }}
              className="rounded-lg bg-white px-3 py-1.5 font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5"
            >
              {w}
            </button>
          ),
        )}
      </div>
      <div className="mt-5 flex gap-3">
        {status !== "right" ? (
          <button
            onClick={check}
            disabled={chosen.length !== words.length}
            className="rounded-xl bg-orange-600 px-5 py-2.5 font-semibold text-white shadow hover:bg-orange-700 disabled:opacity-40"
          >
            Kiểm tra
          </button>
        ) : (
          <button onClick={next} className="rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white shadow hover:bg-emerald-700">
            {idx + 1 < scene.sentences.length ? "Câu tiếp →" : "Xem kết quả"}
          </button>
        )}
        <button onClick={() => setChosen([])} className="rounded-xl px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100">
          Xóa hết
        </button>
      </div>
    </div>
  );
}
