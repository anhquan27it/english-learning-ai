"use client";

import { useEffect, useMemo, useState } from "react";
import type { MatchScene } from "@/lib/types";
import { sfx } from "@/lib/sfx";
import { ActivityHeader, praise, ResultBanner, shuffle, type ActivityProps } from "./common";

/** Trò chơi ghép cặp có tính giờ: chọn một thẻ bên trái rồi chọn thẻ tương ứng bên phải (hoặc kéo thả). */
export function Match({ scene, onDone, teacherSay, speakEn }: ActivityProps<MatchScene>) {
  const left = useMemo(() => scene.pairs.map((p, i) => ({ text: p.left, key: i })), [scene]);
  const right = useMemo(() => shuffle(scene.pairs.map((p, i) => ({ text: p.right, key: i })), scene.pairs.length + 3), [scene]);
  const [sel, setSel] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const done = matched.size === scene.pairs.length;

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [done]);

  function pick(rightKey: number, leftKey = sel) {
    if (leftKey === null || matched.has(rightKey)) return;
    if (leftKey === rightKey) {
      sfx.correct();
      const next = new Set(matched).add(rightKey);
      setMatched(next);
      setSel(null);
      if (next.size === scene.pairs.length) {
        sfx.win();
        teacherSay(`${praise()} Bạn ghép xong trong ${seconds} giây${mistakes ? `, sai ${mistakes} lần` : ""}.`);
        onDone(scene.pairs.length / (scene.pairs.length + mistakes));
      }
    } else {
      sfx.wrong();
      setMistakes((m) => m + 1);
      setWrong(rightKey);
      setTimeout(() => setWrong(null), 600);
    }
  }

  function retry() {
    setMatched(new Set());
    setMistakes(0);
    setSeconds(0);
    setSel(null);
  }

  const card = "w-full rounded-xl px-4 py-3 text-left font-semibold transition select-none";

  return (
    <div>
      <ActivityHeader title={scene.title} intro={scene.intro ?? "Chọn một thẻ bên trái, rồi chọn thẻ phù hợp bên phải."} icon="🔗" />
      <div className="mb-3 flex gap-4 text-sm text-slate-500">
        <span>⏱ {seconds}s</span>
        <span>
          ✅ {matched.size}/{scene.pairs.length}
        </span>
        <span>❌ {mistakes}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-8">
        <div className="space-y-2">
          {left.map((l) => (
            <button
              key={l.key}
              draggable={!matched.has(l.key)}
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", String(l.key));
                setSel(l.key);
              }}
              disabled={matched.has(l.key)}
              onClick={() => {
                setSel(l.key);
                speakEn(l.text);
              }}
              className={`${card} ${
                matched.has(l.key) ? "bg-emerald-100 text-emerald-800 opacity-70" : sel === l.key ? "bg-orange-600 text-white shadow-lg" : "bg-white ring-1 ring-slate-200 hover:ring-orange-400"
              }`}
            >
              {l.text}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {right.map((r) => (
            <button
              key={r.key}
              disabled={matched.has(r.key)}
              onClick={() => pick(r.key)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                pick(r.key, Number(e.dataTransfer.getData("text/plain")));
              }}
              className={`${card} ${
                matched.has(r.key)
                  ? "anim-pop bg-emerald-100 text-emerald-800 opacity-70"
                  : wrong === r.key
                    ? "anim-shake bg-rose-100 text-rose-700"
                    : sel !== null
                      ? "bg-white ring-2 ring-orange-200 hover:bg-orange-50"
                      : "bg-white ring-1 ring-slate-200"
              }`}
            >
              {r.text}
            </button>
          ))}
        </div>
      </div>
      {done && <ResultBanner score={scene.pairs.length} total={scene.pairs.length + mistakes} onRetry={retry} />}
    </div>
  );
}
