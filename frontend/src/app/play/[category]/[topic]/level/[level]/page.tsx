"use client";

import { useState, useEffect, useCallback, useRef, ReactNode } from "react";
import confetti from "canvas-confetti";
import { BookOpen, Lightbulb } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/RouteGuards";
import { gameAPI } from "@/lib/api";
import { invalidateCache } from "@/lib/dataCache";
import { Modal, ModalButton } from "@/components/ui/Modal";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import {
  Heart,
  X,
  Check,
  Trophy,
  ArrowRight,
  RotateCcw,
  Clock,
  Star,
  Circle,
  Loader2,
  Code2,
  Edit,
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

interface Lesson {
  id: string;
  title: string;
  content: string;
  code_example?: string;
  tip?: string;
  order: number;
}

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
  const { play: playSound } = useSoundEffects();
  const categoryId = params.category as string;
  const topicId = params.topic as string;
  const levelId = parseInt(params.level as string) || 1;
  const lastTickRef = useRef<number>(0);

  // State
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showingLessons, setShowingLessons] = useState(true);
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
        // Refresh user data to ensure latest heart count
        await refreshUser();
        
        const response = await gameAPI.getQuizQuestions(
          categoryId,
          topicId,
          levelId,
        );
        const lessonData = response.data.lessons || [];
        setLessons(lessonData);
        setCurrentLesson(0);
        setShowingLessons(lessonData.length > 0);
        setQuestions(response.data.questions);
        setAttemptId(response.data.attempt_id);
        setHearts(response.data.hearts);
        setError(null);

        // Only start timer after lessons are done
        clearTimerStorage();
        if (lessonData.length === 0) {
          setTimeLeft(30);
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
  const totalSteps = lessons.length + totalQuestions;
  const currentStep = showingLessons ? currentLesson + 1 : lessons.length + currentQuestion + 1;
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  // Lesson navigation
  const nextLesson = () => {
    if (currentLesson < lessons.length - 1) {
      setCurrentLesson(prev => prev + 1);
    } else {
      // Done with lessons, start quiz
      setShowingLessons(false);
      setTimeLeft(30);
      saveTimerStart(0);
    }
  };

  // Handle timeout - defined before timer effect to avoid reference issues
  const handleTimeout = useCallback(() => {
    if (!isAnswered) {
      // Deduct a heart with animation
      const newHearts = Math.max(0, hearts - 1);
      setHearts(newHearts);
      setHeartsLost((prev) => prev + 1);
      playSound("heartLost");

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
  }, [isAnswered, hearts, clearTimerStorage, playSound]);

  // Timer - uses stored timestamp to prevent reload abuse
  useEffect(() => {
    if (isAnswered || showResult || loading || !question || showingLessons) return;

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
        // Timer warning sounds
        if (remaining <= 5 && remaining > 0 && remaining !== lastTickRef.current) {
          lastTickRef.current = remaining;
          playSound(remaining <= 3 ? "countdown" : "timerTick");
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [
    isAnswered,
    showResult,
    currentQuestion,
    loading,
    question,
    showingLessons,
    getRemainingTime,
    saveTimerStart,
    handleTimeout,
    playSound,
  ]);

  const handleAnswer = async (answerIndex: number) => {
    if (isAnswered || !question) return;

    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    lastTickRef.current = 0; // Reset tick ref for next question

    const isCorrect = answerIndex === question.correct_answer;

    if (isCorrect) {
      playSound("correct");
      // XP: 10 base per correct answer (matching backend)
      const baseXP = 10;
      setScore((prev) => prev + 1);
      setXpEarned((prev) => prev + baseXP);
    } else {
      playSound("wrong");
      setHearts((prev) => Math.max(0, prev - 1));
      setHeartsLost((prev) => prev + 1);
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
  // Play result sound when quiz ends
  useEffect(() => {
    if (showResult && totalQuestions > 0) {
      const passed = score / totalQuestions >= 0.5;
      playSound(passed ? "levelComplete" : "levelFailed");

      if (passed) {
        // Fire confetti burst from both sides
        const end = Date.now() + 2000;
        const colors = ["#a855f7", "#facc15", "#22d3ee", "#f472b6", "#34d399"];

        (function frame() {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors,
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors,
          });
          if (Date.now() < end) requestAnimationFrame(frame);
        })();
      }
    }
  }, [showResult]);

  useEffect(() => {
    if (showResult && totalQuestions > 0 && !quizSubmitted) {
      setQuizSubmitted(true); // Prevent duplicate submissions
      const submitQuizResult = async () => {
        try {
          const response = await gameAPI.completeQuiz({
            attempt_id: attemptId,
            hearts_lost: heartsLost,
          });
          // Backend is authoritative for score/xp/stars — sync local state so the
          // result modal can never disagree with what gets stored.
          if (response.data.xp_earned !== undefined) {
            setXpEarned(response.data.xp_earned);
          }
          if (response.data.score !== undefined) {
            setScore(response.data.score);
          }
          // Refresh user data to update XP/hearts in context and sidebar
          await refreshUser();
          
          // Invalidate caches to ensure progress is updated
          if (user) {
            invalidateCache(`topic_${categoryId}_${topicId}_${user.id}`);
            invalidateCache(`category_progress_${categoryId}_${user.id}`);
          }
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
          <Modal isOpen={true} onClose={() => {}} showOverlay={true}>
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

            <ModalButton variant="primary" accentColor="#8b5cf6">
              <Link
                href={`/play/${categoryId}/${topicId}`}
                className="flex items-center justify-center gap-2 w-full h-full"
              >
                Go Back
              </Link>
            </ModalButton>
          </Modal>
        </div>
      </ProtectedRoute>
    );
  }

  // No questions (only show this after lessons are done)
  if (!question && !showingLessons) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e]">
          <Modal isOpen={true} onClose={() => {}} showOverlay={true}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gray-500/20">
              <X className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No Questions</h2>
            <p className="text-gray-400 text-sm mb-4">
              No questions found for this level.
            </p>
            <ModalButton variant="primary" accentColor="#8b5cf6">
              <Link
                href={`/play/${categoryId}/${topicId}`}
                className="flex items-center justify-center gap-2 w-full h-full"
              >
                Go Back
              </Link>
            </ModalButton>
          </Modal>
        </div>
      </ProtectedRoute>
    );
  }

  // Current lesson for the lesson phase
  const lesson = showingLessons && lessons.length > 0 ? lessons[currentLesson] : null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen relative overflow-hidden bg-[#0f0f1a]">
        {/* Simple background with floating elements */}
        <div className="absolute inset-0">
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-bounce opacity-10"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 2) * 30}%`,
                width: `${4 + (i % 3) * 2}px`,
                height: `${4 + (i % 3) * 2}px`,
                backgroundColor: i % 2 === 0 ? "#8b5cf6" : "#6366f1",
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${6 + (i % 3) * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Pixel grid overlay */}
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #ffffff 1px, transparent 1px),
              linear-gradient(to bottom, #ffffff 1px, transparent 1px)
            `,
            backgroundSize: "8px 8px",
          }}
        />

        {/* Header */}
        <div className="sticky top-0 z-40 bg-[#0f0f1a]/95 backdrop-blur-sm border-b border-[#2d2d44] shadow-lg">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <Link
                href={`/play/${categoryId}/${topicId}`}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-[#1a1a2e] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </Link>

              <div className="flex items-center gap-3">
                {/* Timer - hidden during lessons */}
                {!showingLessons && (
                  <div
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                      timeLeft <= 10
                        ? "bg-red-500/20 text-red-400 border border-red-500/30 shadow-lg shadow-red-500/20"
                        : "bg-[#1a1a2e] text-gray-400 border border-[#2d2d44]"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span className="font-mono">{timeLeft}s</span>
                  </div>
                )}

                {/* Lesson indicator - shown during lessons */}
                {showingLessons && (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <BookOpen className="w-4 h-4" />
                    <span>{currentLesson + 1}/{lessons.length}</span>
                  </div>
                )}

                {/* Hearts */}
                <div
                  className={`flex items-center gap-1 px-3 py-1.5 bg-red-500/20 rounded-xl border border-red-500/30 transition-all ${heartShake ? "animate-pulse scale-110 shadow-lg shadow-red-500/30" : ""}`}
                >
                  <Heart
                    className={`w-4 h-4 text-red-500 fill-red-500 ${heartShake ? "animate-bounce" : ""}`}
                  />
                  <span className="text-red-400 font-bold">
                    {hearts}/{user?.max_hearts || 10}
                  </span>
                </div>

                {/* XP */}
                <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/20 rounded-xl border border-yellow-500/30">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-bold">{xpEarned}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-3 bg-[#1a1a2e] rounded-full overflow-hidden border border-[#2d2d44]">
              <div
                className="h-full bg-purple-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Lesson Card - shown during lesson phase */}
        {showingLessons && lesson && (
          <div className="relative max-w-2xl mx-auto px-4 py-8 animate-in fade-in duration-500" key={`lesson-${currentLesson}`}>
            {/* Lesson badge */}
            <div className="flex items-center gap-3 mb-6 animate-in slide-in-from-bottom-4 duration-700">
              <div className="px-3 py-1.5 bg-purple-500/20 text-purple-400 text-sm rounded-full border border-purple-500/30 font-medium flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Lesson
              </div>
              <div className="px-3 py-1.5 bg-[#1a1a2e] text-gray-400 text-sm rounded-full border border-[#2d2d44] font-medium">
                {currentLesson + 1} / {lessons.length}
              </div>
            </div>

            {/* Lesson title */}
            <div className="pixel-box p-6 mb-6 relative overflow-hidden animate-in slide-in-from-left-4 duration-700 delay-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-500/20 border border-purple-500/30 shrink-0">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-white leading-relaxed">{lesson.title}</h2>
              </div>
              <p className="text-gray-300 text-base leading-relaxed pl-[52px]">{lesson.content}</p>
            </div>

            {/* Code example */}
            {lesson.code_example && (
              <div className="mb-6 pixel-box overflow-hidden animate-in slide-in-from-right-4 duration-700 delay-400">
                {/* Terminal Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a2e] border-b border-[#2d2d44]">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Circle className="w-3 h-3 text-red-500 fill-red-500" />
                      <Circle className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <Circle className="w-3 h-3 text-green-500 fill-green-500" />
                    </div>
                    <span className="text-xs text-gray-400 font-medium">Example</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#0f0f1a] rounded border border-[#2d2d44]">
                    <span className="text-xs text-gray-400 font-medium">code</span>
                  </div>
                  <div className="w-12" />
                </div>
                {/* Code Content */}
                <div className="bg-[#0f0f1a] p-4 font-mono text-sm overflow-x-auto">
                  {lesson.code_example.split("\n").map((line, idx) => (
                    <div key={idx} className="flex items-start leading-6">
                      <span className="w-8 text-gray-600 select-none text-right pr-4 shrink-0">{idx + 1}</span>
                      <code className="flex-1">{highlightCode(line)}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tip box */}
            {lesson.tip && (
              <div className="mb-8 pixel-box p-4 border-l-4 border-purple-500 animate-in slide-in-from-bottom-4 duration-700 delay-600">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/20 shrink-0 mt-0.5">
                    <Lightbulb className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-purple-400 mb-1">Did you know?</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{lesson.tip}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Got it button */}
            <div className="flex justify-center animate-in fade-in duration-500 delay-800">
              <button
                onClick={nextLesson}
                className="group px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all duration-300 ease-out pixel-box cursor-pointer transform hover:scale-105 hover:shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <span>{currentLesson < lessons.length - 1 ? "Got it" : "Start Quiz"}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Question - only shown after lessons are done */}
        {!showingLessons && question && (
        <div className="relative max-w-2xl mx-auto px-4 py-8 animate-in fade-in duration-500">
          <div className="mb-8 animate-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="flex items-center gap-3 mb-4">
              {question.question_type === "find-error" && (
                <div className="px-3 py-1.5 bg-red-500/20 text-red-400 text-sm rounded-full border border-red-500/30 font-medium animate-in zoom-in duration-500 delay-300 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  Find the Error
                </div>
              )}
              {question.question_type === "output" && (
                <div className="px-3 py-1.5 bg-blue-500/20 text-blue-400 text-sm rounded-full border border-blue-500/30 font-medium animate-in zoom-in duration-500 delay-300 flex items-center gap-1">
                  <Code2 className="w-3 h-3" />
                  What's the Output?
                </div>
              )}
              {question.question_type === "fill-blank" && (
                <div className="px-3 py-1.5 bg-green-500/20 text-green-400 text-sm rounded-full border border-green-500/30 font-medium animate-in zoom-in duration-500 delay-300 flex items-center gap-1">
                  <Edit className="w-3 h-3" />
                  Fill in the Blank
                </div>
              )}
              <div className="px-3 py-1.5 bg-[#1a1a2e] text-gray-400 text-sm rounded-full border border-[#2d2d44] font-medium animate-in zoom-in duration-500 delay-400">
                {currentQuestion + 1} / {totalQuestions}
              </div>
            </div>
            <div className="pixel-box p-6 relative overflow-hidden animate-in slide-in-from-left-4 duration-700 delay-500">
              <h2 className="text-xl font-bold text-white relative z-10 leading-relaxed">
                {question.question_text}
              </h2>
            </div>
          </div>

          {/* Code Block - Simple Terminal Style */}
          {question.code_snippet && (
            <div className="mb-6 pixel-box overflow-hidden">
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a2e] border-b border-[#2d2d44]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Circle className="w-3 h-3 text-red-500 fill-red-500" />
                    <Circle className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <Circle className="w-3 h-3 text-green-500 fill-green-500" />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    Terminal
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-[#0f0f1a] rounded border border-[#2d2d44]">
                  <span className="text-xs text-gray-400 font-medium">
                    code
                  </span>
                </div>
                <div className="w-12" />
              </div>

              {/* Code Content */}
              <div className="bg-[#0f0f1a] p-4 font-mono text-sm overflow-x-auto">
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

          {/* Options - Clean Design */}
          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => {
              const isCorrect = index === question.correct_answer;
              const isSelected = selectedAnswer === index;
              const showCorrect = isAnswered && isCorrect;
              const showWrong = isAnswered && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  data-no-click-sound
                  onClick={() => handleAnswer(index)}
                  disabled={isAnswered}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-300 ease-out cursor-pointer transform hover:scale-[1.02] hover:shadow-lg animate-in slide-in-from-right-4 ${
                    showCorrect
                      ? "bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:border-green-500 dark:text-green-400 shadow-md"
                      : showWrong
                        ? "bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:border-red-500 dark:text-red-400 shadow-md"
                        : isSelected
                          ? "bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-900/20 dark:border-purple-500 dark:text-purple-400 shadow-md"
                          : "bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:bg-[#1a1a2e] dark:border-[#2d2d44] dark:text-gray-300 dark:hover:border-[#3d3d5c] dark:hover:bg-[#252540]"
                  } ${isAnswered && !isSelected && !isCorrect ? "opacity-50 cursor-not-allowed hover:scale-100" : ""}`}
                  style={{ animationDelay: `${700 + index * 150}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 flex items-center justify-center rounded text-sm font-bold ${
                          showCorrect
                            ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                            : showWrong
                              ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200"
                              : "bg-gray-100 text-gray-800 dark:bg-[#0f0f1a] dark:text-gray-400"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="font-medium">{option}</span>
                    </div>
                    {showCorrect && (
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                    )}
                    {showWrong && (
                      <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation - Clean */}
          {isAnswered && (
            <div className="pixel-box p-6 mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedAnswer === question.correct_answer
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {selectedAnswer === question.correct_answer ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <X className="w-5 h-5" />
                  )}
                </div>
                <h4
                  className={`text-lg font-bold ${
                    selectedAnswer === question.correct_answer
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {selectedAnswer === question.correct_answer
                    ? "Correct! Well Done!"
                    : "Incorrect - Learn from this"}
                </h4>
              </div>
              <p className="text-gray-300 text-base leading-relaxed pl-11">
                {question.explanation}
              </p>
            </div>
          )}

          {/* Next Button - Clean */}
          {isAnswered && (
            <div className="flex justify-center animate-in fade-in duration-500 delay-1000">
              <button
                onClick={nextQuestion}
                className="group px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all duration-300 ease-out pixel-box cursor-pointer transform hover:scale-105 hover:shadow-lg animate-in zoom-in duration-500 delay-1200"
              >
                <div className="flex items-center gap-2">
                  <span>
                    {currentQuestion < totalQuestions - 1
                      ? "Next Question"
                      : "View Results"}
                  </span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </button>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Results Modal */}
      {showResult && (
        <Modal
          isOpen={true}
          onClose={() => {}}
          maxWidth="max-w-sm"
          showOverlay={true}
        >
          {(() => {
            const stars = getStars();
            const passed = stars >= 1;

            return (
              <>
                {/* Decorative glow */}
                <div
                  className={`absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 ${passed ? "bg-yellow-500/20" : "bg-gray-500/20"} rounded-full blur-3xl`}
                />

                <div
                  className={`relative w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center border ${
                    passed
                      ? "bg-yellow-500/20 border-yellow-500/30"
                      : "bg-gray-500/20 border-gray-500/30"
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
                    <span className="text-yellow-400 font-bold">
                      +{xpEarned}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <ModalButton onClick={restartQuiz}>
                    <div className="flex items-center justify-center gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Retry
                    </div>
                  </ModalButton>
                  <ModalButton variant="primary" accentColor="#8b5cf6">
                    <Link
                      href={`/play/${categoryId}/${topicId}`}
                      className="flex items-center justify-center gap-2 w-full h-full"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </ModalButton>
                </div>
              </>
            );
          })()}
        </Modal>
      )}

      {/* Out of Hearts Modal */}
      {((hearts <= 0 && !showResult) || noHeartsError) && (
        <Modal
          isOpen={true}
          onClose={() => {}}
          maxWidth="max-w-sm"
          showOverlay={true}
        >
          {/* Broken heart icon */}
          <div className="relative w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-red-500/20">
            <Heart className="w-8 h-8 text-red-400" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-0.5 bg-red-400 rotate-45 rounded-full" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-2">Out of Hearts!</h2>
          <p className="text-gray-400 text-sm mb-4">
            You&apos;ve run out of hearts. Take a short break!
          </p>

          {/* Regeneration info */}
          <div className="bg-[#0f0f1a] rounded-lg px-3 py-2 mb-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>
                Regenerates 1 every{" "}
                <span className="text-purple-400 font-medium">2 minutes</span>
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
                <span className="text-yellow-400 font-medium">+{xpEarned}</span>
              </div>
            </div>
          )}

          <ModalButton variant="primary" accentColor="#8b5cf6">
            <Link
              href={`/play/${categoryId}/${topicId}`}
              className="flex items-center justify-center gap-2 w-full h-full"
            >
              Go Back
            </Link>
          </ModalButton>
        </Modal>
      )}
    </ProtectedRoute>
  );
}
