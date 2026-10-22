import { AIError, chatJSON, clientIp, rateLimited } from "@/lib/ai/server";
import { generatorPrompt } from "@/lib/ai/prompts";
import { normalizeLesson } from "@/lib/normalize";
import type { LevelId } from "@/lib/types";

const LEVELS: LevelId[] = ["beginner", "intermediate", "advanced"];

export async function POST(req: Request) {
  if (rateLimited(clientIp(req) + ":gen", 3)) {
    return Response.json({ error: "Mỗi phút chỉ tạo được vài bài để tiết kiệm lượt AI miễn phí. Hãy thử lại sau." }, { status: 429 });
  }
  const body = (await req.json().catch(() => ({}))) as { topic?: string; level?: string; source?: string };
  const topic = body.topic?.trim().slice(0, 200);
  if (!topic) return Response.json({ error: "Hãy nhập chủ đề bài học." }, { status: 400 });
  const level = LEVELS.find((l) => l === body.level) ?? "beginner";

  try {
    const raw = await chatJSON(
      [
        { role: "system", content: "Bạn là chuyên gia thiết kế bài giảng tiếng Anh. Chỉ trả lời bằng JSON hợp lệ." },
        { role: "user", content: generatorPrompt(topic, level, body.source?.trim()) },
      ],
      req.signal,
    );
    return Response.json({ lesson: normalizeLesson(raw, { level, topic }) });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: e instanceof AIError ? 503 : 500 });
  }
}
