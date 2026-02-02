"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/RouteGuards";
import { gameAPI } from "@/lib/api";
import Sidebar from "@/components/layout/Sidebar";
import {
  Star,
  Lock,
  Zap,
  ChevronLeft,
  CheckCircle2,
  CheckCircle,
  Play,
  Award,
  Download,
} from "lucide-react";
import { getIcon, getIconColor, getAccentColor } from "@/lib/iconMap";

// Level titles for each topic
const topicLevelTitles: { [key: string]: string[] } = {
  javascript: [
    "Basics",
    "Variables",
    "Data Types",
    "Operators",
    "Arrays",
    "Functions",
    "Higher-Order",
    "Objects",
    "Loops",
    "Closures",
    "DOM Basics",
    "Events",
    "Async Intro",
    "Promises",
    "Final Boss",
  ],
  html: [
    "Basics",
    "Text & Headings",
    "Links & Navigation",
    "Images & Media",
    "Lists",
    "Tables",
    "Forms Basics",
    "Form Controls",
    "Semantic HTML",
    "Meta & SEO",
    "Accessibility",
    "Audio & Video",
    "Canvas & SVG",
    "Web Components",
    "Final Boss",
  ],
  css: [
    "Basics",
    "Selectors",
    "Colors & Backgrounds",
    "Text Styling",
    "Box Model",
    "Display & Visibility",
    "Positioning",
    "Flexbox Basics",
    "Flexbox Advanced",
    "Grid Basics",
    "Grid Advanced",
    "Responsive Design",
    "Transitions",
    "Animations",
    "Final Boss",
  ],
  react: [
    "Basics",
    "Components",
    "Props",
    "State",
    "Events",
    "Conditionals",
    "Lists & Keys",
    "useEffect",
    "Forms",
    "Context API",
    "Custom Hooks",
    "Refs & DOM",
    "Performance",
    "Error Handling",
    "Final Boss",
  ],
  python: [
    "Basics",
    "Variables",
    "Data Types",
    "Operators",
    "Strings",
    "Lists",
    "Dictionaries",
    "Conditionals",
    "Loops",
    "Functions",
    "Comprehensions",
    "Exceptions",
    "OOP Basics",
    "Modules",
    "Final Boss",
  ],
  sql: [
    "Basics",
    "SELECT Queries",
    "Filtering",
    "Sorting",
    "Aggregates",
    "Grouping",
    "Joins Basics",
    "Advanced Joins",
    "Subqueries",
    "CRUD",
    "Table Design",
    "Constraints",
    "Indexes",
    "Transactions",
    "Final Boss",
  ],
  bash: [
    "Basics",
    "Navigation",
    "File Operations",
    "File Content",
    "Variables",
    "Input/Output",
    "Conditionals",
    "Loops",
    "Functions",
    "Text Processing",
    "Permissions",
    "Processes",
    "Environment",
    "Scripting",
    "Final Boss",
  ],
  java: [
    "Basics",
    "Variables",
    "Operators",
    "Strings",
    "Arrays",
    "Control Flow",
    "Loops",
    "Methods",
    "OOP Basics",
    "Inheritance",
    "Interfaces",
    "Exceptions",
    "Collections",
    "Generics",
    "Final Boss",
  ],
  cpp: [
    "Basics",
    "Variables",
    "Operators",
    "Strings",
    "Arrays & Vectors",
    "Control Flow",
    "Loops",
    "Functions",
    "Pointers",
    "Classes",
    "Inheritance",
    "Memory",
    "Smart Pointers",
    "Templates",
    "Final Boss",
  ],
};

// Generate level data
const generateLevels = (
  topicId: string,
  totalLevels: number,
  userProgress: number = 1,
) => {
  const titles =
    topicLevelTitles[topicId] ||
    Array.from({ length: totalLevels }, (_, i) => `Level ${i + 1}`);

  return Array.from({ length: totalLevels }, (_, i) => {
    const level = i + 1;
    const isCompleted = level < userProgress;
    const isCurrent = level === userProgress;
    const isLocked = level > userProgress;

    // Only boss level at final level, all others are normal
    let type: "normal" | "boss" = "normal";
    if (level === totalLevels) type = "boss";

    const baseXP = 50;
    const xpReward = type === "boss" ? baseXP * 3 : baseXP;

    const stars = isCompleted ? ((level * 7) % 3) + 1 : 0;

    return {
      level,
      type,
      isCompleted,
      isCurrent,
      isLocked,
      xpReward,
      stars,
      title: titles[i] || `Level ${level}`,
    };
  });
};

export default function TopicLevelPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const categoryId = params.category as string;
  const topicId = params.topic as string;
  const currentLevelRef = useRef<HTMLDivElement>(null);

  // Topic data from API
  const [topicInfo, setTopicInfo] = useState<{
    name: string;
    icon: string;
    totalLevels: number;
  } | null>(null);
  
  // Get icon and colors from iconMap using topicId as fallback
  const iconKey = topicInfo?.icon || topicId;
  const TopicIcon = getIcon(iconKey);
  const iconColor = getIconColor(iconKey);
  const accentColor = getAccentColor(iconKey);

  const [userProgress, setUserProgress] = useState(1);
  const [loading, setLoading] = useState(true);
  const [certificateData, setCertificateData] = useState<{
    totalStars: number;
    levelStars: Record<number, number>;
    completionDate: string | null;
    totalXpEarned: number;
  }>({
    totalStars: 0,
    levelStars: {},
    completionDate: null,
    totalXpEarned: 0,
  });

  // Fetch user progress from API
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await gameAPI.getTopic(categoryId, topicId);
        const data = response.data;
        
        // Set topic info from API
        setTopicInfo({
          name: data.name,
          icon: data.icon || topicId,
          totalLevels: data.total_levels || 15,
        });
        
        const progress = data.user_progress;
        if (progress) {
          setUserProgress(progress.current_level || 1);
          setCertificateData({
            totalStars: progress.total_stars || 0,
            levelStars: progress.level_stars || {},
            completionDate: progress.completion_date || null,
            totalXpEarned: progress.total_xp_earned || 0,
          });
        }
      } catch (err) {
        console.error("Failed to fetch progress:", err);
        // Default to level 1 for new users
        setUserProgress(1);
        // Set fallback topic info
        setTopicInfo({
          name: topicId.charAt(0).toUpperCase() + topicId.slice(1).replace(/-/g, ' '),
          icon: topicId,
          totalLevels: 15,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [categoryId, topicId]);

  // Use topicInfo for totalLevels (with fallback)
  const totalLevels = topicInfo?.totalLevels || 15;
  const topicName = topicInfo?.name || topicId;
  
  const levels = generateLevels(topicId, totalLevels, userProgress);
  const completedLevels = levels.filter((l) => l.isCompleted).length;
  const totalStars =
    certificateData.totalStars || levels.reduce((acc, l) => acc + l.stars, 0);
  const isAllCompleted = completedLevels === totalLevels;

  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      currentLevelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleLevelClick = (level: (typeof levels)[0]) => {
    if (level.isLocked) return;
    setSelectedLevel(level.level);
  };

  const startLevel = () => {
    if (selectedLevel) {
      router.push(`/play/${categoryId}/${topicId}/level/${selectedLevel}`);
    }
  };

  return (
    <ProtectedRoute>
      <Sidebar>
        <div className="min-h-screen pb-8 relative overflow-hidden">
          {/* Pixelated Floating Particles Background */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float"
                style={{
                  left: `${(i * 17) % 100}%`,
                  top: `${(i * 23) % 100}%`,
                  width: `${4 + (i % 3) * 2}px`,
                  height: `${4 + (i % 3) * 2}px`,
                  backgroundColor: i % 2 === 0 ? accentColor : "#a855f7",
                  opacity: 0.15 + (i % 5) * 0.05,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${8 + (i % 5) * 2}s`,
                }}
              />
            ))}
          </div>

          {/* Pixel grid overlay */}
          <div
            className="fixed inset-0 pointer-events-none opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(to right, #ffffff 1px, transparent 1px),
                linear-gradient(to bottom, #ffffff 1px, transparent 1px)
              `,
              backgroundSize: "8px 8px",
            }}
          />

          {/* Header */}
          <div className="sticky top-0 z-40 bg-[#0f0f1a]/95 backdrop-blur-sm border-b border-[#2d2d44]">
            <div className="max-w-lg mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/play/${categoryId}`}
                    className="p-2 text-gray-400 hover:text-white rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Link>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `${accentColor}20`,
                    }}
                  >
                    <TopicIcon
                      className="w-6 h-6"
                      style={{ color: iconColor }}
                    />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">
                      {topicName}
                    </h1>
                    <p className="text-xs text-green-500">
                      {isAllCompleted
                        ? "All levels completed!"
                        : `Level ${userProgress} of ${totalLevels}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-[#1a1a2e] rounded-lg">
                    <Star
                      className="w-4 h-4"
                      style={{ color: accentColor }}
                    />
                    <span
                      className="text-sm font-bold"
                      style={{ color: accentColor }}
                    >
                      {totalStars}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-3">
                <div className="h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(completedLevels / totalLevels) * 100}%`,
                      backgroundColor: accentColor,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {completedLevels}/{totalLevels} completed
                </p>
              </div>
            </div>
          </div>

          {/* Level Path */}
          <div className="max-w-md mx-auto px-6 py-6 overflow-hidden relative z-10">
            <div className="relative">
              {/* Main vertical line - stops at certificate branch */}
              <div
                className="absolute left-1/2 top-0 w-1 bg-[#2d2d44] -translate-x-1/2 rounded-full"
                style={{ height: `calc(100% - 56px)` }}
              />

              {/* Colored progress line - thicker */}
              <div
                className="absolute left-1/2 top-0 w-1 -translate-x-1/2 transition-all duration-500 rounded-full"
                style={{
                  height: `${((userProgress - 0.5) / (totalLevels + 1)) * 100}%`,
                  backgroundColor: accentColor,
                  boxShadow: `0 0 10px ${accentColor}40`,
                }}
              />

              {/* Levels */}
              {levels.map((level, index) => {
                const isLeft = index % 2 === 0;

                return (
                  <div
                    key={level.level}
                    ref={level.isCurrent ? currentLevelRef : null}
                    className="relative h-28"
                  >
                    {/* Branch line - thicker and longer */}
                    <div
                      className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full"
                      style={{
                        left: isLeft ? "0" : "50%",
                        right: isLeft ? "50%" : "0",
                        backgroundColor:
                          level.isCompleted || level.isCurrent
                            ? accentColor
                            : "#2d2d44",
                        boxShadow:
                          level.isCompleted || level.isCurrent
                            ? `0 0 8px ${accentColor}40`
                            : "none",
                      }}
                    />

                    {/* Center dot - bigger */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                      <div
                        className={`w-4 h-4 rounded-sm ${
                          level.isCurrent ? "animate-pulse" : ""
                        }`}
                        style={{
                          backgroundColor:
                            level.isCompleted || level.isCurrent
                              ? accentColor
                              : "#2d2d44",
                          boxShadow: level.isCurrent
                            ? `0 0 12px ${accentColor}`
                            : "none",
                          transform: "rotate(45deg)",
                        }}
                      />
                    </div>

                    {/* Level Card */}
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 ${
                        isLeft ? "left-0" : "right-0"
                      }`}
                      style={{ width: "calc(50% - 20px)" }}
                    >
                      <button
                        onClick={() => handleLevelClick(level)}
                        disabled={level.isLocked}
                        className={`relative w-full transition-all duration-200 ${
                          level.isLocked
                            ? "cursor-not-allowed"
                            : "hover:scale-[1.02] cursor-pointer"
                        }`}
                      >
                        <div
                          className={`p-2.5 rounded-xl border-2 bg-[#1a1a2e] ${
                            level.isCurrent
                              ? "border-purple-500"
                              : level.isCompleted
                                ? ""
                                : "border-[#2d2d44]"
                          }`}
                          style={{
                            borderColor: level.isCompleted
                              ? accentColor
                              : undefined,
                          }}
                        >
                          {/* Boss badge */}
                          {level.type === "boss" && (
                            <div
                              className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[8px] font-bold uppercase"
                              style={{
                                backgroundColor: level.isLocked
                                  ? "#2d2d44"
                                  : accentColor,
                                color: level.isLocked ? "#6b7280" : "#0f0f1a",
                              }}
                            >
                              Final
                            </div>
                          )}

                          {/* Level icon/number */}
                          <div
                            className="w-9 h-9 mx-auto mb-1 rounded-lg flex items-center justify-center text-sm font-bold"
                            style={{
                              backgroundColor: `${accentColor}20`,
                              color: level.isLocked
                                ? "#4b5563"
                                : accentColor,
                            }}
                          >
                            {level.isLocked ? (
                              <Lock className="w-4 h-4" />
                            ) : level.isCompleted ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              level.level
                            )}
                          </div>

                          {/* Title */}
                          <p
                            className={`text-[10px] font-medium text-center ${
                              level.isLocked ? "text-gray-500" : "text-white"
                            }`}
                          >
                            {level.title}
                          </p>

                          {/* Stars for completed */}
                          {level.isCompleted && (
                            <div className="flex justify-center gap-0.5 mt-0.5">
                              {[1, 2, 3].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-2.5 h-2.5 ${
                                    star <= level.stars
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-[#2d2d44]"
                                  }`}
                                />
                              ))}
                            </div>
                          )}

                          {/* Current badge */}
                          {level.isCurrent && (
                            <p className="text-[8px] text-purple-400 text-center mt-0.5 font-bold uppercase">
                              Continue
                            </p>
                          )}

                          {/* Locked text */}
                          {level.isLocked && (
                            <p className="text-[8px] text-gray-600 text-center mt-0.5">
                              Locked
                            </p>
                          )}

                          {/* XP - only show for unlocked */}
                          {!level.isLocked && (
                            <div className="flex items-center justify-center gap-0.5 mt-0.5">
                              <Zap
                                className="w-2.5 h-2.5"
                                style={{ color: accentColor }}
                              />
                              <span
                                className="text-[9px] font-medium"
                                style={{ color: accentColor }}
                              >
                                +{level.xpReward}
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Certificate at the end - with branch like levels */}
              <div className="relative h-28">
                {/* Branch line to certificate */}
                <div
                  className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full"
                  style={{
                    left: "50%",
                    right: "0",
                    backgroundColor: isAllCompleted
                      ? accentColor
                      : "#2d2d44",
                    boxShadow: isAllCompleted
                      ? `0 0 8px ${accentColor}40`
                      : "none",
                  }}
                />

                {/* Center dot - end of main line */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{
                      backgroundColor: isAllCompleted
                        ? accentColor
                        : "#2d2d44",
                      transform: "rotate(45deg)",
                    }}
                  />
                </div>

                {/* Certificate Card */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 right-0"
                  style={{ width: "calc(50% - 20px)" }}
                >
                  <button
                    onClick={() => isAllCompleted && setShowCertificate(true)}
                    disabled={!isAllCompleted}
                    className={`relative w-full transition-all duration-200 ${!isAllCompleted ? "cursor-not-allowed" : "hover:scale-[1.02] cursor-pointer"}`}
                  >
                    <div
                      className="p-3 rounded-xl border-2 bg-[#1a1a2e] flex flex-col items-center justify-center gap-1"
                      style={{
                        borderColor: isAllCompleted
                          ? accentColor
                          : "#2d2d44",
                      }}
                    >
                      {isAllCompleted ? (
                        <Award
                          className="w-8 h-8"
                          style={{ color: accentColor }}
                        />
                      ) : (
                        <Lock className="w-6 h-6 text-gray-500" />
                      )}
                      <p
                        className="text-xs font-bold"
                        style={{
                          color: isAllCompleted ? accentColor : "#6b7280",
                        }}
                      >
                        Certificate
                      </p>
                      {isAllCompleted && (
                        <p className="text-[9px] text-green-400 font-medium flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5" /> Ready to
                          claim!
                        </p>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Level Modal */}
          {selectedLevel && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedLevel(null)}
            >
              <div
                className="bg-[#1a1a2e]/95 backdrop-blur-xl rounded-2xl p-6 max-w-xs w-full border border-[#2d2d44] shadow-2xl shadow-black/50"
                onClick={(e) => e.stopPropagation()}
              >
                {(() => {
                  const level = levels.find((l) => l.level === selectedLevel);
                  if (!level) return null;

                  return (
                    <>
                      <div className="text-center mb-4">
                        <div
                          className="w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${accentColor}20` }}
                        >
                          <TopicIcon
                            className="w-8 h-8"
                            style={{ color: iconColor }}
                          />
                        </div>
                        <h2 className="text-xl font-bold text-white">
                          Level {level.level}
                        </h2>
                        <p className="text-gray-400 text-sm">{level.title}</p>
                        {level.isCompleted && (
                          <div className="flex justify-center gap-1 mt-2">
                            {[1, 2, 3].map((star) => (
                              <Star
                                key={star}
                                className={`w-5 h-5 ${
                                  star <= level.stars
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-700"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm px-3 py-2 bg-[#0f0f1a] rounded-lg">
                          <span className="text-gray-400">Type</span>
                          <span className="text-white">
                            {level.type === "boss" ? "Final" : "Lesson"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm px-3 py-2 bg-[#0f0f1a] rounded-lg">
                          <span className="text-gray-400">Questions</span>
                          <span className="text-white">
                            {level.type === "boss" ? "5" : "5"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm px-3 py-2 bg-[#0f0f1a] rounded-lg">
                          <span className="text-gray-400">XP Reward</span>
                          <span style={{ color: accentColor }}>
                            +{level.xpReward}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedLevel(null)}
                          className="flex-1 py-2.5 bg-[#2d2d44] text-white rounded-lg font-medium hover:bg-[#3d3d5c]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={startLevel}
                          className="flex-1 py-2.5 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                          style={{ backgroundColor: accentColor }}
                        >
                          <Play className="w-4 h-4" />
                          {level.isCompleted ? "Replay" : "Start"}
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Certificate Modal */}
          {showCertificate && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowCertificate(false)}
            >
              <div
                className="bg-gradient-to-br from-[#fffef8] to-[#faf6e9] rounded-xl p-4 max-w-md w-full text-center shadow-2xl border-4 border-[#c9a227]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-2 border-[#d4b854] p-4 rounded-lg relative">
                  {/* Header */}
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#c9a227] to-transparent" />
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-[#c9a227]">
                      CL
                    </div>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#c9a227] to-transparent" />
                  </div>

                  <p className="text-[9px] text-[#8b7355] uppercase tracking-[4px] mb-1">
                    Certificate of Completion
                  </p>
                  <h2
                    className="text-xl font-semibold text-[#2d2418] mb-3"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    CodeLogic Academy
                  </h2>

                  {/* Topic badge */}
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3"
                    style={{
                      backgroundColor: `${accentColor}15`,
                      border: `2px solid ${accentColor}40`,
                    }}
                  >
                    <TopicIcon
                      className="w-6 h-6"
                      style={{ color: iconColor }}
                    />
                    <span
                      className="font-semibold text-[#2d2418]"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {topicName}
                    </span>
                  </div>

                  <p className="text-[10px] text-[#8b7355] uppercase tracking-[2px] mb-1">
                    This certificate is proudly presented to
                  </p>
                  <p
                    className="text-lg font-semibold text-[#2d2418] mb-1 border-b border-[#c9a227] inline-block px-4 pb-1"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {user?.display_name || user?.username || "Student"}
                  </p>

                  <p className="text-[10px] text-[#5c5040] mt-2 mb-3 leading-relaxed max-w-xs mx-auto">
                    For successfully completing all {totalLevels} levels
                    of the {topicName} course, demonstrating exceptional
                    proficiency.
                  </p>

                  {/* Stars */}
                  <div className="flex justify-center gap-1 mb-1">
                    {[1, 2, 3].map((star) => {
                      const avgStars = totalStars / totalLevels;
                      const filled = star <= Math.round(avgStars);
                      return (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${filled ? "fill-[#d4af37] text-[#d4af37]" : "text-gray-300"}`}
                        />
                      );
                    })}
                  </div>
                  <p className="text-[8px] text-[#8b7355] uppercase tracking-[2px] mb-2">
                    Achievement Rating
                  </p>

                  {/* Stats */}
                  <div className="flex justify-center gap-6 py-2 border-t border-b border-[#e8dcc8] mb-3">
                    <div className="text-center">
                      <p
                        className="text-base font-semibold text-[#2d2418]"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        {totalLevels}
                      </p>
                      <p className="text-[8px] text-[#8b7355] uppercase tracking-wider">
                        Levels
                      </p>
                    </div>
                    <div className="text-center">
                      <p
                        className="text-base font-semibold text-[#2d2418]"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        {totalStars}/{totalLevels * 3}
                      </p>
                      <p className="text-[8px] text-[#8b7355] uppercase tracking-wider">
                        Stars
                      </p>
                    </div>
                    <div className="text-center">
                      <p
                        className="text-base font-semibold text-[#2d2418]"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        {certificateData.totalXpEarned.toLocaleString()}
                      </p>
                      <p className="text-[8px] text-[#8b7355] uppercase tracking-wider">
                        XP Earned
                      </p>
                    </div>
                  </div>

                  {certificateData.completionDate && (
                    <p className="text-[9px] text-[#8b7355]">
                      Completed:{" "}
                      {new Date(
                        certificateData.completionDate,
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}

                  {/* Verified seal */}
                  <div className="absolute -bottom-3 -right-3 w-14 h-14 bg-gradient-to-br from-[#f4d03f] to-[#c9a227] rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#fffef0] to-[#f4d03f] rounded-full border-2 border-[#c9a227] flex flex-col items-center justify-center">
                      <span className="text-[6px] text-[#5c4a1f] uppercase font-semibold">
                        Verified
                      </span>
                      <span className="text-sm text-[#5c4a1f] font-bold leading-none">
                        ✓
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setShowCertificate(false)}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const avgStars = totalStars / totalLevels;
                      const filledStars = Math.round(avgStars);
                      const completionDateStr = certificateData.completionDate
                        ? new Date(
                            certificateData.completionDate,
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : new Date().toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          });

                      // Generate deterministic certificate ID
                      const generateCertId = () => {
                        const baseString = `${user?.id || 0}-${topicId}-${certificateData.completionDate || "unknown"}`;
                        let hash = 0;
                        for (let i = 0; i < baseString.length; i++) {
                          const char = baseString.charCodeAt(i);
                          hash = (hash << 5) - hash + char;
                          hash = hash & hash;
                        }
                        const hashHex = Math.abs(hash)
                          .toString(16)
                          .toUpperCase()
                          .padStart(8, "0");
                        const topicCode = topicId.slice(0, 4).toUpperCase();
                        return `CL-${topicCode}-${hashHex}`;
                      };
                      const certificateId = generateCertId();
                      const userName =
                        user?.display_name || user?.username || "Student";

                      // SVG icon map for PDF
                      const getTopicSVG = () => {
                        const svgMap: { [key: string]: string } = {
                          javascript: `<svg viewBox="0 0 48 48" width="48" height="48"><rect width="48" height="48" fill="#f7df1e" rx="4"/><path d="M12 36.4V33l3.6.2c.8 0 1.4-.6 1.4-1.4v-11.6h4v11.8c0 3.2-1.8 4.8-5 4.8-2.2 0-3.6-.2-4-.4zm14.6-.6c-1.2-.6-2-1.6-2.4-2.6l3.2-1.8c.4.8.8 1.2 1.4 1.6.6.4 1.2.4 2 .4 1 0 1.8-.4 1.8-1.2 0-1-1.2-1.4-2.8-2-1.8-.6-4.2-1.6-4.2-4.4 0-2.8 2.4-4.6 5.4-4.6 1.8 0 3.4.4 4.6 1.4l-2.8 2c-.6-.6-1.4-.8-2-.8-.8 0-1.4.4-1.4 1 0 .8 1 1.2 2.4 1.6 2.2.8 4.6 1.8 4.6 4.6 0 3-2.4 5.2-6 5.2-1.8 0-3.2-.4-4.4-1z" fill="#000"/></svg>`,
                          python: `<svg viewBox="0 0 48 48" width="48" height="48"><path fill="#3776ab" d="M24 4c-3.4 0-6.4.2-8.8.8C11.4 5.8 10 7.6 10 10v4h12v2H8.6c-2 0-4 1.2-4.6 3.6-.6 2.8-.6 4.6 0 7.6.6 2.2 2 3.6 4 3.6H10v-3.2c0-2.4 2-4.4 4.6-4.4h9c2 0 3.4-1.4 3.4-3.4V10c0-2-1.6-3.4-3.4-4-1.2-.4-2.6-.6-3.8-.6-1.4-.2-2.6-.2-3.8-.2zm-5 4c.8 0 1.6.6 1.6 1.6s-.6 1.6-1.6 1.6-1.6-.6-1.6-1.6.6-1.6 1.6-1.6z"/><path fill="#ffc331" d="M37.2 17.2h-2v3.2c0 2.4-2 4.4-4.6 4.4h-9c-2 0-3.4 1.4-3.4 3.4v6.4c0 2 1.6 3 3.4 3.6 2.2.6 4.4.8 6.8 0 1.6-.4 3.4-1.4 3.4-3.6v-2.6h-8v-1h11.2c2 0 2.8-1.4 3.4-3.4.6-2 .6-4.2 0-6.8-.4-2-2.2-3-4-3.6zm-8.2 17.2c.8 0 1.6.6 1.6 1.6s-.6 1.6-1.6 1.6-1.6-.6-1.6-1.6.6-1.6 1.6-1.6z"/></svg>`,
                          html: `<svg viewBox="0 0 48 48" width="48" height="48"><path fill="#e44d26" d="M8 4l3 34L24 44l13-6L40 4H8zm25 12H16.6l.4 5h15.4l-1.2 13-7.2 2-7.4-2-.4-6h4.8l.2 3 2.8.8 2.8-.8.2-4H14.2l-1-11h21.4l-.6 2z"/></svg>`,
                          css: `<svg viewBox="0 0 48 48" width="48" height="48"><path fill="#264de4" d="M8 4l3 34L24 44l13-6L40 4H8zm25.2 11.8l-.2 1.6-.2 1-.2 1H16.6l.4 4h14.4l-.2 1.2-1.2 13.2-6 1.6-6-1.6-.4-5h4.2l.2 2.6 2 .6 2-.6.2-2.8.2-2.6H15.2l-1-11h19.2l-.2 1.8z"/></svg>`,
                          react: `<svg viewBox="0 0 48 48" width="48" height="48"><circle cx="24" cy="24" r="4.4" fill="#61dafb"/><g fill="none" stroke="#61dafb" stroke-width="2"><ellipse rx="20" ry="8" cx="24" cy="24"/><ellipse rx="20" ry="8" cx="24" cy="24" transform="rotate(60 24 24)"/><ellipse rx="20" ry="8" cx="24" cy="24" transform="rotate(120 24 24)"/></g></svg>`,
                          sql: `<svg viewBox="0 0 48 48" width="48" height="48"><ellipse cx="24" cy="12" rx="16" ry="6" fill="#336791"/><path fill="#336791" d="M8 12v24c0 3.3 7.2 6 16 6s16-2.7 16-6V12c0 3.3-7.2 6-16 6S8 15.3 8 12z"/></svg>`,
                          bash: `<svg viewBox="0 0 48 48" width="48" height="48"><rect x="4" y="8" width="40" height="32" rx="4" fill="#2d2d2d"/><path fill="#4EAA25" d="M12 20l6 4-6 4v-3H8v-2h4v-3zm8 8h12v2H20v-2z"/></svg>`,
                          java: `<svg viewBox="0 0 48 48" width="48" height="48"><path fill="#e76f00" d="M17.8 37.2s-1.8 1 1.2 1.4c3.6.6 5.6.4 9.6-.4 0 0 1 .6 2.6 1.2-9 3.8-20.4-.2-13.4-2.2zm-1.2-5s-2 1.4 1 1.8c4 .4 7 .4 12.4-.6 0 0 .8.8 2 1.2-10.8 3.2-23 .2-15.4-2.4z"/><path fill="#5382a1" d="M27 20.6c2.4 2.8-.6 5.2-.6 5.2s6.2-3.2 3.4-7.2c-2.6-3.6-4.6-5.6 6.4-11.8 0 0-17.4 4.4-9.2 13.8z"/></svg>`,
                          cpp: `<svg viewBox="0 0 48 48" width="48" height="48"><circle cx="24" cy="24" r="20" fill="none" stroke="#00599C" stroke-width="3"/><path fill="#00599C" d="M18 16v16c0 1.2.8 2 2 2h4c4.4 0 8-3.6 8-8s-3.6-8-8-8h-6zm4 4h2c2.2 0 4 1.8 4 4s-1.8 4-4 4h-2v-8z"/><path fill="#00599C" d="M34 20h-2v2h-2v2h2v2h2v-2h2v-2h-2v-2z"/></svg>`,
                        };
                        return (
                          svgMap[topicId] ||
                          `<svg viewBox="0 0 48 48" width="48" height="48"><path fill="${accentColor}" d="M14 16l-8 8 8 8 2.8-2.8L11.6 24l5.2-5.2L14 16zm20 0l8 8-8 8-2.8-2.8 5.2-5.2-5.2-5.2L34 16z"/></svg>`
                        );
                      };

                      const starSVG = (filled: boolean) =>
                        filled
                          ? `<svg width="28" height="28" viewBox="0 0 24 24" fill="#d4af37" stroke="#b8960f" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
                          : `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

                      const starsHTML = [1, 2, 3]
                        .map((i) => starSVG(i <= filledStars))
                        .join("");

                      const certContent = `
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <title>Certificate - ${topicName} | CodeLogic Academy</title>
                            <style>
                              @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:wght@400;500;600&display=swap');
                              
                              * { margin: 0; padding: 0; box-sizing: border-box; }
                              
                              @page {
                                size: landscape;
                                margin: 0;
                              }
                              
                              html, body { 
                                font-family: 'Montserrat', sans-serif;
                                width: 100%;
                                height: 100%;
                                overflow: hidden;
                              }
                              
                              .certificate-wrapper {
                                width: 100vw;
                                height: 100vh;
                                background: linear-gradient(135deg, #fefcf3 0%, #faf6e9 50%, #f5f0dc 100%);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                padding: 20px;
                              }
                              
                              .certificate {
                                width: 100%;
                                height: 100%;
                                position: relative;
                                background: linear-gradient(180deg, #fffffe 0%, #fffcf5 50%, #fff9eb 100%);
                                border: 4px solid #c9a227;
                                box-shadow: inset 0 0 0 2px #fff, inset 0 0 0 4px #e8d48b;
                              }
                              
                              .corner {
                                position: absolute;
                                width: 100px;
                                height: 100px;
                              }
                              .corner svg { width: 100%; height: 100%; }
                              .corner-tl { top: 8px; left: 8px; }
                              .corner-tr { top: 8px; right: 8px; transform: scaleX(-1); }
                              .corner-bl { bottom: 8px; left: 8px; transform: scaleY(-1); }
                              .corner-br { bottom: 8px; right: 8px; transform: scale(-1, -1); }
                              
                              .border-pattern {
                                position: absolute;
                                top: 25px;
                                left: 25px;
                                right: 25px;
                                bottom: 25px;
                                border: 2px solid #d4b854;
                                pointer-events: none;
                              }
                              
                              .content {
                                position: relative;
                                height: 100%;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                padding: 50px 80px;
                                text-align: center;
                              }
                              
                              .header-ornament {
                                display: flex;
                                align-items: center;
                                gap: 20px;
                                margin-bottom: 5px;
                              }
                              
                              .ornament-line {
                                width: 120px;
                                height: 2px;
                                background: linear-gradient(90deg, transparent, #c9a227, transparent);
                              }
                              
                              .logo-badge {
                                width: 60px;
                                height: 60px;
                                background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: white;
                                font-weight: 700;
                                font-size: 20px;
                                letter-spacing: -1px;
                                border: 3px solid #c9a227;
                                box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
                              }
                              
                              .certificate-label {
                                font-size: 11px;
                                color: #8b7355;
                                text-transform: uppercase;
                                letter-spacing: 8px;
                                margin-bottom: 8px;
                              }
                              
                              .academy-name {
                                font-family: 'Cormorant Garamond', serif;
                                font-size: 44px;
                                color: #2d2418;
                                font-weight: 600;
                                margin-bottom: 20px;
                                letter-spacing: 2px;
                              }
                              
                              .topic-section {
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: 16px;
                                padding: 14px 36px;
                                background: linear-gradient(135deg, ${accentColor}08, ${accentColor}15);
                                border: 2px solid ${accentColor}30;
                                border-radius: 60px;
                                margin-bottom: 20px;
                              }
                              
                              .topic-name {
                                font-family: 'Cormorant Garamond', serif;
                                font-size: 28px;
                                color: #2d2418;
                                font-weight: 600;
                              }
                              
                              .awarded-text {
                                font-size: 13px;
                                color: #8b7355;
                                letter-spacing: 3px;
                                text-transform: uppercase;
                                margin-bottom: 8px;
                              }
                              
                              .recipient-name {
                                font-family: 'Cormorant Garamond', serif;
                                font-size: 38px;
                                color: #2d2418;
                                font-weight: 600;
                                margin-bottom: 8px;
                                position: relative;
                                display: inline-block;
                              }
                              
                              .recipient-name::after {
                                content: '';
                                position: absolute;
                                bottom: -4px;
                                left: 50%;
                                transform: translateX(-50%);
                                width: 80%;
                                height: 2px;
                                background: linear-gradient(90deg, transparent, #c9a227, transparent);
                              }
                              
                              .description {
                                font-size: 12px;
                                color: #5c5040;
                                line-height: 1.7;
                                max-width: 580px;
                                margin: 18px auto;
                              }
                              
                              .stars-section {
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: 8px;
                                margin: 12px 0;
                              }
                              
                              .achievement-label {
                                font-size: 10px;
                                color: #8b7355;
                                text-transform: uppercase;
                                letter-spacing: 3px;
                              }
                              
                              .stats-row {
                                display: flex;
                                justify-content: center;
                                gap: 60px;
                                margin: 18px 0;
                                padding: 14px 0;
                                border-top: 1px solid #e8dcc8;
                                border-bottom: 1px solid #e8dcc8;
                              }
                              
                              .stat-item { text-align: center; }
                              
                              .stat-value {
                                font-family: 'Cormorant Garamond', serif;
                                font-size: 24px;
                                color: #2d2418;
                                font-weight: 600;
                              }
                              
                              .stat-label {
                                font-size: 9px;
                                color: #8b7355;
                                text-transform: uppercase;
                                letter-spacing: 2px;
                                margin-top: 2px;
                              }
                              
                              .footer-section {
                                display: flex;
                                justify-content: space-between;
                                align-items: flex-end;
                                width: 100%;
                                max-width: 700px;
                                margin-top: auto;
                                padding-top: 15px;
                              }
                              
                              .signature-block { text-align: center; }
                              
                              .signature-line {
                                width: 160px;
                                height: 1px;
                                background: #5c5040;
                                margin-bottom: 8px;
                              }
                              
                              .signature-name {
                                font-size: 12px;
                                color: #5c5040;
                                font-weight: 500;
                              }
                              
                              .signature-title {
                                font-size: 10px;
                                color: #8b7355;
                                margin-top: 2px;
                              }
                              
                              .cert-info { text-align: right; }
                              
                              .cert-date, .cert-id {
                                font-size: 10px;
                                color: #8b7355;
                                margin-bottom: 4px;
                              }
                              
                              .seal {
                                position: absolute;
                                bottom: 50px;
                                right: 100px;
                                width: 90px;
                                height: 90px;
                              }
                              
                              .seal-outer {
                                width: 100%;
                                height: 100%;
                                background: linear-gradient(135deg, #f4d03f 0%, #c9a227 50%, #f4d03f 100%);
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                box-shadow: 0 4px 20px rgba(201, 162, 39, 0.4);
                              }
                              
                              .seal-inner {
                                width: 70px;
                                height: 70px;
                                background: linear-gradient(135deg, #fffef0 0%, #f4d03f 100%);
                                border-radius: 50%;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                border: 2px solid #c9a227;
                              }
                              
                              .seal-text {
                                font-size: 8px;
                                color: #5c4a1f;
                                text-transform: uppercase;
                                letter-spacing: 1px;
                                font-weight: 600;
                              }
                              
                              .seal-check {
                                font-size: 22px;
                                color: #5c4a1f;
                                font-weight: bold;
                                line-height: 1;
                              }
                              
                              .watermark {
                                position: absolute;
                                top: 50%;
                                left: 50%;
                                transform: translate(-50%, -50%);
                                font-family: 'Cormorant Garamond', serif;
                                font-size: 200px;
                                color: rgba(201, 162, 39, 0.04);
                                font-weight: 700;
                                pointer-events: none;
                                letter-spacing: -10px;
                              }
                              
                              @media print {
                                html, body {
                                  width: 100%;
                                  height: 100%;
                                  print-color-adjust: exact;
                                  -webkit-print-color-adjust: exact;
                                }
                                .certificate-wrapper {
                                  width: 100%;
                                  height: 100%;
                                }
                              }
                            </style>
                          </head>
                          <body>
                            <div class="certificate-wrapper">
                              <div class="certificate">
                                <div class="corner corner-tl">
                                  <svg viewBox="0 0 100 100"><path d="M10 90 L10 10 L90 10" fill="none" stroke="#c9a227" stroke-width="2"/><path d="M10 70 L10 30 L30 10" fill="none" stroke="#d4b854" stroke-width="1"/><circle cx="10" cy="10" r="6" fill="#c9a227"/></svg>
                                </div>
                                <div class="corner corner-tr">
                                  <svg viewBox="0 0 100 100"><path d="M10 90 L10 10 L90 10" fill="none" stroke="#c9a227" stroke-width="2"/><path d="M10 70 L10 30 L30 10" fill="none" stroke="#d4b854" stroke-width="1"/><circle cx="10" cy="10" r="6" fill="#c9a227"/></svg>
                                </div>
                                <div class="corner corner-bl">
                                  <svg viewBox="0 0 100 100"><path d="M10 90 L10 10 L90 10" fill="none" stroke="#c9a227" stroke-width="2"/><path d="M10 70 L10 30 L30 10" fill="none" stroke="#d4b854" stroke-width="1"/><circle cx="10" cy="10" r="6" fill="#c9a227"/></svg>
                                </div>
                                <div class="corner corner-br">
                                  <svg viewBox="0 0 100 100"><path d="M10 90 L10 10 L90 10" fill="none" stroke="#c9a227" stroke-width="2"/><path d="M10 70 L10 30 L30 10" fill="none" stroke="#d4b854" stroke-width="1"/><circle cx="10" cy="10" r="6" fill="#c9a227"/></svg>
                                </div>
                                
                                <div class="border-pattern"></div>
                                <div class="watermark">CL</div>
                                
                                <div class="content">
                                  <div class="header-ornament">
                                    <div class="ornament-line"></div>
                                    <div class="logo-badge">CL</div>
                                    <div class="ornament-line"></div>
                                  </div>
                                  
                                  <div class="certificate-label">Certificate of Completion</div>
                                  <div class="academy-name">CodeLogic Academy</div>
                                  
                                  <div class="topic-section">
                                    ${getTopicSVG()}
                                    <span class="topic-name">${topicName}</span>
                                  </div>
                                  
                                  <div class="awarded-text">This certificate is proudly presented to</div>
                                  <div class="recipient-name">${userName}</div>
                                  
                                  <div class="description">
                                    For successfully completing all ${totalLevels} levels of the ${topicName} course,
                                    demonstrating exceptional proficiency and dedication in mastering the fundamentals
                                    and advanced concepts of ${categoryId} development.
                                  </div>
                                  
                                  <div class="stars-section">
                                    ${starsHTML}
                                  </div>
                                  <div class="achievement-label">Achievement Rating</div>
                                  
                                  <div class="stats-row">
                                    <div class="stat-item">
                                      <div class="stat-value">${totalLevels}</div>
                                      <div class="stat-label">Levels Completed</div>
                                    </div>
                                    <div class="stat-item">
                                      <div class="stat-value">${totalStars}/${totalLevels * 3}</div>
                                      <div class="stat-label">Stars Earned</div>
                                    </div>
                                    <div class="stat-item">
                                      <div class="stat-value">${certificateData.totalXpEarned.toLocaleString()}</div>
                                      <div class="stat-label">XP Earned</div>
                                    </div>
                                  </div>
                                  
                                  <div class="footer-section">
                                    <div class="signature-block">
                                      <div class="signature-line"></div>
                                      <div class="signature-name">CodeLogic Team</div>
                                      <div class="signature-title">Program Director</div>
                                    </div>
                                    
                                    <div class="cert-info">
                                      <div class="cert-date">Issued: ${completionDateStr}</div>
                                      <div class="cert-id">Certificate ID: ${certificateId}</div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div class="seal">
                                  <div class="seal-outer">
                                    <div class="seal-inner">
                                      <div class="seal-text">Verified</div>
                                      <div class="seal-check">✓</div>
                                      <div class="seal-text">Complete</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </body>
                        </html>
                      `;
                      const printWindow = window.open("", "_blank");
                      if (printWindow) {
                        printWindow.document.write(certContent);
                        printWindow.document.close();
                      }
                    }}
                    className="flex-1 py-2 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Sidebar>
    </ProtectedRoute>
  );
}
