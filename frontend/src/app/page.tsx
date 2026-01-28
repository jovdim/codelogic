"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
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
} from "lucide-react";

// Language/Topic data for the Play section
const playTopics = [
  {
    id: "html",
    name: "HTML",
    icon: "🌐",
    color: "from-orange-500 to-red-500",
    borderColor: "border-orange-500/30",
    hoverBorder: "hover:border-orange-500",
    level: 1,
    totalLevels: 10,
    xpReward: 50,
    description: "Structure of web pages",
  },
  {
    id: "css",
    name: "CSS",
    icon: "🎨",
    color: "from-blue-500 to-cyan-500",
    borderColor: "border-blue-500/30",
    hoverBorder: "hover:border-blue-500",
    level: 1,
    totalLevels: 12,
    xpReward: 60,
    description: "Styling and layouts",
  },
  {
    id: "javascript",
    name: "JavaScript",
    icon: "⚡",
    color: "from-yellow-400 to-orange-500",
    borderColor: "border-yellow-500/30",
    hoverBorder: "hover:border-yellow-500",
    level: 1,
    totalLevels: 15,
    xpReward: 75,
    description: "Interactive web magic",
  },
  {
    id: "python",
    name: "Python",
    icon: "🐍",
    color: "from-green-500 to-teal-500",
    borderColor: "border-green-500/30",
    hoverBorder: "hover:border-green-500",
    level: 1,
    totalLevels: 15,
    xpReward: 75,
    description: "Versatile programming",
  },
  {
    id: "react",
    name: "React",
    icon: "⚛️",
    color: "from-cyan-400 to-blue-500",
    borderColor: "border-cyan-500/30",
    hoverBorder: "hover:border-cyan-500",
    level: 1,
    totalLevels: 12,
    xpReward: 80,
    description: "Modern UI library",
  },
  {
    id: "database",
    name: "Database",
    icon: "🗄️",
    color: "from-purple-500 to-pink-500",
    borderColor: "border-purple-500/30",
    hoverBorder: "hover:border-purple-500",
    level: 1,
    totalLevels: 10,
    xpReward: 70,
    description: "SQL & NoSQL",
  },
];

// Animated counter component
function AnimatedNumber({
  value,
  duration = 1000,
}: {
  value: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
}

// Floating pixel particles
function FloatingPixels() {
  const [particles, setParticles] = useState<
    { id: number; left: number; top: number; delay: number; duration: number }[]
  >([]);

  useEffect(() => {
    const newParticles = [...Array(20)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
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

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0f0f1a] relative">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#2d2d44] bg-[#0f0f1a]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center pixel-box group-hover:scale-105 transition-transform">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white">CodeLogic</span>
              <span className="text-[10px] text-purple-400 -mt-1">
                Level Up Your Code
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/learn"
              className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-2 text-sm"
            >
              <BookOpen className="w-4 h-4" />
              Learn
            </Link>
            <Link
              href="/leaderboard"
              className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-2 text-sm"
            >
              <Trophy className="w-4 h-4" />
              Leaderboard
            </Link>
            <Link
              href="/how-to-play"
              className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-2 text-sm"
            >
              <HelpCircle className="w-4 h-4" />
              How to Play
            </Link>
            <Link
              href="/about"
              className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-2 text-sm"
            >
              <Users className="w-4 h-4" />
              About
            </Link>
          </nav>

          {/* Auth Buttons / User Info */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="w-20 h-10 bg-[#1a1a2e] animate-pulse rounded-lg" />
            ) : isAuthenticated && user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-lg hover:border-purple-500 transition-all group"
              >
                <div className="flex items-center gap-2 text-sm">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-orange-400">
                    {user.current_streak || 0}
                  </span>
                </div>
                <div className="w-px h-4 bg-[#2d2d44]" />
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-400">{user.xp || 0}</span>
                </div>
                <div className="w-px h-4 bg-[#2d2d44]" />
                <span className="text-white font-medium group-hover:text-purple-400 transition-colors">
                  {user.display_name || user.username}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-500 hover:to-purple-600 transition-all flex items-center gap-2 group"
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
            className="md:hidden p-2 text-gray-400 hover:text-white"
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
          <div className="md:hidden border-t border-[#2d2d44] bg-[#0f0f1a] px-4 py-4 space-y-2">
            <Link
              href="/learn"
              className="block px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Learn
            </Link>
            <Link
              href="/leaderboard"
              className="block px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Trophy className="w-4 h-4 inline mr-2" />
              Leaderboard
            </Link>
            <Link
              href="/how-to-play"
              className="block px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              <HelpCircle className="w-4 h-4 inline mr-2" />
              How to Play
            </Link>
            <Link
              href="/about"
              className="block px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Users className="w-4 h-4 inline mr-2" />
              About
            </Link>
            <div className="pt-4 border-t border-[#2d2d44] flex gap-3">
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
      <section className="relative overflow-hidden">
        <FloatingPixels />
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm mb-6 animate-pulse">
                <Sparkles className="w-4 h-4" />
                New: Python Challenges Available!
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Level Up Your
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-gradient">
                  Coding Skills
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
                Master programming through epic quizzes, earn XP, unlock
                achievements, and compete on the leaderboard. Your coding
                adventure starts here!
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href={isAuthenticated ? "/dashboard" : "/register"}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-purple-500/25"
                >
                  <Play className="w-5 h-5" />
                  {isAuthenticated ? "Continue Playing" : "Start Your Journey"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/how-to-play"
                  className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-medium rounded-lg hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <HelpCircle className="w-5 h-5" />
                  How It Works
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center lg:justify-start gap-8 mt-10 pt-8 border-t border-[#2d2d44]">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    <AnimatedNumber value={10000} />+
                  </div>
                  <div className="text-sm text-gray-500">Active Learners</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    <AnimatedNumber value={500} />+
                  </div>
                  <div className="text-sm text-gray-500">Quiz Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    <AnimatedNumber value={12} />
                  </div>
                  <div className="text-sm text-gray-500">Languages</div>
                </div>
              </div>
            </div>

            {/* Right Content - Game Preview */}
            <div className="relative">
              <div className="pixel-box p-6 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border-purple-500/30">
                {/* Game HUD Preview */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Heart
                          key={i}
                          className={`w-6 h-6 ${i <= 4 ? "text-red-500 fill-red-500" : "text-gray-600"} ${i === 4 ? "animate-pulse" : ""}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 rounded-lg">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-orange-400 font-bold">7</span>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 rounded-lg">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-yellow-400 font-bold">1,250</span>
                    </div>
                  </div>
                </div>

                {/* Question Preview */}
                <div className="bg-[#0a0a12] p-4 rounded-lg mb-4">
                  <div className="text-purple-400 text-sm mb-2">
                    Question 5 of 10
                  </div>
                  <p className="text-white font-medium">
                    What does CSS stand for?
                  </p>
                </div>

                {/* Answer Options */}
                <div className="space-y-2">
                  {[
                    { text: "Computer Style Sheets", correct: false },
                    { text: "Cascading Style Sheets", correct: true },
                    { text: "Creative Style System", correct: false },
                    { text: "Colorful Style Sheets", correct: false },
                  ].map((option, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        option.correct
                          ? "bg-green-500/20 border-green-500 text-green-400"
                          : "bg-[#1a1a2e] border-[#2d2d44] text-gray-300 hover:border-purple-500/50"
                      }`}
                    >
                      <span className="text-sm font-medium mr-2 text-gray-500">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      {option.text}
                      {option.correct && (
                        <span className="float-right text-green-400">
                          ✓ Correct!
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* XP Earned */}
                <div className="mt-4 flex items-center justify-center gap-2 text-yellow-400 animate-bounce">
                  <Star className="w-5 h-5 fill-yellow-400" />
                  <span className="font-bold">+50 XP</span>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
              <div
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-pink-500/20 rounded-full blur-xl animate-pulse"
                style={{ animationDelay: "1s" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* PLAY SECTION - Main Feature */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-purple-400 mb-4">
              <Gamepad2 className="w-5 h-5" />
              <span className="font-medium">Choose Your Path</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to <span className="text-purple-400">Play</span>?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Select a language or topic and start your quiz adventure. Each
              correct answer earns XP and gets you closer to the next level!
            </p>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {playTopics.map((topic) => (
              <Link
                key={topic.id}
                href={isAuthenticated ? `/play/${topic.id}` : "/login"}
                className={`group relative overflow-hidden pixel-box p-6 ${topic.borderColor} ${topic.hoverBorder} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
                onMouseEnter={() => setHoveredTopic(topic.id)}
                onMouseLeave={() => setHoveredTopic(null)}
              >
                {/* Background Gradient on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon and Level */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${topic.color} flex items-center justify-center text-3xl rounded-lg shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                    >
                      {topic.icon}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        Level
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {topic.level}
                      </div>
                    </div>
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                    {topic.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {topic.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>
                        {topic.level}/{topic.totalLevels} Levels
                      </span>
                    </div>
                    <div className="h-2 bg-[#0a0a12] rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${topic.color} transition-all duration-500`}
                        style={{
                          width: `${(topic.level / topic.totalLevels) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* XP Reward and Play Button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        +{topic.xpReward} XP per quiz
                      </span>
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${hoveredTopic === topic.id ? "text-purple-400" : "text-gray-500"} transition-colors`}
                    >
                      Play
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${hoveredTopic === topic.id ? "translate-x-1" : ""}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Animated Corner */}
                <div className="absolute -bottom-2 -right-2 w-20 h-20">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-20 rounded-tl-3xl transform rotate-45 group-hover:scale-150 transition-transform duration-500`}
                  />
                </div>
              </Link>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-10">
            <Link
              href={isAuthenticated ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-600/30 hover:border-purple-500 transition-all group"
            >
              View All Languages & Topics
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why <span className="text-purple-400">CodeLogic</span>?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We&apos;ve gamified the learning experience to make coding
              education fun, engaging, and effective.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Lives System */}
            <div className="pixel-box p-6 text-center group hover:border-red-500/50 transition-all">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 text-red-500 group-hover:animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Lives System
              </h3>
              <p className="text-gray-400 text-sm">
                5 hearts that regenerate over time. Each wrong answer costs a
                heart!
              </p>
            </div>

            {/* Streaks */}
            <div className="pixel-box p-6 text-center group hover:border-orange-500/50 transition-all">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/20 flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform">
                <Flame className="w-8 h-8 text-orange-500 group-hover:animate-bounce" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Daily Streaks
              </h3>
              <p className="text-gray-400 text-sm">
                Play daily to maintain your streak and earn bonus XP rewards!
              </p>
            </div>

            {/* XP & Levels */}
            <div className="pixel-box p-6 text-center group hover:border-yellow-500/50 transition-all">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-yellow-500 group-hover:animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">XP & Levels</h3>
              <p className="text-gray-400 text-sm">
                Earn XP for correct answers and level up to unlock new content!
              </p>
            </div>

            {/* Achievements */}
            <div className="pixel-box p-6 text-center group hover:border-purple-500/50 transition-all">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform">
                <Trophy className="w-8 h-8 text-purple-500 group-hover:animate-bounce" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Achievements
              </h3>
              <p className="text-gray-400 text-sm">
                Unlock badges and achievements as you master new skills!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-transparent via-[#1a1a2e]/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It <span className="text-purple-400">Works</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="pixel-box p-6 h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-xl font-bold text-white mb-4 rounded-lg">
                  1
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">
                    Choose a Topic
                  </h3>
                </div>
                <p className="text-gray-400 text-sm">
                  Select from HTML, CSS, JavaScript, Python, and more
                  programming languages.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 text-gray-600 text-2xl">
                →
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="pixel-box p-6 h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-xl font-bold text-white mb-4 rounded-lg">
                  2
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">Take Quizzes</h3>
                </div>
                <p className="text-gray-400 text-sm">
                  Answer questions, use your hearts wisely, and try to get the
                  highest score!
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 text-gray-600 text-2xl">
                →
              </div>
            </div>

            {/* Step 3 */}
            <div>
              <div className="pixel-box p-6 h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-xl font-bold text-white mb-4 rounded-lg">
                  3
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">Level Up!</h3>
                </div>
                <p className="text-gray-400 text-sm">
                  Earn XP, unlock achievements, climb the leaderboard, and
                  become a coding master!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="pixel-box p-8 md:p-12 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Coding Adventure?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join thousands of learners who are leveling up their programming
              skills every day. It&apos;s free to start!
            </p>
            <Link
              href={isAuthenticated ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all group shadow-lg shadow-purple-500/25"
            >
              <Gamepad2 className="w-5 h-5" />
              {isAuthenticated ? "Go to Dashboard" : "Create Free Account"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2d2d44] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center pixel-box">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">CodeLogic</span>
              </Link>
              <p className="text-gray-500 text-sm max-w-xs">
                Learn to code through gamified quizzes. Earn XP, maintain
                streaks, and level up your programming skills.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/how-to-play"
                    className="text-gray-500 hover:text-white transition-colors text-sm"
                  >
                    How to Play
                  </Link>
                </li>
                <li>
                  <Link
                    href="/learn"
                    className="text-gray-500 hover:text-white transition-colors text-sm"
                  >
                    Learn
                  </Link>
                </li>
                <li>
                  <Link
                    href="/leaderboard"
                    className="text-gray-500 hover:text-white transition-colors text-sm"
                  >
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-gray-500 hover:text-white transition-colors text-sm"
                  >
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-medium mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/login"
                    className="text-gray-500 hover:text-white transition-colors text-sm"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="text-gray-500 hover:text-white transition-colors text-sm"
                  >
                    Register
                  </Link>
                </li>
                <li>
                  <Link
                    href="/forgot-password"
                    className="text-gray-500 hover:text-white transition-colors text-sm"
                  >
                    Reset Password
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#2d2d44] pt-8 text-center text-gray-600 text-sm">
            <p>
              &copy; {new Date().getFullYear()} CodeLogic. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

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
    </div>
  );
}
