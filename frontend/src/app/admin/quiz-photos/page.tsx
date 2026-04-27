"use client";

/**
 * Admin: review face-verification photos captured at quiz start.
 *
 * Each row shows the snapshot, who took it, which topic + level, when it was
 * taken, and the score. Use it to spot impostors. The photo blob lives on
 * QuizAttempt.verification_photo and is auto-purged after 60 days.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { gameAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";

type VerificationItem = {
  attempt_id: string;
  user_id: number;
  user_email: string;
  user_username: string;
  topic: string;
  category: string;
  level: number;
  score: number;
  total_questions: number;
  stars: number;
  completed: boolean;
  captured_at: string | null;
  photo_url: string;
};

type VerificationPage = {
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
  items: VerificationItem[];
};

export default function AdminQuizPhotosPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<VerificationPage | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!user.is_staff) {
      router.replace("/dashboard");
      return;
    }

    let cancelled = false;
    setLoading(true);
    gameAPI
      .adminListVerifications(page)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((e) => {
        if (!cancelled)
          setErr(
            (e as { response?: { data?: { error?: string } } })?.response?.data?.error ||
              "Failed to load",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, page, router]);

  if (authLoading || (loading && !data)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] p-6 text-white">
        <p className="text-red-400">{err}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e] p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Quiz verification photos</h1>
            <p className="text-sm text-gray-400">
              {data ? `${data.total.toLocaleString()} attempts on file` : null}
              {" — photos auto-delete after 60 days."}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-lg bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900">
              <tr className="text-zinc-400">
                <th className="px-3 py-2">Photo</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Quiz</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">When</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((item) => (
                <tr key={item.attempt_id} className="border-t border-zinc-800 align-top">
                  <td className="px-3 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.photo_url}
                      alt="verification"
                      className="h-24 w-24 rounded-lg object-cover"
                      style={{ transform: "scaleX(-1)" }}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-medium">{item.user_username}</div>
                    <div className="text-xs text-zinc-400">{item.user_email}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div>{item.category} / {item.topic}</div>
                    <div className="text-xs text-zinc-400">Level {item.level}</div>
                  </td>
                  <td className="px-3 py-3 tabular-nums">
                    {item.completed
                      ? `${item.score}/${item.total_questions} · ${item.stars}★`
                      : <span className="text-zinc-500">in-progress</span>}
                  </td>
                  <td className="px-3 py-3 text-xs text-zinc-400">
                    {item.captured_at
                      ? new Date(item.captured_at).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
              {data && data.items.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-zinc-400" colSpan={5}>
                    No photos yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="rounded-lg bg-zinc-800 px-3 py-2 disabled:opacity-40 hover:enabled:bg-zinc-700"
          >
            Previous
          </button>
          <span className="text-zinc-400">Page {data?.page ?? 1}</span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={!data?.has_next || loading}
            className="rounded-lg bg-zinc-800 px-3 py-2 disabled:opacity-40 hover:enabled:bg-zinc-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
