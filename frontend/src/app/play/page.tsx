"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/RouteGuards";
import Sidebar from "@/components/layout/Sidebar";
import { ScrollReveal, ScrollToTop } from "@/components/ui/ScrollAnimations";
import {
  Zap,
  ChevronRight,
  Gamepad2,
  Star,
  Trophy,
  Sparkles,
  Target,
  Flame,
  Loader2,
  Code,
} from "lucide-react";
import api from "@/lib/api";

// Category type
interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string | null;
  color: string;
  topics: string[];
  topicCount: number;
  totalQuestions: number;
  totalXP: number;
}

// Color mapping for categories
const colorMap: Record<
  string,
  { bg: string; border: string; hoverBorder: string; progress: string }
> = {
  "#8b5cf6": {
    bg: "bg-violet-600",
    border: "border-violet-500/30",
    hoverBorder: "hover:border-violet-500",
    progress: "bg-violet-500",
  },
  "#10b981": {
    bg: "bg-emerald-600",
    border: "border-emerald-500/30",
    hoverBorder: "hover:border-emerald-500",
    progress: "bg-emerald-500",
  },
  "#f59e0b": {
    bg: "bg-amber-600",
    border: "border-amber-500/30",
    hoverBorder: "hover:border-amber-500",
    progress: "bg-amber-500",
  },
  "#3b82f6": {
    bg: "bg-blue-600",
    border: "border-blue-500/30",
    hoverBorder: "hover:border-blue-500",
    progress: "bg-blue-500",
  },
  "#ef4444": {
    bg: "bg-red-600",
    border: "border-red-500/30",
    hoverBorder: "hover:border-red-500",
    progress: "bg-red-500",
  },
  "#ec4899": {
    bg: "bg-pink-600",
    border: "border-pink-500/30",
    hoverBorder: "hover:border-pink-500",
    progress: "bg-pink-500",
  },
  "#06b6d4": {
    bg: "bg-cyan-600",
    border: "border-cyan-500/30",
    hoverBorder: "hover:border-cyan-500",
    progress: "bg-cyan-500",
  },
  "#84cc16": {
    bg: "bg-lime-600",
    border: "border-lime-500/30",
    hoverBorder: "hover:border-lime-500",
    progress: "bg-lime-500",
  },
};

// Default colors if not in map
const defaultColors = {
  bg: "bg-slate-600",
  border: "border-slate-500/30",
  hoverBorder: "hover:border-slate-500",
  progress: "bg-slate-500",
};

export default function PlayPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/game/categories/");
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const getColors = (color: string) =>
    colorMap[color.toLowerCase()] || defaultColors;

  return (
    <ProtectedRoute>
      <Sidebar>
        <div className="min-h-screen pb-8">
          <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Header */}
            <ScrollReveal>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center shadow-lg ">
                    <Gamepad2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                      Choose Your Path
                    </h1>
                    <p className="text-gray-400 text-sm">
                      Select a category to start your coding adventure
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* User Progress Summary */}
            {user && (
              <ScrollReveal delay={0.1}>
                <div className="pixel-box p-5 mb-8 bg-[#0f1a2e]">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-cyan-500/50 shadow-lg">
                        <img
                          src={`/avatars/avatar-${user.avatar || 1}.png`}
                          alt="Avatar"
                          className="w-full h-full object-cover object-top scale-150"
                        />
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">
                          {user.display_name || user.username}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Level {user.level} Developer
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Zap className="w-5 h-5" />
                          <span className="font-bold text-xl">{user.xp}</span>
                        </div>
                        <p className="text-gray-500 text-xs">Total XP</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-orange-400">
                          <Flame className="w-5 h-5" />
                          <span className="font-bold text-xl">
                            {user.current_streak || 1}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs">Day Streak</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-cyan-400">
                          <Trophy className="w-5 h-5" />
                          <span className="font-bold text-xl">
                            {user.level}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs">Level</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Categories Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category, index) => {
                  const colors = getColors(category.color);

                  return (
                    <ScrollReveal key={category.id} delay={0.1 + index * 0.05}>
                      <Link
                        href={`/play/${category.slug}`}
                        className={`flex flex-col h-full pixel-box p-6 ${colors.border} ${colors.hoverBorder} transition-all duration-200 hover:scale-[1.02]`}
                      >
                        {/* Icon & XP Badge */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-14 h-14 bg-[#0f0f1a] flex items-center justify-center rounded-xl overflow-hidden border border-[#2d2d44]">
                            {category.icon ? (
                              <img
                                src={category.icon}
                                alt={category.name}
                                className="w-8 h-8 object-contain"
                              />
                            ) : (
                              <Code className="w-7 h-7 text-white" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 rounded-full">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-400 text-sm font-bold">
                              {category.totalXP} XP
                            </span>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-xl font-bold text-white mb-2">
                          {category.name}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2 min-h-[40px]">
                          {category.description}
                        </p>

                        {/* Topics Preview */}
                        <div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">
                          {category.topics.slice(0, 3).map((topic) => (
                            <span
                              key={topic}
                              className="px-2 py-1 bg-[#0a0a12] text-gray-400 text-xs rounded-lg"
                            >
                              {topic}
                            </span>
                          ))}
                          {category.topics.length > 3 && (
                            <span className="px-2 py-1 bg-[#0a0a12] text-purple-400 text-xs rounded-lg">
                              +{category.topics.length - 3} more
                            </span>
                          )}
                        </div>

                        {/* Footer - pushed to bottom */}
                        <div className="flex items-center justify-between mt-auto pt-2">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-500 text-sm">
                              {category.topicCount} Topics
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm font-medium text-cyan-400">
                            Start
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </Link>
                    </ScrollReveal>
                  );
                })}
              </div>
            )}

            {/* Info Section */}
            <ScrollReveal delay={0.3}>
              <div className="mt-8 pixel-box p-6 bg-[#0a0a12]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      How It Works
                    </h3>
                    <ul className="space-y-2 text-gray-400 text-sm">
                      <li className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        Choose a category and topic to start learning
                      </li>
                      <li className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        Answer quiz questions to earn XP and level up
                      </li>
                      <li className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        Unlock new categories as you progress
                      </li>
                      <li className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        Maintain streaks for bonus rewards
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
          <ScrollToTop />
        </div>
      </Sidebar>
    </ProtectedRoute>
  );
}
