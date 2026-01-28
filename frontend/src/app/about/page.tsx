"use client";

import Navbar from "@/components/layout/Navbar";
import {
  Code2,
  Github,
  Linkedin,
  Mail,
  Heart,
  Target,
  Users,
  Sparkles,
} from "lucide-react";

// Team members data
const teamMembers = [
  {
    name: "Alex Johnson",
    role: "Project Lead & Full-Stack Developer",
    bio: "Passionate about creating educational technology that makes learning fun and accessible for everyone.",
    avatar: "AJ",
    color: "from-purple-500 to-pink-500",
    github: "#",
    linkedin: "#",
    email: "alex@codelogic.com",
  },
  {
    name: "Sarah Chen",
    role: "Frontend Developer",
    bio: "UI/UX enthusiast who loves pixel art and creating delightful user experiences.",
    avatar: "SC",
    color: "from-blue-500 to-cyan-500",
    github: "#",
    linkedin: "#",
    email: "sarah@codelogic.com",
  },
  {
    name: "Marcus Williams",
    role: "Backend Developer",
    bio: "Systems architect with a focus on building scalable and reliable backend solutions.",
    avatar: "MW",
    color: "from-green-500 to-teal-500",
    github: "#",
    linkedin: "#",
    email: "marcus@codelogic.com",
  },
  {
    name: "Emily Rodriguez",
    role: "Content Creator",
    bio: "Technical writer and educator dedicated to making complex topics easy to understand.",
    avatar: "ER",
    color: "from-yellow-500 to-orange-500",
    github: "#",
    linkedin: "#",
    email: "emily@codelogic.com",
  },
  {
    name: "David Kim",
    role: "Game Designer",
    bio: "Game enthusiast who designs engaging quiz mechanics and progression systems.",
    avatar: "DK",
    color: "from-red-500 to-pink-500",
    github: "#",
    linkedin: "#",
    email: "david@codelogic.com",
  },
  {
    name: "Lisa Thompson",
    role: "Quality Assurance",
    bio: "Detail-oriented tester ensuring every feature works flawlessly for our users.",
    avatar: "LT",
    color: "from-indigo-500 to-purple-500",
    github: "#",
    linkedin: "#",
    email: "lisa@codelogic.com",
  },
];

export default function AboutPage() {
  return (
    <Navbar>
      <div className="min-h-screen pb-8">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-purple-600 mx-auto mb-6 flex items-center justify-center pixel-box">
              <Code2 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to <span className="text-purple-400">CodeLogic</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              We&apos;re on a mission to make learning programming fun,
              engaging, and accessible to everyone through gamification.
            </p>
          </div>

          {/* Mission Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="pixel-box p-6 text-center">
              <div className="w-14 h-14 bg-purple-500/20 mx-auto mb-4 flex items-center justify-center">
                <Target className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Our Mission</h3>
              <p className="text-gray-400 text-sm">
                To revolutionize programming education by combining the thrill
                of gaming with the power of structured learning.
              </p>
            </div>

            <div className="pixel-box p-6 text-center">
              <div className="w-14 h-14 bg-pink-500/20 mx-auto mb-4 flex items-center justify-center">
                <Heart className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Our Values</h3>
              <p className="text-gray-400 text-sm">
                We believe in accessibility, continuous improvement, and
                creating a supportive community for learners worldwide.
              </p>
            </div>

            <div className="pixel-box p-6 text-center">
              <div className="w-14 h-14 bg-cyan-500/20 mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Our Vision</h3>
              <p className="text-gray-400 text-sm">
                To become the go-to platform for anyone looking to learn
                programming through an engaging, game-like experience.
              </p>
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Meet Our Team</h2>
              </div>
              <p className="text-gray-400">
                The passionate people behind CodeLogic
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="pixel-box p-6 hover:border-purple-500/50 transition-colors group"
                >
                  {/* Avatar */}
                  <div
                    className={`w-20 h-20 bg-gradient-to-br ${member.color} mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white`}
                  >
                    {member.avatar}
                  </div>

                  {/* Info */}
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-purple-400 text-sm font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-gray-400 text-sm mb-4">{member.bio}</p>

                    {/* Social Links */}
                    <div className="flex justify-center gap-3">
                      <a
                        href={member.github}
                        className="w-8 h-8 bg-[#0f0f1a] flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-500/20 transition-colors"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                      <a
                        href={member.linkedin}
                        className="w-8 h-8 bg-[#0f0f1a] flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-500/20 transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                      <a
                        href={`mailto:${member.email}`}
                        className="w-8 h-8 bg-[#0f0f1a] flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-500/20 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="pixel-box p-8 mb-16">
            <h2 className="text-xl font-bold text-white text-center mb-8">
              Our Impact
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">10K+</p>
                <p className="text-gray-400 text-sm">Active Learners</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">500+</p>
                <p className="text-gray-400 text-sm">Quiz Questions</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">8</p>
                <p className="text-gray-400 text-sm">Programming Languages</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">95%</p>
                <p className="text-gray-400 text-sm">Satisfaction Rate</p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="pixel-box p-8 text-center border-purple-500/30 bg-purple-500/5">
            <h2 className="text-xl font-bold text-white mb-2">Get in Touch</h2>
            <p className="text-gray-400 mb-4">
              Have questions or suggestions? We&apos;d love to hear from you!
            </p>
            <a
              href="mailto:hello@codelogic.com"
              className="btn-primary px-6 py-3 inline-flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </Navbar>
  );
}
