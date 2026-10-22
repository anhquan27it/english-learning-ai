"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LEVELS } from "@/lib/courses";
import { deleteCustomLesson, saveCustomLesson, useCustomLessons } from "@/lib/customLessons";
import { normalizeLesson } from "@/lib/normalize";
import type { LevelId } from "@/lib/types";
import { STATIC_EXPORT } from "@/lib/useTutor";

const IDEAS = [
  "Thì hiện tại đơn cho người mới bắt đầu",
  "So sánh hơn và so sánh nhất",
  "Giới từ chỉ thời gian in / on / at",
  "Câu tường thuật (Reported speech)",
  "Mạo từ a / an / the",
  "Từ vựng chủ đề du lịch",
];

const STEPS = ["Đọc yêu cầu và tài liệu…", "Lên dàn ý bài giảng…", "Viết lời giảng cho thầy Minh…", "Thiết kế trò chơi và câu đố…", "Kiểm tra và hoàn thiện…"];

export function Studio() {
  const lessons = useCustomLessons();
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<LevelId>("beginner");
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [configured, setConfigured] = useState<boolean | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (STATIC_EXPORT) {
      queueMicrotask(() => setConfigured(false));
      return;
    }
    fetch("/api/ai/status")
      .then((r) => r.json())
      .then((s) => setConfigured(s.configured))
      .catch(() => setConfigured(false));
  }, []);

  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 4000);
    return () => clearInterval(t);
  }, [busy]);

  async function generate() {
    if (!topic.trim()) return setError("Hãy nhập chủ đề bài học.");
    setStep(0);
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level, source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Có lỗi xảy ra");
      saveCustomLesson(data.lesson);
      setTopic("");
      setSource("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function download(id: string) {
    const l = lessons.find((x) => x.id === id);
    if (!l) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(l, null, 2)], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `${l.title}.json` });
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importFile(f: File) {
    try {
      const raw = JSON.parse(await f.text());
      saveCustomLesson({ ...normalizeLesson(raw, { level: "beginner", topic: f.name }), id: raw.id ?? `import-${Date.now()}` });
    } catch (e) {
      alert("File không hợp lệ: " + (e as Error).message);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold">✨ Tạo bài học bằng AI</h1>
      <p className="mt-2 text-slate-600">
        Nhập chủ đề (và dán tài liệu nếu có), AI sẽ tự soạn slide bài giảng, lời giảng cho giáo viên AI, câu đố và trò chơi — giống cách OpenMAIC tạo lớp học từ một chủ đề.
      </p>

      {configured === false && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {STATIC_EXPORT ? (
            <>
              <b>Bản trên GitHub Pages chưa có máy chủ AI.</b> Tính năng nhờ thầy AI soạn bài cần chạy website trên máy chủ (Vercel, máy cá nhân…) với khóa AI miễn phí. Bạn vẫn có
              thể nhập bài học từ file JSON.
            </>
          ) : (
            <>
              <b>AI chưa được bật.</b> Thêm khóa API miễn phí (Google Gemini hoặc Groq) hoặc cài Ollama vào file <code>.env.local</code> rồi khởi động lại máy chủ. Xem hướng dẫn
              trong <code>README.md</code>.
            </>
          )}
        </div>
      )}

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <label className="text-sm font-semibold">Chủ đề bài học</label>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="VD: Câu so sánh trong tiếng Anh"
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-400"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {IDEAS.map((i) => (
            <button key={i} onClick={() => setTopic(i)} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 hover:bg-orange-50 hover:text-orange-700">
              {i}
            </button>
          ))}
        </div>

        <label className="mt-5 block text-sm font-semibold">Trình độ</label>
        <div className="mt-1 grid gap-2 sm:grid-cols-3">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              onClick={() => setLevel(l.id)}
              className={`rounded-xl border-2 px-3 py-2 text-left text-sm ${level === l.id ? "border-orange-500 bg-orange-50" : "border-slate-200"}`}
            >
              <b>{l.label}</b> <span className="text-slate-500">· {l.cefr}</span>
            </button>
          ))}
        </div>

        <label className="mt-5 block text-sm font-semibold">
          Tài liệu tham khảo <span className="font-normal text-slate-400">(không bắt buộc — dán nội dung bài giảng, giáo trình…)</span>
        </label>
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          rows={5}
          placeholder="Dán nội dung tài liệu vào đây để AI soạn bài bám sát tài liệu của bạn."
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
        />

        {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">⚠️ {error}</p>}

        <button
          onClick={generate}
          disabled={busy || STATIC_EXPORT}
          className="mt-5 w-full rounded-2xl bg-gradient-to-r from-orange-600 to-rose-600 py-3.5 text-lg font-bold text-white shadow-lg disabled:opacity-70"
        >
          {busy ? `⏳ ${STEPS[step]}` : "✨ Tạo bài học"}
        </button>
        {busy && <p className="mt-2 text-center text-xs text-slate-500">Thường mất 20–60 giây với AI miễn phí.</p>}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xl font-bold">Bài học của tôi ({lessons.length})</h2>
        <button onClick={() => fileRef.current?.click()} className="rounded-lg px-3 py-1.5 text-sm text-orange-700 hover:bg-orange-50">
          ⬆ Nhập từ file JSON
        </button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} />
      </div>
      {lessons.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Chưa có bài học nào. Hãy tạo bài đầu tiên ở trên!</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {lessons.map((l) => (
            <div key={l.id} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-50 text-2xl">{l.emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="font-bold">{l.title}</div>
                <div className="truncate text-sm text-slate-600">{l.summary}</div>
                <div className="text-xs text-slate-400">
                  {LEVELS.find((x) => x.id === l.level)?.label} · {l.scenes.length} phần
                </div>
              </div>
              <Link href={`/studio/play?id=${encodeURIComponent(l.id)}`} className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-700">
                ▶ Học
              </Link>
              <button onClick={() => download(l.id)} title="Tải JSON" className="rounded-lg px-2 py-1.5 hover:bg-slate-100">
                ⬇
              </button>
              <button onClick={() => confirm(`Xóa bài “${l.title}”?`) && deleteCustomLesson(l.id)} title="Xóa" className="rounded-lg px-2 py-1.5 text-rose-600 hover:bg-rose-50">
                🗑
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
