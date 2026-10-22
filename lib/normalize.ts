// Kiểm tra và chuẩn hóa bài học do AI tạo ra, để trình phát bài học không bao giờ lỗi
// vì dữ liệu thiếu hoặc sai định dạng.

import type { Action, Block, Lesson, LevelId, Scene } from "./types";

type Any = Record<string, unknown>;

const str = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : typeof v === "number" ? String(v) : fallback);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const strArr = (v: unknown) => arr(v).map((x) => str(x)).filter(Boolean);

function normBlock(raw: Any, i: number): Block | null {
  const id = str(raw.id) || `b${i}`;
  switch (raw.kind) {
    case "text":
      return { id, kind: "text", text: str(raw.text), tone: (["lead", "note", "tip", "warn"] as const).find((t) => t === raw.tone) };
    case "bullets":
      return { id, kind: "bullets", items: strArr(raw.items) };
    case "table": {
      const headers = strArr(raw.headers);
      const rows = arr(raw.rows).map((r) => strArr(r)).filter((r) => r.length);
      return headers.length && rows.length ? { id, kind: "table", headers, rows } : null;
    }
    case "formula":
      return { id, kind: "formula", label: str(raw.label) || undefined, parts: strArr(raw.parts) };
    case "example":
      return raw.en ? { id, kind: "example", en: str(raw.en), vi: str(raw.vi) || undefined, highlight: strArr(raw.highlight) } : null;
    case "compare":
      return raw.wrong && raw.right ? { id, kind: "compare", wrong: str(raw.wrong), right: str(raw.right), note: str(raw.note) || undefined } : null;
    case "cards": {
      const items = arr(raw.items).map((c) => {
        const o = c as Any;
        return { icon: str(o.icon, "⭐"), title: str(o.title), text: str(o.text) };
      });
      return items.length ? { id, kind: "cards", items } : null;
    }
    case "image":
      return { id, kind: "image", emoji: str(raw.emoji, "📘"), caption: str(raw.caption) || undefined };
    default:
      return raw.text ? { id, kind: "text", text: str(raw.text) } : null;
  }
}

function normActions(raw: unknown, blocks: Block[], narration: string): Action[] {
  const ids = new Set(blocks.map((b) => b.id));
  const actions: Action[] = [];
  for (const a of arr(raw)) {
    const o = a as Any;
    if (o.type === "speech" && o.text) actions.push({ type: "speech", text: str(o.text) });
    else if ((o.type === "reveal" || o.type === "spotlight") && ids.has(str(o.target)))
      actions.push({ type: o.type, target: str(o.target) });
  }
  if (!actions.some((a) => a.type === "speech")) {
    // AI không viết kịch bản: tự hiện từng block và đọc phần thuyết minh.
    return [...blocks.map((b): Action => ({ type: "reveal", target: b.id })), { type: "speech", text: narration || "Các bạn hãy đọc kỹ nội dung trên slide nhé." }];
  }
  return actions;
}

function normScene(raw: Any, i: number): Scene | null {
  const id = str(raw.id) || `scene${i}`;
  const title = str(raw.title, "Hoạt động");
  const intro = str(raw.intro) || undefined;
  switch (raw.type) {
    case "slide": {
      const blocks = arr(raw.blocks).map((b, j) => normBlock(b as Any, j)).filter((b): b is Block => !!b);
      // đảm bảo id duy nhất
      const seen = new Set<string>();
      blocks.forEach((b, j) => {
        if (seen.has(b.id)) b.id = `${b.id}_${j}`;
        seen.add(b.id);
      });
      if (!blocks.length) return null;
      return { id, type: "slide", title, subtitle: str(raw.subtitle) || undefined, blocks, actions: normActions(raw.actions, blocks, str(raw.narration)) };
    }
    case "quiz": {
      const questions = arr(raw.questions)
        .map((q) => {
          const o = q as Any;
          const options = strArr(o.options);
          const answer = Number(o.answer);
          return { q: str(o.q), options, answer: Number.isInteger(answer) && answer >= 0 && answer < options.length ? answer : 0, explain: str(o.explain) || undefined };
        })
        .filter((q) => q.q && q.options.length >= 2);
      return questions.length ? { id, type: "quiz", title, intro, questions } : null;
    }
    case "fill": {
      const items = arr(raw.items)
        .map((it) => {
          const o = it as Any;
          return { sentence: str(o.sentence), answers: strArr(o.answers).length ? strArr(o.answers) : strArr([o.answer]), hint: str(o.hint) || undefined, explain: str(o.explain) || undefined };
        })
        .filter((x) => x.sentence.includes("___") && x.answers.length);
      return items.length ? { id, type: "fill", title, intro, items } : null;
    }
    case "fix": {
      const items = arr(raw.items)
        .map((it) => {
          const o = it as Any;
          return { wrong: str(o.wrong), answers: strArr(o.answers).length ? strArr(o.answers) : strArr([o.answer]), explain: str(o.explain) || undefined };
        })
        .filter((x) => x.wrong && x.answers.length);
      return items.length ? { id, type: "fix", title, intro, items } : null;
    }
    case "sort": {
      const categories = arr(raw.categories).map((c, j) => {
        const o = c as Any;
        return { id: str(o.id) || `c${j}`, label: str(o.label) };
      });
      const catIds = new Set(categories.map((c) => c.id));
      const items = arr(raw.items)
        .map((it) => {
          const o = it as Any;
          return { text: str(o.text), category: str(o.category) };
        })
        .filter((x) => x.text && catIds.has(x.category));
      return categories.length >= 2 && items.length >= 2 ? { id, type: "sort", title, intro, categories, items } : null;
    }
    case "match": {
      const pairs = arr(raw.pairs)
        .map((p) => {
          const o = p as Any;
          return { left: str(o.left), right: str(o.right) };
        })
        .filter((p) => p.left && p.right);
      return pairs.length >= 2 ? { id, type: "match", title, intro, pairs: pairs.slice(0, 8) } : null;
    }
    case "order": {
      const sentences = arr(raw.sentences)
        .map((s) => {
          const o = s as Any;
          return { answer: str(o.answer), vi: str(o.vi) || undefined };
        })
        .filter((s) => s.answer.split(/\s+/).length >= 3);
      return sentences.length ? { id, type: "order", title, intro, sentences } : null;
    }
    default:
      return null;
  }
}

export function normalizeLesson(raw: unknown, fallback: { level: LevelId; topic: string }): Lesson {
  const o = (raw ?? {}) as Any;
  const scenes = arr(o.scenes)
    .map((s, i) => normScene(s as Any, i))
    .filter((s): s is Scene => !!s);
  scenes.forEach((s, i) => (s.id = `${s.id}-${i}`));
  if (!scenes.length) throw new Error("Bài học AI tạo ra không có nội dung hợp lệ.");
  const level = (["beginner", "intermediate", "advanced"] as const).find((l) => l === o.level) ?? fallback.level;
  return {
    id: `ai-${Date.now().toString(36)}`,
    title: str(o.title) || fallback.topic,
    summary: str(o.summary),
    level,
    emoji: str(o.emoji, "✨").slice(0, 4),
    minutes: Math.max(5, Math.round(scenes.length * 2)),
    scenes,
  };
}
