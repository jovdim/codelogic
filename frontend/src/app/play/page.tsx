"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/RouteGuards";
import Sidebar from "@/components/layout/Sidebar";
import {
  Zap,
  ChevronRight,
  Gamepad2,
  Star,
  Lock,
  Trophy,
  Code,
  Server,
  Cloud,
  Sparkles,
  Target,
  Flame,
} from "lucide-react";

// Category data
const categories = [
  {
    id: "frontend",
    name: "Frontend",
    icon: "🎨",
    color: "from-purple-500 to-pink-500",
    borderColor: "border-purple-500/30",
    hoverBorder: "hover:border-purple-500",
    bgGlow: "bg-purple-500/10",
    description: "Build beautiful user interfaces",
    longDescription:
      "Master the art of creating stunning web interfaces with HTML, CSS, JavaScript, React, and more.",
    topics: ["HTML", "CSS", "JavaScript", "React", "TypeScript"],
    totalXP: 500,
    progress: 35,
    unlocked: true,
    lucideIcon: Code,
  },
  {
    id: "backend",
    name: "Backend",
    icon: "⚙️",
    color: "from-green-500 to-teal-500",
    borderColor: "border-green-500/30",
    hoverBorder: "hover:border-green-500",
    bgGlow: "bg-green-500/10",
    description: "Power the server side",
    longDescription:
      "Learn to build robust server applications with Python, Node.js, databases, and APIs.",
    topics: ["Python", "Node.js", "Database", "APIs"],
    totalXP: 400,
    progress: 20,
    unlocked: true,
    lucideIcon: Server,
  },
  {
    id: "devops",
    name: "DevOps",
    icon: "☁️",
    color: "from-orange-500 to-yellow-500",
    borderColor: "border-orange-500/30",
    hoverBorder: "hover:border-orange-500",
    bgGlow: "bg-orange-500/10",
    description: "Deploy & scale applications",
    longDescription:
      "Master deployment, CI/CD, containers, and cloud infrastructure.",
    topics: ["Docker", "Git", "CI/CD", "Cloud"],
    totalXP: 350,
    progress: 0,
    unlocked: false,
    requiredLevel: 5,
    lucideIcon: Cloud,
  },
];

export default function PlayPage() {
  const { user } = useAuth();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const isCategoryUnlocked = (category: (typeof categories)[0]) => {
    if (category.unlocked) return true;
    if (!user) return false;
    return user.level >= (category.requiredLevel || 0);
  };

  return (
    <ProtectedRoute>
      <Sidebar>
        <div className="min-h-screen pb-8">
          <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
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

            {/* User Progress Summary */}
            {user && (
              <div className="pixel-box p-5 mb-8 bg-gradient-to-r from-purple-600/10 to-pink-600/10">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                      {user.display_name?.[0]?.toUpperCase() ||
                        user.username[0].toUpperCase()}
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
                          {user.current_streak}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs">Day Streak</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-purple-400">
                        <Trophy className="w-5 h-5" />
                        <span className="font-bold text-xl">
                          {
                            categories.filter((c) => isCategoryUnlocked(c))
                              .length
                          }
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs">Unlocked</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
                const unlocked = isCategoryUnlocked(category);

                return (
                  <div
                    key={category.id}
                    className="relative"
                    onMouseEnter={() => setHoveredCategory(category.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    {unlocked ? (
                      <Link
                        href={`/play/${category.id}`}
                        className={`group block relative overflow-hidden pixel-box p-6 ${category.borderColor} ${category.hoverBorder} transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
                      >
                        {/* Background Glow */}
                        <div
                          className={`absolute inset-0 ${category.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                        />
                        <div
                          className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${category.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`}
                        />

                        {/* Content */}
                        <div className="relative z-10">
                          {/* Icon */}
                          <div className="flex items-start justify-between mb-4">
                            <div
                              className={`w-16 h-16 bg-gradient-to-br ${category.color} flex items-center justify-center text-3xl rounded-xl shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                            >
                              {category.icon}
                            </div>
                            <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 rounded-full">
                              <Zap className="w-4 h-4 text-yellow-400" />
                              <span className="text-yellow-400 text-sm font-bold">
                                {category.totalXP} XP
                              </span>
                            </div>
                          </div>

                          {/* Title & Description */}
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                            {category.longDescription}
                          </p>

                          {/* Topics Preview */}
                          <div className="flex flex-wrap gap-2 mb-4">
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

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{category.progress}%</span>
                            </div>
                            <div className="h-2 bg-[#0a0a12] rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${category.color} transition-all duration-500`}
                                style={{ width: `${category.progress}%` }}
                              />
                            </div>
                          </div>

                          {/* CTA */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-500 text-sm">
                                {category.topics.length} Topics
                              </span>
                            </div>
                            <div
                              className={`flex items-center gap-1 text-sm font-medium ${
                                hoveredCategory === category.id
                                  ? "text-purple-400"
                                  : "text-gray-500"
                              } transition-colors`}
                            >
                              Start
                              <ChevronRight
                                className={`w-4 h-4 transition-transform ${
                                  hoveredCategory === category.id
                                    ? "translate-x-1"
                                    : ""
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Animated Corner */}
                        <div className="absolute -bottom-4 -right-4 w-24 h-24">
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-20 rounded-tl-3xl transform rotate-45 group-hover:scale-150 transition-transform duration-500`}
                          />
                        </div>
                      </Link>
                    ) : (
                      <div
                        className={`relative overflow-hidden pixel-box p-6 border-gray-700/30 opacity-60`}
                      >
                        {/* Locked Overlay */}
                        <div className="absolute inset-0 bg-[#0a0a12]/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-3">
                            <Lock className="w-8 h-8 text-gray-500" />
                          </div>
                          <p className="text-gray-400 font-medium">
                            Requires Level {category.requiredLevel}
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            Current: Level {user?.level || 1}
                          </p>
                        </div>

                        {/* Blurred Content */}
                        <div className="relative z-10 blur-sm">
                          <div className="flex items-start justify-between mb-4">
                            <div
                              className={`w-16 h-16 bg-gradient-to-br ${category.color} flex items-center justify-center text-3xl rounded-xl`}
                            >
                              {category.icon}
                            </div>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">
                            {category.name}
                          </h3>
                          <p className="text-gray-400 text-sm mb-4">
                            {category.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Info Section */}
            <div className="mt-8 pixel-box p-6 bg-[#0a0a12]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-purple-400" />
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
          </div>
        </div>
      </Sidebar>
    </ProtectedRoute>
  );
}
