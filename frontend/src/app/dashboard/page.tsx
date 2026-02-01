"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { gameAPI } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/RouteGuards";
import Sidebar from "@/components/layout/Sidebar";
import { ScrollReveal, ScrollToTop } from "@/components/ui/ScrollAnimations";
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
  Loader2,
  Rocket,
  Medal,
  Gem,
  Code,
  Brain,
  Lock,
  Code2,
  Database,
  Terminal,
} from "lucide-react";

// Topic icon component using custom SVGs
const TopicIcon = ({ icon, size = 24 }: { icon: string; size?: number }) => {
  const iconMap: { [key: string]: React.ReactElement } = {
    javascript: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <rect width="24" height="24" fill="#f7df1e" rx="2" />
        <path
          d="M6 18.2V16.5l1.8.1c.4 0 .7-.3.7-.7v-5.8h2v5.9c0 1.6-.9 2.4-2.5 2.4-1.1 0-1.8-.1-2-.2zm7.3-.3c-.6-.3-1-.8-1.2-1.3l1.6-.9c.2.4.4.6.7.8.3.2.6.2 1 .2.5 0 .9-.2.9-.6 0-.5-.6-.7-1.4-1-.9-.3-2.1-.8-2.1-2.2 0-1.4 1.2-2.3 2.7-2.3.9 0 1.7.2 2.3.7l-1.4 1c-.3-.3-.7-.4-1-.4-.4 0-.7.2-.7.5 0 .4.5.6 1.2.8 1.1.4 2.3.9 2.3 2.3 0 1.5-1.2 2.6-3 2.6-.9 0-1.6-.2-2.2-.5z"
          fill="#000"
        />
      </svg>
    ),
    python: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path
          fill="#3776ab"
          d="M12 2c-1.7 0-3.2.1-4.4.4C5.3 2.9 5 3.8 5 5v2h6v1H4.3c-1 0-2 .6-2.3 1.8-.3 1.4-.3 2.3 0 3.8.3 1.1 1 1.8 2 1.8H5v-1.6c0-1.2 1-2.2 2.3-2.2h4.5c1 0 1.7-.7 1.7-1.7V5c0-1-.8-1.7-1.7-2-.6-.2-1.3-.3-1.9-.3-.7-.1-1.3-.1-1.9-.1zm-2.5 2c.4 0 .8.3.8.8s-.3.8-.8.8-.8-.3-.8-.8.3-.8.8-.8z"
        />
        <path
          fill="#ffc331"
          d="M18.6 8.6h-1v1.6c0 1.2-1 2.2-2.3 2.2H11c-1 0-1.7.7-1.7 1.7v3.2c0 1 .8 1.5 1.7 1.8 1.1.3 2.2.4 3.4 0 .8-.2 1.7-.7 1.7-1.8v-1.3h-4v-.5h5.6c1 0 1.4-.7 1.7-1.7.3-1 .3-2.1 0-3.4-.2-1-1.1-1.5-2-1.8zm-4.1 8.6c.4 0 .8.3.8.8s-.3.8-.8.8-.8-.3-.8-.8.3-.8.8-.8z"
        />
      </svg>
    ),
    html: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path
          fill="#e44d26"
          d="M4 2l1.5 17L12 22l6.5-3L20 2H4zm12.5 6H8.3l.2 2.5h7.8l-.6 6.5-3.7 1-3.7-1-.2-3h2.4l.1 1.5 1.4.4 1.4-.4.1-2H7.9l-.5-5.5h9.2l-.1 1z"
        />
      </svg>
    ),
    css: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path
          fill="#264de4"
          d="M4 2l1.5 17L12 22l6.5-3L20 2H4zm12.6 5.9l-.1.8-.1.5-.1.5H8.3l.2 2h7.2l-.1.6-.6 6.6-3 .8-3-.8-.2-2.5h2.1l.1 1.3 1 .3 1-.3.1-1.4.1-1.3H7.6l-.5-5.5h9.6l-.1.9z"
        />
      </svg>
    ),
    react: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <circle cx="12" cy="12" r="2.2" fill="#61dafb" />
        <g fill="none" stroke="#61dafb" strokeWidth="1">
          <ellipse rx="10" ry="4" cx="12" cy="12" />
          <ellipse
            rx="10"
            ry="4"
            cx="12"
            cy="12"
            transform="rotate(60 12 12)"
          />
          <ellipse
            rx="10"
            ry="4"
            cx="12"
            cy="12"
            transform="rotate(120 12 12)"
          />
        </g>
      </svg>
    ),
    typescript: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <rect width="24" height="24" fill="#3178c6" rx="2" />
        <path
          fill="#fff"
          d="M6 13.5v-1h4.5v1H8.8v5h-1v-5H6zm5.3 1.8v-.7c.4.2 1 .4 1.5.4.6 0 .8-.2.8-.5 0-.2-.1-.3-.2-.4-.1-.1-.3-.2-.5-.2l-.5-.2c-.8-.3-1.2-.8-1.2-1.5 0-.5.2-.9.5-1.2.4-.3.9-.4 1.5-.4.5 0 1 .1 1.3.2v.7c-.4-.2-.8-.3-1.3-.3-.5 0-.8.2-.8.5 0 .2.1.3.2.4.1.1.3.2.5.2l.5.2c.4.1.7.3.9.6.2.2.3.5.3.9 0 .5-.2.9-.5 1.2-.4.3-.9.5-1.6.5-.5 0-1.1-.1-1.4-.3zm3.9-1.8v-1h4.5v1h-1.7v5h-1v-5h-1.8z"
        />
      </svg>
    ),
    nodejs: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path
          fill="#68a063"
          d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.2l6.5 3.7v7.3l-6.5 3.6-6.5-3.6V7.9L12 4.2z"
        />
        <path fill="#68a063" d="M12 8v8l-4-2.2V10l4-2z" />
      </svg>
    ),
    java: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path
          fill="#e76f00"
          d="M8.9 18.6s-.9.5.6.7c1.8.3 2.8.2 4.8-.2 0 0 .5.3 1.3.6-4.5 1.9-10.2-.1-6.7-1.1zm-.6-2.5s-1 .7.5.9c2 .2 3.5.2 6.2-.3 0 0 .4.4 1 .6-5.4 1.6-11.5.1-7.7-1.2z"
        />
        <path
          fill="#5382a1"
          d="M13.5 10.3c1.2 1.4-.3 2.6-.3 2.6s3.1-1.6 1.7-3.6c-1.3-1.8-2.3-2.8 3.2-5.9 0 0-8.7 2.2-4.6 6.9z"
        />
        <path
          fill="#e76f00"
          d="M18.4 20.2s.6.5-.7 1c-2.5.8-10.3 1-12.5 0-.8-.4.7-.9 1.2-.9.5-.1.8-.1.8-.1-1-.7-6.1 1.4-2.6 2 9.5 1.7 17.3-.7 13.8-2z"
        />
      </svg>
    ),
    cpp: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path
          fill="#00599C"
          d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 1.5c4.7 0 8.5 3.8 8.5 8.5s-3.8 8.5-8.5 8.5S3.5 16.7 3.5 12 7.3 3.5 12 3.5z"
        />
        <path
          fill="#00599C"
          d="M9 8v8c0 .6.4 1 1 1h2c2.2 0 4-1.8 4-4s-1.8-4-4-4H9zm2 2h1c1.1 0 2 .9 2 2s-.9 2-2 2h-1v-4z"
        />
        <path
          fill="#00599C"
          d="M17 10h-1v1h-1v1h1v1h1v-1h1v-1h-1v-1zm3 0h-1v1h-1v1h1v1h1v-1h1v-1h-1v-1z"
        />
      </svg>
    ),
    sql: <Database size={size} className="text-[#336791]" />,
    bash: <Terminal size={size} className="text-[#4EAA25]" />,
    code: <Code2 size={size} className="text-purple-400" />,
  };
  return iconMap[icon] || iconMap.code;
};

interface DailyChallenge {
  id: number;
  title: string;
  description: string;
  progress: number;
  total: number;
  xpReward: number;
  icon: string;
  color: string;
}

interface RecentActivity {
  id: string;
  type: string;
  topic: string;
  score?: string;
  xp: number;
  time: string;
  icon: string;
}

// Achievements - unlocked by reaching specific levels
const achievementsList = [
  {
    id: 1,
    name: "Beginner",
    icon: Rocket,
    unlockLevel: 2,
    bgColor: "bg-emerald-600",
    borderColor: "border-emerald-500/40",
  },
  {
    id: 2,
    name: "Apprentice",
    icon: Code,
    unlockLevel: 4,
    bgColor: "bg-blue-600",
    borderColor: "border-blue-500/40",
  },
  {
    id: 3,
    name: "Skilled",
    icon: Brain,
    unlockLevel: 7,
    bgColor: "bg-violet-600",
    borderColor: "border-violet-500/40",
  },
  {
    id: 4,
    name: "Expert",
    icon: Medal,
    unlockLevel: 10,
    bgColor: "bg-amber-600",
    borderColor: "border-amber-500/40",
  },
  {
    id: 5,
    name: "Master",
    icon: Gem,
    unlockLevel: 15,
    bgColor: "bg-rose-600",
    borderColor: "border-rose-500/40",
  },
  {
    id: 6,
    name: "Legend",
    icon: Crown,
    unlockLevel: 20,
    bgColor: "bg-yellow-500",
    borderColor: "border-yellow-400/40",
  },
];

const challengeIconMap: {
  [key: string]: React.ComponentType<{ className?: string }>;
} = {
  Target,
  Star,
  Flame,
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("Hello");
  const [animateStats, setAnimateStats] = useState(false);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [hoursUntilReset, setHoursUntilReset] = useState(8);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // Trigger animation
    setTimeout(() => setAnimateStats(true), 100);

    // Fetch daily stats
    const fetchDailyStats = async () => {
      try {
        const response = await gameAPI.getDailyStats();
        setDailyChallenges(response.data.daily_challenges || []);
        setRecentActivity(response.data.recent_activity || []);
        setHoursUntilReset(response.data.hours_until_reset || 8);
      } catch (error) {
        console.error("Failed to fetch daily stats:", error);
        // Use default empty data
        setDailyChallenges([
          {
            id: 1,
            title: "Quick Learner",
            description: "Complete 3 quizzes today",
            progress: 0,
            total: 3,
            xpReward: 150,
            icon: "Target",
            color: "from-blue-500 to-cyan-500",
          },
          {
            id: 2,
            title: "Perfect Score",
            description: "Get 100% on any quiz",
            progress: 0,
            total: 1,
            xpReward: 200,
            icon: "Star",
            color: "from-yellow-500 to-orange-500",
          },
          {
            id: 3,
            title: "Streak Master",
            description: "Answer 5 questions correctly in a row",
            progress: 0,
            total: 5,
            xpReward: 100,
            icon: "Flame",
            color: "from-orange-500 to-red-500",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyStats();
  }, []);

  if (!user) return null;

  const xpProgress = (user.xp % 500) / 5;
  const xpToNext = 500 - (user.xp % 500);

  return (
    <ProtectedRoute>
      <Sidebar>
        <div className="min-h-screen pb-8">
          <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Hero Section with Player Card */}
            <ScrollReveal>
              <div className="pixel-box p-6 mb-6 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-[#0a0a12]/50" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />

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
                            {user.current_streak || 1}{" "}
                            {(user.current_streak || 1) === 1 ? "day" : "days"}
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
                      <span className="text-cyan-400 font-medium">
                        {xpToNext} XP needed
                      </span>
                    </div>
                    <div className="h-4 bg-[#0a0a12] rounded-full overflow-hidden relative border border-[#2d2d44]">
                      <div
                        className="h-full bg-cyan-500 transition-all duration-1000 ease-out relative"
                        style={{ width: `${xpProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-shimmer" />
                      </div>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        {Math.round(xpProgress)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Main Action - Play Button */}
            <ScrollReveal>
              <Link
                href="/play"
                className="block pixel-box p-6 mb-6 bg-[#0f1a2e] border-cyan-500/30 hover:border-cyan-400 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/20">
                      <Gamepad2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                        Continue Playing
                      </h2>
                      <p className="text-gray-400 text-sm">
                        Jump back into quizzes and earn XP
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-400">
                    <span className="hidden sm:block font-medium">
                      Play Now
                    </span>
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Daily Challenges & Activity */}
              <div className="lg:col-span-2 space-y-6">
                {/* Daily Challenges */}
                <ScrollReveal delay={0.1}>
                  <div className="pixel-box p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-cyan-400" />
                        Daily Challenges
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-4 h-4" />
                        Resets in {hoursUntilReset}h
                      </div>
                    </div>

                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dailyChallenges.map((challenge) => {
                          const Icon =
                            challengeIconMap[challenge.icon] || Target;
                          const isComplete =
                            challenge.progress >= challenge.total;
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
                                      className={`h-full transition-all ${isComplete ? "bg-green-500" : "bg-cyan-500"}`}
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
                    )}
                  </div>
                </ScrollReveal>

                {/* Recent Activity */}
                <ScrollReveal delay={0.2}>
                  <div className="pixel-box p-5">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-purple-400" />
                      Recent Activity
                    </h3>

                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                      </div>
                    ) : recentActivity.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <p>No recent activity yet.</p>
                        <p className="text-sm mt-1">
                          Start a quiz to see your progress!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentActivity.map((activity) => {
                          // Parse score to determine pass/fail
                          const scoreParts = activity.score?.split("/");
                          const correct = scoreParts
                            ? parseInt(scoreParts[0])
                            : 0;
                          const total = scoreParts
                            ? parseInt(scoreParts[1])
                            : 0;
                          const percentage =
                            total > 0 ? Math.round((correct / total) * 100) : 0;
                          const passed = percentage >= 50;

                          return (
                            <div
                              key={activity.id}
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                passed
                                  ? "bg-green-500/5 border-green-500/20"
                                  : "bg-red-500/5 border-red-500/20"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    passed ? "bg-green-500/20" : "bg-red-500/20"
                                  }`}
                                >
                                  <TopicIcon icon={activity.icon} size={24} />
                                </div>
                                <div>
                                  <div className="font-medium text-white flex items-center gap-2">
                                    {activity.topic}
                                    <span
                                      className={`text-xs px-1.5 py-0.5 rounded ${
                                        passed
                                          ? "bg-green-500/20 text-green-400"
                                          : "bg-red-500/20 text-red-400"
                                      }`}
                                    >
                                      {passed ? "Passed" : "Failed"}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500 flex items-center gap-2">
                                    {activity.type === "quiz" && (
                                      <>
                                        <span>{activity.score} correct</span>
                                        <span>•</span>
                                        <span>{percentage}% accuracy</span>
                                      </>
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
                                <div className="text-yellow-400 text-sm font-medium flex items-center justify-end gap-1">
                                  <Zap className="w-3 h-3" />+{activity.xp} XP
                                </div>
                                <div className="text-xs text-gray-500">
                                  {activity.time}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              </div>

              {/* Right Column - Topics & Achievements */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <ScrollReveal delay={0.15}>
                  <div className="pixel-box p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                        Quick Start
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <Link
                        href="/play/frontend/javascript"
                        className="block p-3 bg-[#0a0a12] rounded-lg hover:bg-[#12121f] transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center font-bold text-black text-sm group-hover:scale-110 transition-transform">
                            JS
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-white">
                              JavaScript
                            </span>
                            <p className="text-xs text-gray-500">
                              Frontend Development
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                      <Link
                        href="/play/backend/python"
                        className="block p-3 bg-[#0a0a12] rounded-lg hover:bg-[#12121f] transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Code className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-white">
                              Python
                            </span>
                            <p className="text-xs text-gray-500">
                              Backend Development
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                      <Link
                        href="/play"
                        className="block p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-cyan-400">
                              Browse All Topics
                            </span>
                            <p className="text-xs text-gray-500">
                              Explore more categories
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>

                {/* Achievements */}
                <ScrollReveal delay={0.2}>
                  <div className="pixel-box p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        Achievements
                      </h3>
                      <span className="text-xs text-gray-400">
                        {
                          achievementsList.filter(
                            (a) => user && user.level >= a.unlockLevel,
                          ).length
                        }
                        /{achievementsList.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {achievementsList.map((achievement) => {
                        const isUnlocked =
                          user && user.level >= achievement.unlockLevel;
                        const AchievementIcon = achievement.icon;
                        return (
                          <div
                            key={achievement.id}
                            className={`aspect-square rounded-lg flex flex-col items-center justify-center text-center p-2 transition-all ${
                              isUnlocked
                                ? `bg-[#12121f] border ${achievement.borderColor}`
                                : "bg-[#0a0a12] border border-[#2d2d44] opacity-50"
                            }`}
                            title={
                              isUnlocked
                                ? achievement.name
                                : `Unlock at Level ${achievement.unlockLevel}`
                            }
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 ${
                                isUnlocked
                                  ? achievement.bgColor
                                  : "bg-[#1a1a2e]"
                              }`}
                            >
                              {isUnlocked ? (
                                <AchievementIcon className="w-4 h-4 text-white" />
                              ) : (
                                <Lock className="w-4 h-4 text-gray-600" />
                              )}
                            </div>
                            <span
                              className={`text-[10px] ${isUnlocked ? "text-white" : "text-gray-500"}`}
                            >
                              {isUnlocked
                                ? achievement.name
                                : `Lvl ${achievement.unlockLevel}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </ScrollReveal>

                {/* Quick Links */}
                <ScrollReveal delay={0.25}>
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
                </ScrollReveal>
              </div>
            </div>
          </div>
          <ScrollToTop />
        </div>
      </Sidebar>
    </ProtectedRoute>
  );
}
