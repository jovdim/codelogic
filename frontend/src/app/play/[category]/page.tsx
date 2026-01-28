"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/RouteGuards";
import Sidebar from "@/components/layout/Sidebar";
import {
  Zap,
  ChevronRight,
  ChevronLeft,
  Star,
  Lock,
  Trophy,
  Target,
  Flame,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

// Category data with topics
const categoryData: {
  [key: string]: {
    name: string;
    icon: string;
    color: string;
    description: string;
    topics: {
      id: string;
      name: string;
      icon: string;
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
    icon: "🎨",
    color: "from-purple-500 to-pink-500",
    description: "Master the art of creating stunning web interfaces",
    topics: [
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
        unlocked: true,
      },
    ],
  },
  backend: {
    name: "Backend",
    icon: "⚙️",
    color: "from-green-500 to-teal-500",
    description: "Build robust server-side applications",
    topics: [
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
        unlocked: true,
      },
      {
        id: "nodejs",
        name: "Node.js",
        icon: "💚",
        color: "from-lime-500 to-green-500",
        borderColor: "border-lime-500/30",
        hoverBorder: "hover:border-lime-500",
        level: 1,
        totalLevels: 12,
        xpReward: 80,
        description: "Server-side JavaScript",
        unlocked: true,
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
        unlocked: false,
        requiredLevel: 3,
      },
      {
        id: "api",
        name: "APIs",
        icon: "🔌",
        color: "from-indigo-500 to-purple-500",
        borderColor: "border-indigo-500/30",
        hoverBorder: "hover:border-indigo-500",
        level: 1,
        totalLevels: 10,
        xpReward: 70,
        description: "REST & GraphQL",
        unlocked: false,
        requiredLevel: 4,
      },
    ],
  },
  devops: {
    name: "DevOps",
    icon: "☁️",
    color: "from-orange-500 to-yellow-500",
    description: "Deploy and scale applications",
    topics: [
      {
        id: "git",
        name: "Git",
        icon: "📦",
        color: "from-orange-500 to-red-500",
        borderColor: "border-orange-500/30",
        hoverBorder: "hover:border-orange-500",
        level: 1,
        totalLevels: 8,
        xpReward: 60,
        description: "Version control",
        unlocked: true,
      },
      {
        id: "docker",
        name: "Docker",
        icon: "🐳",
        color: "from-blue-500 to-cyan-500",
        borderColor: "border-blue-500/30",
        hoverBorder: "hover:border-blue-500",
        level: 1,
        totalLevels: 10,
        xpReward: 70,
        description: "Containerization",
        unlocked: false,
        requiredLevel: 3,
      },
      {
        id: "cicd",
        name: "CI/CD",
        icon: "🔄",
        color: "from-green-500 to-teal-500",
        borderColor: "border-green-500/30",
        hoverBorder: "hover:border-green-500",
        level: 1,
        totalLevels: 8,
        xpReward: 75,
        description: "Continuous Integration",
        unlocked: false,
        requiredLevel: 5,
      },
      {
        id: "cloud",
        name: "Cloud",
        icon: "☁️",
        color: "from-purple-500 to-pink-500",
        borderColor: "border-purple-500/30",
        hoverBorder: "hover:border-purple-500",
        level: 1,
        totalLevels: 12,
        xpReward: 85,
        description: "AWS, Azure, GCP",
        unlocked: false,
        requiredLevel: 7,
      },
    ],
  },
};

export default function CategoryPage() {
  const params = useParams();
  const { user } = useAuth();
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);

  const categoryId = params.category as string;
  const category = categoryData[categoryId];

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
                  className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center text-3xl shadow-lg shadow-purple-500/25`}
                >
                  {category.icon}
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

                return (
                  <div
                    key={topic.id}
                    className="relative"
                    onMouseEnter={() => setHoveredTopic(topic.id)}
                    onMouseLeave={() => setHoveredTopic(null)}
                  >
                    {unlocked ? (
                      <Link
                        href={`/play/${categoryId}/${topic.id}`}
                        className={`group block relative overflow-hidden pixel-box p-5 ${topic.borderColor} ${topic.hoverBorder} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
                      >
                        {/* Background Gradient on Hover */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                        />

                        {/* Content */}
                        <div className="relative z-10">
                          {/* Icon and Level */}
                          <div className="flex items-start justify-between mb-3">
                            <div
                              className={`w-14 h-14 bg-gradient-to-br ${topic.color} flex items-center justify-center text-2xl rounded-lg shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                            >
                              {topic.icon}
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500 uppercase tracking-wide">
                                Level
                              </div>
                              <div className="text-xl font-bold text-white">
                                {topic.level}
                              </div>
                            </div>
                          </div>

                          {/* Title and Description */}
                          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
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
                                {topic.level}/{topic.totalLevels}
                              </span>
                            </div>
                            <div className="h-1.5 bg-[#0a0a12] rounded-full overflow-hidden">
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
                            <div className="flex items-center gap-1 text-yellow-400 text-sm">
                              <Zap className="w-4 h-4" />
                              <span className="font-medium">
                                +{topic.xpReward} XP
                              </span>
                            </div>
                            <div
                              className={`flex items-center gap-1 text-sm font-medium ${
                                hoveredTopic === topic.id
                                  ? "text-purple-400"
                                  : "text-gray-500"
                              } transition-colors`}
                            >
                              Play
                              <ChevronRight
                                className={`w-4 h-4 transition-transform ${
                                  hoveredTopic === topic.id
                                    ? "translate-x-1"
                                    : ""
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Animated Corner */}
                        <div className="absolute -bottom-2 -right-2 w-16 h-16">
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-20 rounded-tl-3xl transform rotate-45 group-hover:scale-150 transition-transform duration-500`}
                          />
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
                            <p className="text-gray-400 text-sm font-medium">
                              Reach Level {topic.requiredLevel}
                            </p>
                            <p className="text-gray-500 text-xs">
                              to unlock this topic
                            </p>
                          </div>
                        </div>

                        {/* Content (dimmed) */}
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-3">
                            <div
                              className={`w-14 h-14 bg-gradient-to-br ${topic.color} flex items-center justify-center text-2xl rounded-lg shadow-lg grayscale`}
                            >
                              {topic.icon}
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
