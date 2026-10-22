import type { Action } from "../types";

/** Giáo viên nói. Bọc tiếng Anh trong `backtick` để đọc bằng giọng tiếng Anh. */
export const say = (text: string): Action => ({ type: "speech", text });
/** Hiện block có id tương ứng (block sẽ ẩn cho tới lúc này). */
export const show = (target: string): Action => ({ type: "reveal", target });
/** Làm nổi bật block. */
export const focus = (target: string): Action => ({ type: "spotlight", target });
export const pause = (ms: number): Action => ({ type: "pause", ms });
