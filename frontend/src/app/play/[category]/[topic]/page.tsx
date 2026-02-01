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
import {
  FaHtml5,
  FaPython,
  FaJs,
  FaDatabase,
  FaTerminal,
  FaCss3Alt,
  FaReact,
  FaJava,
} from "react-icons/fa";
import { SiCplusplus } from "react-icons/si";
import { IconType } from "react-icons";

// Topic data
const topicData: {
  [key: string]: {
    name: string;
    Icon: IconType;
    iconColor: string;
    accentColor: string;
    totalLevels: number;
  };
} = {
  javascript: {
    name: "JavaScript",
    Icon: FaJs,
    iconColor: "#f7df1e",
    accentColor: "#eab308",
    totalLevels: 15,
  },
  html: {
    name: "HTML",
    Icon: FaHtml5,
    iconColor: "#e34f26",
    accentColor: "#f97316",
    totalLevels: 15,
  },
  css: {
    name: "CSS",
    Icon: FaCss3Alt,
    iconColor: "#264de4",
    accentColor: "#3b82f6",
    totalLevels: 15,
  },
  react: {
    name: "React",
    Icon: FaReact,
    iconColor: "#61dafb",
    accentColor: "#06b6d4",
    totalLevels: 15,
  },
  python: {
    name: "Python",
    Icon: FaPython,
    iconColor: "#3776ab",
    accentColor: "#3b82f6",
    totalLevels: 15,
  },
  sql: {
    name: "SQL",
    Icon: FaDatabase,
    iconColor: "#00758f",
    accentColor: "#06b6d4",
    totalLevels: 15,
  },
  bash: {
    name: "Bash",
    Icon: FaTerminal,
    iconColor: "#4eaa25",
    accentColor: "#22c55e",
    totalLevels: 15,
  },
  java: {
    name: "Java",
    Icon: FaJava,
    iconColor: "#f89820",
    accentColor: "#f97316",
    totalLevels: 15,
  },
  cpp: {
    name: "C++",
    Icon: SiCplusplus,
    iconColor: "#00599C",
    accentColor: "#6366f1",
    totalLevels: 15,
  },
};

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

  const topic = topicData[topicId] || {
    name: "Topic",
    icon: "📚",
    accentColor: "#a855f7",
    totalLevels: 15,
  };

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
        const progress = response.data.user_progress;
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
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [categoryId, topicId]);

  const levels = generateLevels(topicId, topic.totalLevels, userProgress);
  const completedLevels = levels.filter((l) => l.isCompleted).length;
  const totalStars =
    certificateData.totalStars || levels.reduce((acc, l) => acc + l.stars, 0);
  const isAllCompleted = completedLevels === topic.totalLevels;

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
                  backgroundColor: i % 2 === 0 ? topic.accentColor : "#a855f7",
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
                      backgroundColor: `${topic.accentColor}20`,
                    }}
                  >
                    <topic.Icon
                      className="w-6 h-6"
                      style={{ color: topic.iconColor }}
                    />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">
                      {topic.name}
                    </h1>
                    <p className="text-xs text-green-500">
                      {isAllCompleted
                        ? "All levels completed!"
                        : `Level ${userProgress} of ${topic.totalLevels}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-[#1a1a2e] rounded-lg">
                    <Star
                      className="w-4 h-4"
                      style={{ color: topic.accentColor }}
                    />
                    <span
                      className="text-sm font-bold"
                      style={{ color: topic.accentColor }}
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
                      width: `${(completedLevels / topic.totalLevels) * 100}%`,
                      backgroundColor: topic.accentColor,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {completedLevels}/{topic.totalLevels} completed
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
                  height: `${((userProgress - 0.5) / (topic.totalLevels + 1)) * 100}%`,
                  backgroundColor: topic.accentColor,
                  boxShadow: `0 0 10px ${topic.accentColor}40`,
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
                            ? topic.accentColor
                            : "#2d2d44",
                        boxShadow:
                          level.isCompleted || level.isCurrent
                            ? `0 0 8px ${topic.accentColor}40`
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
                              ? topic.accentColor
                              : "#2d2d44",
                          boxShadow: level.isCurrent
                            ? `0 0 12px ${topic.accentColor}`
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
                              ? topic.accentColor
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
                                  : topic.accentColor,
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
                              backgroundColor: `${topic.accentColor}20`,
                              color: level.isLocked
                                ? "#4b5563"
                                : topic.accentColor,
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
                                style={{ color: topic.accentColor }}
                              />
                              <span
                                className="text-[9px] font-medium"
                                style={{ color: topic.accentColor }}
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
                      ? topic.accentColor
                      : "#2d2d44",
                    boxShadow: isAllCompleted
                      ? `0 0 8px ${topic.accentColor}40`
                      : "none",
                  }}
                />

                {/* Center dot - end of main line */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{
                      backgroundColor: isAllCompleted
                        ? topic.accentColor
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
                          ? topic.accentColor
                          : "#2d2d44",
                      }}
                    >
                      {isAllCompleted ? (
                        <Award
                          className="w-8 h-8"
                          style={{ color: topic.accentColor }}
                        />
                      ) : (
                        <Lock className="w-6 h-6 text-gray-500" />
                      )}
                      <p
                        className="text-xs font-bold"
                        style={{
                          color: isAllCompleted ? topic.accentColor : "#6b7280",
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
                          style={{ backgroundColor: `${topic.accentColor}20` }}
                        >
                          <topic.Icon
                            className="w-8 h-8"
                            style={{ color: topic.iconColor }}
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
                          <span style={{ color: topic.accentColor }}>
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
                          style={{ backgroundColor: topic.accentColor }}
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
                className="bg-[#fefefe] rounded-xl p-6 max-w-sm w-full text-center shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-4 border-double border-yellow-600/30 p-5 rounded-lg">
                  <div className="flex justify-center mb-3">
                    <topic.Icon
                      className="w-12 h-12"
                      style={{ color: topic.iconColor }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                    Certificate of Completion
                  </p>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">
                    {topic.name}
                  </h2>
                  <p className="text-gray-500 text-xs mb-3">
                    has been successfully completed by
                  </p>
                  <p className="text-lg font-bold text-gray-800 mb-3">
                    {user?.display_name || user?.username || "Student"}
                  </p>
                  <div className="flex justify-center gap-1 mb-3">
                    {[1, 2, 3].map((star) => {
                      // Calculate average stars (totalStars / totalLevels)
                      const avgStars = totalStars / topic.totalLevels;
                      const filled = star <= Math.round(avgStars);
                      return (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${filled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 pt-3 border-t">
                    <span>
                      Stars: {totalStars}/{topic.totalLevels * 3}
                    </span>
                    <span>XP Earned: {certificateData.totalXpEarned}</span>
                  </div>
                  {certificateData.completionDate && (
                    <p className="text-[9px] text-gray-400 mt-2">
                      Completed on{" "}
                      {new Date(
                        certificateData.completionDate,
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setShowCertificate(false)}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const avgStars = totalStars / topic.totalLevels;
                      const displayStars =
                        "★".repeat(Math.round(avgStars)) +
                        "☆".repeat(3 - Math.round(avgStars));
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
                      const certContent = `
                        <html>
                          <head>
                            <title>Certificate - ${topic.name}</title>
                            <style>
                              * { margin: 0; padding: 0; box-sizing: border-box; }
                              body { 
                                font-family: 'Georgia', serif;
                                background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
                                min-height: 100vh;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                padding: 40px;
                              }
                              .certificate {
                                background: #fefefe;
                                width: 800px;
                                padding: 60px;
                                border-radius: 12px;
                                text-align: center;
                                position: relative;
                              }
                              .border-frame {
                                border: 4px double #d4af37;
                                padding: 40px;
                                border-radius: 8px;
                              }
                              .icon { font-size: 48px; margin-bottom: 20px; }
                              .title { 
                                font-size: 14px; 
                                color: #666; 
                                text-transform: uppercase; 
                                letter-spacing: 4px; 
                                margin-bottom: 10px;
                              }
                              .topic { 
                                font-size: 36px; 
                                color: #1a1a2e; 
                                margin-bottom: 20px;
                                font-weight: bold;
                              }
                              .subtitle { color: #666; margin-bottom: 10px; }
                              .name { 
                                font-size: 28px; 
                                color: #1a1a2e; 
                                margin: 20px 0;
                                font-weight: bold;
                              }
                              .stars { 
                                color: #eab308; 
                                font-size: 24px; 
                                margin: 20px 0;
                              }
                              .stats {
                                display: flex;
                                justify-content: space-around;
                                margin-top: 30px;
                                padding-top: 20px;
                                border-top: 1px solid #eee;
                                color: #888;
                                font-size: 12px;
                              }
                              .date {
                                position: absolute;
                                bottom: 30px;
                                right: 40px;
                                color: #999;
                                font-size: 12px;
                              }
                            </style>
                          </head>
                          <body>
                            <div class="certificate">
                              <div class="border-frame">
                                <div class="icon" style="font-size: 48px; color: ${topic.iconColor};">🏆</div>
                                <div class="title">Certificate of Completion</div>
                                <div class="topic">${topic.name}</div>
                                <div class="subtitle">has been successfully completed by</div>
                                <div class="name">${user?.display_name || user?.username || "Student"}</div>
                                <div class="stars">${displayStars}</div>
                                <div class="stats">
                                  <span>Stars: ${totalStars}/${topic.totalLevels * 3}</span>
                                  <span>XP Earned: ${certificateData.totalXpEarned}</span>
                                  <span>Levels: ${topic.totalLevels}</span>
                                </div>
                              </div>
                              <div class="date">Completed: ${completionDateStr}</div>
                            </div>
                          </body>
                        </html>
                      `;
                      const printWindow = window.open("", "_blank");
                      if (printWindow) {
                        printWindow.document.write(certContent);
                        printWindow.document.close();
                        setTimeout(() => printWindow.print(), 500);
                      }
                    }}
                    className="flex-1 py-2 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                    style={{ backgroundColor: topic.accentColor }}
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
