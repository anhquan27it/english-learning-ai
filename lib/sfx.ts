"use client";

// Hiệu ứng âm thanh tạo bằng Web Audio API — không cần file âm thanh.

let ctx: AudioContext | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.15) {
  const a = audio();
  if (!a) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = a.currentTime + start;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export const sfx = {
  correct() {
    tone(660, 0, 0.15, "triangle");
    tone(880, 0.1, 0.25, "triangle");
  },
  wrong() {
    tone(220, 0, 0.25, "sawtooth", 0.08);
    tone(180, 0.12, 0.3, "sawtooth", 0.08);
  },
  pop() {
    tone(520, 0, 0.08, "sine", 0.1);
  },
  win() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.12, 0.3, "triangle"));
  },
};
