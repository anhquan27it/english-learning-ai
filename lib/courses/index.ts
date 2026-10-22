import type { Course, Lesson, Level, LevelId } from "../types";
import { grammarLessons } from "./grammar";

export const LEVELS: Level[] = [
  {
    id: "beginner",
    label: "Cơ bản",
    cefr: "A1 – A2",
    description: "Mới bắt đầu hoặc mất gốc, cần nền tảng vững chắc.",
    color: "from-amber-300 to-orange-400",
  },
  {
    id: "intermediate",
    label: "Trung cấp",
    cefr: "B1 – B2",
    description: "Đã có nền tảng, muốn dùng câu đa dạng và chính xác hơn.",
    color: "from-orange-400 to-orange-600",
  },
  {
    id: "advanced",
    label: "Nâng cao",
    cefr: "B2 – C1",
    description: "Luyện cấu trúc học thuật cho IELTS, công việc.",
    color: "from-orange-600 to-red-600",
  },
];

export const levelById = (id: LevelId) => LEVELS.find((l) => l.id === id)!;

// Để thêm khóa học mới: tạo file bài học trong lib/courses/<tên>/ rồi thêm vào mảng này.
export const COURSES: Course[] = [
  {
    id: "grammar",
    title: "Tổng quát ngữ pháp tiếng Anh",
    description: "Từ loại, kiểu câu, mệnh đề, 12 thì, hòa hợp chủ ngữ – động từ, câu điều kiện, bị động. Bám sát tiêu chí IELTS.",
    emoji: "📘",
    levels: ["beginner", "intermediate", "advanced"],
    status: "available",
    lessons: grammarLessons,
  },
  {
    id: "vocabulary",
    title: "Từ vựng theo chủ đề",
    description: "3000 từ thông dụng theo chủ đề, học qua hình ảnh, phát âm và trò chơi.",
    emoji: "🗂️",
    levels: ["beginner", "intermediate"],
    status: "coming-soon",
    lessons: [],
  },
  {
    id: "pronunciation",
    title: "Phát âm chuẩn IPA",
    description: "44 âm tiếng Anh, trọng âm, nối âm và ngữ điệu.",
    emoji: "🗣️",
    levels: ["beginner"],
    status: "coming-soon",
    lessons: [],
  },
  {
    id: "ielts-writing",
    title: "IELTS Writing",
    description: "Task 1 & Task 2: bố cục, từ nối, cấu trúc ăn điểm.",
    emoji: "✍️",
    levels: ["advanced"],
    status: "coming-soon",
    lessons: [],
  },
];

export const getCourse = (id: string) => COURSES.find((c) => c.id === id);

export function getLesson(courseId: string, lessonId: string): { course: Course; lesson: Lesson } | undefined {
  const course = getCourse(courseId);
  const lesson = course?.lessons.find((l) => l.id === lessonId);
  return course && lesson ? { course, lesson } : undefined;
}
