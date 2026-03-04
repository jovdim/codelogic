"use client";

import { useCallback, useRef, useEffect } from "react";

/**
 * Sound effects hook — uses .mp3 files for main sounds,
 * Web Audio API only for heartLost, timerTick, countdown.
 */

type SoundType =
  | "correct"
  | "wrong"
  | "click"
  | "heartLost"
  | "levelComplete"
  | "levelFailed"
  | "timerTick"
  | "lessonAdvance"
  | "countdown";

// ── Audio file cache ──────────────────────────────────────────
const audioCache: Record<string, HTMLAudioElement> = {};

function playFile(path: string, volume: number = 0.7) {
  try {
    if (!audioCache[path]) {
      audioCache[path] = new Audio(path);
    }
    const audio = audioCache[path];
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {
    // Silently fail
  }
}

// ── Web Audio API (kept only for heartLost, timerTick, countdown) ──
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext || audioContext.state === "closed") {
    audioContext = new AudioContext();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume: number = 0.3,
  delay: number = 0,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
  gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    ctx.currentTime + delay + duration,
  );
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

// ── Sound effects map ─────────────────────────────────────────
// All volumes set to 0.7 for consistency
const soundEffects: Record<SoundType, () => void> = {
  // MP3 file-based sounds — all at 0.7 volume
  correct: () => playFile("/sound-effects/correct-answer-sound-effect.mp3", 0.7),
  wrong: () => playFile("/sound-effects/wrong-answer-sound-effect.mp3", 0.7),
  click: () => playFile("/sound-effects/mouse-click-sound-effect.mp3", 0.7),
  levelComplete: () => playFile("/sound-effects/Level complete.mp3", 0.7),
  levelFailed: () => playFile("/sound-effects/Level failed.mp3", 0.7),
  lessonAdvance: () => playFile("/sound-effects/mouse-click-sound-effect.mp3", 0.7),

  // Synthesized sounds (heartLost, timerTick, countdown only)
  heartLost: () => {
    const ctx = getAudioContext();
    playTone(ctx, 440, 0.12, "sine", 0.4, 0);
    playTone(ctx, 349.23, 0.15, "sine", 0.35, 0.1);
    playTone(ctx, 293.66, 0.25, "sine", 0.25, 0.2);
  },

  timerTick: () => {
    const ctx = getAudioContext();
    playTone(ctx, 1200, 0.03, "sine", 0.15, 0);
  },

  countdown: () => {
    const ctx = getAudioContext();
    playTone(ctx, 880, 0.08, "square", 0.2, 0);
    playTone(ctx, 880, 0.08, "square", 0.2, 0.15);
  },
};

// ── Preload MP3 files ─────────────────────────────────────────
const MP3_FILES = [
  "/sound-effects/correct-answer-sound-effect.mp3",
  "/sound-effects/wrong-answer-sound-effect.mp3",
  "/sound-effects/mouse-click-sound-effect.mp3",
  "/sound-effects/Level complete.mp3",
  "/sound-effects/Level failed.mp3",
];

function preloadSounds() {
  MP3_FILES.forEach((path) => {
    if (!audioCache[path]) {
      const audio = new Audio(path);
      audio.preload = "auto";
      audioCache[path] = audio;
    }
  });
}

// ── Hook ──────────────────────────────────────────────────────
export function useSoundEffects() {
  const enabledRef = useRef(true);

  useEffect(() => {
    preloadSounds();

    const initAudio = () => {
      getAudioContext();
      document.removeEventListener("click", initAudio);
      document.removeEventListener("keydown", initAudio);
    };
    document.addEventListener("click", initAudio, { once: true });
    document.addEventListener("keydown", initAudio, { once: true });
    return () => {
      document.removeEventListener("click", initAudio);
      document.removeEventListener("keydown", initAudio);
    };
  }, []);

  const play = useCallback((sound: SoundType) => {
    if (!enabledRef.current) return;
    try {
      soundEffects[sound]();
    } catch {
      // Silently fail if audio is not available
    }
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
  }, []);

  return { play, setEnabled };
}

export type { SoundType };
