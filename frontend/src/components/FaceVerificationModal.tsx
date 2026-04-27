"use client";

/**
 * Face-verification modal.
 *
 * Flow: opens camera -> shows oval guide -> tinyFaceDetector runs ~10fps ->
 * once exactly one face is detected centered in the oval and stable for ~1s,
 * we auto-snap a JPEG and hand it to onCaptured. 30s timer; on expiry the
 * camera stays armed and the timer resets (no permission re-prompt).
 *
 * Tab-visibility: if the user switches tabs / minimizes / locks the screen,
 * we release the camera and call onCancel. Stops them parking the camera
 * while they look up answers in another tab.
 *
 * No matching, no enrollment - capture-only. The bytes go to the quiz-start
 * endpoint, which stores them on the QuizAttempt for admin review.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";
import { X } from "lucide-react";

type Phase =
  | "loading"
  | "permission"
  | "denied"
  | "searching"
  | "multiple"
  | "not_centered"
  | "low_quality"   // face detected but confidence too low (blurry / occluded / off-angle)
  | "low_light"     // not enough light on the face area
  | "centered"
  | "captured"
  | "error";

type Props = {
  open: boolean;
  onCaptured: (blob: Blob) => void;
  onCancel: () => void;
};

const TIMER_SECONDS = 30;
const STABILITY_MS = 1000;
const DETECT_INTERVAL_MS = 100;
const CAPTURE_QUALITY = 0.85;
const CAPTURE_MAX_EDGE = 640;
// Face-detector confidence required for capture. Below this, the frame is
// likely blurry, off-angle, or partially occluded - reject it.
const MIN_CONFIDENCE = 0.85;
// Average luminance (0-255) inside the face box. Anything dimmer = too dark
// to recognise the person from the photo later.
const MIN_BRIGHTNESS = 60;

export default function FaceVerificationModal({ open, onCaptured, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectTimerRef = useRef<number | null>(null);
  const stableSinceRef = useRef<number | null>(null);
  const phaseRef = useRef<Phase>("loading");
  // Reused offscreen canvas for the brightness sample - avoids reallocating
  // on every detection tick.
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [phase, setPhase] = useState<Phase>("loading");
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

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

  const start = useCallback(async () => {
    setPhase("loading");
    try {
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
      if (
        current === "captured" ||
        current === "denied" ||
        current === "error" ||
        current === "loading" ||
        current === "permission"
      ) {
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

      const cx = vw / 2;
      const cy = vh / 2;
      const rx = vw * 0.3;
      const ry = vh * 0.4;

      const faceCx = x + width / 2;
      const faceCy = y + height / 2;
      const dx = (faceCx - cx) / rx;
      const dy = (faceCy - cy) / ry;
      const insideOval = dx * dx + dy * dy <= 1;
      const sizeRatio = width / vw;
      const sizeOk = sizeRatio >= 0.18 && sizeRatio <= 0.6;

      if (!insideOval || !sizeOk) {
        stableSinceRef.current = null;
        setPhase("not_centered");
        return;
      }

      // Quality gate 1: detector confidence. tinyFaceDetector returns lower
      // scores on blurry / off-angle / partially-covered faces.
      if (det.score < MIN_CONFIDENCE) {
        stableSinceRef.current = null;
        setPhase("low_quality");
        return;
      }

      // Quality gate 2: brightness inside the face box. Sample a small slice
      // of pixels via an offscreen canvas and average their luminance.
      let canvas = sampleCanvasRef.current;
      if (!canvas) {
        canvas = document.createElement("canvas");
        sampleCanvasRef.current = canvas;
      }
      const SAMPLE_W = 32;
      const SAMPLE_H = 32;
      canvas.width = SAMPLE_W;
      canvas.height = SAMPLE_H;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      let bright = 0;
      if (ctx) {
        ctx.drawImage(video, x, y, width, height, 0, 0, SAMPLE_W, SAMPLE_H);
        const data = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H).data;
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
          // Rec.709 luma approximation.
          sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        }
        bright = sum / (data.length / 4);
      }

      if (bright < MIN_BRIGHTNESS) {
        stableSinceRef.current = null;
        setPhase("low_light");
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
    if (
      phase === "loading" ||
      phase === "permission" ||
      phase === "denied" ||
      phase === "error" ||
      phase === "captured"
    ) {
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

  // ---- auto-cancel when tab is hidden / window loses focus ----
  // Stops the user from parking the camera open and switching tabs to look
  // up answers. Coming back means they have to re-verify from scratch.
  useEffect(() => {
    if (!open) return;
    const handle = () => {
      if (document.hidden) {
        stop();
        onCancel();
      }
    };
    document.addEventListener("visibilitychange", handle);
    window.addEventListener("blur", handle);
    return () => {
      document.removeEventListener("visibilitychange", handle);
      window.removeEventListener("blur", handle);
    };
  }, [open, stop, onCancel]);

  if (!open) return null;

  const status = (() => {
    switch (phase) {
      case "loading":      return "Loading face detector...";
      case "permission":   return "Allow camera access to continue.";
      case "denied":       return "Camera blocked. You need to enable the camera to take the quiz.";
      case "error":        return "Something went wrong starting the camera.";
      case "searching":    return "Position your face in the oval.";
      case "multiple":     return "Only one person should be visible.";
      case "not_centered": return "Center your face inside the oval.";
      case "low_quality":  return "Hold steady - keep your face clear and uncovered.";
      case "low_light":    return "Too dark - move to a brighter spot.";
      case "centered":     return "Hold still...";
      case "captured":     return "Captured - starting quiz.";
    }
  })();

  const ringColor =
    phase === "centered" ? "#10b981" :
    phase === "multiple" || phase === "not_centered" || phase === "low_quality" || phase === "low_light" ? "#f59e0b" :
    phase === "denied" || phase === "error" ? "#ef4444" :
    "#6366f1";

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Face verification</h2>
            <p className="text-xs text-gray-500">Required before each quiz</p>
          </div>
          <div className="flex items-center gap-2">
            {phase !== "denied" && phase !== "error" && phase !== "loading" && phase !== "permission" && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold tabular-nums text-gray-700">
                {secondsLeft}s
              </span>
            )}
            <button
              type="button"
              onClick={onCancel}
              aria-label="Cancel"
              className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Camera area - taller on mobile, ratio 3:4 */}
        <div className="relative mx-5 overflow-hidden rounded-2xl bg-black aspect-[3/4] sm:aspect-[4/3]">
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />

          {/* Oval overlay - bigger on mobile (portrait), regular on desktop */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            <defs>
              <mask id="ovalMaskV2">
                <rect width="100" height="100" fill="white" />
                <ellipse cx="50" cy="50" rx="34" ry="42" fill="black" />
              </mask>
            </defs>
            <rect width="100" height="100" fill="rgba(0,0,0,0.45)" mask="url(#ovalMaskV2)" />
            <ellipse
              cx="50"
              cy="50"
              rx="34"
              ry="42"
              fill="none"
              stroke={ringColor}
              strokeWidth="0.6"
              vectorEffect="non-scaling-stroke"
              style={{ strokeDasharray: phase === "centered" ? undefined : "2 1.5" }}
            />
          </svg>
        </div>

        {/* Status */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: ringColor }}
            />
            <p className="text-sm font-medium text-gray-800">{status}</p>
          </div>
          {(phase === "denied" || phase === "error") && (
            <p className="mt-2 text-xs text-gray-500">
              You can&apos;t take the quiz without enabling the camera. Update your browser settings and retry.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-5 pb-5">
          {phase === "denied" || phase === "error" ? (
            <>
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => void start()}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Retry
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
