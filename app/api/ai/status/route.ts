import { connection } from "next/server";
import { getProviders } from "@/lib/ai/server";

export async function GET() {
  await connection(); // đọc biến môi trường tại thời điểm chạy, không lúc build
  const providers = getProviders();
  return Response.json({
    configured: providers.length > 0,
    providers: providers.map((p) => `${p.label} · ${p.model}`),
  });
}
