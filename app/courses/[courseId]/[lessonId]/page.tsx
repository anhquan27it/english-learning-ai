import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Classroom } from "@/components/classroom/Classroom";
import { COURSES, getLesson } from "@/lib/courses";

export function generateStaticParams() {
  return COURSES.flatMap((c) =>
    c.lessons.map((l) => ({ courseId: c.id, lessonId: l.id })),
  );
}

export default function LessonPage({
  params,
}: PageProps<"/courses/[courseId]/[lessonId]">) {
  return (
    <Suspense
      fallback={
        <div className="grid h-dvh place-items-center text-slate-400">
          Đang mở lớp học…
        </div>
      }
    >
      <LessonRoom params={params} />
    </Suspense>
  );
}

async function LessonRoom({
  params,
}: {
  params: PageProps<"/courses/[courseId]/[lessonId]">["params"];
}) {
  const { courseId, lessonId } = await params;
  const found = getLesson(courseId, lessonId);
  if (!found) notFound();
  const { course, lesson } = found;
  const idx = course.lessons.indexOf(lesson);
  const next = course.lessons[idx + 1];

  return (
    <Classroom
      key={lesson.id}
      lesson={lesson}
      progressId={`${course.id}/${lesson.id}`}
      backHref={`/courses/${course.id}`}
      backLabel={course.title}
      nextHref={next ? `/courses/${course.id}/${next.id}` : undefined}
    />
  );
}
