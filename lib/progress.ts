"use client";

// Tiến độ học lưu trên trình duyệt của học viên (chưa có tài khoản đăng nhập).

import { useSyncExternalStore } from "react";

export interface LessonProgress {
  completed: boolean;
  bestScore: number; // 0..100
  lastScene: number;
  updatedAt: number;
}

type ProgressMap = Record<string, LessonProgress>;

const KEY = "ela.progress";
const listeners = new Set<() => void>();
let cache: ProgressMap | null = null;

function read(): ProgressMap {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    cache = {};
  }
  return cache!;
}

const EMPTY: ProgressMap = {};

export const progressKey = (courseId: string, lessonId: string) => `${courseId}/${lessonId}`;

export function updateProgress(key: string, patch: Partial<LessonProgress>) {
  const all = { ...read() };
  const prev = all[key] ?? { completed: false, bestScore: 0, lastScene: 0, updatedAt: 0 };
  all[key] = {
    ...prev,
    ...patch,
    bestScore: Math.max(prev.bestScore, patch.bestScore ?? 0),
    completed: prev.completed || !!patch.completed,
    updatedAt: Date.now(),
  };
  cache = all;
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {}
  listeners.forEach((l) => l());
}

export function useProgress(): ProgressMap {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => EMPTY,
  );
}
