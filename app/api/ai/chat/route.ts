import { AIError, chatStream, clientIp, rateLimited, type ChatMessage } from "@/lib/ai/server";
import { EXPLAIN_REQUEST, TUTOR_SYSTEM, tutorContext } from "@/lib/ai/prompts";

interface Body {
  messages?: { role: "user" | "assistant"; content: string }[];
  lessonTitle?: string;
  lessonText?: string;
  currentSlide?: string;
  mode?: "chat" | "explain";
}

export async function POST(req: Request) {
  if (rateLimited(clientIp(req))) {
    return Response.json({ error: "Bạn hỏi hơi nhanh 😅 Hãy đợi khoảng một phút rồi hỏi tiếp nhé." }, { status: 429 });
  }
  const body = (await req.json().catch(() => ({}))) as Body;
  const history = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  if (body.mode === "explain") history.push({ role: "user", content: EXPLAIN_REQUEST });
  if (!history.length || history[history.length - 1].role !== "user") {
    return Response.json({ error: "Thiếu câu hỏi." }, { status: 400 });
  }

  const messages: ChatMessage[] = [
    { role: "system", content: TUTOR_SYSTEM },
    { role: "system", content: tutorContext(body.lessonTitle ?? "", body.lessonText ?? "", body.currentSlide) },
    ...history,
  ];

  try {
    const stream = await chatStream(messages, req.signal);
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  } catch (e) {
    const status = e instanceof AIError ? 503 : 500;
    return Response.json({ error: (e as Error).message }, { status });
  }
}
