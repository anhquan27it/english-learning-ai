"use client";

import { useEffect, useRef, useState } from "react";
import type { AIStatus, TutorMessage } from "@/lib/useTutor";
import { MiniMarkdown } from "../Rich";
import { TeacherAvatar } from "./TeacherAvatar";

interface Props {
  messages: TutorMessage[];
  busy: boolean;
  status: AIStatus | null;
  onAsk: (q: string) => void;
  onSpeak: (text: string) => void;
}

const SUGGESTIONS = ["Cho em thêm ví dụ về phần này", "Phần này hay sai ở đâu ạ?", "Mẹo ghi nhớ nội dung này?"];

// Nhận dạng giọng nói (Web Speech API) — miễn phí trên Chrome/Edge.
type Recognition = {
  lang: string;
  interimResults: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
  onerror: () => void;
  start: () => void;
  stop: () => void;
};

export function ChatPanel({ messages, busy, status, onAsk, onSpeak }: Props) {
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [micLang, setMicLang] = useState<"vi-VN" | "en-US">("vi-VN");
  const recRef = useRef<Recognition | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  function send(q = input) {
    if (!q.trim() || busy) return;
    onAsk(q);
    setInput("");
  }

  function toggleMic() {
    const W = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!Ctor) {
      alert("Trình duyệt chưa hỗ trợ nhập bằng giọng nói. Hãy dùng Chrome hoặc Edge.");
      return;
    }
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new Ctor();
    rec.lang = micLang;
    rec.interimResults = true;
    rec.onresult = (e) => setInput(Array.from(e.results).map((r) => r[0].transcript).join(""));
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="rounded-2xl bg-orange-50 p-4 text-sm text-slate-700">
            <div className="flex items-center gap-3">
              <TeacherAvatar speaking={false} size={44} />
              <div>
                <b>Thầy Minh – trợ giảng AI</b>
                <div className="text-xs text-slate-500">Hỏi bất cứ điều gì về bài học, bằng chữ hoặc giọng nói 🎤</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full bg-white px-3 py-1 text-xs text-orange-700 ring-1 ring-orange-200 hover:bg-orange-100">
                  {s}
                </button>
              ))}
            </div>
            {status && !status.configured && (
              <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
                AI chưa được cấu hình trên máy chủ — tạm thời mình sẽ trả lời bằng cách trích nội dung trong bài.
              </p>
            )}
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-8 rounded-2xl rounded-br-sm bg-orange-600 px-4 py-2.5 text-sm text-white">
              {m.content}
            </div>
          ) : (
            <div key={i} className="mr-4 rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200">
              {m.content ? <MiniMarkdown text={m.content} /> : <span className="animate-pulse text-slate-400">Thầy Minh đang suy nghĩ…</span>}
              {!m.pending && m.content && (
                <button onClick={() => onSpeak(m.content)} className="mt-2 text-xs text-orange-600 hover:underline">
                  🔊 Đọc to
                </button>
              )}
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="border-t border-slate-200 bg-white p-3"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={2}
            placeholder={listening ? "Đang nghe…" : "Hỏi thầy Minh về bài học…"}
            className="min-h-11 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
          />
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={toggleMic}
              title="Hỏi bằng giọng nói"
              className={`grid h-9 w-9 place-items-center rounded-xl ${listening ? "animate-pulse bg-rose-500 text-white" : "bg-slate-100 hover:bg-slate-200"}`}
            >
              🎤
            </button>
            <button type="submit" disabled={busy || !input.trim()} className="grid h-9 w-9 place-items-center rounded-xl bg-orange-600 text-white disabled:opacity-40">
              ➤
            </button>
          </div>
        </div>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
          Micro:
          {(["vi-VN", "en-US"] as const).map((l) => (
            <button key={l} type="button" onClick={() => setMicLang(l)} className={micLang === l ? "font-bold text-orange-600" : "hover:text-slate-600"}>
              {l === "vi-VN" ? "Tiếng Việt" : "English"}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
