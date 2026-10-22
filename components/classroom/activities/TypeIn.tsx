"use client";

// Dùng chung cho hai hoạt động gõ đáp án: điền vào chỗ trống (fill) và sửa lỗi sai (fix).

import { useState } from "react";
import type { FillScene, FixScene } from "@/lib/types";
import { sfx } from "@/lib/sfx";
import { ActivityHeader, normalize, praise, ResultBanner, type ActivityProps } from "./common";

type Item = { prompt: string; answers: string[]; explain?: string; hint?: string };

function toItems(scene: FillScene | FixScene): Item[] {
  return scene.type === "fill"
    ? scene.items.map((i) => ({ prompt: i.sentence, answers: i.answers, explain: i.explain, hint: i.hint }))
    : scene.items.map((i) => ({ prompt: i.wrong, answers: i.answers, explain: i.explain }));
}

export function TypeIn({ scene, onDone, teacherSay, speakEn }: ActivityProps<FillScene | FixScene>) {
  const items = toItems(scene);
  const isFix = scene.type === "fix";
  const [values, setValues] = useState<string[]>(() => items.map((i) => (isFix ? i.prompt : "")));
  const [checked, setChecked] = useState(false);
  const results = items.map((it, i) => it.answers.some((a) => normalize(a) === normalize(values[i])));
  const score = results.filter(Boolean).length;

  function check() {
    setChecked(true);
    const s = results.filter(Boolean).length;
    if (s === items.length) {
      sfx.win();
      teacherSay(praise() + " Bạn làm đúng hết rồi!");
    } else {
      sfx.wrong();
      teacherSay(`Bạn đúng ${s} trên ${items.length} câu. Hãy xem đáp án màu xanh để rút kinh nghiệm nhé.`);
    }
    onDone(s / items.length);
  }

  function retry() {
    setChecked(false);
    setValues(items.map((i) => (isFix ? i.prompt : "")));
  }

  return (
    <div>
      <ActivityHeader title={scene.title} intro={scene.intro ?? (isFix ? "Sửa lại câu cho đúng." : "Điền vào chỗ trống.")} icon={isFix ? "🛠️" : "✏️"} />
      <ol className="space-y-3">
        {items.map((it, i) => {
          const ok = results[i];
          return (
            <li key={i} className="anim-in rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200" style={{ animationDelay: `${i * 60}ms` }}>
              {isFix ? (
                <>
                  <div className="mb-2 text-sm text-rose-700">
                    {i + 1}. ❌ <span className="line-through">{it.prompt}</span>
                  </div>
                  <input
                    value={values[i]}
                    disabled={checked}
                    onChange={(e) => setValues((v) => v.map((x, j) => (j === i ? e.target.value : x)))}
                    className={`w-full rounded-lg border-2 px-3 py-2 outline-none focus:border-orange-400 ${
                      checked ? (ok ? "border-emerald-400 bg-emerald-50" : "border-rose-300 bg-rose-50") : "border-slate-200"
                    }`}
                  />
                </>
              ) : (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-lg">
                  <span className="text-sm font-semibold text-slate-400">{i + 1}.</span>
                  {it.prompt.split("___").map((part, k, arr) => (
                    <span key={k} className="contents">
                      <span>{part}</span>
                      {k < arr.length - 1 && (
                        <input
                          value={values[i]}
                          disabled={checked}
                          placeholder="…"
                          onChange={(e) => setValues((v) => v.map((x, j) => (j === i ? e.target.value : x)))}
                          style={{ width: `${Math.max(6, (it.answers[0]?.length ?? 6) + 2)}ch` }}
                          className={`rounded-lg border-b-2 bg-slate-50 px-2 py-0.5 text-center font-semibold outline-none focus:border-orange-500 ${
                            checked ? (ok ? "border-emerald-500 text-emerald-700" : "border-rose-400 text-rose-700") : "border-slate-300"
                          }`}
                        />
                      )}
                    </span>
                  ))}
                </div>
              )}
              {checked && (
                <div className="anim-in mt-2 flex items-center gap-2 text-sm">
                  {ok ? <span className="text-emerald-700">✅ Đúng</span> : <span className="text-emerald-700">✅ Đáp án: {it.answers[0]}</span>}
                  <button onClick={() => speakEn(isFix ? it.answers[0] : it.prompt.replace("___", it.answers[0]))} title="Nghe" className="ml-1">
                    🔊
                  </button>
                  {it.explain && <span className="text-slate-500">· {it.explain}</span>}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {!checked ? (
        <button onClick={check} className="mt-5 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white shadow hover:bg-orange-700">
          Kiểm tra đáp án
        </button>
      ) : (
        <ResultBanner score={score} total={items.length} onRetry={retry} />
      )}
    </div>
  );
}
