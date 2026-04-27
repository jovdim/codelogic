"use client";

/**
 * Face-verification modal.
 *
 * Flow: opens camera → shows oval guide → tinyFaceDetector runs ~10fps →
 * once exactly one face is detected centered in the oval and stable for ~1s,
 * we auto-snap a JPEG and hand it to onCaptured. 30s timer; on expiry the
 * camera stays armed and the timer resets (no permission re-prompt). User
 * can cancel anytime.
 *
 * No matching, no enrollment — capture-only. The bytes go straight to the
 * quiz-start endpoint, which stores them on the QuizAttempt for later
 * admin review.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";

type Phase =
  | "loading"        // models / camera not ready yet
  | "permission"     // waiting on getUserMedia prompt
  | "denied"         // user said no, or no webcam
  | "searching"      // camera live, no face yet
  | "multiple"       // >1 face in frame
  | "not_centered"   // 1 face, but outside the oval
  | "centered"       // 1 face inside oval, accumulating stability
  | "captured"       // snapped — modal will close
  | "error";         // misc fatal error

type Props = {
  open: boolean;
  onCaptured: (blob: Blob) => void;
  onCancel: () => void;
};

const TIMER_SECONDS = 30;
// Hold the centered state this long before snapping. Stops blurry mid-motion.
const STABILITY_MS = 1000;
// Detector cadence. 10fps is plenty smooth and cheap.
const DETECT_INTERVAL_MS = 100;
// JPEG quality on capture — 0.85 strikes a balance between size and clarity.
const CAPTURE_QUALITY = 0.85;
// Downscale long edge before encoding so the upload stays under ~100KB.
const CAPTURE_MAX_EDGE = 640;

export default function FaceVerificationModal({ open, onCaptured, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectTimerRef = useRef<number | null>(null);
  const stableSinceRef = useRef<number | null>(null);
  const phaseRef = useRef<Phase>("loading");

  const [phase, setPhase] = useState<Phase>("loading");
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);

  // Keep phaseRef in sync so the detect loop can read current phase without re-binding.
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // ---- model + camera bring-up ----
  const start = useCallback(async () => {
    setPhase("loading");
    try {
      // Models load once, then cached by the browser.
      if (!faceapi.nets.tinyFaceDetector.params) {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      }

      setPhase("permission");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();

      setSecondsLeft(TIMER_SECONDS);
      stableSinceRef.current = null;
      setPhase("searching");
    } catch (err) {
      console.error("Camera/model init failed:", err);
      const name = (err as { name?: string })?.name;
      if (name === "NotAllowedError" || name === "NotFoundError" || name === "OverconstrainedError") {
        setPhase("denied");
      } else {
        setPhase("error");
      }
    }
  }, []);

  const stop = useCallback(() => {
    if (detectTimerRef.current !== null) {
      window.clearInterval(detectTimerRef.current);
      detectTimerRef.current = null;
    }
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    stableSinceRef.current = null;
  }, []);

  // ---- snap and hand off ----
  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;

    const scale = Math.min(1, CAPTURE_MAX_EDGE / Math.max(w, h));
    const tw = Math.round(w * scale);
    const th = Math.round(h * scale);

    const canvas = document.createElement("canvas");
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, tw, th);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setPhase("captured");
        stop();
        onCaptured(blob);
      },
      "image/jpeg",
      CAPTURE_QUALITY,
    );
  }, [onCaptured, stop]);

  // ---- detection loop ----
  useEffect(() => {
    if (!open) return;

    const tick = async () => {
      const video = videoRef.current;
      const current = phaseRef.current;
      if (!video || video.readyState < 2) return;
      // Once captured we stop processing.
      if (current === "captured" || current === "denied" || current === "error" || current === "loading" || current === "permission") {
        return;
      }

      const detections = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }),
      );

      if (detections.length === 0) {
        stableSinceRef.current = null;
        setPhase("searching");
        return;
      }
      if (detections.length > 1) {
        stableSinceRef.current = null;
        setPhase("multiple");
        return;
      }

      const det = detections[0];
      const { x, y, width, height } = det.box;
      const vw = video.videoWidth;
      const vh = video.videoHeight;

      // Oval target: centered, 60% of video width, 80% of video height.
      const cx = vw / 2;
      const cy = vh / 2;
      const rx = vw * 0.3;  // half-width
      const ry = vh * 0.4;  // half-height

      const faceCx = x + width / 2;
      const faceCy = y + height / 2;
      const dx = (faceCx - cx) / rx;
      const dy = (faceCy - cy) / ry;
      const insideOval = dx * dx + dy * dy <= 1;
      // Face shouldn't be tiny (too far) or huge (too close).
      const sizeRatio = width / vw;
      const sizeOk = sizeRatio >= 0.18 && sizeRatio <= 0.6;

      if (!insideOval || !sizeOk) {
        stableSinceRef.current = null;
        setPhase("not_centered");
        return;
      }

      const now = performance.now();
      if (stableSinceRef.current === null) {
        stableSinceRef.current = now;
      }
      setPhase("centered");
      if (now - stableSinceRef.current >= STABILITY_MS) {
        capture();
      }
    };

    detectTimerRef.current = window.setInterval(() => {
      void tick();
    }, DETECT_INTERVAL_MS);

    return () => {
      if (detectTimerRef.current !== null) {
        window.clearInterval(detectTimerRef.current);
        detectTimerRef.current = null;
      }
    };
  }, [open, capture]);

  // ---- 30s timer (resets when it hits zero, no permission re-prompt) ----
  useEffect(() => {
    if (!open) return;
    if (phase === "loading" || phase === "permission" || phase === "denied" || phase === "error" || phase === "captured") {
      return;
    }

    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          stableSinceRef.current = null;
          return TIMER_SECONDS;
        }
        return s - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [open, phase]);

  // ---- mount/unmount the camera with the modal ----
  useEffect(() => {
    if (open) {
      void start();
    }
    return () => stop();
  }, [open, start, stop]);

  if (!open) return null;

  const status = (() => {
    switch (phase) {
      case "loading":      return "Loading face detector…";
      case "permission":   return "Allow camera access to continue.";
      case "denied":       return "Camera blocked. You can't take the quiz without enabling the camera.";
      case "error":        return "Something went wrong starting the camera.";
      case "searching":    return "Position your face in the oval.";
      case "multiple":     return "Only one person should be visible.";
      case "not_centered": return "Center your face inside the oval.";
      case "centered":     return "Hold still…";
      case "captured":     return "Captured — starting quiz.";
    }
  })();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 p-5 text-white shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Face verification</h2>
          {phase !== "denied" && phase !== "error" && phase !== "loading" && phase !== "permission" && (
            <span className="rounded bg-zinc-800 px-2 py-1 text-sm tabular-nums">
              {secondsLeft}s
            </span>
          )}
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black">
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Oval overlay — pure SVG, drawn over the video. */}
          <svg viewBox="0 0 100 75" className="pointer-events-none absolute inset-0 h-full w-full">
            <defs>
              <mask id="ovalMask">
                <rect width="100" height="75" fill="white" />
                <ellipse cx="50" cy="37.5" rx="22" ry="28" fill="black" />
              </mask>
            </defs>
            <rect width="100" height="75" fill="rgba(0,0,0,0.55)" mask="url(#ovalMask)" />
            <ellipse
              cx="50"
              cy="37.5"
              rx="22"
              ry="28"
              fill="none"
              stroke={
                phase === "centered" ? "#22c55e" :
                phase === "multiple" || phase === "not_centered" ? "#f59e0b" :
                "#ffffff"
              }
              strokeWidth="0.6"
            />
          </svg>
        </div>

        <p className="mt-3 min-h-[2.5em] text-center text-sm text-zinc-200">
          {status}
        </p>

        <div className="mt-4 flex justify-end gap-2">
          {phase === "denied" || phase === "error" ? (
            <>
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-600"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => void start()}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500"
              >
                Retry
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-600"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
