"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import {
  ScrollReveal,
  ScrollProgressBar,
  ScrollToTop,
} from "@/components/ui/ScrollAnimations";
import {
  Code2,
  Mail,
  Target,
  Users,
  Rocket,
  BookOpen,
  Gamepad2,
  Trophy,
  Heart,
  Zap,
  ChevronRight,
  GraduationCap,
  Globe,
  Shield,
  Sparkles,
  Palette,
  Database,
  Layout,
  Linkedin,
  Github,
  Twitter,
} from "lucide-react";

export default function AboutPage() {
  const team = [
    {
      name: "Ayes, Kevin Jones R.",
      role: "UX/UI Designer",
      image: "/team/team-1.jpg",
      socials: { linkedin: "#", twitter: "#" },
    },
    {
      name: "Cantoria, Hanna Hazel",
      role: "Documentation lead",
      image: "/team/team-2.jpg",
      socials: { linkedin: "#", twitter: "#" },
    },
    {
      name: "Arceo, Geris Aisen D.",
      role: "Quality Assurance  ",
      image: "/team/team-3.jpg",
      socials: { linkedin: "#", github: "#", twitter: "#" },
    },
    {
      name: "Cabero, Marc Gemmerson D.",
      role: "Full Stack Developer",
      image: "/team/team-4.jpg",
      socials: { linkedin: "#", github: "#" },
    },
    {
      name: "Sierra, Ejay D.",
      role: "Research Lead",
      image: "/team/team-5.jpg",
      socials: { linkedin: "#", twitter: "#" },
    },
  ];

  const values = [
    {
      icon: GraduationCap,
      title: "Learning First",
      description:
        "Every feature is designed to help you truly understand programming concepts.",
      color: "#3b82f6",
    },
    {
      icon: Gamepad2,
      title: "Fun & Engaging",
      description:
        "Quizzes, XP, streaks, and leaderboards keep you motivated to learn more.",
      color: "#8b5cf6",
    },
    {
      icon: Globe,
      title: "Accessible",
      description:
        "Free to use, works on any device, available to learners everywhere.",
      color: "#22c55e",
    },
    {
      icon: Shield,
      title: "Quality Content",
      description:
        "Carefully crafted questions that test real programming knowledge.",
      color: "#f59e0b",
    },
  ];

  const features = [
    {
      icon: Heart,
      label: "Lives System",
      desc: "10 hearts to keep you challenged",
    },
    { icon: Zap, label: "XP & Levels", desc: "Earn points and level up" },
    { icon: Trophy, label: "Leaderboard", desc: "Compete with others" },
    {
      icon: BookOpen,
      label: "6 Topics",
      desc: "HTML, CSS, JS, Python, React, SQL",
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
                  <Users className="w-4 h-4" />
                  <span className="font-medium text-sm">About Us</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Learn to Code,{" "}
                  <span style={{ color: "var(--primary-light)" }}>
                    Level Up
                  </span>
                </h1>
                <p className="text-lg text-gray-400 max-w-xl mx-auto">
                  CodeLogic is a gamified quiz platform that makes learning
                  programming fun, engaging, and rewarding
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* What We Do */}
          <ScrollReveal animation="fade-up">
            <div className="pixel-box p-6 md:p-8 mb-16">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div
                  className="w-20 h-20 shrink-0 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(124, 58, 237, 0.15)" }}
                >
                  <Code2
                    className="w-10 h-10"
                    style={{ color: "var(--primary-light)" }}
                  />
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-xl font-bold text-white mb-2">
                    What is CodeLogic?
                  </h2>
                  <p className="text-gray-400">
                    A quiz-based learning platform where you test your
                    programming knowledge, earn XP for correct answers, maintain
                    daily streaks, and compete on leaderboards. Think of it as a
                    game where the prize is real coding skills.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Meet the Team */}
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Meet the Team
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto">
                The passionate developers behind CodeLogic
              </p>
            </div>
          </ScrollReveal>

          {/* Team Grid */}
          <div className="mb-16">
            {/* Top Row - 3 members */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {team.slice(0, 3).map((member, index) => (
                <ScrollReveal
                  key={member.name}
                  animation="fade-up"
                  delay={index * 100}
                >
                  <div className="pixel-box p-6 h-full group hover:border-purple-500/50 transition-all duration-300">
                    <div className="flex flex-col items-center text-center h-full">
                      {/* Profile Image */}
                      <div className="relative mb-4">
                        <div className="w-60 h-60 shadow-2xl  -rotate-3 overflow-hidden border-2 border-[#2d2d44] group-hover:border-purple-500/50 transition-all duration-300 bg-[#1a1a2e] rounded-lg">
                          <Image
                            src={member.image}
                            alt={member.name}
                            width={500}
                            height={500}
                            className="w-full h-full "
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-3xl font-bold text-purple-400 bg-purple-500/10">${member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}</div>`;
                            }}
                          />
                        </div>
                      </div>

                      {/* Info */}
                      <h3 className="font-bold text-white text-lg mb-1">
                        {member.name}
                      </h3>
                      <p className="text-sm text-purple-400 mb-4">
                        {member.role}
                      </p>

                      {/* Social Links - pushed to bottom */}
                      <div className="flex items-center gap-2 mt-auto">
                        {member.socials.linkedin && (
                          <a
                            href={member.socials.linkedin}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                        {member.socials.github && (
                          <a
                            href={member.socials.github}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {member.socials.twitter && (
                          <a
                            href={member.socials.twitter}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                          >
                            <Twitter className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Bottom Row - 2 members centered */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {team.slice(3, 5).map((member, index) => (
                <ScrollReveal
                  key={member.name}
                  animation="fade-up"
                  delay={(index + 3) * 100}
                >
                  <div className="pixel-box p-6 h-full group hover:border-purple-500/50 transition-all duration-300">
                    <div className="flex flex-col items-center text-center h-full">
                      {/* Profile Image */}
                      <div className="relative mb-4">
                        <div className="w-60 h-60 rounded-lg -rotate-3 shadow-2xl overflow-hidden border-2 border-[#2d2d44] group-hover:border-purple-500/50 transition-all duration-300 bg-[#1a1a2e]">
                          <Image
                            src={member.image}
                            alt={member.name}
                            width={500}
                            height={500}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-3xl font-bold text-purple-400 bg-purple-500/10">${member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}</div>`;
                            }}
                          />
                        </div>
                      </div>

                      {/* Info */}
                      <h3 className="font-bold text-white text-lg mb-1">
                        {member.name}
                      </h3>
                      <p className="text-sm text-purple-400 mb-4">
                        {member.role}
                      </p>

                      {/* Social Links - pushed to bottom */}
                      <div className="flex items-center gap-2 mt-auto">
                        {member.socials.linkedin && (
                          <a
                            href={member.socials.linkedin}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                        {member.socials.github && (
                          <a
                            href={member.socials.github}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {member.socials.twitter && (
                          <a
                            href={member.socials.twitter}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                          >
                            <Twitter className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Our Values */}
          <ScrollReveal animation="fade-up">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <Target
                className="w-6 h-6"
                style={{ color: "var(--primary-light)" }}
              />
              What We Believe
            </h2>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 gap-4 mb-16">
            {values.map((value, index) => (
              <ScrollReveal
                key={value.title}
                animation="fade-up"
                delay={index * 50}
              >
                <div className="pixel-box p-5 h-full hover:border-purple-500/40 transition-colors">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center  shrink-0"
                      style={{ background: `${value.color}20` }}
                    >
                      <value.icon
                        className="w-6 h-6"
                        style={{ color: value.color }}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">
                        {value.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Platform Features */}
          <ScrollReveal animation="fade-up">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <Sparkles
                className="w-6 h-6"
                style={{ color: "var(--primary-light)" }}
              />
              Platform Features
            </h2>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={100}>
            <div className="pixel-box p-6 md:p-8 mb-16">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {features.map((feature) => (
                  <div key={feature.label} className="text-center">
                    <div
                      className="w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(124, 58, 237, 0.15)" }}
                    >
                      <feature.icon
                        className="w-7 h-7"
                        style={{ color: "var(--primary-light)" }}
                      />
                    </div>
                    <h4 className="font-bold text-white text-sm">
                      {feature.label}
                    </h4>
                    <p className="text-gray-400 text-xs mt-1">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal animation="fade-up">
            <div className="pixel-box p-6 md:p-8 text-center">
              <Mail
                className="w-12 h-12 mx-auto mb-4"
                style={{ color: "var(--primary-light)" }}
              />
              <h3 className="text-xl font-bold text-white mb-2">
                Questions or Feedback?
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                We'd love to hear from you. Reach out anytime!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="mailto:hello@codelogic.com"
                  className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold rounded-xl transition-all hover:scale-105"
                  style={{
                    background: "var(--gradient-purple)",
                    boxShadow: "0 4px 20px rgba(124, 58, 237, 0.3)",
                  }}
                >
                  <Mail className="w-5 h-5" />
                  Contact Us
                  <ChevronRight className="w-5 h-5" />
                </a>
                <Link
                  href="/play"
                  className="inline-flex items-center gap-2 px-6 py-3 text-gray-300 font-medium rounded-xl border border-[#2d2d44] hover:border-purple-500/50 hover:text-white transition-all"
                >
                  <Gamepad2 className="w-5 h-5" />
                  Start Playing
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </Navbar>
  );
}
