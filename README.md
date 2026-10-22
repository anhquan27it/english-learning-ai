# EnglishAI — Học tiếng Anh cùng thầy AI

Website học tiếng Anh theo trình độ: thầy AI (thầy Minh) giảng bài bằng giọng nói trên slide tương tác, trò chơi xen kẽ trong bài, học viên hỏi đáp AI bất cứ lúc nào, và AI tự soạn bài học mới từ một chủ đề.
Mô hình lớp học (scene + action) lấy ý tưởng từ [OpenMAIC](https://github.com/THU-MAIC/OpenMAIC) (MIT).

## Chạy thử

```bash
npm install
npm run dev
```

Mở http://localhost:3000. Không cần khóa AI vẫn học được toàn bộ khóa ngữ pháp; khi chưa bật AI, phần hỏi đáp sẽ trích nội dung liên quan trong bài.

## Bật AI miễn phí

1. Sao chép `.env.example` thành `.env.local`.
2. Điền **một** trong các khóa miễn phí (không cần thẻ thanh toán):
   - Google Gemini: https://aistudio.google.com/apikey → `GEMINI_API_KEY`
   - Groq: https://console.groq.com/keys → `GROQ_API_KEY`
   - OpenRouter (model `:free`): https://openrouter.ai/keys → `OPENROUTER_API_KEY`
3. Khởi động lại `npm run dev`.

Điền nhiều khóa thì khi một nơi hết lượt miễn phí, hệ thống tự chuyển sang nơi tiếp theo (`AI_PROVIDERS`).

**Miễn phí vĩnh viễn, không phụ thuộc nhà cung cấp:** cài [Ollama](https://ollama.com) trên máy chủ, chạy `ollama pull qwen2.5:7b`, rồi đặt `AI_PROVIDERS=ollama` (hoặc thêm `ollama` vào cuối danh sách làm phương án dự phòng).

Giọng nói của thầy dùng Web Speech API của trình duyệt — miễn phí, không qua máy chủ. Microsoft Edge có giọng tiếng Việt tự nhiên nhất.

## Cấu trúc

| Đường dẫn | Nội dung |
| --- | --- |
| `lib/types.ts` | Mô hình bài học: slide (block + action của thầy) và 6 loại hoạt động |
| `lib/courses/` | Danh sách khóa học, trình độ; `grammar/` là 10 bài soạn từ tài liệu ngữ pháp |
| `components/classroom/` | Lớp học: slide, thầy AI, điều khiển, hỏi đáp, trò chơi |
| `app/api/ai/` | API hỏi đáp (`chat`), soạn bài (`generate`), trạng thái AI (`status`) |
| `lib/ai/` | Kết nối AI miễn phí (OpenAI-compatible) và các prompt |
| `app/studio/` | Trang nhờ thầy AI soạn bài học mới |

## Thêm khóa học mới

1. Tạo thư mục `lib/courses/<ten-khoa>/` với các file bài học (xem mẫu trong `grammar/`), hoặc dùng trang **Thầy AI soạn bài** rồi bấm ⬇ để tải JSON bài học.
2. Thêm khóa học vào mảng `COURSES` trong `lib/courses/index.ts` với `status: "available"`.

## Đăng lên GitHub Pages

Repo có sẵn workflow `.github/workflows/pages.yml`: mỗi lần push lên nhánh `main`, GitHub tự build bản tĩnh (`npm run build:pages`) và đăng lên Pages.

- Lần đầu: vào **Settings → Pages → Source** của repo, chọn **GitHub Actions**.
- Repo tên `<user>.github.io` sẽ chạy ở `https://<user>.github.io/`; repo khác chạy ở `https://<user>.github.io/<tên-repo>/` (basePath được tự đặt).
- GitHub Pages chỉ phục vụ file tĩnh nên **không có máy chủ AI**: hỏi đáp sẽ trích nội dung bài học, trang soạn bài bằng AI bị tắt. Muốn bật AI cho người học, hãy chạy bản đầy đủ trên máy chủ (ví dụ Vercel miễn phí) với khóa AI trong biến môi trường.
