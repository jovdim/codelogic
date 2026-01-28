"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Code2,
  BookOpen,
  Trophy,
  HelpCircle,
  Users,
  Menu,
  X,
  ArrowRight,
  Gamepad2,
  ChevronRight,
  Flame,
  Zap,
} from "lucide-react";

interface NavbarProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/how-to-play", label: "How to Play", icon: HelpCircle },
  { href: "/about", label: "About", icon: Users },
];

export default function Navbar({ children }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#2d2d44] bg-[#0f0f1a]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center pixel-box group-hover:scale-105 transition-transform">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white">CodeLogic</span>
              <span className="text-[10px] text-purple-400 -mt-1">
                Level Up Your Code
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm ${
                    isActive
                      ? "bg-purple-500/20 text-purple-400"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth Buttons / User Info */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="w-20 h-10 bg-[#1a1a2e] animate-pulse rounded-lg" />
            ) : isAuthenticated && user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-lg hover:border-purple-500 transition-all group"
              >
                <div className="flex items-center gap-2 text-sm">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-orange-400">
                    {user.current_streak || 0}
                  </span>
                </div>
                <div className="w-px h-4 bg-[#2d2d44]" />
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-400">{user.xp || 0}</span>
                </div>
                <div className="w-px h-4 bg-[#2d2d44]" />
                <span className="text-white font-medium group-hover:text-purple-400 transition-colors">
                  {user.display_name || user.username}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-500 hover:to-purple-600 transition-all flex items-center gap-2 group"
                >
                  <Gamepad2 className="w-4 h-4" />
                  Start Playing
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#2d2d44] bg-[#0f0f1a] px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-purple-500/20 text-purple-400"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-4 h-4 inline mr-2" />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-4 border-t border-[#2d2d44] flex gap-3">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="flex-1 btn-primary text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex-1 btn-secondary text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 btn-primary text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative">{children}</main>
    </div>
  );
}
