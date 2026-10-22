import type { Block, Lesson, Scene } from "./types";

const strip = (s: string) => s.replace(/\*\*|==|`/g, "");

function blockText(b: Block): string {
  switch (b.kind) {
    case "text":
      return strip(b.text);
    case "bullets":
      return b.items.map((i) => "- " + strip(i)).join("\n");
    case "table":
      return [b.headers.join(" | "), ...b.rows.map((r) => r.map(strip).join(" | "))].join("\n");
    case "formula":
      return (b.label ? b.label + ": " : "") + b.parts.join(" ");
    case "example":
      return `Ví dụ: ${b.en}${b.vi ? ` (${b.vi})` : ""}`;
    case "compare":
      return `Sai: ${b.wrong} → Đúng: ${b.right}${b.note ? ` (${b.note})` : ""}`;
    case "cards":
      return b.items.map((c) => `- ${c.title}: ${c.text}`).join("\n");
    case "image":
      return b.caption ?? "";
  }
}

export function sceneToText(s: Scene): string {
  const head = `## ${s.title}`;
  switch (s.type) {
    case "slide":
      return [head, s.subtitle ?? "", ...s.blocks.map(blockText)].filter(Boolean).join("\n");
    case "quiz":
      return [head, ...s.questions.map((q) => `${q.q} [${q.options.join(" / ")}] → ${q.options[q.answer]}`)].join("\n");
    case "fill":
      return [head, ...s.items.map((i) => `${i.sentence} → ${i.answers[0]}`)].join("\n");
    case "fix":
      return [head, ...s.items.map((i) => `${i.wrong} → ${i.answers[0]}`)].join("\n");
    case "sort":
      return [
        head,
        ...s.categories.map(
          (c) => `${c.label}: ${s.items.filter((i) => i.category === c.id).map((i) => i.text).join(", ")}`,
        ),
      ].join("\n");
    case "match":
      return [head, ...s.pairs.map((p) => `${p.left} ↔ ${p.right}`)].join("\n");
    case "order":
      return [head, ...s.sentences.map((x) => x.answer)].join("\n");
  }
}

export const lessonToText = (l: Lesson) => `# ${l.title}\n${l.summary}\n\n` + l.scenes.map(sceneToText).join("\n\n");
