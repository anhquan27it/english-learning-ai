import type { LevelId } from "../types";

const LEVEL_TEXT: Record<LevelId, string> = {
  beginner: "Cơ bản (A1–A2): câu ngắn, từ vựng đơn giản, giải thích thật dễ hiểu",
  intermediate: "Trung cấp (B1–B2)",
  advanced: "Nâng cao (B2–C1), có liên hệ IELTS",
};

export const TUTOR_SYSTEM = `Bạn là "thầy Minh", giáo viên tiếng Anh AI thân thiện của một website học tiếng Anh cho người Việt.
Quy tắc:
- Trả lời bằng tiếng Việt, ngắn gọn, rõ ràng (tối đa khoảng 150 từ trừ khi học viên yêu cầu chi tiết).
- Luôn đưa 1–2 ví dụ tiếng Anh có dịch nghĩa. Đặt mọi câu/từ tiếng Anh trong dấu \`backtick\` (để hệ thống đọc bằng giọng tiếng Anh).
- Ưu tiên bám vào nội dung bài học được cung cấp. Câu hỏi về tiếng Anh nói chung vẫn trả lời được.
- Nếu câu hỏi không liên quan đến việc học tiếng Anh, lịch sự từ chối và gợi ý quay lại bài học.
- Dùng markdown nhẹ: **đậm**, gạch đầu dòng. Không dùng bảng, không dùng tiêu đề #.`;

export function tutorContext(lessonTitle: string, lessonText: string, currentSlide?: string) {
  return `BÀI HỌC HIỆN TẠI: ${lessonTitle}
${currentSlide ? `\nSLIDE HỌC VIÊN ĐANG XEM:\n${currentSlide}\n` : ""}
NỘI DUNG BÀI HỌC (tham khảo):
${lessonText.slice(0, 9000)}`;
}

export const EXPLAIN_REQUEST =
  "Hãy giảng giải lại nội dung slide tôi đang xem theo cách khác, dễ hiểu hơn, như đang nói chuyện với tôi (khoảng 100–140 từ). Thêm một mẹo ghi nhớ và một ví dụ mới. Đây là lời nói nên KHÔNG dùng markdown, không gạch đầu dòng.";

export function generatorPrompt(topic: string, level: LevelId, source?: string) {
  return `Hãy thiết kế một bài học tiếng Anh tương tác cho người Việt.
Chủ đề: ${topic}
Trình độ: ${LEVEL_TEXT[level]}
${source ? `Tài liệu tham khảo (dựa vào đây để soạn nội dung):\n"""\n${source.slice(0, 12000)}\n"""\n` : ""}
Yêu cầu:
- 4 đến 6 scene "slide" xen kẽ 3 đến 4 scene hoạt động (quiz, fill, sort, match, order, fix). Mỗi loại hoạt động dùng tối đa 1 lần.
- Lời giảng (speech) bằng tiếng Việt, giọng thân thiện như thầy giáo tên "thầy Minh". Mọi từ/câu tiếng Anh trong lời giảng phải đặt trong \`backtick\`.
- Mỗi slide có 2–5 block và mảng "actions" xen kẽ: {"type":"reveal","target":"<id block>"} rồi {"type":"speech","text":"..."}; có thể dùng {"type":"spotlight","target":"<id>"} để nhấn mạnh.
- Văn bản trong block hỗ trợ **đậm** và ==tô sáng==.
- Nội dung chính xác về ngữ pháp, ví dụ tự nhiên.

Chỉ trả về JSON đúng cấu trúc sau (không giải thích thêm):
{
  "title": "tên bài (tiếng Việt)",
  "summary": "1 câu mô tả",
  "emoji": "1 emoji",
  "level": "${level}",
  "scenes": [
    {"type":"slide","title":"...","subtitle":"...","blocks":[
      {"id":"b1","kind":"text","tone":"lead|note|tip|warn","text":"..."},
      {"id":"b2","kind":"bullets","items":["..."]},
      {"id":"b3","kind":"table","headers":["..."],"rows":[["..."]]},
      {"id":"b4","kind":"formula","label":"(+)","parts":["S","+","V"]},
      {"id":"b5","kind":"example","en":"English sentence.","vi":"Nghĩa tiếng Việt","highlight":["từ cần tô"]},
      {"id":"b6","kind":"compare","wrong":"câu sai","right":"câu đúng","note":"giải thích"},
      {"id":"b7","kind":"cards","items":[{"icon":"emoji","title":"...","text":"..."}]},
      {"id":"b8","kind":"image","emoji":"1-3 emoji minh họa","caption":"..."}
    ],"actions":[{"type":"reveal","target":"b1"},{"type":"speech","text":"..."}]},
    {"type":"quiz","title":"...","intro":"...","questions":[{"q":"... ___ ...","options":["a","b","c"],"answer":0,"explain":"..."}]},
    {"type":"fill","title":"...","intro":"...","items":[{"sentence":"câu có ___","answers":["đáp án"],"explain":"..."}]},
    {"type":"sort","title":"...","intro":"...","categories":[{"id":"c1","label":"..."}],"items":[{"text":"...","category":"c1"}]},
    {"type":"match","title":"...","intro":"...","pairs":[{"left":"...","right":"..."}]},
    {"type":"order","title":"...","intro":"...","sentences":[{"answer":"Full English sentence.","vi":"..."}]},
    {"type":"fix","title":"...","intro":"...","items":[{"wrong":"câu sai","answers":["câu đúng"],"explain":"..."}]}
  ]
}`;
}
