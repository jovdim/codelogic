"use client";

/**
 * In-quiz camera monitor.
 *
 * Stays mounted for the entire quiz. Owns its own getUserMedia stream and
 * runs face-api.js TinyFaceDetector at ~5fps. Reports state changes via
 * `onStateChange` (one of: ok | no_face | multiple_faces | denied | error)
 * and posts snapshots to the backend on:
 *
 *   - a random 25-50s schedule while state === "ok"
 *   - face_lost / multiple_faces / face_returned / tab_hidden events
 *
 * The component renders an internal hidden video element that drives the
 * detector. A separate ref-forwarded preview slot (`previewSlotRef`)
 * receives the same MediaStream so the pause modal can show a live mirror
 * of the camera without us creating a second video element.
 */

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";
import { gameAPI } from "@/lib/api";

export type MonitorState =
  | "loading"          // starting up
  | "ok"               // exactly one face visible
  | "no_face"          // 0 faces
  | "multiple_faces"   // >1 faces
  | "tab_hidden"       // browser tab not visible
  | "denied"           // user blocked camera
  | "error";           // misc fatal init error

export type SnapshotKind =
  | "routine"
  | "face_lost"
  | "face_returned"
  | "multiple_faces"
  | "tab_hidden";

export interface QuizFaceMonitorHandle {
  /** Bind a host video element to the monitor's MediaStream so the
   *  PauseOverlay can mirror what the camera sees. Returns a function
   *  that detaches the binding when the host unmounts. */
  attachPreview: (videoEl: HTMLVideoElement | null) => () => void;
  /** Force a snapshot now (used at quiz completion). */
  captureNow: (kind: SnapshotKind) => Promise<void>;
  /** Stop the detection loop, close the camera, cancel scheduler. */
  stop: () => void;
}

interface Props {
  attemptId: string;
  /** Whether the monitor should be actively detecting/snapping. False when
   *  the host wants to suspend (e.g. quiz ended, modal closed). */
  active: boolean;
  onStateChange?: (state: MonitorState) => void;
  /** Called after every snapshot upload attempt (regardless of outcome). */
  onSnapshotPosted?: (kind: SnapshotKind, ok: boolean) => void;
}

const DETECT_INTERVAL_MS = 200; // ~5fps
const ROUTINE_MIN_MS = 25_000;
const ROUTINE_MAX_MS = 50_000;
const SNAPSHOT_MAX_EDGE = 480;
const SNAPSHOT_QUALITY = 0.78;

const QuizFaceMonitor = forwardRef<QuizFaceMonitorHandle, Props>(function QuizFaceMonitor(
  { attemptId, active, onStateChange, onSnapshotPosted },
  ref,
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectTimerRef = useRef<number | null>(null);
  const routineTimerRef = useRef<number | null>(null);
  const stateRef = useRef<MonitorState>("loading");
  const lastEmittedRef = useRef<MonitorState | null>(null);
  const [, force] = useState(0);

  const setState = useCallback(
    (next: MonitorState) => {
      stateRef.current = next;
      if (lastEmittedRef.current !== next) {
        lastEmittedRef.current = next;
        onStateChange?.(next);
      }
      force((n) => n + 1);
    },
    [onStateChange],
  );

  // ---- snapshot capture + upload ----
  const capture = useCallback(
    async (kind: SnapshotKind) => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (!w || !h) return;

      const scale = Math.min(1, SNAPSHOT_MAX_EDGE / Math.max(w, h));
      const tw = Math.round(w * scale);
      const th = Math.round(h * scale);
      const canvas = document.createElement("canvas");
      canvas.width = tw;
      canvas.height = th;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, tw, th);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", SNAPSHOT_QUALITY),
      );
      if (!blob) return;

      try {
        await gameAPI.postQuizSnapshot({ attempt_id: attemptId, kind, photo: blob });
        onSnapshotPosted?.(kind, true);
      } catch (err) {
        // Swallow upload errors - the quiz must keep running. Fire-and-
        // forget; admins simply lose this single snapshot.
        console.warn("snapshot upload failed:", err);
        onSnapshotPosted?.(kind, false);
      }
    },
    [attemptId, onSnapshotPosted],
  );

  // ---- routine schedule (25-50s) ----
  const scheduleNextRoutine = useCallback(() => {
    if (routineTimerRef.current !== null) {
      window.clearTimeout(routineTimerRef.current);
    }
    const wait = ROUTINE_MIN_MS + Math.random() * (ROUTINE_MAX_MS - ROUTINE_MIN_MS);
    routineTimerRef.current = window.setTimeout(() => {
      // Only snap if we're in a healthy state - otherwise it's a violation
      // capture's job.
      if (stateRef.current === "ok") {
        void capture("routine");
      }
      scheduleNextRoutine();
    }, wait);
  }, [capture]);

  // ---- detection loop ----
  const tick = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    if (stateRef.current === "denied" || stateRef.current === "error") return;

    let detections;
    try {
      detections = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }),
      );
    } catch {
      return; // transient - try again next tick
    }

    const prev = stateRef.current;
    let next: MonitorState;
    if (detections.length === 0) next = "no_face";
    else if (detections.length > 1) next = "multiple_faces";
    else next = "ok";

    if (next !== prev) {
      // Capture violation transitions and recovery.
      if (prev === "ok" && next === "no_face") void capture("face_lost");
      else if (prev === "ok" && next === "multiple_faces") void capture("multiple_faces");
      else if ((prev === "no_face" || prev === "multiple_faces") && next === "ok") {
        void capture("face_returned");
      }
      setState(next);
    }
  }, [capture, setState]);

  // ---- lifecycle: start/stop camera + loops ----
  const start = useCallback(async () => {
    setState("loading");
    try {
      if (!faceapi.nets.tinyFaceDetector.params) {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setState("ok"); // optimistic; first tick will correct
      detectTimerRef.current = window.setInterval(() => void tick(), DETECT_INTERVAL_MS);
      scheduleNextRoutine();
    } catch (err) {
      const name = (err as { name?: string })?.name;
      if (name === "NotAllowedError" || name === "NotFoundError" || name === "OverconstrainedError") {
        setState("denied");
      } else {
        setState("error");
      }
    }
  }, [setState, tick, scheduleNextRoutine]);

  const stop = useCallback(() => {
    if (detectTimerRef.current !== null) {
      window.clearInterval(detectTimerRef.current);
      detectTimerRef.current = null;
    }
    if (routineTimerRef.current !== null) {
      window.clearTimeout(routineTimerRef.current);
      routineTimerRef.current = null;
    }
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    if (active) void start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // ---- tab visibility ----
  useEffect(() => {
    if (!active) return;
    const onVis = () => {
      if (document.hidden) {
        // Snap a tab_hidden frame if we still can; the page is visually
        // gone but the video element keeps producing frames briefly.
        void capture("tab_hidden");
        setState("tab_hidden");
      } else if (stateRef.current === "tab_hidden") {
        // Force a re-tick to let the detector decide the right state.
        setState("loading");
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [active, capture, setState]);

  // ---- imperative handle for parent ----
  useImperativeHandle(
    ref,
    () => ({
      attachPreview: (el) => {
        if (!el) return () => {};
        const stream = streamRef.current;
        if (stream) {
          el.srcObject = stream;
          el.play().catch(() => {});
        }
        return () => {
          el.srcObject = null;
        };
      },
      captureNow: capture,
      stop,
    }),
    [capture, stop],
  );

  return (
    <video
      ref={videoRef}
      playsInline
      muted
      // Hidden detector source. The pause modal mirrors the same stream via
      // attachPreview() so we don't need a second getUserMedia or a second
      // <video>.
      style={{ position: "fixed", left: -99999, top: -99999, width: 320, height: 240 }}
      aria-hidden
    />
  );
});

export default QuizFaceMonitor;
