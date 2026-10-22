import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { ContinueLearning } from "@/components/ContinueLearning";
import { TeacherAvatar } from "@/components/classroom/TeacherAvatar";
import { COURSES, LEVELS } from "@/lib/courses";

const grammar = COURSES.find((c) => c.id === "grammar")!;

const STEPS = [
  { icon: "🎧", title: "Nghe thầy giảng", text: "Thầy Minh giảng bằng giọng nói, chỉ vào từng phần trên slide. Bấm vào ví dụ để nghe phát âm." },
  { icon: "🎮", title: "Chơi & luyện tập", text: "Câu đố, kéo thả phân loại, ghép từ, sắp xếp câu, sửa lỗi sai — xen kẽ ngay trong bài." },
  { icon: "💬", title: "Hỏi thầy bất cứ lúc nào", text: "Chưa hiểu? Gõ hoặc nói câu hỏi, thầy AI trả lời ngay theo đúng nội dung bài." },
  { icon: "🏆", title: "Nhận sao & theo dõi tiến độ", text: "Mỗi bài có điểm và sao. Lộ trình tự ghi nhớ bạn đã học tới đâu." },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden bg-white">
          <div className="bg-dots absolute inset-0" />
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-orange-200/50 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 md:grid-cols-[1.15fr_1fr] md:py-20">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700 ring-1 ring-orange-200">
                <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" /> 100% miễn phí · Không cần đăng ký
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.15] tracking-tight text-stone-900 md:text-[3.4rem]">
                Học tiếng Anh cùng{" "}
                <span className="relative whitespace-nowrap text-orange-500">
                  thầy AI
                  <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden>
                    <path d="M2 7c50-6 140-6 196 0" stroke="#fdba74" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
                <br />
                như ngồi trong lớp thật
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone-600">
                Bài giảng có giọng nói, slide sinh động, trò chơi ngay trong bài và một người thầy luôn sẵn sàng trả lời mọi câu hỏi — học đúng trình độ của bạn.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/courses/grammar/parts-of-speech"
                  className="rounded-2xl bg-orange-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-orange-500/30 transition hover:-translate-y-0.5 hover:bg-orange-600"
                >
                  ▶ Học thử bài đầu tiên
                </Link>
                <a href="#lo-trinh" className="rounded-2xl bg-white px-6 py-3.5 font-bold text-stone-700 ring-1 ring-stone-200 transition hover:ring-orange-300">
                  Chọn trình độ
                </a>
              </div>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
                {[
                  [String(grammar.lessons.length), "bài ngữ pháp"],
                  ["6", "dạng trò chơi"],
                  ["24/7", "hỏi đáp AI"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <dt className="text-2xl font-extrabold text-stone-900">{n}</dt>
                    <dd className="text-sm text-stone-500">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Bản xem trước lớp học */}
            <div className="relative">
              <div className="rounded-3xl bg-white p-5 shadow-2xl shadow-orange-900/10 ring-1 ring-orange-100">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                  <span className="ml-3 text-xs font-medium text-stone-400">Bài 1 · Tám từ loại chính</span>
                </div>
                <div className="mt-4 rounded-2xl bg-orange-50/60 p-4">
                  <div className="text-lg font-extrabold text-stone-900">Tính từ hay trạng từ?</div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded-lg bg-orange-500 px-2.5 py-1 font-semibold text-white">Verb</span>
                    <span className="font-bold text-stone-400">+</span>
                    <span className="rounded-lg bg-orange-500 px-2.5 py-1 font-semibold text-white">Adverb</span>
                  </div>
                  <div className="spotlight mt-3 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-orange-100">🔊</span>
                    She sings <mark className="hl font-semibold">beautifully</mark>.
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="rounded-full ring-4 ring-orange-100">
                    <TeacherAvatar speaking size={52} />
                  </div>
                  <div className="flex-1 rounded-2xl rounded-tl-sm bg-stone-50 px-3 py-2 text-sm text-stone-700">
                    “Từ <b className="text-orange-600">beautifully</b> là trạng từ, bổ nghĩa cho động từ <b>sings</b>…”
                  </div>
                  <span className="sound-wave flex h-6 items-center gap-0.5 text-orange-400">
                    {[0, 0.15, 0.3, 0.45].map((d) => (
                      <span key={d} style={{ height: 18, animationDelay: `${d}s` }} />
                    ))}
                  </span>
                </div>
              </div>
              <div className="anim-float absolute -bottom-12 left-6 rounded-2xl bg-white px-4 py-3 text-sm shadow-xl ring-1 ring-orange-100">
                <div className="font-bold text-emerald-600">✓ Chính xác! +10⭐</div>
                <div className="text-xs text-stone-500">Trò chơi kéo thả từ loại</div>
              </div>
              <div className="anim-float absolute -right-3 -top-5 rounded-2xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-xl" style={{ animationDelay: "1.2s" }}>
                💬 Hỏi thầy AI
              </div>
            </div>
          </div>
        </section>

        <ContinueLearning />

        {/* LỘ TRÌNH */}
        <section id="lo-trinh" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
          <SectionTitle kicker="Lộ trình học" title="Bắt đầu đúng trình độ của bạn" text="Mỗi khóa học được chia theo mức độ. Chưa chắc trình độ? Hãy bắt đầu từ bậc 1 — các bài đầu rất nhẹ nhàng." />
          <div className="relative mt-10 grid gap-5 md:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-12 hidden h-0.5 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-600 md:block" />
            {LEVELS.map((l, i) => {
              const count = grammar.lessons.filter((x) => x.level === l.id).length;
              return (
                <Link
                  key={l.id}
                  href={`/courses/grammar?level=${l.id}`}
                  className="group relative rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-orange-100 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-900/5 hover:ring-orange-300"
                >
                  <div className={`mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${l.color} text-lg font-extrabold text-white shadow-lg shadow-orange-500/20`}>{i + 1}</div>
                  <div className="mt-4 text-xs font-bold uppercase tracking-wider text-orange-500">{l.cefr}</div>
                  <h3 className="mt-1 text-xl font-extrabold text-stone-900">{l.label}</h3>
                  <p className="mt-2 text-sm text-stone-600">{l.description}</p>
                  <div className="mt-4 text-sm font-semibold text-orange-600 group-hover:underline">{count} bài học →</div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* KHÓA HỌC */}
        <section id="khoa-hoc" className="scroll-mt-20 bg-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle kicker="Khóa học" title="Chọn khóa học" text="Bắt đầu với ngữ pháp nền tảng — các khóa từ vựng, phát âm và IELTS đang được thầy AI chuẩn bị." />
            <div className="mt-10 grid gap-5 md:grid-cols-[1.3fr_1fr]">
              <Link
                href="/courses/grammar"
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-white shadow-xl shadow-orange-500/20 transition hover:-translate-y-1"
              >
                <div className="absolute -bottom-10 -right-6 text-[9rem] opacity-15">{grammar.emoji}</div>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">ĐANG MỞ · {grammar.lessons.length} BÀI</span>
                <h3 className="mt-4 text-2xl font-extrabold">{grammar.title}</h3>
                <p className="mt-2 max-w-md text-white/90">{grammar.description}</p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-bold text-orange-600">Xem lộ trình khóa học →</div>
              </Link>
              <div className="grid gap-4">
                {COURSES.filter((c) => c.status === "coming-soon").map((c) => (
                  <div key={c.id} className="flex items-center gap-4 rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-100">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white text-2xl shadow-sm">{c.emoji}</div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-stone-800">{c.title}</div>
                      <div className="truncate text-sm text-stone-500">{c.description}</div>
                    </div>
                    <span className="shrink-0 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">Sắp ra mắt</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CÁCH HỌC */}
        <section id="cach-hoc" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
          <SectionTitle kicker="Một buổi học" title="Học chủ động, không nhàm chán" text="Mỗi bài học là một lớp học thu nhỏ do thầy AI dẫn dắt từ đầu đến cuối." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative rounded-3xl bg-white p-6 shadow-sm ring-1 ring-orange-100">
                <span className="absolute right-5 top-4 text-4xl font-extrabold text-orange-100">0{i + 1}</span>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-2xl">{s.icon}</div>
                <h3 className="mt-4 font-extrabold text-stone-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA thầy AI soạn bài */}
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="flex flex-col items-center gap-6 rounded-3xl bg-stone-900 p-8 text-white md:flex-row md:p-10">
            <div className="rounded-full bg-orange-500/20 p-2">
              <TeacherAvatar speaking={false} size={96} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-extrabold">Muốn học chủ đề khác?</h3>
              <p className="mt-2 text-stone-300">Nhập một chủ đề bất kỳ, thầy AI sẽ tự soạn slide, lời giảng, câu đố và trò chơi cho bạn trong khoảng một phút.</p>
            </div>
            <Link href="/studio" className="rounded-2xl bg-orange-500 px-6 py-3.5 font-bold text-white hover:bg-orange-600">
              ✨ Nhờ thầy AI soạn bài
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function SectionTitle({ kicker, title, text }: { kicker: string; title: string; text: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="text-sm font-bold uppercase tracking-widest text-orange-500">{kicker}</div>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-stone-900 md:text-4xl">{title}</h2>
      <p className="mt-3 text-stone-600">{text}</p>
    </div>
  );
}
