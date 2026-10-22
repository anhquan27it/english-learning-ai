"use client";

// Bài học do AI tạo được lưu trên trình duyệt của người tạo.
// Muốn đưa vào khóa học chính thức: tải file JSON về và thêm vào lib/courses.

import { useSyncExternalStore } from "react";
import type { Lesson } from "./types";

const KEY = "ela.customLessons";
const listeners = new Set<() => void>();
let cache: Lesson[] | null = null;
const EMPTY: Lesson[] = [];

function read(): Lesson[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    cache = [];
  }
  return cache!;
}

function write(list: Lesson[]) {
  cache = list;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    alert("Bộ nhớ trình duyệt đã đầy, không lưu được bài học.");
  }
  listeners.forEach((l) => l());
}

export const saveCustomLesson = (l: Lesson) => write([l, ...read().filter((x) => x.id !== l.id)]);
export const deleteCustomLesson = (id: string) => write(read().filter((x) => x.id !== id));

export function useCustomLessons(): Lesson[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => EMPTY,
  );
}
