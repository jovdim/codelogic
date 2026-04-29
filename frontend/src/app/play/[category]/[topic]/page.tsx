"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/RouteGuards";
import { getCached, setCache } from "@/lib/dataCache";
import { gameAPI } from "@/lib/api";
import Sidebar from "@/components/layout/Sidebar";
import { ScrollReveal } from "@/components/ui/ScrollAnimations";
import { Modal, ModalButton } from "@/components/ui/Modal";
import {
  Star,
  Lock,
  Zap,
  ChevronLeft,
  CheckCircle2,
  Play,
  Award,
  Download,
  Code2,
  Heart,
  Clock,
  Loader2,
} from "lucide-react";
import {
  generateCertificateHTML,
  CertData,
  getTopicIconForCertificate,
} from "@/lib/certTemplate";
import { downloadCertAsPdf } from "@/lib/certPdf";

// Topic data structure for API response
interface TopicData {
  name: string;
  icon: string | null;
  accentColor: string;
  totalLevels: number;
  certificateTitle?: string;
  certificateDescription?: string;
}

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
  levelStars: Record<number, number> = {},
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

    const stars = isCompleted
      ? (levelStars[level] ?? levelStars[String(level) as unknown as number] ?? 0)
      : 0;

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
  const [topic, setTopic] = useState<TopicData>({
    name: "Loading...",
    icon: null,
    accentColor: "#a855f7",
    totalLevels: 15,
    certificateTitle: undefined,
    certificateDescription: undefined,
  });

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

  // Fetch topic data and user progress from API
  useEffect(() => {
    const fetchTopicData = async () => {
      try {
        const cacheKey = `topic_${categoryId}_${topicId}_${user?.id || 'guest'}`;
        const cached = getCached<any>(cacheKey);
        
        let data;
        if (cached) {
          data = cached;
        } else {
          const response = await gameAPI.getTopic(categoryId, topicId);
          data = response.data;
          setCache(cacheKey, data);
        }

        // Set topic data from API
        setTopic({
          name: data.name || "Topic",
          icon: data.icon || null,
          accentColor: data.category_color || "#a855f7",
          totalLevels: data.total_levels || 15,
          certificateTitle: data.certificate_title,
          certificateDescription: data.certificate_description,
        });

        // Set progress if available
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
        console.error("Failed to fetch topic data:", err);
        // Default values for error case
        setUserProgress(1);
      } finally {
        setLoading(false);
      }
    };

    fetchTopicData();
  }, [categoryId, topicId]);

  const levels = generateLevels(
    topicId,
    topic.totalLevels,
    userProgress,
    certificateData.levelStars,
  );
  const completedLevels = levels.filter((l) => l.isCompleted).length;
  const totalStars =
    certificateData.totalStars || levels.reduce((acc, l) => acc + l.stars, 0);
  const isAllCompleted = completedLevels === topic.totalLevels;

  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  // Build the cert HTML + payload from current page data.
  const buildCertHtml = (): { html: string; topicName: string } | null => {
    if (!topic) return null;
    const completionDateStr = certificateData.completionDate
      ? new Date(certificateData.completionDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

    const baseString = `${user?.id || 0}-${topicId}-${certificateData.completionDate || "unknown"}`;
    let hash = 0;
    for (let i = 0; i < baseString.length; i++) {
      const char = baseString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    const hashHex = Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
    const certificateId = `CL-${topicId.slice(0, 4).toUpperCase()}-${hashHex}`;

    const certData: CertData = {
      topicName: topic.name,
      topicId: topicId,
      topicIconHtml: getTopicIconForCertificate(topic.icon, topic.accentColor),
      accentColor: topic.accentColor,
      userName: user?.display_name || user?.username || "Student",
      completionDateStr,
      certificateId,
      category: categoryId,
      certificateTitle: topic.certificateTitle,
      certificateDescription: topic.certificateDescription,
    };

    return { html: generateCertificateHTML(certData), topicName: topic.name };
  };

  const [downloadingCert, setDownloadingCert] = useState(false);

  const downloadCertificate = async () => {
    if (downloadingCert) return;
    const built = buildCertHtml();
    if (!built) return;
    setDownloadingCert(true);
    try {
      const safe = built.topicName.replace(/[^a-z0-9]+/gi, "-");
      await downloadCertAsPdf(built.html, `Certificate-${safe}.pdf`);
    } catch (err) {
      console.error("Failed to download certificate:", err);
      alert("Couldn't generate the PDF. Try again or use the View button.");
    } finally {
      setDownloadingCert(false);
    }
  };
  const [showOutOfHearts, setShowOutOfHearts] = useState(false);

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
      // Check if user has hearts
      if (!user || user.current_hearts <= 0) {
        setShowOutOfHearts(true);
        return;
      }
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
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#0f0f1a] border border-[#2d2d44]">
                    {topic.icon ? (
                      <img
                        src={topic.icon}
                        alt={topic.name}
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      <Code2
                        className="w-6 h-6"
                        style={{ color: topic.accentColor }}
                      />
                    )}
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
                  <ScrollReveal key={level.level} delay={0.1 + index * 0.05}>
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
                            className={`p-2.5 border-2 bg-[#1a1a2e] ${
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
                              className="w-8 h-8 mx-auto mb-1 rounded border flex items-center justify-center text-sm font-bold"
                              style={{
                                backgroundColor: `${topic.accentColor}20`,
                                borderColor: topic.accentColor,
                                color: level.isLocked
                                  ? "#4b5563"
                                  : topic.accentColor,
                              }}
                            >
                              {level.isLocked ? (
                                <Lock className="w-4 h-4" />
                              ) : level.isCompleted ? (
                                <CheckCircle2 className="w-4 h-4" />
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
                  </ScrollReveal>
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
                  <div
                    className="p-3 border-2 bg-[#1a1a2e] flex flex-col items-center justify-center gap-2"
                    style={{
                      borderColor: isAllCompleted ? "#fbbf24" : "#2d2d44",
                    }}
                  >
                    {isAllCompleted ? (
                      <Award className="w-7 h-7" style={{ color: "#fbbf24" }} />
                    ) : (
                      <Lock className="w-6 h-6 text-gray-500" />
                    )}
                    <p
                      className="text-xs font-bold"
                      style={{
                        color: isAllCompleted ? "#fbbf24" : "#6b7280",
                      }}
                    >
                      Certificate
                    </p>
                    {isAllCompleted ? (
                      <button
                        type="button"
                        onClick={downloadCertificate}
                        disabled={downloadingCert}
                        aria-label={
                          downloadingCert
                            ? "Generating certificate"
                            : "Download certificate as PDF"
                        }
                        /* Fixed height + min-width so the spinner state can't
                           reflow the card on mobile. */
                        className="w-full text-[11px] font-semibold text-white rounded hover:opacity-90 disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-1"
                        style={{
                          background: "var(--gradient-purple)",
                          height: "32px",
                        }}
                      >
                        {downloadingCert ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <Download className="w-3 h-3" />
                            Download PDF
                          </>
                        )}
                      </button>
                    ) : (
                      <p className="text-[9px] text-gray-500 font-medium">
                        Complete all levels
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Level Modal */}
          {selectedLevel && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedLevel(null)}
            >
              <div
                className="bg-[#1a1a2e]/60 backdrop-blur-xl pixel-box p-6 max-w-xs w-full border border-[#2d2d44] shadow-2xl shadow-black/50"
                onClick={(e) => e.stopPropagation()}
              >
                {(() => {
                  const level = levels.find((l) => l.level === selectedLevel);
                  if (!level) return null;

                  return (
                    <>
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center bg-[#0f0f1a] border border-[#2d2d44]">
                          {topic.icon ? (
                            <img
                              src={topic.icon}
                              alt={topic.name}
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <Code2
                              className="w-8 h-8"
                              style={{ color: topic.accentColor }}
                            />
                          )}
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
                          className="flex-1 py-2.5 bg-[#2d2d44] text-white pixel-box font-medium hover:bg-[#3d3d5c] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={startLevel}
                          className="flex-1 py-2.5 text-white pixel-box font-medium flex items-center justify-center gap-2 cursor-pointer"
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


          {/* Out of Hearts Modal */}
          <Modal
            isOpen={showOutOfHearts}
            onClose={() => setShowOutOfHearts(false)}
          >
            {/* Broken heart icon */}
            <div className="relative w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-red-500/20">
              <Heart className="w-8 h-8 text-red-400" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-0.5 bg-red-400 rotate-45 rounded-full" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">
              Out of Hearts!
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              You&apos;ve run out of hearts. Take a short break!
            </p>

            {/* Regeneration info */}
            <div className="bg-[#0f0f1a] rounded-lg px-3 py-2 mb-4">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>
                  Regenerates 1 every{" "}
                  <span className="text-purple-400 font-medium">2 minutes</span>
                </span>
              </div>
            </div>

            <ModalButton
              onClick={() => {
                setShowOutOfHearts(false);
                setSelectedLevel(null);
              }}
            >
              Close
            </ModalButton>
          </Modal>
        </div>
      </Sidebar>
    </ProtectedRoute>
  );
}


