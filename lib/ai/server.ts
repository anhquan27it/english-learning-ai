// Kết nối mô hình AI miễn phí qua chuẩn OpenAI-compatible (chỉ chạy trên máy chủ).
//
// Hỗ trợ sẵn:
//  - gemini     : Google AI Studio (gói miễn phí)          GEMINI_API_KEY
//  - groq       : GroqCloud (gói miễn phí)                  GROQ_API_KEY
//  - openrouter : các model ":free" của OpenRouter          OPENROUTER_API_KEY
//  - ollama     : chạy model mã nguồn mở trên máy của bạn — miễn phí vĩnh viễn
//
// AI_PROVIDERS quy định thứ tự thử (vd "gemini,groq,ollama"): khi một nhà cung cấp
// hết hạn mức miễn phí (lỗi 429) hệ thống tự chuyển sang nhà cung cấp tiếp theo.

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface Provider {
  id: string;
  label: string;
  baseUrl: string;
  apiKey?: string;
  model: string;
}

const env = (k: string) => process.env[k]?.trim() || undefined;

function presets(): Record<string, Provider | null> {
  return {
    gemini: env("GEMINI_API_KEY")
      ? {
          id: "gemini",
          label: "Google Gemini",
          baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
          apiKey: env("GEMINI_API_KEY"),
          model: env("GEMINI_MODEL") ?? "gemini-2.5-flash",
        }
      : null,
    groq: env("GROQ_API_KEY")
      ? {
          id: "groq",
          label: "Groq",
          baseUrl: "https://api.groq.com/openai/v1",
          apiKey: env("GROQ_API_KEY"),
          model: env("GROQ_MODEL") ?? "openai/gpt-oss-120b",
        }
      : null,
    openrouter: env("OPENROUTER_API_KEY")
      ? {
          id: "openrouter",
          label: "OpenRouter",
          baseUrl: "https://openrouter.ai/api/v1",
          apiKey: env("OPENROUTER_API_KEY"),
          model: env("OPENROUTER_MODEL") ?? "meta-llama/llama-3.3-70b-instruct:free",
        }
      : null,
    ollama: {
      id: "ollama",
      label: "Ollama (máy chủ riêng)",
      baseUrl: env("OLLAMA_BASE_URL") ?? "http://localhost:11434/v1",
      model: env("OLLAMA_MODEL") ?? "qwen2.5:7b",
    },
  };
}

export function getProviders(): Provider[] {
  const all = presets();
  const order = (env("AI_PROVIDERS") ?? "gemini,groq,openrouter")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return order.map((id) => all[id]).filter((p): p is Provider => !!p);
}

export const aiConfigured = () => getProviders().length > 0;

/* ---------- Giới hạn tần suất đơn giản để bảo vệ hạn mức miễn phí ---------- */

const hits = new Map<string, number[]>();

export function rateLimited(ip: string, perMinute = Number(env("AI_RATE_LIMIT_PER_MINUTE") ?? 15)): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > perMinute;
}

export const clientIp = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";

/* ---------- Gọi model ---------- */

async function callProvider(p: Provider, body: Record<string, unknown>, signal?: AbortSignal) {
  return fetch(`${p.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(p.apiKey ? { Authorization: `Bearer ${p.apiKey}` } : {}),
    },
    body: JSON.stringify({ model: p.model, ...body }),
    signal,
  });
}

export class AIError extends Error {}

/** Thử lần lượt các nhà cung cấp cho tới khi có một nơi phản hồi thành công. */
async function firstOk(body: Record<string, unknown>, signal?: AbortSignal) {
  const providers = getProviders();
  if (!providers.length) throw new AIError("Chưa cấu hình AI. Xem hướng dẫn trong file .env.example.");
  const errors: string[] = [];
  for (const p of providers) {
    try {
      const res = await callProvider(p, body, signal);
      if (res.ok) return { res, provider: p };
      errors.push(`${p.label}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
    } catch (e) {
      errors.push(`${p.label}: ${(e as Error).message}`);
    }
  }
  console.error("[ai] tất cả nhà cung cấp đều lỗi:\n" + errors.join("\n"));
  throw new AIError("Máy chủ AI đang bận hoặc hết lượt miễn phí. Vui lòng thử lại sau ít phút.");
}

/** Trả về luồng văn bản (stream) để hiển thị câu trả lời dần dần. */
export async function chatStream(messages: ChatMessage[], signal?: AbortSignal): Promise<ReadableStream<Uint8Array>> {
  const { res } = await firstOk({ messages, stream: true, temperature: 0.4 }, signal);
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const data = line.replace(/^data:\s*/, "").trim();
        if (!data || data === "[DONE]" || !line.startsWith("data:")) continue;
        try {
          const delta = JSON.parse(data).choices?.[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        } catch {
          // dòng chưa đầy đủ — bỏ qua
        }
      }
    },
    cancel() {
      void reader.cancel();
    },
  });
}

/** Gọi model và yêu cầu trả về JSON. */
export async function chatJSON<T = unknown>(messages: ChatMessage[], signal?: AbortSignal): Promise<T> {
  const { res } = await firstOk(
    { messages, temperature: 0.6, response_format: { type: "json_object" } },
    signal,
  );
  const data = await res.json();
  const text: string = data.choices?.[0]?.message?.content ?? "";
  const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  try {
    return JSON.parse(json) as T;
  } catch {
    throw new AIError("AI trả về dữ liệu không hợp lệ, vui lòng thử lại.");
  }
}
