"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/RouteGuards";
import Sidebar from "@/components/layout/Sidebar";
import { ScrollReveal } from "@/components/ui/ScrollAnimations";
import api from "@/lib/api";
import { getCached, setCache } from "@/lib/dataCache";
import {
  Zap,
  ChevronRight,
  Star,
  Lock,
  Trophy,
  Target,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Code,
} from "lucide-react";

// Category type from API
interface Topic {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string | null;
  totalLevels: number;
  xpReward: number;
  questionCount: number;
}

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string | null;
  color: string;
  topics: Topic[];
  totalXP: number;
}

// Color mapping - simplified to solid colors
const colorMap: Record<
  string,
  { bg: string; border: string; hoverBorder: string }
> = {
  "#8b5cf6": {
    bg: "bg-violet-500",
    border: "border-violet-500/30",
    hoverBorder: "hover:border-violet-500",
  },
  "#10b981": {
    bg: "bg-emerald-500",
    border: "border-emerald-500/30",
    hoverBorder: "hover:border-emerald-500",
  },
  "#f59e0b": {
    bg: "bg-amber-500",
    border: "border-amber-500/30",
    hoverBorder: "hover:border-amber-500",
  },
  "#3b82f6": {
    bg: "bg-blue-500",
    border: "border-blue-500/30",
    hoverBorder: "hover:border-blue-500",
  },
  "#ef4444": {
    bg: "bg-red-500",
    border: "border-red-500/30",
    hoverBorder: "hover:border-red-500",
  },
  "#ec4899": {
    bg: "bg-pink-500",
    border: "border-pink-500/30",
    hoverBorder: "hover:border-pink-500",
  },
  "#06b6d4": {
    bg: "bg-cyan-500",
    border: "border-cyan-500/30",
    hoverBorder: "hover:border-cyan-500",
  },
  "#84cc16": {
    bg: "bg-lime-500",
    border: "border-lime-500/30",
    hoverBorder: "hover:border-lime-500",
  },
};

const defaultColors = {
  bg: "bg-slate-500",
  border: "border-slate-500/30",
  hoverBorder: "hover:border-slate-500",
};

export default function CategoryPage() {
  const params = useParams();
  const { user } = useAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [topicProgress, setTopicProgress] = useState<{ [key: string]: number }>(
    {},
  );

  const categorySlug = params.category as string;

  // Fetch category with topics from API
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const cacheKey = `category_${categorySlug}`;
        const cached = getCached<Category>(cacheKey);
        if (cached) {
          setCategory(cached);
          setLoading(false);
          return;
        }
        const response = await api.get(`/game/categories/${categorySlug}/`);
        setCategory(response.data);
        setCache(cacheKey, response.data);
        setError(false);
      } catch (err) {
        console.error("Failed to fetch category:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [categorySlug]);

  // Fetch user progress for topics
  useEffect(() => {
    const fetchProgress = async () => {
      if (!category || !user) return;

      const cacheKey = `category_progress_${categorySlug}_${user.id}`;
      const cached = getCached<{ [key: string]: number }>(cacheKey);
      if (cached) {
        setTopicProgress(cached);
        return;
      }

      const progressMap: { [key: string]: number } = {};
      for (const topic of category.topics) {
        try {
          const response = await api.get(
            `/game/topics/${categorySlug}/${topic.slug}/`,
          );
          const progress = response.data.user_progress;
          progressMap[topic.slug] = progress?.current_level || 1;
        } catch {
          progressMap[topic.slug] = 1;
        }
      }
      setTopicProgress(progressMap);
      setCache(cacheKey, progressMap);
    };
    fetchProgress();
  }, [category, user, categorySlug]);

  const getColors = (color: string) =>
    colorMap[color?.toLowerCase()] || defaultColors;

  // Loading state
  if (loading) {
    return (
      <ProtectedRoute>
        <Sidebar>
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        </Sidebar>
      </ProtectedRoute>
    );
  }

  // Error state
  if (error || !category) {
    return (
      <ProtectedRoute>
        <Sidebar>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-4">
                Category Not Found
              </h1>
              <Link href="/play" className="btn-primary">
                Back to Play
              </Link>
            </div>
          </div>
        </Sidebar>
      </ProtectedRoute>
    );
  }

  const colors = getColors(category.color);
  const totalXP = category.totalXP || 0;

  return (
    <ProtectedRoute>
      <Sidebar>
        <div className="min-h-screen pb-8">
          <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Back Button & Header */}
            <div className="mb-8">
              <Link
                href="/play"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Categories</span>
              </Link>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#0f0f1a] rounded-xl flex items-center justify-center shadow-lg overflow-hidden border border-[#2d2d44]">
                  {category.icon ? (
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <Code className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    {category.name}
                  </h1>
                  <p className="text-gray-400">{category.description}</p>
                </div>
              </div>
            </div>

            {/* Category Stats */}
            <div className={`pixel-box p-5 mb-8 ${colors.bg}/10`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Zap className="w-5 h-5" />
                      <span className="font-bold text-xl">{totalXP}</span>
                    </div>
                    <p className="text-gray-500 text-xs">Total XP Available</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-purple-400">
                      <Target className="w-5 h-5" />
                      <span className="font-bold text-xl">
                        {category.topics.length}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs">Topics</p>
                  </div>
                </div>

                {user && (
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Your Level</p>
                      <p className="text-white font-bold text-xl">
                        {user.level}
                      </p>
                    </div>
                    <div
                      className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}
                    >
                      <Star className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Topics Grid */}
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Choose a Topic
            </h2>

            {category.topics.length === 0 ? (
              <div className="pixel-box p-8 text-center">
                <p className="text-gray-400">
                  No topics available yet. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {category.topics.map((topic, index) => {
                  const currentLevel = topicProgress[topic.slug] || 1;
                  const isCompleted = currentLevel > topic.totalLevels;
                  const displayLevel = isCompleted
                    ? topic.totalLevels
                    : currentLevel;
                  const completedLevels = isCompleted
                    ? topic.totalLevels
                    : Math.max(0, currentLevel - 1);

                  return (
                    <ScrollReveal key={topic.id} delay={0.1 + index * 0.05}>
                      <Link
                        key={topic.id}
                        href={`/play/${categorySlug}/${topic.slug}`}
                        className={`block pixel-box p-5 h-full ${colors.border} ${colors.hoverBorder} transition-all duration-200 hover:scale-[1.02]`}
                      >
                        {/* Icon and Level */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-14 h-14 bg-[#0f0f1a] flex items-center justify-center rounded-lg overflow-hidden border border-[#2d2d44]">
                            {topic.icon ? (
                              <img
                                src={topic.icon}
                                alt={topic.name}
                                className="w-9 h-9 object-contain"
                              />
                            ) : (
                              <Code className="w-8 h-8 text-white" />
                            )}
                          </div>

                          {isCompleted ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 text-sm font-medium">
                                Complete
                              </span>
                            </div>
                          ) : (
                            <div className="text-right">
                              <div className="text-xs text-gray-500 uppercase tracking-wide">
                                Level
                              </div>
                              <div className="text-xl font-bold text-white">
                                {displayLevel}
                                <span className="text-sm text-gray-500 font-normal">
                                  /{topic.totalLevels}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Title and Description */}
                        <h3 className="text-lg font-bold text-white mb-1">
                          {topic.name}
                        </h3>
                        <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                          {topic.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>
                              {completedLevels}/{topic.totalLevels}
                            </span>
                          </div>
                          <div className="h-1.5 bg-[#0a0a12] rounded-full overflow-hidden">
                            <div
                              className={`h-full ${isCompleted ? "bg-green-500" : colors.bg}`}
                              style={{
                                width: `${(completedLevels / topic.totalLevels) * 100}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* XP and Play Button */}
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-1 text-yellow-400 text-sm">
                            <Zap className="w-4 h-4" />
                            <span className="font-medium">
                              +{topic.xpReward} XP
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm font-medium text-purple-400">
                            {isCompleted ? "Review" : "Play"}
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </Link>
                    </ScrollReveal>
                  );
                })}
              </div>
            )}

            {/* Tips Section */}
            <div className="mt-8 pixel-box p-5 bg-[#0a0a12]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Tip</h3>
                  <p className="text-gray-400 text-sm">
                    Quiz more to earn more XP. Rack up XP and level up as you
                    go!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Sidebar>
    </ProtectedRoute>
  );
}
