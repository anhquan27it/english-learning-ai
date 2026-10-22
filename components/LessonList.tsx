"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getCourse, LEVELS } from "@/lib/courses";
import { progressKey, useProgress } from "@/lib/progress";
import type { LevelId } from "@/lib/types";

/** Lộ trình bài học dạng dòng thời gian + bảng tiến độ bên phải. */
export function LessonList({ courseId }: { courseId: string }) {
  const course = getCourse(courseId)!;
  const params = useSearchParams();
  const router = useRouter();
  const progress = useProgress();
  const filter = (params.get("level") as LevelId | null) ?? null;

  const pOf = (id: string) => progress[progressKey(courseId, id)];
  const done = course.lessons.filter((l) => pOf(l.id)?.completed).length;
  const pct = Math.round((done / course.lessons.length) * 100);
  const nextLesson = course.lessons.find((l) => !pOf(l.id)?.completed);
  const avgScore = done ? Math.round(course.lessons.reduce((s, l) => s + (pOf(l.id)?.completed ? pOf(l.id)!.bestScore : 0), 0) / done) : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="flex flex-wrap gap-2">
          <Chip active={!filter} onClick={() => router.replace(`/courses/${courseId}`, { scroll: false })}>
            Tất cả trình độ
          </Chip>
          {LEVELS.filter((l) => course.levels.includes(l.id)).map((l) => (
            <Chip key={l.id} active={filter === l.id} onClick={() => router.replace(`/courses/${courseId}?level=${l.id}`, { scroll: false })}>
              {l.label} · {l.cefr}
            </Chip>
          ))}
        </div>

        {LEVELS.filter((l) => !filter || l.id === filter).map((level, li) => {
          const lessons = course.lessons.filter((x) => x.level === level.id);
          if (!lessons.length) return null;
          return (
            <section key={level.id} className="mt-8">
              <div className="flex items-center gap-3">
                <span className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${level.color} font-extrabold text-white`}>{LEVELS.indexOf(level) + 1}</span>
                <div>
                  <h2 className="text-lg font-extrabold text-stone-900">
                    {level.label} <span className="font-semibold text-orange-500">· {level.cefr}</span>
                  </h2>
                  <p className="text-sm text-stone-500">{level.description}</p>
                </div>
              </div>

              <ol className="relative mt-5 space-y-3 pl-6 before:absolute before:bottom-6 before:left-[11px] before:top-6 before:w-0.5 before:bg-orange-100" key={li}>
                {lessons.map((lesson) => {
                  const idx = course.lessons.indexOf(lesson) + 1;
                  const p = pOf(lesson.id);
                  const isNext = nextLesson?.id === lesson.id;
                  const activities = lesson.scenes.filter((s) => s.type !== "slide").length;
                  return (
                    <li key={lesson.id} className="relative">
                      <span
                        className={`absolute -left-6 top-1/2 z-10 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-[11px] font-bold ring-4 ring-[#fffaf5] ${
                          p?.completed ? "bg-emerald-500 text-white" : isNext ? "bg-orange-500 text-white" : "bg-white text-stone-400 ring-stone-100"
                        }`}
                      >
                        {p?.completed ? "✓" : idx}
                      </span>
                      <Link
                        href={`/courses/${courseId}/${lesson.id}`}
                        className={`group ml-3 flex items-center gap-4 rounded-2xl bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-900/5 ${
                          isNext ? "shadow-md ring-2 ring-orange-400" : "shadow-sm ring-1 ring-stone-100 hover:ring-orange-200"
                        }`}
                      >
                        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-orange-50 text-3xl transition group-hover:scale-105">{lesson.emoji}</div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-orange-500">BÀI {idx}</div>
                          <div className="font-extrabold text-stone-900">{lesson.title}</div>
                          <div className="line-clamp-1 text-sm text-stone-500">{lesson.summary}</div>
                          <div className="mt-1.5 flex flex-wrap gap-x-3 text-xs text-stone-400">
                            <span>⏱ {lesson.minutes} phút</span>
                            <span>🎞 {lesson.scenes.length - activities} slide</span>
                            <span>🎮 {activities} trò chơi</span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          {p?.completed ? (
                            <div className="text-center">
                              <div className="text-sm">{"⭐".repeat(p.bestScore >= 90 ? 3 : p.bestScore >= 60 ? 2 : 1)}</div>
                              <div className="text-xs font-semibold text-emerald-600">{p.bestScore}%</div>
                            </div>
                          ) : (
                            <span
                              className={`rounded-full px-4 py-2 text-sm font-bold ${
                                isNext ? "bg-orange-500 text-white shadow-md shadow-orange-500/30" : p ? "bg-orange-100 text-orange-700" : "bg-stone-100 text-stone-600 group-hover:bg-orange-100 group-hover:text-orange-700"
                              }`}
                            >
                              {p ? "Học tiếp" : isNext ? "Bắt đầu" : "Học"}
                            </span>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>

      {/* Bảng tiến độ */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-orange-100">
          <h3 className="font-extrabold text-stone-900">Tiến độ của bạn</h3>
          <div className="mt-4 flex items-center gap-5">
            <Ring pct={pct} />
            <div className="space-y-1 text-sm text-stone-600">
              <div>
                <b className="text-stone-900">{done}</b>/{course.lessons.length} bài hoàn thành
              </div>
              <div>
                Điểm TB: <b className="text-stone-900">{done ? `${avgScore}%` : "—"}</b>
              </div>
            </div>
          </div>
          {nextLesson ? (
            <Link
              href={`/courses/${courseId}/${nextLesson.id}`}
              className="mt-5 block rounded-2xl bg-orange-500 px-4 py-3 text-center font-bold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600"
            >
              ▶ {done ? "Học bài tiếp theo" : "Bắt đầu bài 1"}
            </Link>
          ) : (
            <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-center font-bold text-emerald-700">🎓 Bạn đã hoàn thành khóa học!</div>
          )}
          {nextLesson && <p className="mt-2 text-center text-xs text-stone-500">Tiếp theo: {nextLesson.title}</p>}
        </div>
        <div className="mt-4 rounded-3xl bg-stone-900 p-5 text-sm text-stone-300">
          <div className="font-bold text-white">💡 Mẹo học hiệu quả</div>
          <ul className="mt-2 space-y-1.5">
            <li>• Bật loa và nghe thầy giảng hết slide.</li>
            <li>• Bấm 🔊 ở mỗi ví dụ và đọc theo.</li>
            <li>• Chưa hiểu chỗ nào, hỏi thầy AI ngay.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0">
      <circle cx="40" cy="40" r={r} fill="none" stroke="#ffedd5" strokeWidth="9" />
      <circle cx="40" cy="40" r={r} fill="none" stroke="#f97316" strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 40 40)" />
      <text x="40" y="45" textAnchor="middle" className="fill-stone-900 text-[15px] font-extrabold">
        {pct}%
      </text>
    </svg>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active ? "bg-orange-500 text-white shadow-md shadow-orange-500/25" : "bg-white text-stone-600 ring-1 ring-stone-200 hover:ring-orange-300"
      }`}
    >
      {children}
    </button>
  );
}
