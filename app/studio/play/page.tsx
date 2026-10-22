"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Classroom } from "@/components/classroom/Classroom";
import { useCustomLessons } from "@/lib/customLessons";

function Player() {
  const id = useSearchParams().get("id");
  const lessons = useCustomLessons();
  const lesson = lessons.find((l) => l.id === id);
  if (!lesson)
    return (
      <div className="grid flex-1 place-items-center p-10 text-center">
        <div>
          <p className="text-slate-600">Không tìm thấy bài học này trên trình duyệt.</p>
          <Link href="/studio" className="mt-3 inline-block text-orange-700 underline">
            Quay lại trang tạo bài
          </Link>
        </div>
      </div>
    );
  return <Classroom key={lesson.id} lesson={lesson} progressId={`custom/${lesson.id}`} backHref="/studio" backLabel="Bài học của tôi" />;
}

export default function StudioPlayPage() {
  return (
    <Suspense>
      <Player />
    </Suspense>
  );
}
