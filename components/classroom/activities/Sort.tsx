"use client";

import { useMemo, useState } from "react";
import type { SortScene } from "@/lib/types";
import { sfx } from "@/lib/sfx";
import { ActivityHeader, praise, ResultBanner, shuffle, type ActivityProps } from "./common";

/** Trò chơi kéo thả phân loại. Trên thiết bị cảm ứng: chạm chọn từ rồi chạm vào nhóm. */
export function Sort({ scene, onDone, teacherSay, speakEn }: ActivityProps<SortScene>) {
  const items = useMemo(() => shuffle(scene.items.map((it, i) => ({ ...it, key: i })), scene.items.length), [scene]);
  const [placed, setPlaced] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [wrongKey, setWrongKey] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [overCat, setOverCat] = useState<string | null>(null);
  const done = Object.keys(placed).length === items.length;

  function drop(key: number, cat: string) {
    const item = items.find((i) => i.key === key);
    if (!item || placed[key]) return;
    setSelected(null);
    if (item.category === cat) {
      sfx.correct();
      const next = { ...placed, [key]: cat };
      setPlaced(next);
      if (Object.keys(next).length === items.length) {
        sfx.win();
        const score = Math.max(0, (items.length - mistakes) / items.length);
        teacherSay(mistakes === 0 ? praise() + " Bạn phân loại đúng tất cả ngay lần đầu!" : `Hoàn thành! Bạn sai ${mistakes} lần, lần sau sẽ tốt hơn nhé.`);
        onDone(score);
      }
    } else {
      sfx.wrong();
      setMistakes((m) => m + 1);
      setWrongKey(key);
      setTimeout(() => setWrongKey(null), 650);
    }
  }

  function retry() {
    setPlaced({});
    setMistakes(0);
  }

  const pool = items.filter((i) => !placed[i.key]);

  return (
    <div>
      <ActivityHeader title={scene.title} intro={scene.intro} icon="🧲" />
      <div className="min-h-16 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-3">
        <div className="flex flex-wrap gap-2">
          {pool.length === 0 && <span className="text-sm text-slate-400">Đã xếp hết các thẻ 🎉</span>}
          {pool.map((it) => (
            <button
              key={it.key}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", String(it.key));
                sfx.pop();
              }}
              onClick={() => {
                setSelected(selected === it.key ? null : it.key);
                speakEn(it.text);
              }}
              className={`cursor-grab select-none rounded-xl px-4 py-2 font-semibold shadow-sm transition active:cursor-grabbing ${
                wrongKey === it.key ? "anim-shake bg-rose-500 text-white" : selected === it.key ? "-translate-y-1 bg-orange-600 text-white shadow-lg" : "bg-white text-slate-800 ring-1 ring-slate-200 hover:-translate-y-0.5"
              }`}
            >
              {it.text}
            </button>
          ))}
        </div>
      </div>

      <div className={`mt-4 grid gap-3 ${scene.categories.length > 3 ? "sm:grid-cols-2 lg:grid-cols-4" : scene.categories.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {scene.categories.map((c) => (
          <div
            key={c.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCat(c.id);
            }}
            onDragLeave={() => setOverCat(null)}
            onDrop={(e) => {
              e.preventDefault();
              setOverCat(null);
              drop(Number(e.dataTransfer.getData("text/plain")), c.id);
            }}
            onClick={() => selected !== null && drop(selected, c.id)}
            className={`min-h-36 rounded-2xl border-2 p-3 transition ${
              overCat === c.id ? "scale-[1.02] border-orange-500 bg-orange-50" : selected !== null ? "cursor-pointer border-orange-300 bg-white" : "border-slate-200 bg-white"
            }`}
          >
            <div className="mb-2 font-bold text-slate-800">{c.label}</div>
            <div className="flex flex-wrap gap-1.5">
              {items
                .filter((i) => placed[i.key] === c.id)
                .map((i) => (
                  <span key={i.key} className="anim-pop rounded-lg bg-emerald-100 px-2.5 py-1 text-sm font-semibold text-emerald-800">
                    {i.text}
                  </span>
                ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-sm text-slate-500">
        Đã xếp {Object.keys(placed).length}/{items.length} · Sai {mistakes} lần
      </div>
      {done && <ResultBanner score={Math.max(0, items.length - mistakes)} total={items.length} onRetry={retry} />}
    </div>
  );
}
