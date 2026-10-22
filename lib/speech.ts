"use client";

import { useSyncExternalStore } from "react";

// Giọng nói giáo viên dùng Web Speech API của trình duyệt: miễn phí hoàn toàn,
// không cần máy chủ, không cần API key. Edge có giọng tiếng Việt tự nhiên
// (Microsoft HoaiMy/NamMinh Online), Chrome/Windows dùng giọng hệ thống.
//
// Quy ước: phần nằm trong `backtick` được đọc bằng giọng tiếng Anh.

export type Lang = "vi" | "en";

export interface Segment {
  lang: Lang;
  text: string;
}

export interface VoicePrefs {
  vi?: string; // voiceURI
  en?: string;
  rate: number;
  muted: boolean;
}

const PREFS_KEY = "ela.voicePrefs";
const DEFAULT_PREFS: VoicePrefs = { rate: 1, muted: false };

export function loadVoicePrefs(): VoicePrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

let prefsCache: VoicePrefs | null = null;
const prefsListeners = new Set<() => void>();

/** Cài đặt giọng hiện tại (đọc một lần từ localStorage rồi giữ trong bộ nhớ) */
export function currentVoicePrefs(): VoicePrefs {
  return (prefsCache ??= loadVoicePrefs());
}

export function saveVoicePrefs(p: VoicePrefs) {
  prefsCache = p;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  } catch {}
  prefsListeners.forEach((l) => l());
}

export function useVoicePrefs(): VoicePrefs {
  return useSyncExternalStore(
    (cb) => {
      prefsListeners.add(cb);
      return () => prefsListeners.delete(cb);
    },
    currentVoicePrefs,
    () => DEFAULT_PREFS,
  );
}

export function splitSegments(text: string): Segment[] {
  const out: Segment[] = [];
  text.split(/(`[^`]+`)/).forEach((part) => {
    if (!part.trim()) return;
    if (part.startsWith("`") && part.endsWith("`")) out.push({ lang: "en", text: part.slice(1, -1) });
    else out.push({ lang: "vi", text: part });
  });
  return out;
}

/** Bỏ dấu backtick để hiển thị phụ đề */
export const plainText = (text: string) => text.replace(/`/g, "");

const supported = () => typeof window !== "undefined" && "speechSynthesis" in window;

export function getVoices(): SpeechSynthesisVoice[] {
  return supported() ? window.speechSynthesis.getVoices() : [];
}

export function onVoicesChanged(cb: () => void): () => void {
  if (!supported()) return () => {};
  const synth = window.speechSynthesis;
  synth.addEventListener("voiceschanged", cb);
  return () => synth.removeEventListener("voiceschanged", cb);
}

// Ưu tiên giọng nam tự nhiên cho thầy Minh, rồi tới các giọng chất lượng cao khác.
const MALE = /namminh|guy|andrew|christopher|brian|davis|eric|roger|steffan|male|daniel|david|mark|google uk english male/i;
const QUALITY = /natural|online|neural|google|hoaimy|namminh|aria|jenny|guy|andrew|samantha/i;

export function pickVoice(lang: Lang, preferredURI?: string): SpeechSynthesisVoice | undefined {
  const voices = getVoices();
  if (preferredURI) {
    const v = voices.find((v) => v.voiceURI === preferredURI);
    if (v) return v;
  }
  const prefix = lang === "vi" ? "vi" : "en";
  const candidates = voices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
  if (lang === "en") {
    const us = candidates.filter((v) => /en[-_]us/i.test(v.lang));
    return (
      us.find((v) => MALE.test(v.name) && QUALITY.test(v.name)) ??
      us.find((v) => MALE.test(v.name)) ??
      us.find((v) => QUALITY.test(v.name)) ??
      us[0] ??
      candidates[0]
    );
  }
  return candidates.find((v) => MALE.test(v.name)) ?? candidates.find((v) => QUALITY.test(v.name)) ?? candidates[0];
}

// Tách câu dài để tránh lỗi Chrome dừng đọc sau ~15 giây.
function chunk(text: string): string[] {
  return text
    .split(/(?<=[.!?;:])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

let currentToken = 0;

export function stopSpeaking() {
  currentToken++;
  if (supported()) window.speechSynthesis.cancel();
}

export interface SpeakOptions {
  prefs?: VoicePrefs;
  onBoundary?: () => void;
}

/** Đọc một đoạn văn bản (có thể lẫn tiếng Anh trong backtick). Resolve khi đọc xong hoặc bị dừng. */
export async function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  const prefs = opts.prefs ?? DEFAULT_PREFS;
  stopSpeaking();
  const token = ++currentToken;
  const segments = splitSegments(text);

  // Tắt tiếng hoặc trình duyệt không hỗ trợ: giả lập thời gian đọc để phụ đề vẫn chạy.
  if (prefs.muted || !supported()) {
    const ms = Math.min(12000, Math.max(1200, plainText(text).length * 55)) / prefs.rate;
    await new Promise((r) => setTimeout(r, ms));
    return;
  }

  const synth = window.speechSynthesis;
  for (const seg of segments) {
    const voice = pickVoice(seg.lang, seg.lang === "vi" ? prefs.vi : prefs.en);
    for (const piece of chunk(seg.text)) {
      if (token !== currentToken) return;
      await new Promise<void>((resolve) => {
        const u = new SpeechSynthesisUtterance(piece);
        u.lang = seg.lang === "vi" ? "vi-VN" : "en-US";
        if (voice) u.voice = voice;
        u.rate = prefs.rate * (seg.lang === "en" ? 0.92 : 1);
        u.onboundary = () => opts.onBoundary?.();
        // Phòng trường hợp onend không bao giờ được gọi.
        const guard = setTimeout(resolve, 4000 + piece.length * 140);
        u.onend = u.onerror = () => {
          clearTimeout(guard);
          resolve();
        };
        synth.speak(u);
      });
    }
  }
}

/** Đọc một câu tiếng Anh (dùng khi bấm vào ví dụ) */
export function speakEnglish(text: string, prefs?: VoicePrefs) {
  return speak("`" + text.replace(/`/g, "") + "`", { prefs: prefs ? { ...prefs, muted: false } : undefined });
}
