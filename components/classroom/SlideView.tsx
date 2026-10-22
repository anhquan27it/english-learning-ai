"use client";

import type { Block, SlideScene } from "@/lib/types";
import { Rich } from "../Rich";

interface Props {
  scene: SlideScene;
  visible: Set<string>;
  spotlight: string | null;
  onSpeakExample: (text: string) => void;
}

export function SlideView({ scene, visible, spotlight, onSpeakExample }: Props) {
  // Ảnh minh họa đặt bên phải, phần còn lại xếp theo cột.
  const images = scene.blocks.filter((b) => b.kind === "image");
  const others = scene.blocks.filter((b) => b.kind !== "image");

  return (
    <div className="flex h-full flex-col">
      <div className="anim-in" key={scene.id}>
        <div className="mb-4 h-2 w-16 rounded-full bg-orange-500" />
        <h2 className="text-3xl font-extrabold tracking-tight text-stone-900 md:text-[2.75rem] md:leading-tight">{scene.title}</h2>
        {scene.subtitle && <p className="mt-2 text-lg font-semibold text-orange-600 md:text-xl">{scene.subtitle}</p>}
      </div>
      <div className={`mt-8 grid flex-1 gap-8 ${images.length ? "md:grid-cols-[1fr_240px]" : ""}`}>
        <div className="space-y-5">
          {others.map((b) => (
            <BlockWrap key={b.id} block={b} visible={visible} spotlight={spotlight}>
              <BlockView block={b} onSpeakExample={onSpeakExample} />
            </BlockWrap>
          ))}
        </div>
        {images.length > 0 && (
          <div className="order-first flex items-center justify-center gap-4 md:order-none md:flex-col">
            {images.map((b) => (
              <BlockWrap key={b.id} block={b} visible={visible} spotlight={spotlight}>
                <BlockView block={b} onSpeakExample={onSpeakExample} />
              </BlockWrap>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BlockWrap({ block, visible, spotlight, children }: { block: Block; visible: Set<string>; spotlight: string | null; children: React.ReactNode }) {
  if (!visible.has(block.id)) return null;
  return (
    <div data-block={block.id} className={`anim-in transition-shadow ${spotlight === block.id ? "spotlight" : ""}`}>
      {children}
    </div>
  );
}

const TONE: Record<string, string> = {
  lead: "text-xl leading-relaxed text-slate-700 md:text-2xl",
  note: "rounded-2xl bg-slate-100 px-5 py-4 text-lg text-slate-700 md:text-xl",
  tip: "rounded-2xl border-l-[6px] border-emerald-400 bg-emerald-50 px-5 py-4 text-lg text-emerald-900 md:text-xl",
  warn: "rounded-2xl border-l-[6px] border-amber-400 bg-amber-50 px-5 py-4 text-lg text-amber-900 md:text-xl",
};
const TONE_ICON: Record<string, string> = { tip: "💡 ", warn: "⚠️ ", note: "📌 " };

function SpeakButton({ text, onSpeak }: { text: string; onSpeak: (t: string) => void }) {
  return (
    <button
      onClick={() => onSpeak(text)}
      title="Nghe phát âm"
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-orange-100 text-lg text-orange-700 transition hover:scale-110 hover:bg-orange-200"
    >
      🔊
    </button>
  );
}

function highlightEn(en: string, words: string[] = []) {
  if (!words.length) return en;
  let out = en;
  for (const w of words) out = out.replace(w, `==${w}==`);
  return out;
}

function BlockView({ block: b, onSpeakExample }: { block: Block; onSpeakExample: (t: string) => void }) {
  switch (b.kind) {
    case "text":
      return (
        <p className={TONE[b.tone ?? "lead"] ?? ""}>
          {TONE_ICON[b.tone ?? ""] ?? ""}
          <Rich text={b.text} />
        </p>
      );
    case "bullets":
      return (
        <ul className="space-y-3">
          {b.items.map((it, i) => (
            <li key={i} className="flex gap-3 text-xl text-slate-700 md:text-2xl">
              <span className="mt-3 h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500" />
              <Rich text={it} />
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-base md:text-lg">
            <thead className="bg-orange-50 text-orange-900">
              <tr>
                {b.headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i} className="border-t border-slate-100 odd:bg-white even:bg-slate-50/60">
                  {r.map((c, j) => (
                    <td key={j} className="px-4 py-3 align-top text-slate-700">
                      <Rich text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "formula":
      return (
        <div className="flex flex-wrap items-center gap-3">
          {b.label && <span className="mr-1 text-base font-bold text-slate-500 md:text-lg">{b.label}</span>}
          {b.parts.map((p, i) =>
            p === "+" || p === "," || p === "?" ? (
              <span key={i} className="text-2xl font-bold text-slate-400">
                {p}
              </span>
            ) : (
              <span key={i} className="anim-pop rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 px-4 py-2 text-lg font-bold text-white shadow md:text-xl" style={{ animationDelay: `${i * 70}ms` }}>
                {p}
              </span>
            ),
          )}
        </div>
      );
    case "example":
      return (
        <div className="flex items-start gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200">
          <SpeakButton text={b.en} onSpeak={onSpeakExample} />
          <div>
            <div className="text-xl font-semibold text-slate-900 md:text-2xl">
              <Rich text={highlightEn(b.en, b.highlight)} />
            </div>
            {b.vi && <div className="mt-1 text-base text-slate-500 md:text-lg">{b.vi}</div>}
          </div>
        </div>
      );
    case "compare":
      return (
        <div className="grid gap-3 rounded-2xl bg-white p-4 text-lg shadow-sm ring-1 ring-slate-200 sm:grid-cols-2 md:text-xl">
          <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-4 py-3 text-rose-800">
            <span>❌</span>
            <span className="line-through decoration-rose-300">{b.wrong}</span>
          </div>
          <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-800">
            <span>✅</span>
            <span className="flex-1">{b.right}</span>
            <button onClick={() => onSpeakExample(b.right)} title="Nghe" className="text-lg">
              🔊
            </button>
          </div>
          {b.note && <div className="text-base text-slate-600 sm:col-span-2 md:text-lg">→ {b.note}</div>}
        </div>
      );
    case "cards":
      return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {b.items.map((c, i) => (
            <div key={i} className="anim-pop rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200" style={{ animationDelay: `${i * 90}ms` }}>
              <div className="text-4xl">{c.icon}</div>
              <div className="mt-2 text-lg font-bold text-slate-900">{c.title}</div>
              <div className="mt-1 text-base text-slate-600">
                <Rich text={c.text} />
              </div>
            </div>
          ))}
        </div>
      );
    case "image":
      return (
        <figure className="anim-float text-center">
          <div className="grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-orange-50 to-orange-200 text-6xl shadow-inner md:h-48 md:w-48 md:text-8xl">{b.emoji}</div>
          {b.caption && <figcaption className="mt-3 text-base text-slate-500 md:text-lg">{b.caption}</figcaption>}
        </figure>
      );
  }
}
