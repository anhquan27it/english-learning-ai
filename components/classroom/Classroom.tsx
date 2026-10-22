"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ActivityScene, Lesson, Scene, SlideScene } from "@/lib/types";
import { currentVoicePrefs, saveVoicePrefs, speak, speakEnglish, stopSpeaking, useVoicePrefs, type VoicePrefs } from "@/lib/speech";
import { updateProgress } from "@/lib/progress";
import { sfx } from "@/lib/sfx";
import { useTutor } from "@/lib/useTutor";
import { levelById } from "@/lib/courses";
import { SlideView } from "./SlideView";
import { FitStage } from "./FitStage";
import { TeacherAvatar } from "./TeacherAvatar";
import { ChatPanel } from "./ChatPanel";
import { VoiceSettings } from "./VoiceSettings";
import { Quiz } from "./activities/Quiz";
import { TypeIn } from "./activities/TypeIn";
import { Sort } from "./activities/Sort";
import { Match } from "./activities/Match";
import { Order } from "./activities/Order";
import { Rich } from "../Rich";

interface Props {
  lesson: Lesson;
  progressId: string;
  backHref: string;
  backLabel: string;
  nextHref?: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Các block sẽ được hiện dần bằng action "reveal" thì ban đầu ẩn. */
function initialVisible(scene: Scene, revealAll: boolean): Set<string> {
  if (scene.type !== "slide") return new Set();
  const revealed = new Set(scene.actions.filter((a) => a.type === "reveal").map((a) => (a as { target: string }).target));
  return new Set(scene.blocks.filter((b) => revealAll || (!revealed.has(b.id) && !b.hidden)).map((b) => b.id));
}

const ACTIVITY_INTRO: Record<ActivityScene["type"], string> = {
  quiz: "Bây giờ mình cùng làm vài câu đố nhé. Chọn đáp án đúng nào!",
  fill: "Đến lượt bạn rồi! Hãy điền vào chỗ trống.",
  fix: "Mỗi câu dưới đây có một lỗi sai. Bạn hãy sửa lại cho đúng nhé.",
  sort: "Chơi một trò chơi nhé! Kéo mỗi thẻ vào đúng nhóm của nó.",
  match: "Trò chơi ghép cặp! Hãy ghép thật nhanh nào.",
  order: "Hãy sắp xếp các từ thành câu hoàn chỉnh nhé.",
};

/** Lời AI có markdown — làm sạch trước khi đọc. */
const forSpeech = (t: string) =>
  t
    .replace(/\*\*|==|__|^#+\s*/gm, "")
    .replace(/^[-*•]\s+/gm, "")
    .replace(/💡 Trợ giảng AI chưa được bật.*$/gm, "");

export function Classroom({ lesson, progressId, backHref, backLabel, nextHref }: Props) {
  const scenes = lesson.scenes;
  const [sceneIdx, setSceneIdx] = useState(0);
  const scene = scenes[sceneIdx];
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [runId, setRunId] = useState(0);
  const [visible, setVisible] = useState<Set<string>>(() => initialVisible(scenes[0], true));
  const [spot, setSpot] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [sceneDone, setSceneDone] = useState(false);
  const [finished, setFinished] = useState(false);
  const [panel, setPanel] = useState<"chat" | "outline">("chat");
  const [panelOpen, setPanelOpen] = useState(false); // trên điện thoại
  const [deskPanel, setDeskPanel] = useState(true); // trên máy tính
  const [showSettings, setShowSettings] = useState(false);
  const [autoNext, setAutoNext] = useState(true);
  const prefs = useVoicePrefs();
  const actionIdx = useRef(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [finalScore, setFinalScore] = useState(0);
  const tutor = useTutor(lesson);

  useEffect(() => () => stopSpeaking(), []);

  const changePrefs = (p: VoicePrefs) => saveVoicePrefs(p);

  const goTo = useCallback(
    (i: number, opts: { play?: boolean } = {}) => {
      if (i < 0 || i >= scenes.length) return;
      stopSpeaking();
      const play = opts.play ?? playing;
      actionIdx.current = 0;
      setSceneIdx(i);
      setVisible(initialVisible(scenes[i], !play));
      setSpot(null);
      setSceneDone(false);
      setSubtitle("");
      setSpeaking(false);
      setPlaying(play);
      setRunId((r) => r + 1);
      updateProgress(progressId, { lastScene: i });
    },
    [scenes, playing, progressId],
  );

  /* ---------- Trình chạy action của giáo viên ---------- */
  useEffect(() => {
    if (!playing) return;
    let cancelled = false;
    const say = async (text: string) => {
      setSubtitle(text);
      setSpeaking(true);
      await speak(text, { prefs: currentVoicePrefs() });
      if (!cancelled) setSpeaking(false);
    };

    (async () => {
      if (scene.type === "slide") {
        const actions = scene.actions;
        for (let i = actionIdx.current; i < actions.length; i++) {
          if (cancelled) return;
          const a = actions[i];
          if (a.type === "reveal") {
            setVisible((v) => new Set(v).add(a.target));
            await sleep(450);
          } else if (a.type === "spotlight") {
            setVisible((v) => new Set(v).add(a.target));
            setSpot(a.target);
            await sleep(300);
          } else if (a.type === "speech") {
            await say(a.text);
          } else if (a.type === "pause") {
            await sleep(a.ms);
          }
          if (cancelled) return;
          actionIdx.current = i + 1;
        }
        setSpot(null);
        setVisible(initialVisible(scene, true));
        setSceneDone(true);
        if (autoNext && sceneIdx < scenes.length - 1) {
          await sleep(1200);
          if (!cancelled) goTo(sceneIdx + 1, { play: true });
        } else {
          setPlaying(false);
        }
      } else if (actionIdx.current === 0) {
        actionIdx.current = 1;
        await say(scene.intro ? `Đến phần luyện tập rồi! ${scene.intro}` : ACTIVITY_INTRO[scene.type]);
      }
    })();

    return () => {
      cancelled = true;
      stopSpeaking();
    };
    // goTo thay đổi theo `playing`; chỉ chạy lại khi đổi scene / bấm phát lại.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, runId, sceneIdx]);

  /** Giáo viên nói một câu ngoài kịch bản (phản hồi trò chơi, câu trả lời AI…) */
  const teacherSay = useCallback((text: string) => {
    setSubtitle(text);
    setSpeaking(true);
    void speak(text, { prefs: currentVoicePrefs() }).then(() => setSpeaking(false));
  }, []);

  const speakEn = useCallback((text: string) => {
    void speakEnglish(text, currentVoicePrefs());
  }, []);

  function onActivityDone(score: number) {
    setScores((s) => ({ ...s, [scene.id]: Math.max(s[scene.id] ?? 0, score) }));
    setSceneDone(true);
  }

  async function explainSlide() {
    setPlaying(false);
    stopSpeaking();
    setPanel("chat");
    setSubtitle("Thầy Minh đang chuẩn bị bài giảng…");
    setSpeaking(false);
    const text = await tutor.ask({ mode: "explain", scene });
    if (text) teacherSay(forSpeech(text));
    else setSubtitle("");
  }

  function finish() {
    stopSpeaking();
    setPlaying(false);
    const activities = scenes.filter((s) => s.type !== "slide");
    const pct = activities.length ? Math.round((activities.reduce((s, a) => s + (scores[a.id] ?? 0), 0) / activities.length) * 100) : 100;
    setFinalScore(pct);
    updateProgress(progressId, { completed: true, bestScore: pct, lastScene: 0 });
    setFinished(true);
    sfx.win();
    teacherSay(pct >= 80 ? "Chúc mừng bạn đã hoàn thành bài học với kết quả rất tốt!" : "Bạn đã hoàn thành bài học. Hãy ôn lại các phần còn sai để nhớ lâu hơn nhé!");
  }

  const level = levelById(lesson.level);
  const isLast = sceneIdx === scenes.length - 1;
  const isSlide = scene.type === "slide";
  const canContinue = sceneDone || isSlide;

  function togglePlay() {
    setStarted(true);
    if (playing) setPlaying(false);
    else if (sceneDone && isSlide) goTo(sceneIdx, { play: true });
    else setPlaying(true);
  }

  return (
    <div className="flex h-dvh flex-col bg-[#fffaf5]">
      {/* ===== Thanh trên ===== */}
      <header className="z-20 flex h-16 shrink-0 items-center gap-3 border-b border-orange-100 bg-white px-3 md:px-5">
        <Link
          href={backHref}
          title={`Về ${backLabel}`}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-stone-500 ring-1 ring-stone-200 transition hover:bg-orange-50 hover:text-orange-600 hover:ring-orange-200"
        >
          ←
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-extrabold text-stone-900">
              {lesson.emoji} {lesson.title}
            </span>
            <span className={`hidden shrink-0 rounded-full bg-gradient-to-r ${level.color} px-2 py-0.5 text-[11px] font-bold text-white sm:inline`}>{level.label}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {scenes.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => goTo(i)}
                  title={s.title}
                  className={`h-2 flex-1 rounded-full transition hover:opacity-80 ${
                    i < sceneIdx || scores[s.id] !== undefined ? "bg-orange-500" : i === sceneIdx ? "bg-orange-300" : "bg-stone-200"
                  } ${s.type !== "slide" ? "max-w-5 rounded-md" : ""}`}
                />
              ))}
            </div>
            <span className="shrink-0 text-xs font-semibold text-stone-400">
              {sceneIdx + 1}/{scenes.length}
            </span>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowSettings((s) => !s)}
            title="Giọng nói"
            className="grid h-10 w-10 place-items-center rounded-xl text-lg ring-1 ring-stone-200 hover:bg-orange-50 hover:ring-orange-200"
          >
            ⚙️
          </button>
          {showSettings && <VoiceSettings prefs={prefs} onChange={changePrefs} onClose={() => setShowSettings(false)} />}
        </div>
        <button
          onClick={() => setDeskPanel((v) => !v)}
          className={`hidden rounded-xl px-3 py-2 text-sm font-bold transition lg:block ${deskPanel ? "bg-orange-100 text-orange-700" : "bg-orange-500 text-white"}`}
        >
          {deskPanel ? "Ẩn hỏi đáp" : "💬 Hỏi thầy"}
        </button>
        <button onClick={() => setPanelOpen(true)} className="rounded-xl bg-orange-500 px-3 py-2 text-sm font-bold text-white lg:hidden">
          💬
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ===== Sân khấu ===== */}
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col px-3 pt-3 md:px-6 md:pt-4">
            <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col">
              <div className="mb-2 flex shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <span className={`rounded-full px-2.5 py-1 ${isSlide ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {isSlide ? "🎞 Bài giảng" : "🎮 Luyện tập"}
                </span>
                <span className="truncate text-stone-400">{scene.title}</span>
              </div>
              <div className="min-h-0 flex-1">
                <FitStage
                  overlay={
                    <>
                      {!started && (
                        <div className="absolute inset-0 z-20 grid place-items-center bg-white/90 backdrop-blur-sm">
                          <div className="anim-pop max-w-md p-6 text-center">
                            <div className="relative mx-auto w-fit">
                              <div className="absolute inset-0 animate-ping rounded-full bg-orange-200 opacity-40" />
                              <div className="relative rounded-full bg-orange-50 p-2 ring-4 ring-orange-100">
                                <TeacherAvatar speaking={false} size={120} />
                              </div>
                            </div>
                            <p className="mt-4 text-sm font-semibold text-orange-600">Thầy Minh đã sẵn sàng</p>
                            <h1 className="mt-1 text-2xl font-extrabold text-stone-900">{lesson.title}</h1>
                            <p className="mt-2 text-stone-600">{lesson.summary}</p>
                            <div className="mt-3 flex justify-center gap-3 text-xs text-stone-500">
                              <span>⏱ {lesson.minutes} phút</span>
                              <span>🎞 {scenes.filter((s) => s.type === "slide").length} slide</span>
                              <span>🎮 {scenes.filter((s) => s.type !== "slide").length} trò chơi</span>
                            </div>
                            <button
                              onClick={() => {
                                setStarted(true);
                                goTo(0, { play: true });
                              }}
                              className="mt-6 rounded-2xl bg-orange-500 px-10 py-3.5 text-lg font-extrabold text-white shadow-xl shadow-orange-500/30 transition hover:-translate-y-0.5 hover:bg-orange-600"
                            >
                              ▶ Vào lớp học
                            </button>
                            <p className="mt-3 text-xs text-stone-400">Bật loa 🔊 để nghe thầy giảng bài</p>
                          </div>
                        </div>
                      )}

                      {finished && (
                        <Completion
                          score={finalScore}
                          onRestart={() => {
                            setFinished(false);
                            setScores({});
                            goTo(0, { play: true });
                          }}
                          nextHref={nextHref}
                          backHref={backHref}
                        />
                      )}
                    </>
                  }
                >
                  {isSlide ? (
                    <SlideView scene={scene as SlideScene} visible={visible} spotlight={spot} onSpeakExample={speakEn} />
                  ) : (
                    <ActivityView key={scene.id} scene={scene as ActivityScene} onDone={onActivityDone} teacherSay={teacherSay} speakEn={speakEn} />
                  )}
                </FitStage>
              </div>
            </div>
          </div>

          {/* ===== Bàn giáo viên: phụ đề + điều khiển ===== */}
          <div className="shrink-0 px-3 pb-3 pt-3 md:px-6 md:pb-4">
            <div className="mx-auto flex max-w-[1600px] flex-col gap-3 rounded-3xl bg-white p-3 shadow-lg shadow-orange-900/5 ring-1 ring-orange-100 md:p-4 xl:flex-row xl:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="relative shrink-0">
                  <div className={`rounded-full p-0.5 transition ${speaking ? "bg-orange-400 shadow-lg shadow-orange-400/40" : "bg-orange-100"}`}>
                    <div className="rounded-full bg-white">
                      <TeacherAvatar speaking={speaking} size={56} />
                    </div>
                  </div>
                  {speaking && (
                    <span className="sound-wave absolute -bottom-1 -right-1 flex h-5 items-center gap-0.5 rounded-full bg-orange-500 px-1.5 text-white">
                      {[0, 0.2, 0.4].map((d) => (
                        <span key={d} style={{ height: 10, width: 2, animationDelay: `${d}s` }} />
                      ))}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-orange-600">
                    Thầy Minh <span className="font-medium text-stone-400">· {speaking ? "đang giảng…" : playing ? "chuẩn bị…" : "đang chờ bạn"}</span>
                  </div>
                  <div className="max-h-12 overflow-y-auto text-sm md:max-h-[4.5rem] md:text-[15px] leading-snug text-stone-700">
                    {subtitle ? (
                      <Rich text={subtitle} />
                    ) : (
                      <span className="text-stone-400">
                        {isSlide ? "Bấm ▶ để nghe thầy giảng, hoặc 💡 để thầy AI giải thích theo cách khác." : "Làm xong bài tập rồi bấm “Tiếp tục” nhé!"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 xl:justify-end">
                <div className="flex items-center gap-1 rounded-2xl bg-stone-50 p-1">
                  <CtrlButton onClick={() => goTo(sceneIdx - 1)} disabled={sceneIdx === 0} title="Phần trước">
                    ⏮
                  </CtrlButton>
                  <CtrlButton primary onClick={togglePlay} title={playing ? "Tạm dừng" : "Phát"}>
                    {playing ? "❚❚" : "▶"}
                  </CtrlButton>
                  <CtrlButton onClick={() => goTo(sceneIdx, { play: true })} title="Giảng lại phần này">
                    ↻
                  </CtrlButton>
                  <CtrlButton onClick={() => changePrefs({ ...prefs, muted: !prefs.muted })} title={prefs.muted ? "Bật tiếng" : "Tắt tiếng"}>
                    {prefs.muted ? "🔇" : "🔊"}
                  </CtrlButton>
                  {isSlide && (
                    <CtrlButton onClick={explainSlide} disabled={tutor.busy} title="Nhờ thầy AI giảng lại dễ hiểu hơn">
                      💡
                    </CtrlButton>
                  )}
                </div>
                <button
                  onClick={() => (isLast ? finish() : goTo(sceneIdx + 1))}
                  className={`shrink-0 rounded-2xl px-5 py-3 text-sm font-extrabold text-white shadow-md transition ${
                    canContinue ? "bg-orange-500 shadow-orange-500/30 hover:bg-orange-600" : "bg-stone-300 hover:bg-stone-400"
                  } ${sceneDone && !isSlide ? "animate-pulse" : ""}`}
                >
                  {isLast ? "Hoàn thành ✓" : "Tiếp tục →"}
                </button>
              </div>
            </div>
            <label className="mx-auto mt-2 flex max-w-[1600px] items-center justify-end gap-1.5 text-xs text-stone-400">
              <input type="checkbox" checked={autoNext} onChange={(e) => setAutoNext(e.target.checked)} className="accent-orange-500" />
              Tự chuyển slide khi thầy giảng xong
            </label>
          </div>
        </main>

        {/* ===== Bảng bên: hỏi đáp + mục lục ===== */}
        <aside
          className={`${panelOpen ? "fixed inset-0 z-40 flex" : "hidden"} w-full flex-col border-l border-orange-100 bg-white ${
            deskPanel ? "lg:static lg:z-auto lg:flex lg:w-[340px] 2xl:w-[380px]" : "lg:hidden"
          }`}
        >
          <div className="flex shrink-0 items-center gap-1 border-b border-orange-100 p-2">
            {(["chat", "outline"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setPanel(t)}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${panel === t ? "bg-orange-500 text-white" : "text-stone-500 hover:bg-orange-50"}`}
              >
                {t === "chat" ? "💬 Hỏi thầy AI" : "📑 Nội dung bài"}
              </button>
            ))}
            <button onClick={() => setPanelOpen(false)} className="px-3 text-stone-400 lg:hidden">
              ✕
            </button>
          </div>
          <div className="min-h-0 flex-1">
            {panel === "chat" ? (
              <ChatPanel
                messages={tutor.messages}
                busy={tutor.busy}
                status={tutor.status}
                onAsk={(q) => void tutor.ask({ question: q, scene })}
                onSpeak={(t) => teacherSay(forSpeech(t))}
              />
            ) : (
              <ol className="h-full space-y-1 overflow-y-auto p-3">
                {scenes.map((s, i) => (
                  <li key={s.id}>
                    <button
                      onClick={() => {
                        goTo(i);
                        setPanelOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition ${
                        i === sceneIdx ? "bg-orange-50 font-bold text-orange-800 ring-1 ring-orange-200" : "text-stone-700 hover:bg-stone-50"
                      }`}
                    >
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-bold ${
                          s.type === "slide" ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {s.type === "slide" ? i + 1 : "🎮"}
                      </span>
                      <span className="flex-1">{s.title}</span>
                      {scores[s.id] !== undefined && <span className="text-xs font-bold text-emerald-600">{Math.round(scores[s.id] * 100)}%</span>}
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function ActivityView(props: { scene: ActivityScene; onDone: (s: number) => void; teacherSay: (t: string) => void; speakEn: (t: string) => void }) {
  const { scene, ...rest } = props;
  switch (scene.type) {
    case "quiz":
      return <Quiz scene={scene} {...rest} />;
    case "fill":
    case "fix":
      return <TypeIn scene={scene} {...rest} />;
    case "sort":
      return <Sort scene={scene} {...rest} />;
    case "match":
      return <Match scene={scene} {...rest} />;
    case "order":
      return <Order scene={scene} {...rest} />;
  }
}

function CtrlButton({ children, onClick, disabled, title, primary }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; title: string; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`grid place-items-center rounded-xl transition disabled:opacity-30 ${
        primary
          ? "h-11 w-11 bg-orange-500 text-base font-bold text-white shadow-md shadow-orange-500/30 hover:bg-orange-600"
          : "h-10 w-10 text-lg text-stone-600 hover:bg-white hover:shadow-sm"
      }`}
    >
      {children}
    </button>
  );
}

const CONFETTI = ["#f97316", "#fb923c", "#fbbf24", "#10b981", "#fdba74"];

function Completion({ score, onRestart, nextHref, backHref }: { score: number; onRestart: () => void; nextHref?: string; backHref: string }) {
  const stars = score >= 90 ? 3 : score >= 60 ? 2 : 1;
  return (
    <div className="absolute inset-0 z-30 grid place-items-center overflow-hidden bg-white/95">
      {Array.from({ length: 30 }).map((_, i) => (
        <span
          key={i}
          className="confetti absolute top-0 h-3 w-2 rounded-sm"
          style={{ left: `${(i * 37) % 100}%`, background: CONFETTI[i % CONFETTI.length], animationDelay: `${(i % 7) * 0.15}s` }}
        />
      ))}
      <div className="anim-pop p-6 text-center">
        <div className="mx-auto w-fit rounded-full bg-orange-50 p-2 ring-4 ring-orange-100">
          <TeacherAvatar speaking={false} size={96} />
        </div>
        <div className="mt-4 flex justify-center gap-1 text-4xl">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`anim-pop ${i < stars ? "" : "opacity-20 grayscale"}`} style={{ animationDelay: `${0.3 + i * 0.2}s` }}>
              ⭐
            </span>
          ))}
        </div>
        <h2 className="mt-3 text-3xl font-extrabold text-stone-900">Hoàn thành bài học!</h2>
        <p className="mt-2 text-stone-600">
          Điểm luyện tập: <b className="text-2xl text-orange-600">{score}%</b>
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={onRestart} className="rounded-2xl bg-stone-100 px-5 py-3 font-bold text-stone-700 hover:bg-stone-200">
            ↻ Học lại
          </button>
          {nextHref && (
            <Link href={nextHref} className="rounded-2xl bg-orange-500 px-6 py-3 font-bold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600">
              Bài tiếp theo →
            </Link>
          )}
          <Link href={backHref} className="rounded-2xl px-5 py-3 font-bold text-orange-600 hover:bg-orange-50">
            Về lộ trình
          </Link>
        </div>
      </div>
    </div>
  );
}
