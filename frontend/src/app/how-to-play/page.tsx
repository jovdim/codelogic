"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import {
  ScrollReveal,
  ScrollProgressBar,
  ScrollToTop,
} from "@/components/ui/ScrollAnimations";
import {
  Heart,
  Flame,
  Star,
  Trophy,
  Target,
  Clock,
  Zap,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Award,
  TrendingUp,
  Gamepad2,
  Play,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileQuestion,
  Lightbulb,
  Code,
} from "lucide-react";

// FAQ Item Component
function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-[#2d2d44] last:border-b-0">
      <button
        onClick={onClick}
        className="w-full py-4 px-2 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-white font-medium pr-4">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-purple-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 pb-4" : "max-h-0"}`}
      >
        <p className="px-2 text-gray-400 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function HowToPlayPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do hearts work?",
      answer:
        "You have 10 hearts globally across all quizzes. Every wrong answer or timeout costs 1 heart. If you run out of hearts, you can't take quizzes until they regenerate. Hearts regenerate 1 every 2 minutes.",
    },
    {
      question: "What happens if I run out of time?",
      answer:
        "Each question has a 30-second timer. If time runs out, you lose 1 heart and stay on the same question. The timer resets so you can try again.",
    },
    {
      question: "How is XP calculated?",
      answer:
        "You earn 10 XP for each correct answer. Complete a quiz with all correct answers (perfect score) and earn a 50 XP bonus! Your total XP determines your level.",
    },
    {
      question: "What are streaks?",
      answer:
        "Complete at least one quiz every day to build your streak. Miss a day and it resets to zero. Longer streaks show your dedication and consistency!",
    },
    {
      question: "How do I unlock higher levels?",
      answer:
        "Each topic has multiple levels (1-15). Complete a level to unlock the next one. Start with basics and work your way up to advanced challenges.",
    },
    {
      question: "What types of questions are there?",
      answer:
        "We have 4 question types: Multiple Choice (pick the right answer), Find the Error (spot the bug in code), What's the Output (predict what code will print), and Fill in the Blank (complete the missing code).",
    },
    {
      question: "Can I redo a quiz I already completed?",
      answer:
        "Yes! You can replay any level for practice. However, your previous score and status for that level will remain unchanged - retaking won't update your record.",
    },
    {
      question: "How do I get on the leaderboard?",
      answer:
        "The leaderboard ranks players by total XP. Keep answering questions correctly and completing quizzes to climb the ranks!",
    },
  ];

  const questionTypes = [
    {
      type: "Multiple Choice",
      icon: CheckCircle2,
      description: "Pick the correct answer from 4 options",
      color: "#22c55e",
    },
    {
      type: "Find the Error",
      icon: XCircle,
      description: "Spot the bug or mistake in the code",
      color: "#ef4444",
    },
    {
      type: "What's the Output",
      icon: FileQuestion,
      description: "Predict what the code will print",
      color: "#f59e0b",
    },
    {
      type: "Fill in the Blank",
      icon: Code,
      description: "Complete the missing code snippet",
      color: "#3b82f6",
    },
  ];

  return (
    <Navbar>
      <ScrollProgressBar />
      <ScrollToTop />
      <div className="min-h-screen pb-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-[#2d2d44]">
          <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-20">
            <ScrollReveal animation="fade-up">
              <div className="text-center">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 border rounded-full mb-6"
                  style={{
                    background: "rgba(124, 58, 237, 0.15)",
                    borderColor: "rgba(124, 58, 237, 0.3)",
                    color: "var(--primary-light)",
                  }}
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span className="font-medium text-sm">Game Guide</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  How to{" "}
                  <span style={{ color: "var(--primary-light)" }}>Play</span>
                </h1>
                <p className="text-lg text-gray-400 max-w-xl mx-auto">
                  Everything you need to know about quizzes, scoring, and
                  becoming a coding champion
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Step by Step - Visual Flow */}
          <ScrollReveal animation="fade-up">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <Play
                className="w-6 h-6"
                style={{ color: "var(--primary-light)" }}
              />
              Getting Started
            </h2>
          </ScrollReveal>

          <div className="relative mb-16">
            {/* Connection line */}
            <div
              className="hidden md:block absolute left-8 top-16 bottom-16 w-0.5"
              style={{ background: "rgba(124, 58, 237, 0.3)" }}
            />

            <div className="space-y-6">
              {[
                {
                  step: "1",
                  title: "Choose a Topic",
                  desc: "Pick from HTML, CSS, JavaScript, Python, React, or SQL",
                  icon: Target,
                },
                {
                  step: "2",
                  title: "Select Your Level",
                  desc: "Start at Level 1 and unlock higher levels as you progress",
                  icon: TrendingUp,
                },
                {
                  step: "3",
                  title: "Answer Questions",
                  desc: "5-10 questions per quiz, 30 seconds each. Think fast!",
                  icon: HelpCircle,
                },
                {
                  step: "4",
                  title: "Earn XP & Climb",
                  desc: "Correct answers earn XP. Top the leaderboard!",
                  icon: Trophy,
                },
              ].map((item, index) => (
                <ScrollReveal
                  key={item.step}
                  animation="fade-right"
                  delay={index * 100}
                >
                  <div className="flex items-start gap-4 md:gap-6">
                    <div
                      className="w-16 h-16 shrink-0 pixel-box flex items-center justify-center relative z-10"
                      style={{ background: "var(--card-bg)" }}
                    >
                      <span
                        className="text-2xl font-bold"
                        style={{ color: "var(--primary-light)" }}
                      >
                        {item.step}
                      </span>
                    </div>
                    <div className="flex-1 pt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <item.icon className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-bold text-white">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Core Mechanics - Horizontal Layout */}
          <ScrollReveal animation="fade-up">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <Zap
                className="w-6 h-6"
                style={{ color: "var(--primary-light)" }}
              />
              Game Mechanics
            </h2>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={100}>
            <div className="pixel-box p-6 md:p-8 mb-16">
              <div className="grid md:grid-cols-3 gap-8 md:gap-6">
                {/* Hearts */}
                <div className="text-center">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(239, 68, 68, 0.15)" }}
                  >
                    <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    10 Hearts
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Global across all quizzes. Regenerate 1 every 2 minutes.
                  </p>
                </div>

                {/* Timer */}
                <div className="text-center">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(59, 130, 246, 0.15)" }}
                  >
                    <Clock className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    30 Seconds
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Per question. Time out = lose a heart and retry.
                  </p>
                </div>

                {/* XP */}
                <div className="text-center">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(234, 179, 8, 0.15)" }}
                  >
                    <Star className="w-8 h-8 text-yellow-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">+10 XP</h3>
                  <p className="text-gray-400 text-sm">
                    Per correct answer. Perfect quiz = +50 bonus XP.
                  </p>
                </div>
              </div>

              {/* Streak Banner */}
              <div
                className="mt-8 pt-6 border-t flex items-center justify-center gap-4"
                style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
              >
                <Flame className="w-6 h-6 text-orange-500" />
                <p className="text-gray-300">
                  <span className="text-orange-400 font-bold">
                    Daily Streaks:
                  </span>{" "}
                  Complete a quiz every day to build your streak
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Question Types */}
          <ScrollReveal animation="fade-up">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <Lightbulb
                className="w-6 h-6"
                style={{ color: "var(--primary-light)" }}
              />
              Question Types
            </h2>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {questionTypes.map((qt, index) => (
              <ScrollReveal
                key={qt.type}
                animation="fade-up"
                delay={index * 50}
              >
                <div className="pixel-box p-5 h-full flex flex-col items-center text-center hover:border-(--primary)/40 transition-colors">
                  <div
                    className="w-14 h-14 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: `${qt.color}20` }}
                  >
                    <qt.icon className="w-7 h-7" style={{ color: qt.color }} />
                  </div>
                  <h3 className="font-bold text-white mb-1">{qt.type}</h3>
                  <p className="text-gray-400 text-sm flex-1">
                    {qt.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Rewards */}
          <ScrollReveal animation="fade-up">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <Award
                className="w-6 h-6"
                style={{ color: "var(--primary-light)" }}
              />
              Rewards
            </h2>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={100}>
            <div className="flex flex-wrap justify-center gap-12 mb-16">
              <div className="text-center">
                <div
                  className="w-16 h-16 mx-auto mb-3 pixel-box flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  }}
                >
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <p className="text-white font-medium">Badges</p>
                <p className="text-gray-400 text-sm mt-1">
                  Unlock achievements
                </p>
              </div>
              <div className="text-center">
                <div
                  className="w-16 h-16 mx-auto mb-3 pixel-box flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                  }}
                >
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <p className="text-white font-medium">Leaderboard</p>
                <p className="text-gray-400 text-sm mt-1">Compete globally</p>
              </div>
            </div>
          </ScrollReveal>

          {/* FAQ Section */}
          <ScrollReveal animation="fade-up">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <HelpCircle
                className="w-6 h-6"
                style={{ color: "var(--primary-light)" }}
              />
              Frequently Asked Questions
            </h2>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={100}>
            <div className="pixel-box p-4 md:p-6 mb-16">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFAQ === index}
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                />
              ))}
            </div>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal animation="fade-up">
            <div className="pixel-box p-6 md:p-8 text-center">
              <BookOpen
                className="w-12 h-12 mx-auto mb-4"
                style={{ color: "var(--primary-light)" }}
              />
              <h3 className="text-xl font-bold text-white mb-2">
                Ready to Start?
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Jump into a quiz or brush up on concepts in our learning library
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/play"
                  className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold rounded-xl transition-all hover:scale-105"
                  style={{
                    background: "var(--gradient-purple)",
                    boxShadow: "0 4px 20px rgba(124, 58, 237, 0.3)",
                  }}
                >
                  <Gamepad2 className="w-5 h-5" />
                  Start Playing
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/learn"
                  className="inline-flex items-center gap-2 px-6 py-3 text-gray-300 font-medium rounded-xl border border-[#2d2d44] hover:border-purple-500/50 hover:text-white transition-all"
                >
                  <BookOpen className="w-5 h-5" />
                  Browse Learning
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </Navbar>
  );
}
