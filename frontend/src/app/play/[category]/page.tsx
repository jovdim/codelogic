"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/RouteGuards";
import Sidebar from "@/components/layout/Sidebar";
import { gameAPI } from "@/lib/api";
import {
  Zap,
  ChevronRight,
  Star,
  Lock,
  Trophy,
  Target,
  Sparkles,
  ArrowLeft,
  Award,
  CheckCircle,
} from "lucide-react";
import {
  FaReact,
  FaServer,
  FaCloud,
  FaHtml5,
  FaPython,
  FaJs,
  FaDatabase,
  FaTerminal,
  FaCss3Alt,
  FaJava,
} from "react-icons/fa";
import { SiCplusplus } from "react-icons/si";
import { IconType } from "react-icons";

// Category data with topics
const categoryData: {
  [key: string]: {
    name: string;
    Icon: IconType;
    color: string;
    description: string;
    topics: {
      id: string;
      name: string;
      Icon: IconType;
      iconColor: string;
      color: string;
      borderColor: string;
      hoverBorder: string;
      level: number;
      totalLevels: number;
      xpReward: number;
      description: string;
      unlocked: boolean;
      requiredLevel?: number;
    }[];
  };
} = {
  frontend: {
    name: "Frontend",
    Icon: FaReact,
    color: "from-purple-500 to-pink-500",
    description: "Master the art of creating stunning web interfaces",
    topics: [
      {
        id: "html",
        name: "HTML",
        Icon: FaHtml5,
        iconColor: "#e34f26",
        color: "from-orange-400 to-orange-500",
        borderColor: "border-orange-500/30",
        hoverBorder: "hover:border-orange-500",
        level: 1,
        totalLevels: 15,
        xpReward: 150,
        description: "Web structure & markup",
        unlocked: true,
      },
      {
        id: "css",
        name: "CSS",
        Icon: FaCss3Alt,
        iconColor: "#264de4",
        color: "from-blue-400 to-blue-500",
        borderColor: "border-blue-500/30",
        hoverBorder: "hover:border-blue-500",
        level: 1,
        totalLevels: 15,
        xpReward: 150,
        description: "Styling & visual design",
        unlocked: true,
      },
      {
        id: "javascript",
        name: "JavaScript",
        Icon: FaJs,
        iconColor: "#f7df1e",
        color: "from-yellow-400 to-yellow-500",
        borderColor: "border-yellow-500/30",
        hoverBorder: "hover:border-yellow-500",
        level: 1,
        totalLevels: 15,
        xpReward: 150,
        description: "Interactive web magic",
        unlocked: true,
      },
      {
        id: "react",
        name: "React",
        Icon: FaReact,
        iconColor: "#61dafb",
        color: "from-cyan-400 to-cyan-500",
        borderColor: "border-cyan-500/30",
        hoverBorder: "hover:border-cyan-500",
        level: 1,
        totalLevels: 15,
        xpReward: 150,
        description: "Component-based UI library",
        unlocked: true,
      },
    ],
  },
  backend: {
    name: "Backend",
    Icon: FaServer,
    color: "from-green-500 to-teal-500",
    description: "Build robust server-side applications",
    topics: [
      {
        id: "python",
        name: "Python",
        Icon: FaPython,
        iconColor: "#3776ab",
        color: "from-blue-400 to-blue-500",
        borderColor: "border-blue-500/30",
        hoverBorder: "hover:border-blue-500",
        level: 1,
        totalLevels: 15,
        xpReward: 150,
        description: "Versatile programming",
        unlocked: true,
      },
      {
        id: "java",
        name: "Java",
        Icon: FaJava,
        iconColor: "#f89820",
        color: "from-orange-400 to-red-500",
        borderColor: "border-orange-500/30",
        hoverBorder: "hover:border-orange-500",
        level: 1,
        totalLevels: 15,
        xpReward: 150,
        description: "Enterprise programming",
        unlocked: true,
      },
      {
        id: "cpp",
        name: "C++",
        Icon: SiCplusplus,
        iconColor: "#00599C",
        color: "from-blue-500 to-indigo-600",
        borderColor: "border-indigo-500/30",
        hoverBorder: "hover:border-indigo-500",
        level: 1,
        totalLevels: 15,
        xpReward: 150,
        description: "Systems programming",
        unlocked: true,
      },
    ],
  },
  devops: {
    name: "DevOps",
    Icon: FaCloud,
    color: "from-orange-500 to-yellow-500",
    description: "Deploy and scale applications",
    topics: [
      {
        id: "sql",
        name: "SQL",
        Icon: FaDatabase,
        iconColor: "#00758f",
        color: "from-cyan-400 to-cyan-500",
        borderColor: "border-cyan-500/30",
        hoverBorder: "hover:border-cyan-500",
        level: 1,
        totalLevels: 15,
        xpReward: 150,
        description: "Database queries",
        unlocked: true,
      },
      {
        id: "bash",
        name: "Bash",
        Icon: FaTerminal,
        iconColor: "#4eaa25",
        color: "from-green-400 to-green-500",
        borderColor: "border-green-500/30",
        hoverBorder: "hover:border-green-500",
        level: 1,
        totalLevels: 15,
        xpReward: 150,
        description: "Shell scripting",
        unlocked: true,
      },
    ],
  },
};

export default function CategoryPage() {
  const params = useParams();
  const { user } = useAuth();
  const [topicProgress, setTopicProgress] = useState<{ [key: string]: number }>(
    {},
  );

  const categoryId = params.category as string;
  const category = categoryData[categoryId];

  // Fetch user progress for all topics in this category
  useEffect(() => {
    const fetchProgress = async () => {
      if (!category || !user) return;

      const progressMap: { [key: string]: number } = {};

      for (const topic of category.topics) {
        try {
          const response = await gameAPI.getTopic(categoryId, topic.id);
          const progress = response.data.user_progress;
          if (progress) {
            progressMap[topic.id] = progress.current_level || 1;
          } else {
            progressMap[topic.id] = 1;
          }
        } catch (err) {
          progressMap[topic.id] = 1;
        }
      }

      setTopicProgress(progressMap);
    };

    fetchProgress();
  }, [categoryId, category, user]);

  // Helper to get current level for a topic
  const getTopicLevel = (topicId: string) => {
    return topicProgress[topicId] || 1;
  };

  // If category doesn't exist, show error
  if (!category) {
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

  const isTopicUnlocked = (topic: (typeof category.topics)[0]) => {
    if (topic.unlocked) return true;
    if (!user) return false;
    return user.level >= (topic.requiredLevel || 0);
  };

  const totalXP = category.topics.reduce((sum, t) => sum + t.xpReward, 0);
  const unlockedCount = category.topics.filter((t) =>
    isTopicUnlocked(t),
  ).length;

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
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <category.Icon className="w-8 h-8 text-white" />
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
            <div className="pixel-box p-5 mb-8 bg-gradient-to-r from-purple-600/10 to-pink-600/10">
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
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-green-400">
                      <Trophy className="w-5 h-5" />
                      <span className="font-bold text-xl">
                        {unlockedCount}/{category.topics.length}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs">Unlocked</p>
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
                      className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center text-lg`}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {category.topics.map((topic) => {
                const unlocked = isTopicUnlocked(topic);
                const rawLevel = getTopicLevel(topic.id);
                const isCompleted = rawLevel > topic.totalLevels;
                const currentLevel = isCompleted ? topic.totalLevels : rawLevel;
                const completedLevels = isCompleted
                  ? topic.totalLevels
                  : Math.max(0, rawLevel - 1);
                const TopicIcon = topic.Icon;

                return (
                  <div key={topic.id}>
                    {unlocked ? (
                      <Link
                        href={`/play/${categoryId}/${topic.id}`}
                        className={`block pixel-box p-5 ${topic.borderColor} ${topic.hoverBorder} transition-all duration-200 hover:scale-[1.02]`}
                      >
                        {/* Icon and Level/Completion */}
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className={`w-14 h-14 bg-gradient-to-br ${topic.color} flex items-center justify-center rounded-lg`}
                          >
                            <TopicIcon
                              className="w-8 h-8"
                              style={{ color: topic.iconColor }}
                            />
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
                                {currentLevel}
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
                        <p className="text-xs text-gray-400 mb-3">
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
                              className={`h-full ${isCompleted ? "bg-green-500" : `bg-gradient-to-r ${topic.color}`}`}
                              style={{
                                width: `${(completedLevels / topic.totalLevels) * 100}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* XP Reward and Play Button */}
                        <div className="flex items-center justify-between">
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
                    ) : (
                      <div
                        className={`relative overflow-hidden pixel-box p-5 border-gray-600/30 opacity-60`}
                      >
                        {/* Locked Overlay */}
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-20">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Lock className="w-6 h-6 text-gray-500" />
                            </div>
                            {topic.requiredLevel === 999 ? (
                              <>
                                <p className="text-gray-400 text-sm font-medium">
                                  Coming Soon
                                </p>
                                <p className="text-gray-500 text-xs">
                                  Questions being added
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-gray-400 text-sm font-medium">
                                  Reach Level {topic.requiredLevel}
                                </p>
                                <p className="text-gray-500 text-xs">
                                  to unlock this topic
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Content (dimmed) */}
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-3">
                            <div
                              className={`w-14 h-14 bg-gradient-to-br ${topic.color} flex items-center justify-center rounded-lg grayscale`}
                            >
                              <TopicIcon className="w-8 h-8 text-white" />
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500 uppercase tracking-wide">
                                Level
                              </div>
                              <div className="text-xl font-bold text-gray-500">
                                ?
                              </div>
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-gray-500 mb-1">
                            {topic.name}
                          </h3>
                          <p className="text-xs text-gray-600 mb-3">
                            {topic.description}
                          </p>
                          <div className="h-1.5 bg-[#0a0a12] rounded-full" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

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
