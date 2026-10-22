import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { LessonList } from "@/components/LessonList";
import { TeacherAvatar } from "@/components/classroom/TeacherAvatar";
import { COURSES, getCourse } from "@/lib/courses";

export function generateStaticParams() {
  return COURSES.filter((c) => c.status === "available").map((c) => ({ courseId: c.id }));
}

export default function CoursePage({ params }: PageProps<"/courses/[courseId]">) {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<main className="flex-1" />}>
        <CourseContent params={params} />
      </Suspense>
      <SiteFooter />
    </>
  );
}

async function CourseContent({ params }: { params: PageProps<"/courses/[courseId]">["params"] }) {
  const { courseId } = await params;
  const course = getCourse(courseId);
  if (!course || course.status !== "available") notFound();
  const totalMinutes = course.lessons.reduce((s, l) => s + l.minutes, 0);
  const activities = course.lessons.reduce((s, l) => s + l.scenes.filter((x) => x.type !== "slide").length, 0);

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b border-orange-100 bg-white">
        <div className="bg-dots absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <nav className="text-sm text-stone-500">
              <Link href="/" className="hover:text-orange-600">
                Trang chủ
              </Link>{" "}
              / <span className="text-stone-700">Khóa học</span>
            </nav>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-stone-900 md:text-4xl">
              {course.emoji} {course.title}
            </h1>
            <p className="mt-3 max-w-2xl text-stone-600">{course.description}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm">
              {[
                `📚 ${course.lessons.length} bài học`,
                `⏱ ~${Math.round(totalMinutes / 60)} giờ học`,
                `🎮 ${activities} trò chơi & bài tập`,
                "🧑‍🏫 Thầy AI giảng bằng giọng nói",
              ].map((t) => (
                <span key={t} className="rounded-full bg-orange-50 px-3 py-1.5 font-medium text-orange-800 ring-1 ring-orange-100">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden items-end gap-3 md:flex">
            <div className="mb-6 max-w-52 rounded-2xl rounded-br-sm bg-orange-500 px-4 py-3 text-sm text-white shadow-lg">
              Học theo thứ tự từ trên xuống nhé, mỗi bài chỉ khoảng 15–20 phút thôi!
            </div>
            <TeacherAvatar speaking={false} size={110} />
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Suspense>
          <LessonList courseId={course.id} />
        </Suspense>
      </div>
    </main>
  );
}
