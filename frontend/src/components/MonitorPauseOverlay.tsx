"use client";

/**
 * Full-screen pause overlay shown by the level page when the in-quiz face
 * monitor reports an unhealthy state. Locks all quiz interactions and
 * surfaces a live mirror of the camera so the student can fix their
 * position. Closes automatically when the parent passes a healthy state.
 */

import { useEffect, useRef } from "react";
import { AlertTriangle, Eye, Users, EyeOff } from "lucide-react";
import type { MonitorState } from "./QuizFaceMonitor";

type Reason = Exclude<MonitorState, "ok" | "loading">;

interface Props {
  open: boolean;
  reason: Reason;
  /** Bind a video element to the monitor's MediaStream. Returns a detach
   *  cleanup. Provided by QuizFaceMonitor's imperative handle. */
  attachPreview: (el: HTMLVideoElement | null) => () => void;
  /** Seconds remaining on the question timer at pause. Shown so the
   *  student knows time is genuinely frozen, not silently ticking. */
  pausedRemainingSeconds?: number;
  /** Seconds spent in this continuous pause so far (used to telegraph the
   *  long-pause auto-fail cap). */
  pauseElapsedSeconds: number;
  longPauseCapSeconds: number;
}

const COPY: Record<Reason, { title: string; body: string; Icon: typeof AlertTriangle }> = {
  no_face: {
    title: "Quiz paused - face not detected",
    body:
      "We can't see you in the camera right now. The quiz will resume as soon as your face is visible again.",
    Icon: Eye,
  },
  multiple_faces: {
    title: "Quiz paused - multiple people detected",
    body:
      "Only you should be visible in the camera. The quiz will resume when no one else is in frame.",
    Icon: Users,
  },
  tab_hidden: {
    title: "Quiz paused - return to this tab",
    body:
      "You switched away from the quiz. Come back to this tab to continue.",
    Icon: EyeOff,
  },
  denied: {
    title: "Camera blocked",
    body:
      "The quiz can't continue without the camera. Re-enable it in your browser settings, then refresh.",
    Icon: AlertTriangle,
  },
  error: {
    title: "Camera error",
    body:
      "Something went wrong with the camera. Please refresh and try again.",
    Icon: AlertTriangle,
  },
};

export default function MonitorPauseOverlay({
  open,
  reason,
  attachPreview,
  pausedRemainingSeconds,
  pauseElapsedSeconds,
  longPauseCapSeconds,
}: Props) {
  const previewRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const detach = attachPreview(previewRef.current);
    return detach;
  }, [open, attachPreview]);

  if (!open) return null;

  const { title, body, Icon } = COPY[reason];
  const remainingBeforeCancel = Math.max(0, longPauseCapSeconds - pauseElapsedSeconds);
  const cancelPercent = Math.min(100, (pauseElapsedSeconds / longPauseCapSeconds) * 100);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm"
      // Lock background interaction.
      role="alertdialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md mx-4 rounded-2xl bg-[#0f0f1a] border border-[#2d2d44] shadow-2xl text-white p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="rounded-full bg-amber-500/15 p-2 shrink-0">
            <Icon className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight">{title}</h2>
            <p className="text-sm text-gray-400 mt-1">{body}</p>
          </div>
        </div>

        <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-black mb-4 relative">
          <video
            ref={previewRef}
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
        </div>

        {pausedRemainingSeconds !== undefined && (
          <div className="text-xs text-gray-400 text-center mb-3">
            Question time paused at <span className="font-semibold text-white">{pausedRemainingSeconds}s</span>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          {remainingBeforeCancel > 0 ? (
            <>
              Quiz will be cancelled if paused for{" "}
              <span className="text-amber-400 font-semibold">
                {Math.ceil(remainingBeforeCancel)}s
              </span>{" "}
              more
            </>
          ) : (
            <span className="text-red-400 font-semibold">Quiz cancelled - too much time off-camera.</span>
          )}
        </div>
        <div className="mt-2 h-1 w-full rounded-full bg-[#2d2d44] overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-[width] duration-1000 ease-linear"
            style={{ width: `${cancelPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
