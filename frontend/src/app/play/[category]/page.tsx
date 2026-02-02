"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/RouteGuards";
import Sidebar from "@/components/layout/Sidebar";
import api from "@/lib/api";
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
} from "lucide-react";
import { getIcon, getIconColor } from "@/lib/iconMap";

// Category type from API
interface Topic {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  totalLevels: number;
  xpReward: number;
  questionCount: number;
}

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  topics: Topic[];
  totalXP: number;
}

// Color mapping
const colorMap: Record<
  string,
  { gradient: string; border: string; hoverBorder: string }
> = {
  "#8b5cf6": {
    gradient: "from-violet-500 to-purple-500",
    border: "border-violet-500/30",
    hoverBorder: "hover:border-violet-500",
  },
  "#10b981": {
    gradient: "from-emerald-500 to-teal-500",
    border: "border-emerald-500/30",
    hoverBorder: "hover:border-emerald-500",
  },
  "#f59e0b": {
    gradient: "from-amber-500 to-orange-500",
    border: "border-amber-500/30",
    hoverBorder: "hover:border-amber-500",
  },
  "#3b82f6": {
    gradient: "from-blue-500 to-indigo-500",
    border: "border-blue-500/30",
    hoverBorder: "hover:border-blue-500",
  },
  "#ef4444": {
    gradient: "from-red-500 to-rose-500",
    border: "border-red-500/30",
    hoverBorder: "hover:border-red-500",
  },
  "#ec4899": {
    gradient: "from-pink-500 to-rose-500",
    border: "border-pink-500/30",
    hoverBorder: "hover:border-pink-500",
  },
  "#06b6d4": {
    gradient: "from-cyan-500 to-teal-500",
    border: "border-cyan-500/30",
    hoverBorder: "hover:border-cyan-500",
  },
  "#84cc16": {
    gradient: "from-lime-500 to-green-500",
    border: "border-lime-500/30",
    hoverBorder: "hover:border-lime-500",
  },
};

const defaultColors = {
  gradient: "from-slate-500 to-gray-500",
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
        const response = await api.get(`/game/categories/${categorySlug}/`);
        setCategory(response.data);
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
                {(() => {
                  const CategoryIcon = getIcon(category.icon);
                  return (
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${colors.gradient} rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <CategoryIcon className="w-8 h-8 text-white" />
                    </div>
                  );
                })()}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    {category.name}
                  </h1>
                  <p className="text-gray-400">{category.description}</p>
                </div>
              </div>
            </div>

            {/* Category Stats */}
            <div
              className={`pixel-box p-5 mb-8 bg-gradient-to-r ${colors.gradient.replace("from-", "from-").replace("to-", "to-")}/10`}
            >
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
                      className={`w-12 h-12 bg-gradient-to-br ${colors.gradient} rounded-xl flex items-center justify-center`}
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
                {category.topics.map((topic) => {
                  const currentLevel = topicProgress[topic.slug] || 1;
                  const isCompleted = currentLevel > topic.totalLevels;
                  const displayLevel = isCompleted
                    ? topic.totalLevels
                    : currentLevel;
                  const completedLevels = isCompleted
                    ? topic.totalLevels
                    : Math.max(0, currentLevel - 1);

                  return (
                    <Link
                      key={topic.id}
                      href={`/play/${categorySlug}/${topic.slug}`}
                      className={`block pixel-box p-5 h-full ${colors.border} ${colors.hoverBorder} transition-all duration-200 hover:scale-[1.02]`}
                    >
                      {/* Icon and Level */}
                      <div className="flex items-start justify-between mb-3">
                        {(() => {
                          const TopicIcon = getIcon(topic.icon);
                          return (
                            <div
                              className={`w-14 h-14 bg-gradient-to-br ${colors.gradient} flex items-center justify-center rounded-lg`}
                            >
                              <TopicIcon className="w-8 h-8 text-white" />
                            </div>
                          );
                        })()}

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
                            className={`h-full ${isCompleted ? "bg-green-500" : `bg-gradient-to-r ${colors.gradient}`}`}
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
                  );
                })}
              </div>
            )}

            {/* Tips Section */}
            <div className="mt-8 pixel-box p-5 bg-[#0a0a12]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Pro Tip</h3>
                  <p className="text-gray-400 text-sm">
                    Complete quizzes to earn XP and level up. Higher levels
                    unlock more advanced topics. Build answer streaks for bonus
                    XP!
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
