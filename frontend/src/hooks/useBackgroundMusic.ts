"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "bg-music-playing";

// Global singleton — survives component mount/unmount and page navigation
let globalAudio: HTMLAudioElement | null = null;
let globalIsPlaying = false;
let resumeListenerAdded = false;
const listeners = new Set<(playing: boolean) => void>();

function getAudio(): HTMLAudioElement {
  if (!globalAudio) {
    globalAudio = new Audio("/sound-effects/background-music.mp3");
    globalAudio.loop = true;
    globalAudio.volume = 0.3;
  }
  return globalAudio;
}

function notify(playing: boolean) {
  globalIsPlaying = playing;
  listeners.forEach((fn) => fn(playing));
}

// Resume music on first user interaction after a reload (browsers block autoplay)
function addResumeListener() {
  if (resumeListenerAdded) return;
  resumeListenerAdded = true;

  const resume = () => {
    if (localStorage.getItem(STORAGE_KEY) === "true" && !globalIsPlaying) {
      const audio = getAudio();
      audio.play().then(() => notify(true)).catch(() => {});
    }
    document.removeEventListener("click", resume);
    document.removeEventListener("keydown", resume);
  };

  document.addEventListener("click", resume, { once: true });
  document.addEventListener("keydown", resume, { once: true });
}

export function useBackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(globalIsPlaying);

  useEffect(() => {
    listeners.add(setIsPlaying);

    // Try to auto-resume; if blocked, wait for first interaction
    const audio = getAudio();
    if (localStorage.getItem(STORAGE_KEY) === "true" && !globalIsPlaying && audio.paused) {
      audio.play().then(() => notify(true)).catch(() => {
        // Autoplay blocked — resume on first user interaction
        addResumeListener();
        // Still show as "playing" since it will resume on interaction
        notify(true);
      });
    }

    setIsPlaying(globalIsPlaying);

    return () => {
      listeners.delete(setIsPlaying);
    };
  }, []);

  const toggle = useCallback(() => {
    const audio = getAudio();

    if (globalIsPlaying) {
      audio.pause();
      localStorage.setItem(STORAGE_KEY, "false");
      notify(false);
    } else {
      audio.play().then(() => {
        localStorage.setItem(STORAGE_KEY, "true");
        notify(true);
      }).catch(() => {});
    }
  }, []);

  return { isPlaying, toggle };
}
