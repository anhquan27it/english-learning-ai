"use client";

import { useEffect, useState } from "react";
import { getVoices, onVoicesChanged, pickVoice, speak, type VoicePrefs } from "@/lib/speech";

export function VoiceSettings({ prefs, onChange, onClose }: { prefs: VoicePrefs; onChange: (p: VoicePrefs) => void; onClose: () => void }) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    const load = () => setVoices(getVoices());
    load();
    return onVoicesChanged(load);
  }, []);

  const vi = voices.filter((v) => v.lang.toLowerCase().startsWith("vi"));
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));

  return (
    <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl bg-white p-4 text-sm shadow-2xl ring-1 ring-slate-200">
      <div className="mb-3 flex items-center justify-between">
        <b>🔊 Giọng thầy Minh</b>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
          ✕
        </button>
      </div>
      <label className="block text-xs font-semibold text-slate-500">Giọng tiếng Việt</label>
      <select
        className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5"
        value={prefs.vi ?? pickVoice("vi")?.voiceURI ?? ""}
        onChange={(e) => onChange({ ...prefs, vi: e.target.value })}
      >
        {vi.length === 0 && <option value="">(Máy chưa có giọng tiếng Việt)</option>}
        {vi.map((v) => (
          <option key={v.voiceURI} value={v.voiceURI}>
            {v.name}
          </option>
        ))}
      </select>
      <label className="mt-3 block text-xs font-semibold text-slate-500">Giọng tiếng Anh</label>
      <select
        className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5"
        value={prefs.en ?? pickVoice("en")?.voiceURI ?? ""}
        onChange={(e) => onChange({ ...prefs, en: e.target.value })}
      >
        {en.map((v) => (
          <option key={v.voiceURI} value={v.voiceURI}>
            {v.name} ({v.lang})
          </option>
        ))}
      </select>
      <label className="mt-3 block text-xs font-semibold text-slate-500">Tốc độ: {prefs.rate.toFixed(2)}×</label>
      <input
        type="range"
        min={0.6}
        max={1.4}
        step={0.05}
        value={prefs.rate}
        onChange={(e) => onChange({ ...prefs, rate: Number(e.target.value) })}
        className="w-full accent-orange-600"
      />
      <button
        onClick={() => speak("Xin chào, mình là thầy Minh. Ví dụ: `How are you today?`", { prefs: { ...prefs, muted: false } })}
        className="mt-3 w-full rounded-lg bg-orange-50 py-2 font-semibold text-orange-700 hover:bg-orange-100"
      >
        ▶ Nghe thử
      </button>
      {vi.length === 0 && (
        <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
          Mẹo: trình duyệt <b>Microsoft Edge</b> có sẵn giọng tiếng Việt tự nhiên (giọng nam NamMinh). Trên Windows bạn cũng có thể cài gói giọng nói tiếng Việt trong Settings → Time &amp; Language → Speech.
        </p>
      )}
    </div>
  );
}
