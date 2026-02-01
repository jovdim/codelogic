"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/RouteGuards";
import { gameAPI } from "@/lib/api";
import {
  Heart,
  Zap,
  X,
  Check,
  Trophy,
  ArrowRight,
  RotateCcw,
  Clock,
  Star,
  Circle,
  Loader2,
} from "lucide-react";

// Syntax highlighting function
const highlightCode = (code: string): ReactNode[] => {
  const tokens: { type: string; value: string }[] = [];
  let remaining = code;

  const patterns: [RegExp, string][] = [
    [/^(_{2,})/, "blank"], // Fill-in-the-blank placeholder (two or more underscores)
    [/^(\/\/.*?)(?=\n|$)/, "comment"],
    [/^(#.*?)(?=\n|$)/, "comment"], // Python comments
    [/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/, "string"],
    [/^(\d+\.?\d*)/, "number"],
    [
      /^(const|let|var|function|return|if|else|for|while|class|new|this|typeof|instanceof|try|catch|throw|async|await|import|export|from|default|def|elif|in|and|or|not|is|None|True|False|with|as|try|except|finally|raise|lambda|yield|pass|break|continue|global|nonlocal)\b/,
      "keyword",
    ],
    [/^(true|false|null|undefined|NaN|Infinity)\b/, "boolean"],
    [
      /^(console|document|window|Math|Array|Object|String|Number|Boolean|Date|JSON|Promise|print|len|range|int|str|float|list|dict|set|tuple|open|input|type|isinstance|hasattr|getattr|setattr)\b/,
      "builtin",
    ],
    [
      /^(\.\s*)(log|push|pop|map|filter|reduce|forEach|find|indexOf|slice|splice|join|split|toString|parse|stringify|append|extend|remove|insert|sort|reverse|keys|values|items|get|update|read|write|readlines|close|upper|lower|strip|replace|format|startswith|endswith)\b/,
      "method",
    ],
    [/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/, "function"],
    [/^([a-zA-Z_$][a-zA-Z0-9_$]*)/, "identifier"],
    [/^(===|!==|==|!=|<=|>=|=>|&&|\|\||[+\-*/%=<>!&|^~?:])/, "operator"],
    [/^([{}[\]();,\.])/, "punctuation"],
    [/^(\s+)/, "whitespace"],
  ];

  while (remaining.length > 0) {
    let matched = false;
    for (const [pattern, type] of patterns) {
      const match = remaining.match(pattern);
      if (match) {
        const value = type === "method" ? match[0] : match[1];
        if (type === "method") {
          tokens.push({ type: "punctuation", value: match[1] });
          tokens.push({ type: "method", value: match[2] });
        } else {
          tokens.push({ type, value });
        }
        remaining = remaining.slice(match[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push({ type: "text", value: remaining[0] });
      remaining = remaining.slice(1);
    }
  }

  const colorMap: { [key: string]: string } = {
    blank:
      "bg-yellow-500/30 text-yellow-300 px-2 py-0.5 rounded border border-yellow-500/50 font-bold",
    keyword: "text-purple-400",
    string: "text-green-400",
    number: "text-orange-400",
    boolean: "text-yellow-400",
    comment: "text-gray-500 italic",
    builtin: "text-cyan-400",
    method: "text-blue-400",
    function: "text-blue-400",
    operator: "text-pink-400",
    punctuation: "text-gray-400",
    identifier: "text-white",
    whitespace: "",
    text: "text-gray-300",
  };

  return tokens.map((token, i) => (
    <span key={i} className={colorMap[token.type] || "text-gray-300"}>
      {token.value}
    </span>
  ));
};

// Question types
type QuestionType = "multiple-choice" | "find-error" | "fill-blank" | "output";

interface Question {
  id: string;
  question_type: QuestionType;
  question_text: string;
  code_snippet?: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  highlight_line?: number;
}

export default function LevelQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user, refreshUser, updateUserHearts } = useAuth();
  const categoryId = params.category as string;
  const topicId = params.topic as string;
  const levelId = parseInt(params.level as string) || 1;

  // State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [xpEarned, setXpEarned] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [heartsLost, setHeartsLost] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [heartShake, setHeartShake] = useState(false);

  // Generate a unique key for this quiz session's timer
  const timerStorageKey = `quiz_timer_${categoryId}_${topicId}_${levelId}`;

  // Helper to get remaining time from stored timestamp
  const getRemainingTime = useCallback(
    (questionIndex: number): number => {
      const stored = sessionStorage.getItem(timerStorageKey);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.questionIndex === questionIndex) {
          const elapsed = Math.floor((Date.now() - data.startTime) / 1000);
          const remaining = Math.max(0, 30 - elapsed);
          return remaining;
        }
      }
      return 30;
    },
    [timerStorageKey],
  );

  // Helper to save timer start time
  const saveTimerStart = useCallback(
    (questionIndex: number) => {
      sessionStorage.setItem(
        timerStorageKey,
        JSON.stringify({
          questionIndex,
          startTime: Date.now(),
        }),
      );
    },
    [timerStorageKey],
  );

  // Clear timer storage when quiz ends
  const clearTimerStorage = useCallback(() => {
    sessionStorage.removeItem(timerStorageKey);
  }, [timerStorageKey]);

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await gameAPI.getQuizQuestions(
          categoryId,
          topicId,
          levelId,
        );
        setQuestions(response.data.questions);
        setAttemptId(response.data.attempt_id);
        setHearts(response.data.hearts);
        setError(null);

        // Initialize timer from storage or start fresh
        const remaining = getRemainingTime(0);
        setTimeLeft(remaining);
        if (remaining === 30) {
          // Fresh start - save the timestamp
          saveTimerStart(0);
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load questions";
        if (typeof err === "object" && err !== null && "response" in err) {
          const axiosError = err as {
            response?: { data?: { error?: string } };
          };
          setError(axiosError.response?.data?.error || errorMessage);
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [categoryId, topicId, levelId]);

  const question = questions[currentQuestion];
  const totalQuestions = questions.length;
  const progress =
    totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

  // Handle timeout - defined before timer effect to avoid reference issues
  const handleTimeout = useCallback(() => {
    if (!isAnswered) {
      // Deduct a heart with animation
      const newHearts = Math.max(0, hearts - 1);
      setHearts(newHearts);
      setHeartsLost((prev) => prev + 1);
      setStreak(0);

      // Trigger heart shake animation
      setHeartShake(true);
      setTimeout(() => setHeartShake(false), 500);

      // If no hearts left, show result
      if (newHearts <= 0) {
        setShowResult(true);
        clearTimerStorage();
        return;
      }

      // Stay on the same question, just reset the timer
      // Timer will automatically reset to 30 in the interval
    }
  }, [isAnswered, hearts, clearTimerStorage]);

  // Timer - uses stored timestamp to prevent reload abuse
  useEffect(() => {
    if (isAnswered || showResult || loading || !question) return;

    const timer = setInterval(() => {
      // Calculate remaining time from stored start timestamp
      const remaining = getRemainingTime(currentQuestion);

      if (remaining <= 0) {
        handleTimeout();
        // Reset timer for retry on same question
        saveTimerStart(currentQuestion);
        setTimeLeft(30);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [
    isAnswered,
    showResult,
    currentQuestion,
    loading,
    question,
    getRemainingTime,
    saveTimerStart,
    handleTimeout,
  ]);

  const handleAnswer = async (answerIndex: number) => {
    if (isAnswered || !question) return;

    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    const isCorrect = answerIndex === question.correct_answer;

    if (isCorrect) {
      // XP: 10 base per correct answer (matching backend)
      const baseXP = 10;
      setScore((prev) => prev + 1);
      setXpEarned((prev) => prev + baseXP);
      setStreak((prev) => prev + 1);
    } else {
      setHearts((prev) => Math.max(0, prev - 1));
      setHeartsLost((prev) => prev + 1);
      setStreak(0);
    }

    // Sync with backend to deduct hearts in database
    try {
      const response = await gameAPI.submitAnswer({
        question_id: question.id,
        answer: answerIndex,
        attempt_id: attemptId,
      });
      // Update hearts from backend response for accuracy
      if (response.data.hearts_remaining !== undefined) {
        setHearts(response.data.hearts_remaining);
        // Update sidebar hearts in real-time
        updateUserHearts(response.data.hearts_remaining);
      }
    } catch (err) {
      console.error("Failed to submit answer to backend:", err);
    }
  };

  const nextQuestion = () => {
    if (hearts <= 0) {
      setShowResult(true);
      clearTimerStorage();
      return;
    }

    if (currentQuestion < totalQuestions - 1) {
      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);
      setSelectedAnswer(null);
      setIsAnswered(false);
      // Save new timer start for next question
      saveTimerStart(nextIndex);
      setTimeLeft(30);
    } else {
      setShowResult(true);
      clearTimerStorage();
    }
  };

  const [noHeartsError, setNoHeartsError] = useState(false);

  const restartQuiz = async () => {
    // First refresh user to get latest heart count
    await refreshUser();

    // Refetch questions to start fresh
    try {
      setLoading(true);
      setNoHeartsError(false);
      const response = await gameAPI.getQuizQuestions(
        categoryId,
        topicId,
        levelId,
      );
      setQuestions(response.data.questions);
      setAttemptId(response.data.attempt_id);
      setHearts(response.data.hearts);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setScore(0);
      setXpEarned(0);
      setShowResult(false);
      setStreak(0);
      setTimeLeft(30);
      setHeartsLost(0);
      setQuizSubmitted(false); // Allow new submission for restarted quiz
      // Save fresh timer start for restarted quiz
      saveTimerStart(0);
    } catch (err: unknown) {
      console.error("Failed to restart quiz:", err);
      // Check if it's a "no hearts" error
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosError = err as {
          response?: { status?: number; data?: { error?: string } };
        };
        if (
          axiosError.response?.status === 403 ||
          axiosError.response?.data?.error?.includes("hearts")
        ) {
          setNoHeartsError(true);
          setShowResult(false); // Hide result screen to show no hearts message
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate stars
  const getStars = () => {
    if (totalQuestions === 0) return 0;
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  // Submit quiz results when quiz is completed (only once)
  useEffect(() => {
    if (showResult && totalQuestions > 0 && !quizSubmitted) {
      setQuizSubmitted(true); // Prevent duplicate submissions
      const submitQuizResult = async () => {
        try {
          const response = await gameAPI.completeQuiz({
            category_slug: categoryId,
            topic_slug: topicId,
            level: levelId,
            score: score,
            total_questions: totalQuestions,
            hearts_lost: heartsLost,
          });
          // Update XP earned with actual value from backend (includes bonuses)
          if (response.data.xp_earned !== undefined) {
            setXpEarned(response.data.xp_earned);
          }
          // Refresh user data to update XP/hearts in context and sidebar
          await refreshUser();
        } catch (err) {
          console.error("Failed to submit quiz result:", err);
        }
      };
      submitQuizResult();
    }
  }, [showResult, quizSubmitted]);

  // Loading state
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e] flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="relative text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
            <p className="text-gray-400">Loading questions...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Error state - check if it's a "no hearts" error
  const isNoHeartsError = error?.toLowerCase().includes("heart");

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e]">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-xs w-full text-center border border-[#2d2d44] shadow-2xl shadow-black/50">
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${isNoHeartsError ? "bg-red-500/20" : "bg-purple-500/20"}`}
              >
                {isNoHeartsError ? (
                  <Heart className="w-8 h-8 text-red-400" />
                ) : (
                  <X className="w-8 h-8 text-purple-400" />
                )}
              </div>

              <h2 className="text-xl font-bold text-white mb-2">
                {isNoHeartsError ? "No Hearts Remaining" : "Oops!"}
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                {isNoHeartsError ? "You need hearts to start a quiz." : error}
              </p>

              {isNoHeartsError && (
                <div className="bg-[#0f0f1a] rounded-lg px-3 py-2 mb-4">
                  <p className="text-gray-500 text-sm">
                    Hearts regenerate 1 every 2 minutes
                  </p>
                </div>
              )}

              <Link
                href={`/play/${categoryId}/${topicId}`}
                className="block w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors"
              >
                Go Back
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // No questions
  if (!question) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e]">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-xs w-full text-center border border-[#2d2d44] shadow-2xl shadow-black/50">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gray-500/20">
                <X className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                No Questions
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                No questions found for this level.
              </p>
              <Link
                href={`/play/${categoryId}/${topicId}`}
                className="block w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors"
              >
                Go Back
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Out of hearts (either from quiz or from trying to retry)
  if ((hearts <= 0 && !showResult) || noHeartsError) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e]">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-xs w-full text-center border border-[#2d2d44] shadow-2xl shadow-black/50">
              {/* Broken heart icon */}
              <div className="relative w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-red-500/20">
                <Heart className="w-8 h-8 text-red-400" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-0.5 bg-red-400 rotate-45 rounded-full" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-white mb-2">
                Out of Hearts!
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                You&apos;ve run out of hearts. Take a short break!
              </p>

              {/* Regeneration info */}
              <div className="bg-[#0f0f1a] rounded-lg px-3 py-2 mb-4">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>
                    Regenerates 1 every{" "}
                    <span className="text-purple-400 font-medium">
                      2 minutes
                    </span>
                  </span>
                </div>
              </div>

              {!noHeartsError && (
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm px-3 py-2 bg-[#0f0f1a] rounded-lg">
                    <span className="text-gray-400">Your Score</span>
                    <span className="text-white font-medium">
                      {score}/{totalQuestions}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm px-3 py-2 bg-[#0f0f1a] rounded-lg">
                    <span className="text-gray-400">XP Earned</span>
                    <span className="text-yellow-400 font-medium">
                      +{xpEarned}
                    </span>
                  </div>
                </div>
              )}

              <Link
                href={`/play/${categoryId}/${topicId}`}
                className="block w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors"
              >
                Go Back
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Results screen
  if (showResult) {
    const stars = getStars();
    const passed = stars >= 1;

    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="relative bg-[#1a1a2e]/95 backdrop-blur-xl rounded-3xl p-8 max-w-sm w-full text-center border border-[#2d2d44] shadow-2xl shadow-black/50">
            {/* Decorative glow */}
            <div
              className={`absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 ${passed ? "bg-yellow-500/20" : "bg-gray-500/20"} rounded-full blur-3xl`}
            />

            <div
              className={`relative w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center border ${
                passed
                  ? "bg-gradient-to-br from-yellow-500/30 to-yellow-600/10 border-yellow-500/30"
                  : "bg-gradient-to-br from-gray-500/30 to-gray-600/10 border-gray-500/30"
              }`}
            >
              <Trophy
                className={`w-10 h-10 ${passed ? "text-yellow-400" : "text-gray-400"}`}
              />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {passed ? "Level Complete!" : "Try Again"}
            </h2>
            <p className="text-gray-400 mb-4">Level {levelId}</p>

            {/* Stars */}
            <div className="flex justify-center gap-3 mb-6">
              {[1, 2, 3].map((star) => (
                <div
                  key={star}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    star <= stars
                      ? "bg-yellow-500/20 border border-yellow-500/30"
                      : "bg-[#0f0f1a]/50 border border-[#2d2d44]"
                  }`}
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= stars
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-600"
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="bg-[#0f0f1a]/80 rounded-xl p-4 mb-6 space-y-3 border border-[#2d2d44]">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Score</span>
                <span className="text-white font-medium">
                  {score}/{totalQuestions}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Accuracy</span>
                <span className="text-white font-medium">
                  {Math.round((score / totalQuestions) * 100)}%
                </span>
              </div>
              <div className="flex justify-between text-sm pt-3 border-t border-[#2d2d44]">
                <span className="text-gray-400">XP Earned</span>
                <span className="text-yellow-400 font-bold">+{xpEarned}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={restartQuiz}
                className="flex-1 py-3 bg-[#2d2d44] hover:bg-[#3d3d5c] text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Retry
              </button>
              <Link
                href={`/play/${categoryId}/${topicId}`}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/25"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0f0f1a]">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-[#0f0f1a] border-b border-[#2d2d44]">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <Link
                href={`/play/${categoryId}/${topicId}`}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Link>

              <div className="flex items-center gap-3">
                {/* Timer */}
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm ${
                    timeLeft <= 10
                      ? "bg-red-500/20 text-red-400"
                      : "bg-[#1a1a2e] text-gray-400"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-bold">{timeLeft}s</span>
                </div>

                {/* Hearts */}
                <div
                  className={`flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded-lg transition-all ${heartShake ? "animate-pulse scale-110" : ""}`}
                >
                  <Heart
                    className={`w-4 h-4 text-red-500 fill-red-500 ${heartShake ? "animate-bounce" : ""}`}
                  />
                  <span className="text-red-400 font-bold text-sm">
                    {hearts}/{user?.max_hearts || 10}
                  </span>
                </div>

                {/* Streak */}
                <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 rounded-lg">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 font-bold text-sm">
                    {streak + 1}
                  </span>
                </div>

                {/* XP */}
                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-bold text-sm">
                    {xpEarned}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              {question.question_type === "find-error" && (
                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                  Find the Error
                </span>
              )}
              {question.question_type === "output" && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                  What&apos;s the Output?
                </span>
              )}
              {question.question_type === "fill-blank" && (
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  Fill in the Blank
                </span>
              )}
              <span className="text-gray-500 text-sm">
                {currentQuestion + 1} / {totalQuestions}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">
              {question.question_text}
            </h2>
          </div>

          {/* Code Block - Terminal Style */}
          {question.code_snippet && (
            <div className="mb-6 rounded-xl overflow-hidden border border-[#2d2d44] shadow-2xl">
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#1e1e2e]">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <Circle className="w-3 h-3 text-red-500 fill-red-500" />
                    <Circle className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <Circle className="w-3 h-3 text-green-500 fill-green-500" />
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-[#0d0d14] rounded-md">
                  <span className="text-xs text-gray-500 font-medium">
                    script.js
                  </span>
                </div>
                <div className="w-12" />
              </div>

              {/* Code Content */}
              <div className="bg-[#0d0d14] p-4 font-mono text-sm overflow-x-auto">
                {question.code_snippet.split("\n").map((line, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start leading-6 ${
                      question.highlight_line === idx + 1 && isAnswered
                        ? selectedAnswer === question.correct_answer
                          ? "bg-green-500/10 -mx-4 px-4 border-l-2 border-green-500"
                          : "bg-red-500/10 -mx-4 px-4 border-l-2 border-red-500"
                        : ""
                    }`}
                  >
                    <span className="w-8 text-gray-600 select-none text-right pr-4 shrink-0">
                      {idx + 1}
                    </span>
                    <code className="flex-1">{highlightCode(line)}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => {
              const isCorrect = index === question.correct_answer;
              const isSelected = selectedAnswer === index;
              const showCorrect = isAnswered && isCorrect;
              const showWrong = isAnswered && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={isAnswered}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                    showCorrect
                      ? "bg-green-500/10 border-green-500 text-green-400"
                      : showWrong
                        ? "bg-red-500/10 border-red-500 text-red-400"
                        : isSelected
                          ? "bg-purple-500/10 border-purple-500 text-purple-400"
                          : "bg-[#1a1a2e] border-[#2d2d44] text-gray-300 hover:border-[#3d3d5c]"
                  } ${isAnswered && !isSelected && !isCorrect ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm font-bold ${
                          showCorrect
                            ? "bg-green-500/20"
                            : showWrong
                              ? "bg-red-500/20"
                              : "bg-[#0f0f1a]"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="font-medium">{option}</span>
                    </div>
                    {showCorrect && <Check className="w-5 h-5" />}
                    {showWrong && <X className="w-5 h-5" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {isAnswered && (
            <div className="bg-[#1a1a2e] rounded-xl p-4 mb-6 border border-[#2d2d44]">
              <h4
                className={`font-bold mb-1 ${
                  selectedAnswer === question.correct_answer
                    ? "text-green-400"
                    : "text-yellow-400"
                }`}
              >
                {selectedAnswer === question.correct_answer
                  ? "Correct!"
                  : "Explanation"}
              </h4>
              <p className="text-gray-400 text-sm">{question.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <button
              onClick={nextQuestion}
              className="w-full py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-colors"
            >
              {currentQuestion < totalQuestions - 1
                ? "Next Question"
                : "See Results"}
            </button>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
