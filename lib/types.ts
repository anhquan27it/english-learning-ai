// Mô hình dữ liệu bài học — lấy cảm hứng từ mô hình Scene + Action của OpenMAIC
// (https://github.com/THU-MAIC/OpenMAIC, MIT): mỗi bài học là một chuỗi "scene"
// (slide hoặc hoạt động tương tác), mỗi slide có danh sách "action" mà giáo viên AI
// thực hiện lần lượt (nói, hiện phần tử, làm nổi bật phần tử).

export type LevelId = "beginner" | "intermediate" | "advanced";

export interface Level {
  id: LevelId;
  label: string;
  cefr: string;
  description: string;
  color: string; // tailwind gradient classes
}

/* ---------- Slide blocks ---------- */
// Văn bản hỗ trợ markup nhẹ: **đậm**, ==tô sáng==, `tiếng Anh`.

interface BlockBase {
  id: string;
  /** Ẩn cho tới khi có action "reveal" hoặc "spotlight" nhắm tới block này */
  hidden?: boolean;
}

export type Block =
  | (BlockBase & { kind: "text"; text: string; tone?: "lead" | "note" | "tip" | "warn" })
  | (BlockBase & { kind: "bullets"; items: string[] })
  | (BlockBase & { kind: "table"; headers: string[]; rows: string[][] })
  | (BlockBase & { kind: "formula"; label?: string; parts: string[] })
  | (BlockBase & { kind: "example"; en: string; vi?: string; highlight?: string[] })
  | (BlockBase & { kind: "compare"; wrong: string; right: string; note?: string })
  | (BlockBase & { kind: "cards"; items: { icon: string; title: string; text: string }[] })
  | (BlockBase & { kind: "image"; emoji: string; caption?: string });

/* ---------- Teacher actions ---------- */

export type Action =
  /** Giáo viên nói. Phần nằm trong `backtick` được đọc bằng giọng tiếng Anh. */
  | { type: "speech"; text: string }
  /** Hiện block (hiệu ứng xuất hiện) */
  | { type: "reveal"; target: string }
  /** Làm nổi bật block (đồng thời hiện nếu đang ẩn) */
  | { type: "spotlight"; target: string }
  | { type: "pause"; ms: number };

/* ---------- Scenes ---------- */

export interface SlideScene {
  id: string;
  type: "slide";
  title: string;
  subtitle?: string;
  blocks: Block[];
  actions: Action[];
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  explain?: string;
}

export interface QuizScene {
  id: string;
  type: "quiz";
  title: string;
  intro?: string;
  questions: QuizQuestion[];
}

export interface FillItem {
  /** Dùng ___ cho chỗ trống */
  sentence: string;
  /** Các đáp án chấp nhận được */
  answers: string[];
  hint?: string;
  explain?: string;
}

export interface FillScene {
  id: string;
  type: "fill";
  title: string;
  intro?: string;
  items: FillItem[];
}

export interface SortScene {
  id: string;
  type: "sort";
  title: string;
  intro?: string;
  categories: { id: string; label: string }[];
  items: { text: string; category: string }[];
}

export interface MatchScene {
  id: string;
  type: "match";
  title: string;
  intro?: string;
  pairs: { left: string; right: string }[];
}

export interface OrderScene {
  id: string;
  type: "order";
  title: string;
  intro?: string;
  sentences: { answer: string; vi?: string }[];
}

export interface FixScene {
  id: string;
  type: "fix";
  title: string;
  intro?: string;
  items: { wrong: string; answers: string[]; explain?: string }[];
}

export type ActivityScene = QuizScene | FillScene | SortScene | MatchScene | OrderScene | FixScene;
export type Scene = SlideScene | ActivityScene;

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  level: LevelId;
  emoji: string;
  minutes: number;
  scenes: Scene[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  emoji: string;
  levels: LevelId[];
  status: "available" | "coming-soon";
  lessons: Lesson[];
}
