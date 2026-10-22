"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { lessonToText, sceneToText } from "./lessonText";
import type { Lesson, Scene } from "./types";

export const STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
}

export interface AIStatus {
  configured: boolean;
  providers: string[];
}

/** Khi chưa bật AI: tìm phần liên quan trong bài học để trả lời tạm. */
function offlineAnswer(lesson: Lesson, question: string): string {
  const words = question
    .toLowerCase()
    .split(/[^\p{L}\p{N}']+/u)
    .filter((w) => w.length > 2);
  const ranked = lesson.scenes
    .map((s) => {
      const text = sceneToText(s);
      const lower = text.toLowerCase();
      return { s, text, score: words.reduce((n, w) => n + (lower.includes(w) ? 1 : 0), 0) };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);
  const note = "💡 Trợ giảng AI chưa được bật nên thầy trích phần liên quan trong bài học.";
  if (!ranked.length) return `Mình chưa tìm thấy nội dung liên quan trong bài này. Bạn thử hỏi bằng từ khóa khác nhé!\n\n${note}`;
  return ranked.map((r) => r.text.replace(/^## /, "**").replace(/\n/, "**\n")).join("\n\n") + `\n\n${note}`;
}

export function useTutor(lesson: Lesson) {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<AIStatus | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lessonText = useMemo(() => lessonToText(lesson), [lesson]);

  useEffect(() => {
    // Bản tĩnh (GitHub Pages) không có máy chủ AI → dùng chế độ trả lời theo nội dung bài.
    if (STATIC_EXPORT) {
      queueMicrotask(() => setStatus({ configured: false, providers: [] }));
      return;
    }
    fetch("/api/ai/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ configured: false, providers: [] }));
  }, []);

  const ask = useCallback(
    async (opts: { question?: string; mode?: "chat" | "explain"; scene?: Scene }): Promise<string> => {
      const mode = opts.mode ?? "chat";
      const userText = mode === "explain" ? "🧑‍🏫 Thầy ơi, giảng lại slide này dễ hiểu hơn giúp em." : opts.question!.trim();
      const history: TutorMessage[] = [...messages, { role: "user", content: userText }];
      setMessages([...history, { role: "assistant", content: "", pending: true }]);
      setBusy(true);
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      const setAnswer = (content: string, pending = false) => setMessages((m) => [...m.slice(0, -1), { role: "assistant", content, pending }]);

      if (STATIC_EXPORT || status?.configured === false) {
        setAnswer(offlineAnswer(lesson, mode === "explain" && opts.scene ? opts.scene.title : userText));
        setBusy(false);
        return "";
      }

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ac.signal,
          body: JSON.stringify({
            mode,
            messages: (mode === "explain" ? messages : history).map(({ role, content }) => ({ role, content })),
            lessonTitle: lesson.title,
            lessonText,
            currentSlide: opts.scene ? sceneToText(opts.scene) : undefined,
          }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          const fallback =
            res.status === 503 && status && !status.configured
              ? offlineAnswer(lesson, mode === "explain" && opts.scene ? opts.scene.title : userText)
              : `⚠️ ${err.error ?? "Có lỗi xảy ra, bạn thử lại nhé."}`;
          setAnswer(fallback);
          return "";
        }
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let text = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          setAnswer(text, true);
        }
        setAnswer(text || "Xin lỗi, mình chưa trả lời được câu này.");
        return text;
      } catch (e) {
        if ((e as Error).name !== "AbortError") setAnswer("⚠️ Không kết nối được máy chủ.");
        return "";
      } finally {
        setBusy(false);
      }
    },
    [messages, lesson, lessonText, status],
  );

  return { messages, busy, status, ask, clear: () => setMessages([]) };
}
