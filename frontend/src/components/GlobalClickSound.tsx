"use client";

import { useEffect } from "react";

/**
 * Global click sound component.
 * Plays the mouse-click sound effect on every clickable element:
 * buttons, links, and elements with cursor: pointer.
 */

const CLICK_SOUND_PATH = "/sound-effects/mouse-click-sound-effect.mp3";

// Clickable element selectors
const CLICKABLE_TAGS = new Set(["BUTTON", "A", "SELECT", "SUMMARY"]);

function isClickable(el: HTMLElement): boolean {
  if (CLICKABLE_TAGS.has(el.tagName)) return true;
  if (el.getAttribute("role") === "button") return true;
  if (el.style.cursor === "pointer") return true;
  if (typeof window !== "undefined") {
    const computed = window.getComputedStyle(el);
    if (computed.cursor === "pointer") return true;
  }
  return false;
}

function findClickableParent(el: HTMLElement | null, maxDepth = 5): boolean {
  let current = el;
  let depth = 0;
  while (current && depth < maxDepth) {
    // Skip elements that opt out of the global click sound
    if (current.dataset.noClickSound !== undefined) return false;
    if (isClickable(current)) return true;
    current = current.parentElement;
    depth++;
  }
  return false;
}

export default function GlobalClickSound() {
  useEffect(() => {
    // Preload
    const preload = new Audio(CLICK_SOUND_PATH);
    preload.preload = "auto";
    preload.load();

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      if (findClickableParent(target)) {
        try {
          // Create a fresh audio instance each time for full volume playback
          const audio = new Audio(CLICK_SOUND_PATH);
          audio.volume = 1.0;
          audio.play().catch(() => {});
        } catch {
          // Silently fail
        }
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
