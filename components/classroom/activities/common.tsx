"use client";

export interface ActivityProps<S> {
  scene: S;
  /** Gọi một lần khi học viên hoàn thành, score từ 0 đến 1 */
  onDone: (score: number) => void;
  /** Giáo viên nói một câu (phản hồi) */
  teacherSay: (text: string) => void;
  /** Đọc câu tiếng Anh */
  speakEn: (text: string) => void;
}

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "")
    .trim();

export function shuffle<T>(arr: T[], seed = 1): T[] {
  // Xáo trộn có hạt giống để server/client giống nhau, tránh lỗi hydration
  const a = [...arr];
  let s = seed * 9301 + 49297;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const PRAISE = ["Chính xác!", "Tuyệt vời!", "Giỏi lắm!", "Đúng rồi!", "Xuất sắc!"];
export const praise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)];

export function ActivityHeader({ title, intro, icon }: { title: string; intro?: string; icon: string }) {
  return (
    <div className="anim-in mb-5">
      <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
        {icon} Hoạt động
      </div>
      <h2 className="mt-2 text-2xl font-extrabold text-slate-900">{title}</h2>
      {intro && <p className="mt-1 text-slate-600">{intro}</p>}
    </div>
  );
}

export function ResultBanner({ score, total, onRetry }: { score: number; total: number; onRetry?: () => void }) {
  const pct = total ? score / total : 0;
  return (
    <div className="anim-pop mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 text-white shadow">
      <div>
        <div className="text-lg font-bold">
          {pct === 1 ? "🏆 Hoàn hảo!" : pct >= 0.6 ? "🎉 Làm tốt lắm!" : "💪 Cố gắng thêm nhé!"}
        </div>
        <div className="text-sm text-white/90">
          Bạn đạt {score}/{total} điểm. Bấm “Tiếp tục” ở dưới để sang phần tiếp theo.
        </div>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/30">
          ↻ Làm lại
        </button>
      )}
    </div>
  );
}
