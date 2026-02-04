"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import LoginOverlay from "@/components/auth/LoginOverlay";
import {
  DiPython,
  DiJavascript1,
  DiReact,
  DiHtml5,
  DiCss3,
  DiMysql,
} from "react-icons/di";
import {
  ScrollReveal,
  ScrollProgressBar,
  ScrollToTop,
} from "@/components/ui/ScrollAnimations";
import {
  NAV_ITEMS,
  PLATFORM_STATS,
  TYPEWRITER_WORDS,
  FOOTER_LINKS,
} from "@/lib/constants";
import {
  Code2,
  Zap,
  Heart,
  Flame,
  Trophy,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Users,
  Play,
  Star,
  ChevronRight,
  Gamepad2,
  Target,
  Brain,
  Sparkles,
  Menu,
  X,
  Check,
  XCircle,
  Award,
  TrendingUp,
  Clock,
  Shield,
  Rocket,
  GraduationCap,
  BarChart3,
  Lightbulb,
} from "lucide-react";

const demoQuestions = [
  {
    id: 1,
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Home Tool Markup Language",
      "Hyperlink Text Making Language",
    ],
    correctAnswer: 0,
    xp: 25,
  },
  {
    id: 2,
    question: "Which CSS property changes text color?",
    options: ["font-color", "text-color", "color", "text-style"],
    correctAnswer: 2,
    xp: 25,
  },
  {
    id: 3,
    question: "What symbol starts a JavaScript comment?",
    options: ["#", "//", "<!--", "**"],
    correctAnswer: 1,
    xp: 25,
  },
];

function TypewriterText({ words }: { words: string[] }) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[currentWordIndex];
    const typeSpeed = isDeleting ? 50 : 100;
    const pauseTime = 2000;

    if (!isDeleting && currentText === word) {
      // Pause before deleting
      const timeout = setTimeout(() => setIsDeleting(true), pauseTime);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && currentText === "") {
      // Move to next word
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setCurrentText((prev) =>
        isDeleting ? prev.slice(0, -1) : word.slice(0, prev.length + 1),
      );
    }, typeSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex, words]);

  return <span className="inline-block">{currentText}</span>;
}

function AnimatedNumber({
  value,
  duration = 1000,
  suffix = "",
}: {
  value: number;
  duration?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start * 10) / 10);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration, isVisible]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );
    const el = document.getElementById(`stat-${value}`);
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span id={`stat-${value}`}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const availableLanguages = [
  {
    icon: DiHtml5,
    name: "HTML",
    color: "#E34F26",
    bgGradient: "from-orange-500/20 to-red-500/20",
    borderHover: "hover:border-orange-500",
    description: "Web Structure",
    levels: 10,
    slug: "html",
  },
  {
    icon: DiCss3,
    name: "CSS",
    color: "#1572B6",
    bgGradient: "from-blue-500/20 to-cyan-500/20",
    borderHover: "hover:border-blue-500",
    description: "Styling & Design",
    levels: 12,
    slug: "css",
  },
  {
    icon: DiJavascript1,
    name: "JavaScript",
    color: "#F7DF1E",
    bgGradient: "from-yellow-500/20 to-orange-500/20",
    borderHover: "hover:border-yellow-500",
    description: "Interactivity",
    levels: 15,
    slug: "javascript",
  },
  {
    icon: DiPython,
    name: "Python",
    color: "#3776AB",
    bgGradient: "from-blue-600/20 to-green-500/20",
    borderHover: "hover:border-blue-400",
    description: "General Purpose",
    levels: 15,
    slug: "python",
  },
  {
    icon: DiReact,
    name: "React",
    color: "#61DAFB",
    bgGradient: "from-cyan-500/20 to-blue-500/20",
    borderHover: "hover:border-cyan-400",
    description: "UI Framework",
    levels: 12,
    slug: "react",
  },
  {
    icon: DiMysql,
    name: "SQL",
    color: "#4479A1",
    bgGradient: "from-blue-500/20 to-purple-500/20",
    borderHover: "hover:border-blue-500",
    description: "Databases",
    levels: 10,
    slug: "database",
  },
];

function FloatingPixels() {
  const [particles, setParticles] = useState<
    { id: number; left: number; top: number; delay: number; duration: number }[]
  >([]);

  useEffect(() => {
    const newParticles = [...Array(15)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 4,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-2 h-2 bg-purple-500/20 animate-float"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function HeroQuiz({
  onComplete,
  onGameOver,
  onReset,
}: {
  onComplete: (score: number) => void;
  onGameOver: () => void;
  onReset: () => void;
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [hearts, setHearts] = useState(2);
  const [score, setScore] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [streak, setStreak] = useState(0);

  const question = demoQuestions[currentQuestion];
  const maxHearts = 5;

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    const correct = answerIndex === question.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(score + 1);
      setTotalXP(totalXP + question.xp);
      setStreak(streak + 1);
    } else {
      const newHearts = hearts - 1;
      setHearts(newHearts);
      setStreak(0);

      if (newHearts <= 0) {
        setTimeout(() => {
          onGameOver();
        }, 1500);
        return;
      }
    }

    // Move to next question or complete
    setTimeout(() => {
      if (currentQuestion < demoQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setIsComplete(true);
        onComplete(score + (correct ? 1 : 0));
      }
    }, 1500);
  };

  if (isComplete) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Awesome!</h3>
        <p className="text-gray-400 mb-4">
          You got{" "}
          <span className="text-white font-semibold">
            {score}/{demoQuestions.length}
          </span>{" "}
          correct
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-xl text-yellow-400 font-bold mb-6">
          <Star className="w-5 h-5 fill-yellow-400" />
          <span>+{totalXP} XP Earned</span>
        </div>
        <div className="space-y-3">
          <button
            onClick={onReset}
            className="w-full px-4 py-3 rounded-xl transition-all bg-white/5 hover:bg-white/10 text-gray-300 font-medium"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Minimal HUD */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          {[...Array(maxHearts)].map((_, i) => (
            <Heart
              key={i}
              className={`w-5 h-5 transition-all duration-300 ${
                i < hearts ? "text-red-500 fill-red-500" : "text-gray-700"
              } ${i === hearts - 1 && hearts < maxHearts ? "animate-pulse" : ""}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-500/20 rounded-lg animate-pulse">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-orange-400 text-sm font-bold">
                {streak}x
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-500/20 rounded-lg">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-400 text-sm font-bold">
              {totalXP} XP
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-5">
        <div className="h-2 bg-[#0a0a12] rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${((currentQuestion + 1) / demoQuestions.length) * 100}%`,
              background: "var(--progress-gradient)",
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-gray-500">
            Question {currentQuestion + 1}/{demoQuestions.length}
          </span>
          <span className="text-xs text-gray-500">+{question.xp} XP</span>
        </div>
      </div>

      {/* Question */}
      <div className="bg-[#0a0a12] p-5 rounded-xl mb-5 border border-white/5">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(var(--primary-rgb), 0.2)" }}
          >
            <Code2
              className="w-4 h-4"
              style={{ color: "var(--primary-light)" }}
            />
          </div>
          <p className="text-white font-medium text-base">
            {question.question}
          </p>
        </div>
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        {question.options.map((option, i) => {
          let buttonClass =
            "bg-[#1a1a2e] border-[#2d2d44] text-gray-300 hover:border-purple-500/50 hover:bg-[#252540]";

          if (showResult) {
            if (i === question.correctAnswer) {
              buttonClass = "bg-green-500/20 border-green-500 text-green-400";
            } else if (i === selectedAnswer && !isCorrect) {
              buttonClass = "bg-red-500/20 border-red-500 text-red-400";
            } else {
              buttonClass = "bg-[#1a1a2e] border-[#2d2d44] text-gray-500";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={selectedAnswer !== null}
              className={`w-full p-3.5 rounded-xl border-2 transition-all cursor-pointer text-left flex items-center justify-between ${buttonClass}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="font-medium">{option}</span>
              </div>
              {showResult && i === question.correctAnswer && (
                <Check className="w-5 h-5 text-green-400" />
              )}
              {showResult && i === selectedAnswer && !isCorrect && (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Result Feedback */}
      {showResult && (
        <div
          className={`mt-4 p-3 rounded-xl flex items-center justify-center gap-2 font-medium ${
            isCorrect
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {isCorrect ? (
            <>
              <Star className="w-5 h-5 fill-current" />
              <span className="font-bold">+{question.xp} XP</span>
            </>
          ) : (
            <>
              <Heart className="w-4 h-4" />
              <span className="font-bold">-1 Heart</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [quizKey, setQuizKey] = useState(0);

  const handleQuizComplete = () => {
    if (!isAuthenticated) {
      setLoginMessage(
        "Great job! Sign up to save your progress and continue playing!",
      );
      setShowLoginOverlay(true);
    }
  };

  const handleQuizGameOver = () => {
    if (!isAuthenticated) {
      setLoginMessage(
        "Out of hearts! Sign up to get more hearts and keep learning!",
      );
      setShowLoginOverlay(true);
    }
  };

  const resetQuiz = () => {
    setQuizKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Scroll Progress Bar */}
      <ScrollProgressBar />

      {/* Login Overlay */}
      <LoginOverlay
        isOpen={showLoginOverlay}
        onClose={() => {
          setShowLoginOverlay(false);
          resetQuiz();
        }}
        message={loginMessage}
      />

      {/* Header/Navbar */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-sm"
        style={{
          borderColor: "var(--navbar-border)",
          background: "var(--navbar-bg)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div
              className="w-10 h-10 flex items-center justify-center pixel-box group-hover:scale-105 transition-transform"
              style={{ background: "var(--gradient-purple)" }}
            >
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white">CodeLogic</span>
              <span
                className="text-[10px] -mt-1"
                style={{ color: "var(--primary-light)" }}
              >
                Test your coding skills
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm hover:text-white hover:bg-white/5"
                style={{ color: "var(--muted)" }}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div
                className="w-20 h-10 animate-pulse rounded-lg"
                style={{ background: "var(--card-bg)" }}
              />
            ) : isAuthenticated && user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all group"
                style={{
                  background:
                    "linear-gradient(to right, rgba(var(--primary-rgb), 0.2), rgba(var(--primary-rgb), 0.1))",
                  border: "1px solid rgba(var(--primary-rgb), 0.3)",
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg overflow-hidden"
                  style={{ border: "1px solid rgba(var(--primary-rgb), 0.5)" }}
                >
                  <img
                    src={`/avatars/avatar-${user.avatar || 1}.png`}
                    alt="Avatar"
                    className="w-full h-full object-cover object-top scale-150"
                  />
                </div>
                <div
                  className="w-px h-4"
                  style={{ background: "var(--border-color)" }}
                />
                <div className="flex items-center gap-2 text-sm">
                  <Flame
                    className="w-4 h-4"
                    style={{ color: "var(--streak-color)" }}
                  />
                  <span style={{ color: "var(--streak-color)" }}>
                    {Math.max(user.current_streak || 0, 1)}
                  </span>
                </div>
                <div
                  className="w-px h-4"
                  style={{ background: "var(--border-color)" }}
                />
                <div className="flex items-center gap-2 text-sm">
                  <Zap
                    className="w-4 h-4"
                    style={{ color: "var(--xp-text)" }}
                  />
                  <span style={{ color: "var(--xp-text)" }}>
                    {user.xp || 0}
                  </span>
                </div>
                <div
                  className="w-px h-4"
                  style={{ background: "var(--border-color)" }}
                />
                <span className="text-white font-medium">
                  {user.display_name || user.username}
                </span>
                <ChevronRight
                  className="w-4 h-4 group-hover:translate-x-1 transition-all"
                  style={{ color: "var(--muted)" }}
                />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 transition-colors hover:text-white"
                  style={{ color: "var(--foreground-secondary)" }}
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 text-white font-medium rounded-lg transition-all flex items-center gap-2 group hover:opacity-90"
                  style={{ background: "var(--gradient-purple)" }}
                >
                  <Gamepad2 className="w-4 h-4" />
                  Start Playing
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:text-white"
            style={{ color: "var(--muted)" }}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t px-4 py-4 space-y-2"
            style={{
              borderColor: "var(--border-color)",
              background: "var(--background)",
            }}
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-3 rounded-lg transition-all hover:text-white hover:bg-white/5"
                style={{ color: "var(--muted)" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="w-4 h-4 inline mr-2" />
                {item.label}
              </Link>
            ))}
            <div
              className="pt-4 border-t flex gap-3"
              style={{ borderColor: "var(--border-color)" }}
            >
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="flex-1 btn-primary text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex-1 btn-secondary text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 btn-primary text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background GIF */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/main-bg/main-bg.gif')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            transform: "scaleX(-1)",
          }}
        />
        {/* Gradient overlay for readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(15,15,26,0.85) 0%, rgba(15,15,26,0.6) 50%, rgba(15,15,26,0.85) 100%)",
            zIndex: 1,
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 w-full overflow-hidden">
          <FloatingPixels />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-24">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
              {/* Left Content - Takes 7 columns */}
              <div className="lg:col-span-7 text-center lg:text-left space-y-6">
                {/* Badge */}
                <ScrollReveal animation="fade-down" delay={100}>
                  <div
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 border rounded-full text-xs sm:text-sm animate-pulse"
                    style={{
                      background: "rgba(34, 197, 94, 0.15)",
                      borderColor: "rgba(34, 197, 94, 0.4)",
                      color: "#4ade80",
                    }}
                  >
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="whitespace-nowrap">
                      New: Python Challenges!
                    </span>
                  </div>
                </ScrollReveal>

                {/* Headline */}
                <ScrollReveal animation="fade-up" delay={200}>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight tracking-tight">
                    Level Up Your
                    <br />
                    <span
                      className="text-transparent bg-clip-text"
                      style={{
                        backgroundImage:
                          "linear-gradient(90deg, var(--primary-light), #818cf8, var(--primary-light))",
                        backgroundSize: "200% 200%",
                      }}
                    >
                      <TypewriterText words={TYPEWRITER_WORDS} />
                    </span>
                  </h1>
                </ScrollReveal>

                {/* Subheadline */}
                <ScrollReveal animation="fade-up" delay={400}>
                  <p
                    className="text-base sm:text-lg md:text-xl max-w-lg mx-auto lg:mx-0 leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    Master programming through epic quizzes, earn XP, unlock
                    achievements, and compete on the leaderboard. Your coding
                    adventure starts here!
                  </p>
                </ScrollReveal>

                {/* CTA Buttons */}
                <ScrollReveal animation="fade-up" delay={600}>
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                    <Link
                      href={isAuthenticated ? "/dashboard" : "/register"}
                      className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-white font-bold text-base sm:text-lg rounded-xl transition-all flex items-center justify-center gap-2 sm:gap-3 group shadow-2xl hover:scale-105 hover:shadow-purple-500/30"
                      style={{
                        background: "var(--primary)",
                        boxShadow: "0 15px 50px rgba(var(--primary-rgb), 0.4)",
                      }}
                    >
                      <Play className="w-5 h-5" />
                      {isAuthenticated
                        ? "Continue Playing"
                        : "Start Your Journey"}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/how-to-play"
                      className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 hover:border-white/30 transition-all flex items-center justify-center gap-2"
                    >
                      <HelpCircle className="w-5 h-5" />
                      How It Works
                    </Link>
                  </div>
                </ScrollReveal>

                {/* Stats Row */}
                <ScrollReveal animation="fade-up" delay={800}>
                  <div
                    className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 md:gap-10 pt-6 md:pt-8 mt-4 border-t"
                    style={{ borderColor: "rgba(255,255,255,0.1)" }}
                  >
                    {PLATFORM_STATS.map((stat, index) => (
                      <div key={index} className="text-center min-w-[70px]">
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                          <AnimatedNumber
                            value={stat.value}
                            suffix={stat.suffix}
                          />
                        </div>
                        <div
                          className="text-[10px] sm:text-xs uppercase tracking-wider mt-1"
                          style={{ color: "rgba(255,255,255,0.5)" }}
                        >
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollReveal>
              </div>

              {/* Right Content - Interactive Quiz - Takes 5 columns */}
              <div className="lg:col-span-5">
                <ScrollReveal animation="fade-left" delay={300}>
                  <div className="relative">
                    {/* Quiz Header */}
                    <div
                      className="text-center mb-4 px-4 py-3 rounded-xl"
                      style={{ background: "rgba(var(--primary-rgb), 0.1)" }}
                    >
                      <div
                        className="flex items-center justify-center gap-2 text-sm font-medium"
                        style={{ color: "var(--primary-light)" }}
                      >
                        <Gamepad2 className="w-4 h-4" />
                        <span>Try a Quick Quiz</span>
                      </div>
                    </div>

                    <div
                      className="pixel-box p-6 backdrop-blur-sm"
                      style={{
                        background:
                          "linear-gradient(to bottom right, rgba(26,26,46,0.95), rgba(15,15,26,0.95))",
                      }}
                    >
                      <HeroQuiz
                        key={quizKey}
                        onComplete={handleQuizComplete}
                        onGameOver={handleQuizGameOver}
                        onReset={resetQuiz}
                      />
                    </div>

                    {/* Decorative Elements */}
                    <div
                      className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-60"
                      style={{ background: "rgba(var(--primary-rgb), 0.4)" }}
                    />
                    <div
                      className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full blur-2xl opacity-60"
                      style={{ background: "rgba(99, 102, 241, 0.4)" }}
                    />
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Journey Section */}
      <section
        className="py-16 md:py-24 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(var(--primary-rgb), 0.05), transparent)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 border rounded-full mb-4"
                style={{
                  background: "rgba(var(--primary-rgb), 0.1)",
                  borderColor: "rgba(var(--primary-rgb), 0.3)",
                  color: "var(--primary-light)",
                }}
              >
                <Rocket className="w-5 h-5" />
                <span className="font-medium">Your Learning Journey</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                How{" "}
                <span style={{ color: "var(--primary-light)" }}>CodeLogic</span>{" "}
                Works
              </h2>
              <p
                className="max-w-2xl mx-auto"
                style={{ color: "var(--muted)" }}
              >
                A simple 3-step process to transform from beginner to coding
                master
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 -translate-y-1/2 z-0">
              <div
                className="h-full w-full"
                style={{
                  background:
                    "linear-gradient(to right, var(--primary), rgba(var(--primary-rgb), 0.5), var(--primary))",
                }}
              />
            </div>

            {/* Step 1 */}
            <ScrollReveal animation="fade-up" delay={100} className="h-full">
              <div className="relative z-10 h-full">
                <div className="pixel-box p-6 h-full flex flex-col group hover:border-purple-500/50 transition-all hover:-translate-y-2">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mb-4 group-hover:scale-110 transition-transform"
                    style={{ background: "var(--gradient-purple)" }}
                  >
                    1
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target
                      className="w-5 h-5"
                      style={{ color: "var(--primary-light)" }}
                    />
                    <h3 className="text-xl font-bold text-white">
                      Choose Your Path
                    </h3>
                  </div>
                  <p className="flex-grow" style={{ color: "var(--muted)" }}>
                    Pick from HTML, CSS, JavaScript, Python, React, and more.
                    Start at your level - beginner to advanced.
                  </p>
                  <div
                    className="mt-4 flex items-center gap-2 text-sm"
                    style={{ color: "var(--primary-light)" }}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>12+ Languages Available</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Step 2 */}
            <ScrollReveal animation="fade-up" delay={250} className="h-full">
              <div className="relative z-10 h-full">
                <div className="pixel-box p-6 h-full flex flex-col group hover:border-purple-500/50 transition-all hover:-translate-y-2">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mb-4 group-hover:scale-110 transition-transform"
                    style={{ background: "var(--gradient-purple)" }}
                  >
                    2
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Brain
                      className="w-5 h-5"
                      style={{ color: "var(--primary-light)" }}
                    />
                    <h3 className="text-xl font-bold text-white">
                      Play & Learn
                    </h3>
                  </div>
                  <p className="flex-grow" style={{ color: "var(--muted)" }}>
                    Answer quiz questions, manage your hearts wisely, and build
                    streaks for bonus XP. Every answer teaches you something
                    new.
                  </p>
                  <div
                    className="mt-4 flex items-center gap-2 text-sm"
                    style={{ color: "var(--xp-text)" }}
                  >
                    <Zap className="w-4 h-4" />
                    <span>Earn XP Every Quiz</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Step 3 */}
            <ScrollReveal animation="fade-up" delay={400} className="h-full">
              <div className="relative z-10 h-full">
                <div className="pixel-box p-6 h-full flex flex-col group hover:border-purple-500/50 transition-all hover:-translate-y-2">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mb-4 group-hover:scale-110 transition-transform"
                    style={{ background: "var(--gradient-purple)" }}
                  >
                    3
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy
                      className="w-5 h-5"
                      style={{ color: "var(--primary-light)" }}
                    />
                    <h3 className="text-xl font-bold text-white">
                      Level Up & Compete
                    </h3>
                  </div>
                  <p className="flex-grow" style={{ color: "var(--muted)" }}>
                    Track your progress, climb the leaderboard, earn
                    certificates, and become a coding master!
                  </p>
                  <div
                    className="mt-4 flex items-center gap-2 text-sm"
                    style={{ color: "var(--streak-color)" }}
                  >
                    <Award className="w-4 h-4" />
                    <span>Unlock Achievements</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Game Features Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Gamified{" "}
                <span style={{ color: "var(--primary-light)" }}>Learning</span>{" "}
                Experience
              </h2>
              <p
                className="max-w-2xl mx-auto"
                style={{ color: "var(--muted)" }}
              >
                We&apos;ve made learning to code as addictive as your favorite
                games
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Hearts System */}
            <ScrollReveal animation="fade-up" delay={100} className="h-full">
              <div className="pixel-box p-6 h-full flex flex-col text-center group hover:border-red-500/50 transition-all hover:-translate-y-3">
                <div
                  className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform"
                  style={{ background: "rgba(239, 68, 68, 0.2)" }}
                >
                  <Heart
                    className="w-8 h-8 group-hover:animate-pulse"
                    style={{ color: "var(--heart-color)" }}
                  />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Lives System
                </h3>
                <p
                  style={{ color: "var(--muted)" }}
                  className="text-sm flex-grow"
                >
                  10 hearts that regenerate over time. Wrong answers cost hearts
                  - play smart!
                </p>
              </div>
            </ScrollReveal>

            {/* Streaks */}
            <ScrollReveal animation="fade-up" delay={200} className="h-full">
              <div className="pixel-box p-6 h-full flex flex-col text-center group hover:border-orange-500/50 transition-all hover:-translate-y-3">
                <div
                  className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform"
                  style={{ background: "rgba(249, 115, 22, 0.2)" }}
                >
                  <Flame
                    className="w-8 h-8 group-hover:animate-bounce"
                    style={{ color: "var(--streak-color)" }}
                  />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Daily Streaks
                </h3>
                <p
                  style={{ color: "var(--muted)" }}
                  className="text-sm flex-grow"
                >
                  Play daily to build your streak and earn bonus XP rewards!
                </p>
              </div>
            </ScrollReveal>

            {/* XP & Levels */}
            <ScrollReveal animation="fade-up" delay={300} className="h-full">
              <div className="pixel-box p-6 h-full flex flex-col text-center group hover:border-yellow-500/50 transition-all hover:-translate-y-3">
                <div
                  className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform"
                  style={{ background: "rgba(234, 179, 8, 0.2)" }}
                >
                  <Zap
                    className="w-8 h-8 group-hover:animate-pulse"
                    style={{ color: "var(--xp-text)" }}
                  />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  XP & Levels
                </h3>
                <p
                  style={{ color: "var(--muted)" }}
                  className="text-sm flex-grow"
                >
                  Earn XP for correct answers and level up to unlock new
                  challenges!
                </p>
              </div>
            </ScrollReveal>

            {/* Achievements */}
            <ScrollReveal animation="fade-up" delay={400} className="h-full">
              <div className="pixel-box p-6 h-full flex flex-col text-center group hover:border-purple-500/50 transition-all hover:-translate-y-3">
                <div
                  className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform"
                  style={{ background: "rgba(var(--primary-rgb), 0.2)" }}
                >
                  <Trophy
                    className="w-8 h-8 group-hover:animate-bounce"
                    style={{ color: "var(--primary-light)" }}
                  />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Achievements
                </h3>
                <p
                  style={{ color: "var(--muted)" }}
                  className="text-sm flex-grow"
                >
                  Unlock badges and certificates as you master new skills!
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Skill Tree Section */}
      <section
        className="py-16 md:py-24 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(var(--primary-rgb), 0.03), transparent)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 relative">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 border rounded-full mb-4"
                style={{
                  background: "rgba(var(--primary-rgb), 0.15)",
                  borderColor: "rgba(var(--primary-rgb), 0.3)",
                  color: "var(--primary-light)",
                }}
              >
                <Target className="w-5 h-5" />
                <span className="font-medium">Your Learning Path</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Test Your{" "}
                <span style={{ color: "var(--primary-light)" }}>Knowledge</span>
              </h2>
              <p
                className="max-w-2xl mx-auto"
                style={{ color: "var(--muted)" }}
              >
                Choose a topic and challenge yourself with quizzes at every
                level
              </p>
            </div>
          </ScrollReveal>

          {/* Skill Tree Layout */}
          <div className="relative py-8">
            {/* SVG Connection Lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
              style={{ zIndex: 0 }}
            >
              {/* Horizontal lines connecting top row */}
              <line
                x1="20%"
                y1="80"
                x2="50%"
                y2="80"
                className="skill-tree-line"
              />
              <line
                x1="50%"
                y1="80"
                x2="80%"
                y2="80"
                className="skill-tree-line"
              />

              {/* Horizontal lines connecting bottom row */}
              <line
                x1="20%"
                y1="calc(100% - 80px)"
                x2="50%"
                y2="calc(100% - 80px)"
                className="skill-tree-line"
              />
              <line
                x1="50%"
                y1="calc(100% - 80px)"
                x2="80%"
                y2="calc(100% - 80px)"
                className="skill-tree-line"
              />

              {/* Vertical lines connecting rows */}
              <line
                x1="20%"
                y1="80"
                x2="20%"
                y2="calc(100% - 80px)"
                className="skill-tree-line"
              />
              <line
                x1="50%"
                y1="80"
                x2="50%"
                y2="calc(100% - 80px)"
                className="skill-tree-line"
              />
              <line
                x1="80%"
                y1="80"
                x2="80%"
                y2="calc(100% - 80px)"
                className="skill-tree-line"
              />
            </svg>

            {/* Top Row - HTML, CSS, JavaScript */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 mb-16 relative z-10">
              {availableLanguages.slice(0, 3).map((lang) => (
                <ScrollReveal
                  key={lang.slug}
                  animation="fade-down"
                  className="h-full"
                >
                  <div className="flex justify-center h-full">
                    <div
                      className={`group relative pixel-box p-4 md:p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 ${lang.borderHover} w-full max-w-[200px] h-full`}
                    >
                      {/* Glowing dot indicator */}
                      <div
                        className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full animate-pulse"
                        style={{
                          background: lang.color,
                          boxShadow: `0 0 10px ${lang.color}`,
                        }}
                      />

                      {/* Icon Container */}
                      <div
                        className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                        style={{ background: `${lang.color}20` }}
                      >
                        <lang.icon
                          className="w-8 h-8 md:w-10 md:h-10"
                          style={{ color: lang.color }}
                        />
                      </div>

                      <h3 className="font-bold text-white text-sm md:text-base">
                        {lang.name}
                      </h3>
                      <p
                        className="text-[10px] md:text-xs mt-1"
                        style={{ color: "var(--muted)" }}
                      >
                        {lang.description}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Bottom Row - Python, React, SQL */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 relative z-10">
              {availableLanguages.slice(3, 6).map((lang) => (
                <ScrollReveal
                  key={lang.slug}
                  animation="fade-up"
                  className="h-full"
                >
                  <div className="flex justify-center h-full">
                    <div
                      className={`group relative pixel-box p-4 md:p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 ${lang.borderHover} w-full max-w-[200px] h-full`}
                    >
                      {/* Glowing dot indicator */}
                      <div
                        className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full animate-pulse"
                        style={{
                          background: lang.color,
                          boxShadow: `0 0 10px ${lang.color}`,
                        }}
                      />

                      {/* Icon Container */}
                      <div
                        className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                        style={{ background: `${lang.color}20` }}
                      >
                        <lang.icon
                          className="w-8 h-8 md:w-10 md:h-10"
                          style={{ color: lang.color }}
                        />
                      </div>

                      <h3 className="font-bold text-white text-sm md:text-base">
                        {lang.name}
                      </h3>
                      <p
                        className="text-[10px] md:text-xs mt-1"
                        style={{ color: "var(--muted)" }}
                      >
                        {lang.description}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* CTA */}
          <ScrollReveal animation="fade-up" delay={200}>
            <div className="text-center mt-16">
              <Link
                href={isAuthenticated ? "/play" : "/register"}
                className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold rounded-xl transition-all group hover:scale-105"
                style={{
                  background: "var(--gradient-purple)",
                  boxShadow: "0 10px 40px rgba(124, 58, 237, 0.3)",
                }}
              >
                <Gamepad2 className="w-5 h-5" />
                {isAuthenticated ? "View All Quizzes" : "Start Your Journey"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Features List */}
            <ScrollReveal animation="fade-right">
              <div>
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 border rounded-full mb-4"
                  style={{
                    background: "rgba(var(--primary-rgb), 0.1)",
                    borderColor: "rgba(var(--primary-rgb), 0.3)",
                    color: "var(--primary-light)",
                  }}
                >
                  <Lightbulb className="w-5 h-5" />
                  <span className="font-medium">Why CodeLogic?</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Learn Smarter, Not Harder
                </h2>

                <div className="space-y-6">
                  {[
                    {
                      icon: GraduationCap,
                      title: "Structured Learning Paths",
                      description:
                        "Progress from basics to advanced with carefully crafted quiz sequences",
                    },
                    {
                      icon: Clock,
                      title: "Learn in 5-Minute Sessions",
                      description:
                        "Perfect for busy schedules - quick quizzes you can do anytime, anywhere",
                    },
                    {
                      icon: BarChart3,
                      title: "Track Your Progress",
                      description:
                        "Detailed stats and visualizations show how far you've come",
                    },
                    {
                      icon: Shield,
                      title: "Free Forever",
                      description:
                        "Core features are completely free - no hidden costs or paywalls",
                    },
                  ].map((feature, index) => (
                    <ScrollReveal
                      key={index}
                      animation="fade-left"
                      delay={index * 150}
                    >
                      <div className="flex items-start gap-4 group">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                          style={{
                            background: "rgba(var(--primary-rgb), 0.2)",
                          }}
                        >
                          <feature.icon
                            className="w-6 h-6"
                            style={{ color: "var(--primary-light)" }}
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">
                            {feature.title}
                          </h3>
                          <p style={{ color: "var(--muted)" }}>
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Right - Stats Card */}
            <ScrollReveal animation="fade-left" delay={200}>
              <div
                className="pixel-box p-8"
                style={{
                  background:
                    "linear-gradient(to bottom right, var(--card-bg), rgba(var(--primary-rgb), 0.1))",
                }}
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Platform Statistics
                  </h3>
                  <p style={{ color: "var(--muted)" }}>
                    Join our growing community
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {[
                    { value: "9", label: "Languages", icon: Code2 },
                    { value: "500+", label: "Quiz Questions", icon: Brain },
                    { value: "100%", label: "Free Forever", icon: Star },
                    {
                      value: "50+",
                      label: "Quiz Topics",
                      icon: TrendingUp,
                    },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="text-center p-4 rounded-xl hover:scale-105 transition-transform cursor-default"
                      style={{ background: "rgba(var(--primary-rgb), 0.1)" }}
                    >
                      <stat.icon
                        className="w-8 h-8 mx-auto mb-2"
                        style={{ color: "var(--primary-light)" }}
                      />
                      <div className="text-2xl font-bold text-white">
                        {stat.value}
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: "var(--muted)" }}
                      >
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <ScrollReveal animation="fade-up">
            <div
              className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
              style={{
                background: "var(--primary)",
                boxShadow: "0 8px 32px rgba(var(--primary-rgb), 0.3)",
              }}
            >
              <Rocket className="w-8 h-8 text-white" />
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={200}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Start Your Coding Journey
            </h2>
            <p
              className="mb-10 max-w-md mx-auto text-lg"
              style={{ color: "var(--muted)" }}
            >
              Join thousands of learners leveling up their skills every day.
              Free to start.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={400}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={isAuthenticated ? "/dashboard" : "/register"}
                className="w-full sm:w-auto px-8 py-4 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group hover:scale-105"
                style={{
                  background: "var(--primary)",
                  boxShadow: "0 4px 20px rgba(var(--primary-rgb), 0.4)",
                }}
              >
                <Gamepad2 className="w-5 h-5" />
                {isAuthenticated ? "Go to Dashboard" : "Create Free Account"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/learn"
                className="w-full sm:w-auto px-8 py-4 text-white font-medium rounded-xl border transition-all flex items-center justify-center gap-2 hover:bg-white/5"
                style={{ borderColor: "var(--border-color)" }}
              >
                <BookOpen className="w-5 h-5" />
                Explore Resources
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <ScrollReveal animation="fade-up">
        <footer
          className="border-t py-12"
          style={{ borderColor: "var(--border-color)" }}
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Brand */}
              <div className="col-span-1 md:col-span-2">
                <Link href="/" className="flex items-center gap-2 mb-4">
                  <div
                    className="w-10 h-10 flex items-center justify-center pixel-box"
                    style={{ background: "var(--gradient-purple)" }}
                  >
                    <Code2 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">
                    CodeLogic
                  </span>
                </Link>
                <p
                  className="text-sm max-w-xs"
                  style={{ color: "var(--muted)" }}
                >
                  Learn to code through gamified quizzes. Earn XP, maintain
                  streaks, and level up your programming skills.
                </p>
              </div>

              <div>
                <h4 className="text-white font-medium mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  {FOOTER_LINKS.quickLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm transition-colors hover:text-white"
                        style={{ color: "var(--muted)" }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-white font-medium mb-4">Account</h4>
                <ul className="space-y-2">
                  {FOOTER_LINKS.account.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm transition-colors hover:text-white"
                        style={{ color: "var(--muted)" }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div
              className="border-t pt-8 text-center text-sm"
              style={{
                borderColor: "var(--border-color)",
                color: "var(--muted)",
              }}
            >
              <p>
                &copy; {new Date().getFullYear()} CodeLogic. All rights
                reserved.
              </p>
            </div>
          </div>
        </footer>
      </ScrollReveal>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.6;
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
      <ScrollToTop />
    </div>
  );
}
