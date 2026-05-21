"use client";

/**
 * Post-login face verification modal.
 *
 * Detection-only (any human face counts). The user has 3 attempts; each
 * attempt is a 30-second window during which we look for a face stable
 * for ~1 second. If they pass any attempt we call onSuccess. If they
 * exhaust all 3 or hit Cancel we call onAllAttemptsFailed / onCancel,
 * which the caller wires to backend logout.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";
import { Camera, AlertTriangle, CheckCircle2, X, Loader2 } from "lucide-react";
import { authAPI } from "@/lib/api";

type Phase =
  | "loading"
  | "permission"
  | "denied"
  | "searching"
  | "detected"
  | "passed"
  | "failed_attempt"
  | "error";

type Props = {
  open: boolean;
  onSuccess: () => void;
  onAllAttemptsFailed: () => void;
  onCancel: () => void;
};

const MAX_ATTEMPTS = 3;
const ATTEMPT_SECONDS = 30;
const STABILITY_MS = 1000;
const DETECT_INTERVAL_MS = 150;
const MIN_CONFIDENCE = 0.5;
// Downscale captured frames so the upload stays small (~30-80 KB at q=0.85).
const CAPTURE_MAX_EDGE = 640;
const CAPTURE_QUALITY = 0.85;

function captureVideoFrame(video: HTMLVideoElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) {
      resolve(null);
      return;
    }
    const scale = Math.min(1, CAPTURE_MAX_EDGE / Math.max(vw, vh));
    const w = Math.round(vw * scale);
    const h = Math.round(vh * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve(null);
      return;
    }
    ctx.drawImage(video, 0, 0, w, h);
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", CAPTURE_QUALITY);
  });
}

export default function LoginFaceVerification({
  open,
  onSuccess,
  onAllAttemptsFailed,
  onCancel,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const stableSinceRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<Phase>("loading");
  const [attempt, setAttempt] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(ATTEMPT_SECONDS);

  const stopCamera = useCallback(() => {
    if (detectTimerRef.current !== null) {
      window.clearInterval(detectTimerRef.current);
      detectTimerRef.current = null;
    }
    if (countdownTimerRef.current !== null) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
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

  const startAttempt = useCallback(async () => {
    setPhase("loading");
    setSecondsLeft(ATTEMPT_SECONDS);
    stableSinceRef.current = null;

    try {
      if (!faceapi.nets.tinyFaceDetector.params) {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      }

      // Reuse existing stream across attempts so we don't re-prompt for
      // camera permission on attempt 2 / 3.
      if (!streamRef.current) {
        setPhase("permission");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
      }

      setPhase("searching");

      countdownTimerRef.current = window.setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            // Stop BOTH timers — otherwise the detect loop will tick once
            // more after we set "failed_attempt" and clobber the phase
            // (e.g. back to "searching"), so the failed-attempt handler
            // never gets to advance to the next attempt or log out.
            if (countdownTimerRef.current !== null) {
              window.clearInterval(countdownTimerRef.current);
              countdownTimerRef.current = null;
            }
            if (detectTimerRef.current !== null) {
              window.clearInterval(detectTimerRef.current);
              detectTimerRef.current = null;
            }
            stableSinceRef.current = null;
            setPhase("failed_attempt");
            return 0;
          }
          return s - 1;
        });
      }, 1000);

      const opts = new faceapi.TinyFaceDetectorOptions({
        inputSize: 320,
        scoreThreshold: MIN_CONFIDENCE,
      });

      detectTimerRef.current = window.setInterval(async () => {
        const video = videoRef.current;
        if (!video || video.readyState < 2) return;
        const result = await faceapi.detectSingleFace(video, opts);
        // The interval may have been cancelled while detectSingleFace was
        // awaiting (e.g. timer expired or the user passed). If so, drop
        // this late result — otherwise it can clobber "failed_attempt"
        // back to "searching" and the modal gets stuck.
        if (detectTimerRef.current === null) return;
        if (result && result.score >= MIN_CONFIDENCE) {
          if (stableSinceRef.current === null) {
            stableSinceRef.current = Date.now();
            setPhase("detected");
          } else if (Date.now() - stableSinceRef.current >= STABILITY_MS) {
            window.clearInterval(detectTimerRef.current!);
            detectTimerRef.current = null;
            window.clearInterval(countdownTimerRef.current!);
            countdownTimerRef.current = null;
            setPhase("passed");

            // Capture a JPEG from the current frame BEFORE we tear down
            // the camera stream, then upload it to the backend. If the
            // upload fails (network/etc) we still let the user through —
            // the detection passed locally, audit photo is best-effort.
            const videoEl = videoRef.current;
            const blobPromise = videoEl
              ? captureVideoFrame(videoEl)
              : Promise.resolve(null);

            blobPromise
              .then((blob) => (blob ? authAPI.loginFaceVerify(blob) : null))
              .catch((err) => {
                console.warn("Login face snapshot upload failed:", err);
              })
              .finally(() => {
                stopCamera();
                onSuccess();
              });
          }
        } else {
          stableSinceRef.current = null;
          setPhase("searching");
        }
      }, DETECT_INTERVAL_MS);
    } catch (err) {
      const name = (err as { name?: string })?.name;
      if (name === "NotAllowedError" || name === "NotFoundError" || name === "OverconstrainedError") {
        setPhase("denied");
      } else {
        setPhase("error");
      }
    }
  }, [onSuccess, stopCamera]);

  // Start first attempt when modal opens.
  useEffect(() => {
    if (!open) return;
    setAttempt(1);
    startAttempt();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Handle the end of an attempt — either advance to next attempt or fail.
  useEffect(() => {
    if (phase !== "failed_attempt") return;
    if (attempt >= MAX_ATTEMPTS) {
      stopCamera();
      onAllAttemptsFailed();
      return;
    }
    const t = window.setTimeout(() => {
      setAttempt((a) => a + 1);
      startAttempt();
    }, 1500);
    return () => window.clearTimeout(t);
  }, [phase, attempt, onAllAttemptsFailed, startAttempt, stopCamera]);

  const handleCancel = () => {
    stopCamera();
    onCancel();
  };

  if (!open) return null;

  const statusLine = () => {
    switch (phase) {
      case "loading":
        return "Loading face detection model…";
      case "permission":
        return "Requesting camera permission…";
      case "denied":
        return "Camera permission denied. Please allow camera access to continue.";
      case "searching":
        return "Position your face inside the frame.";
      case "detected":
        return "Face detected — hold still…";
      case "passed":
        return "Verified!";
      case "failed_attempt":
        return attempt >= MAX_ATTEMPTS
          ? "Verification failed. Logging you out…"
          : `No face detected. Starting attempt ${attempt + 1}…`;
      case "error":
        return "Something went wrong with the camera. Please try again.";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="pixel-box w-full max-w-md mx-4 p-6 bg-[var(--bg-card,#1a1a2e)] border-2 border-purple-500/40">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-purple-400" />
              Face Verification
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Verify it&apos;s really you before continuing.
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-white p-1"
            aria-label="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="text-gray-300">
            Attempt <span className="font-bold text-white">{attempt}</span> of {MAX_ATTEMPTS}
          </span>
          <span
            className={`font-mono ${secondsLeft <= 5 ? "text-red-400" : "text-gray-300"}`}
          >
            {phase === "passed" ? "—" : `${secondsLeft}s`}
          </span>
        </div>

        <div className="relative aspect-[3/4] sm:aspect-video bg-black overflow-hidden border border-purple-500/30 mb-3">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className={`w-[78%] sm:w-[50%] aspect-[3/4] rounded-[50%] border-4 transition-colors ${
                phase === "detected"
                  ? "border-green-400/80"
                  : phase === "passed"
                  ? "border-green-500"
                  : "border-purple-400/60"
              }`}
            />
          </div>
          {phase === "passed" && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
              <CheckCircle2 className="w-16 h-16 text-green-400" />
            </div>
          )}
          {(phase === "loading" || phase === "permission") && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
            </div>
          )}
        </div>

        <div
          className={`flex items-start gap-2 text-sm px-3 py-2 border ${
            phase === "denied" || phase === "error" || phase === "failed_attempt"
              ? "border-red-500/50 bg-red-500/10 text-red-300"
              : phase === "passed"
              ? "border-green-500/50 bg-green-500/10 text-green-300"
              : "border-purple-500/30 bg-purple-500/5 text-gray-300"
          }`}
        >
          {(phase === "denied" || phase === "error" || phase === "failed_attempt") && (
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{statusLine()}</span>
        </div>

        <button
          onClick={handleCancel}
          disabled={phase === "passed"}
          className="w-full mt-3 px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-700/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Cancel and log out
        </button>
      </div>
    </div>
  );
}
