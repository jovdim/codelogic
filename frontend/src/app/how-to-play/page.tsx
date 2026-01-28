"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import {
  Heart,
  Flame,
  Star,
  Trophy,
  Target,
  Clock,
  Zap,
  BookOpen,
  ChevronRight,
  Sparkles,
  Shield,
  Award,
  TrendingUp,
  Gift,
  Gamepad2,
} from "lucide-react";

// Animated pixel heart component
function PixelHeart({ filled, delay }: { filled: boolean; delay: number }) {
  return (
    <div
      className={`w-8 h-8 transition-all duration-300 ${filled ? "scale-110" : "scale-100 opacity-40"}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <Heart
        className={`w-full h-full ${filled ? "text-red-500 fill-red-500 animate-pulse" : "text-gray-600"}`}
      />
    </div>
  );
}

// XP Counter Animation
function XPCounter() {
  const [xp, setXp] = useState(0);
  const targetXP = 1250;

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = targetXP / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetXP) {
        setXp(targetXP);
        clearInterval(timer);
      } else {
        setXp(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-4xl font-bold text-yellow-400 tabular-nums">
      {xp.toLocaleString()} <span className="text-xl">XP</span>
    </div>
  );
}

export default function HowToPlayPage() {
  const [activeHearts, setActiveHearts] = useState(5);
  const [currentStreak, setCurrentStreak] = useState(0);

  // Animate hearts
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHearts((prev) => (prev > 0 ? prev - 1 : 5));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Animate streak
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStreak < 30) {
        setCurrentStreak((prev) => prev + 1);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [currentStreak]);

  return (
    <Navbar>
      <div className="min-h-screen pb-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-900/50 via-[#1a1a2e] to-[#0f0f1a] border-b border-[#2d2d44]">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />

          <div className="relative max-w-4xl mx-auto px-4 py-12 md:py-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-sm mb-6">
              <Gamepad2 className="w-4 h-4" />
              <span>Game Guide</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How to <span className="text-purple-400">Play</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              Master programming through our gamified learning experience. Earn
              XP, maintain streaks, and become a coding champion!
            </p>

            {/* Animated Stats Preview */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-8">
              <div className="pixel-box px-4 md:px-6 py-4 bg-[#1a1a2e]/80">
                <div className="flex gap-1 mb-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <PixelHeart
                      key={i}
                      filled={i < activeHearts}
                      delay={i * 100}
                    />
                  ))}
                </div>
                <p className="text-gray-400 text-sm">Lives System</p>
              </div>
              <div className="pixel-box px-4 md:px-6 py-4 bg-[#1a1a2e]/80">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-8 h-8 text-orange-500" />
                  <span className="text-3xl font-bold text-orange-400">
                    {currentStreak}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">Day Streak</p>
              </div>
              <div className="pixel-box px-4 md:px-6 py-4 bg-[#1a1a2e]/80">
                <XPCounter />
                <p className="text-gray-400 text-sm">Experience Points</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Game Mechanics Grid */}
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Core Game Mechanics
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {/* Hearts Card */}
            <div className="pixel-box p-6 bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20 hover:border-red-500/40 transition-colors group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-red-500/20 flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform">
                  <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Hearts</h3>
                  <p className="text-red-400 text-sm">Your Lives</p>
                </div>
              </div>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-400" />
                  Start with <strong className="text-white">5 hearts</strong>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-red-400" />
                  Wrong answer = -1 heart
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-400" />
                  Regenerate 1 heart every 2 min
                </li>
              </ul>
            </div>

            {/* Streaks Card */}
            <div className="pixel-box p-6 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20 hover:border-orange-500/40 transition-colors group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-orange-500/20 flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform">
                  <Flame className="w-8 h-8 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Streaks</h3>
                  <p className="text-orange-400 text-sm">Daily Consistency</p>
                </div>
              </div>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  Complete 1 quiz daily
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-orange-400" />
                  Miss a day = streak resets
                </li>
                <li className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-orange-400" />
                  Longer streaks = bonus rewards
                </li>
              </ul>
            </div>

            {/* XP Card */}
            <div className="pixel-box p-6 bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20 hover:border-yellow-500/40 transition-colors group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-yellow-500/20 flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform">
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">XP & Levels</h3>
                  <p className="text-yellow-400 text-sm">Your Progress</p>
                </div>
              </div>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Correct answer ={" "}
                  <strong className="text-white">+10 XP</strong>
                </li>
                <li className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-400" />
                  Perfect quiz ={" "}
                  <strong className="text-white">+50 bonus XP</strong>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-yellow-400" />
                  Level up every <strong className="text-white">1000 XP</strong>
                </li>
              </ul>
            </div>

            {/* Quizzes Card */}
            <div className="pixel-box p-6 bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20 hover:border-purple-500/40 transition-colors group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-purple-500/20 flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Quizzes</h3>
                  <p className="text-purple-400 text-sm">Test Your Skills</p>
                </div>
              </div>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-purple-400" />
                  Multiple choice questions
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-purple-400" />
                  Code completion challenges
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-purple-400" />
                  True/False questions
                </li>
              </ul>
            </div>
          </div>

          {/* Rewards Section */}
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Rewards & Achievements
          </h2>

          <div className="pixel-box p-6 mb-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl" />
            <div className="grid md:grid-cols-3 gap-6 relative">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center pixel-box">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-white font-bold mb-1">Badges</h4>
                <p className="text-gray-400 text-sm">
                  Unlock unique badges for achievements
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center pixel-box">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-white font-bold mb-1">Titles</h4>
                <p className="text-gray-400 text-sm">
                  Earn special titles as you level up
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center pixel-box">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-white font-bold mb-1">Leaderboard</h4>
                <p className="text-gray-400 text-sm">
                  Compete for top spots globally
                </p>
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Zap className="w-6 h-6 text-cyan-400" />
            Pro Tips
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {[
              {
                tip: "Practice daily to maintain your streak",
                icon: "🔥",
              },
              {
                tip: "Read learning materials before quizzes",
                icon: "📚",
              },
              {
                tip: "Wait for hearts to regenerate",
                icon: "⏰",
              },
              {
                tip: "Start with basics, then advance",
                icon: "📈",
              },
              {
                tip: "Compete on leaderboards for motivation",
                icon: "🏆",
              },
              {
                tip: "Review wrong answers to learn",
                icon: "🎯",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="pixel-box p-4 flex items-center gap-4 hover:border-purple-500/40 transition-colors"
              >
                <span className="text-3xl">{item.icon}</span>
                <p className="text-gray-300">{item.tip}</p>
              </div>
            ))}
          </div>

          {/* Learning Resources CTA */}
          <div className="pixel-box p-6 bg-gradient-to-r from-green-500/10 to-cyan-500/10 border-green-500/30">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-green-500/20 flex items-center justify-center rounded-lg flex-shrink-0">
                <BookOpen className="w-8 h-8 text-green-400" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-2">
                  Ready to Start Learning?
                </h3>
                <p className="text-gray-400">
                  Check out our comprehensive learning library with guides for
                  all programming languages!
                </p>
              </div>
              <a
                href="/learn"
                className="btn-primary inline-flex items-center gap-2 whitespace-nowrap"
              >
                Browse Library
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </Navbar>
  );
}
