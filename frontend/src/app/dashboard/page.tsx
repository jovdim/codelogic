"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/RouteGuards";
import Sidebar from "@/components/layout/Sidebar";
import Link from "next/link";
import {
  Zap,
  Heart,
  Flame,
  Trophy,
  Star,
  ChevronRight,
  Gamepad2,
  Target,
  Clock,
  TrendingUp,
  Award,
  Sparkles,
  Play,
  BookOpen,
  Swords,
  Crown,
  Shield,
  Gift,
} from "lucide-react";

// Daily challenges data
const dailyChallenges = [
  {
    id: 1,
    title: "Quick Learner",
    description: "Complete 3 quizzes today",
    progress: 1,
    total: 3,
    xpReward: 150,
    icon: Target,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    title: "Perfect Score",
    description: "Get 100% on any quiz",
    progress: 0,
    total: 1,
    xpReward: 200,
    icon: Star,
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: 3,
    title: "Streak Master",
    description: "Maintain a 5+ answer streak",
    progress: 3,
    total: 5,
    xpReward: 100,
    icon: Flame,
    color: "from-orange-500 to-red-500",
  },
];

// Recent activity data
const recentActivity = [
  {
    id: 1,
    type: "quiz",
    topic: "JavaScript",
    score: "8/10",
    xp: 180,
    time: "2 hours ago",
    icon: "⚡",
  },
  {
    id: 2,
    type: "quiz",
    topic: "HTML",
    score: "10/10",
    xp: 250,
    time: "5 hours ago",
    icon: "🌐",
  },
  {
    id: 3,
    type: "achievement",
    topic: "First Perfect!",
    xp: 100,
    time: "5 hours ago",
    icon: "🏆",
  },
  {
    id: 4,
    type: "quiz",
    topic: "CSS",
    score: "7/10",
    xp: 140,
    time: "Yesterday",
    icon: "🎨",
  },
];

// Recommended topics
const recommendedTopics = [
  {
    id: "javascript",
    name: "JavaScript",
    icon: "⚡",
    color: "from-yellow-400 to-orange-500",
    level: 3,
    progress: 65,
  },
  {
    id: "python",
    name: "Python",
    icon: "🐍",
    color: "from-green-500 to-teal-500",
    level: 2,
    progress: 40,
  },
  {
    id: "html",
    name: "HTML",
    icon: "🌐",
    color: "from-orange-500 to-red-500",
    level: 5,
    progress: 85,
  },
];

// Achievements preview
const achievements = [
  { id: 1, name: "First Steps", icon: "👶", unlocked: true },
  { id: 2, name: "Quiz Master", icon: "🎓", unlocked: true },
  { id: 3, name: "Streak Hero", icon: "🔥", unlocked: true },
  { id: 4, name: "Perfect 10", icon: "💯", unlocked: false },
  { id: 5, name: "Speed Demon", icon: "⚡", unlocked: false },
  { id: 6, name: "Grandmaster", icon: "👑", unlocked: false },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("Hello");
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // Trigger animation
    setTimeout(() => setAnimateStats(true), 100);
  }, []);

  if (!user) return null;

  const xpProgress = (user.xp % 1000) / 10;
  const xpToNext = 1000 - (user.xp % 1000);

  return (
    <ProtectedRoute>
      <Sidebar>
        <div className="min-h-screen pb-8">
          <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Hero Section with Player Card */}
            <div className="pixel-box p-6 mb-6 relative overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-pink-600/10" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Player Info */}
                  <div className="flex items-center gap-4">
                    {/* Avatar/Level Badge */}
                    <div className="relative">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg shadow-purple-500/25 border-2 border-purple-500/50">
                        <img
                          src={`/avatars/avatar-${user.avatar || 1}.png`}
                          alt="Avatar"
                          className="w-full h-full object-cover object-top scale-150"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        {user.level}
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm">{greeting},</p>
                      <h1 className="text-2xl md:text-3xl font-bold text-white">
                        {user.display_name || user.username}
                      </h1>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                          Level {user.level} Developer
                        </span>
                        {user.current_streak >= 7 && (
                          <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            On Fire!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div
                      className={`pixel-box p-3 bg-[#0a0a12] transition-all duration-500 ${animateStats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        <span className="text-white font-bold">
                          {user.current_hearts}/{user.max_hearts}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`pixel-box p-3 bg-[#0a0a12] transition-all duration-500 delay-100 ${animateStats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                    >
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <span className="text-white font-bold">
                          {user.current_streak} days
                        </span>
                      </div>
                    </div>
                    <div
                      className={`pixel-box p-3 bg-[#0a0a12] transition-all duration-500 delay-200 ${animateStats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <span className="text-white font-bold">
                          {user.xp.toLocaleString()} XP
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* XP Progress Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Progress to Level {user.level + 1}
                    </span>
                    <span className="text-purple-400 font-medium">
                      {xpToNext} XP needed
                    </span>
                  </div>
                  <div className="h-4 bg-[#0a0a12] rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-purple-400 to-pink-500 transition-all duration-1000 ease-out relative"
                      style={{ width: `${xpProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-shimmer" />
                    </div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      {Math.round(xpProgress)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Action - Play Button */}
            <Link
              href="/play"
              className="block pixel-box p-6 mb-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/50 hover:border-purple-400 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/25">
                    <Gamepad2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                      Continue Playing
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Jump back into quizzes and earn XP
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                  <span className="hidden sm:block font-medium">Play Now</span>
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Daily Challenges & Activity */}
              <div className="lg:col-span-2 space-y-6">
                {/* Daily Challenges */}
                <div className="pixel-box p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-cyan-400" />
                      Daily Challenges
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-4 h-4" />
                      Resets in 8h
                    </div>
                  </div>

                  <div className="space-y-3">
                    {dailyChallenges.map((challenge) => {
                      const Icon = challenge.icon;
                      const isComplete = challenge.progress >= challenge.total;
                      return (
                        <div
                          key={challenge.id}
                          className={`p-4 rounded-lg border transition-all ${isComplete ? "bg-green-500/10 border-green-500/30" : "bg-[#0a0a12] border-[#2d2d44] hover:border-[#3d3d54]"}`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 bg-gradient-to-br ${challenge.color} rounded-lg flex items-center justify-center ${isComplete ? "opacity-50" : ""}`}
                            >
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span
                                  className={`font-medium ${isComplete ? "text-green-400 line-through" : "text-white"}`}
                                >
                                  {challenge.title}
                                </span>
                                <span className="text-yellow-400 text-sm flex items-center gap-1">
                                  <Zap className="w-3 h-3" />+
                                  {challenge.xpReward}
                                </span>
                              </div>
                              <p className="text-gray-500 text-xs mb-2">
                                {challenge.description}
                              </p>
                              <div className="h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${isComplete ? "bg-green-500" : "bg-gradient-to-r " + challenge.color}`}
                                  style={{
                                    width: `${(challenge.progress / challenge.total) * 100}%`,
                                  }}
                                />
                              </div>
                              <div className="text-right text-xs text-gray-500 mt-1">
                                {challenge.progress}/{challenge.total}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="pixel-box p-5">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-purple-400" />
                    Recent Activity
                  </h3>

                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 bg-[#0a0a12] rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#1a1a2e] rounded-lg flex items-center justify-center text-xl">
                            {activity.icon}
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {activity.topic}
                            </div>
                            <div className="text-xs text-gray-500">
                              {activity.type === "quiz" && (
                                <span>Score: {activity.score}</span>
                              )}
                              {activity.type === "achievement" && (
                                <span className="text-yellow-400">
                                  Achievement Unlocked!
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-yellow-400 text-sm font-medium flex items-center gap-1">
                            <Zap className="w-3 h-3" />+{activity.xp}
                          </div>
                          <div className="text-xs text-gray-500">
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Topics & Achievements */}
              <div className="space-y-6">
                {/* Continue Learning */}
                <div className="pixel-box p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-green-400" />
                      Your Topics
                    </h3>
                    <Link
                      href="/play"
                      className="text-xs text-purple-400 hover:text-purple-300"
                    >
                      View all
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {recommendedTopics.map((topic) => (
                      <Link
                        key={topic.id}
                        href={`/play/${topic.id}`}
                        className="block p-3 bg-[#0a0a12] rounded-lg hover:bg-[#12121f] transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 bg-gradient-to-br ${topic.color} rounded-lg flex items-center justify-center text-lg group-hover:scale-110 transition-transform`}
                          >
                            {topic.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-white">
                                {topic.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                Lvl {topic.level}
                              </span>
                            </div>
                            <div className="h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${topic.color}`}
                                style={{ width: `${topic.progress}%` }}
                              />
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                <div className="pixel-box p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      Achievements
                    </h3>
                    <span className="text-xs text-gray-400">
                      {achievements.filter((a) => a.unlocked).length}/
                      {achievements.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center text-center p-2 transition-all ${
                          achievement.unlocked
                            ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
                            : "bg-[#0a0a12] border border-[#2d2d44] opacity-50"
                        }`}
                        title={achievement.name}
                      >
                        <span className="text-2xl mb-1">
                          {achievement.icon}
                        </span>
                        <span
                          className={`text-[10px] ${achievement.unlocked ? "text-yellow-400" : "text-gray-500"}`}
                        >
                          {achievement.unlocked ? achievement.name : "???"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Links */}
                <div className="pixel-box p-5">
                  <h3 className="text-lg font-bold text-white mb-4">
                    Quick Links
                  </h3>
                  <div className="space-y-2">
                    <Link
                      href="/leaderboard"
                      className="flex items-center justify-between p-3 bg-[#0a0a12] rounded-lg hover:bg-[#12121f] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Crown className="w-5 h-5 text-yellow-400" />
                        <span className="text-gray-300 group-hover:text-white">
                          Leaderboard
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/learn"
                      className="flex items-center justify-between p-3 bg-[#0a0a12] rounded-lg hover:bg-[#12121f] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-blue-400" />
                        <span className="text-gray-300 group-hover:text-white">
                          Learning Library
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center justify-between p-3 bg-[#0a0a12] rounded-lg hover:bg-[#12121f] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-purple-400" />
                        <span className="text-gray-300 group-hover:text-white">
                          Settings
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Sidebar>
    </ProtectedRoute>
  );
}
