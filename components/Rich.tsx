import { Fragment, type ReactNode } from "react";

/** Hiển thị markup nhẹ: **đậm**, ==tô sáng==, `tiếng Anh` */
export function Rich({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|==[^=]+==|`[^`]+`)/g);
  const nodes: ReactNode[] = parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i} className="font-semibold text-slate-900">{p.slice(2, -2)}</strong>;
    if (p.startsWith("==") && p.endsWith("==")) return <mark key={i} className="hl">{p.slice(2, -2)}</mark>;
    if (p.startsWith("`") && p.endsWith("`"))
      return (
        <span key={i} className="font-medium text-orange-700">
          {p.slice(1, -1)}
        </span>
      );
    return <Fragment key={i}>{p}</Fragment>;
  });
  return <span className={className}>{nodes}</span>;
}

/** Markdown tối giản cho câu trả lời của AI: đoạn văn + gạch đầu dòng */
export function MiniMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const t = line.trim();
        if (!t) return null;
        const bullet = /^[-*•]\s+/.test(t);
        const content = t.replace(/^[-*•]\s+/, "").replace(/^#+\s*/, "");
        return bullet ? (
          <div key={i} className="flex gap-2">
            <span className="text-orange-500">•</span>
            <Rich text={content} />
          </div>
        ) : (
          <p key={i}>
            <Rich text={content} />
          </p>
        );
      })}
    </div>
  );
}
