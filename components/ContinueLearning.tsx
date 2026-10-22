"use client";

import Link from "next/link";
import { COURSES } from "@/lib/courses";
import { progressKey, useProgress } from "@/lib/progress";

/** Thẻ "Học tiếp" trên trang chủ — chỉ hiện khi học viên đã từng học. */
export function ContinueLearning() {
  const progress = useProgress();
  const entries = COURSES.flatMap((c) =>
    c.lessons.map((l, i) => ({ course: c, lesson: l, index: i, p: progress[progressKey(c.id, l.id)] })),
  );
  const started = entries.filter((e) => e.p);
  if (!started.length) return null;

  const latest = started.sort((a, b) => b.p!.updatedAt - a.p!.updatedAt)[0];
  // Bài vừa học đã xong → gợi ý bài kế tiếp chưa hoàn thành
  const target = latest.p!.completed
    ? (latest.course.lessons.slice(latest.index + 1).find((l) => !progress[progressKey(latest.course.id, l.id)]?.completed) ?? latest.lesson)
    : latest.lesson;
  const done = latest.course.lessons.filter((l) => progress[progressKey(latest.course.id, l.id)]?.completed).length;
  const pct = Math.round((done / latest.course.lessons.length) * 100);

  return (
    <section className="mx-auto -mb-6 mt-10 max-w-6xl px-4">
      <div className="flex flex-col items-center gap-5 rounded-3xl bg-orange-50 p-5 ring-1 ring-orange-200 sm:flex-row">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white text-3xl shadow-sm">{target.emoji}</div>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="text-xs font-bold uppercase tracking-wider text-orange-600">Học tiếp nào!</div>
          <div className="truncate text-lg font-extrabold text-stone-900">{target.title}</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-orange-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="shrink-0 text-xs font-semibold text-stone-500">
              {done}/{latest.course.lessons.length} bài
            </span>
          </div>
        </div>
        <Link
          href={`/courses/${latest.course.id}/${target.id}`}
          className="shrink-0 rounded-2xl bg-orange-500 px-6 py-3 font-bold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600"
        >
          ▶ Tiếp tục học
        </Link>
      </div>
    </section>
  );
}
