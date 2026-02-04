"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "./Footer";
import { NAV_ITEMS } from "@/lib/constants";
import {
  Code2,
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

export default function Navbar({ children }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navbar */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-sm"
        style={{
          borderColor: "var(--navbar-border)",
          background: "var(--navbar-bg)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div
              className="w-10 h-10 flex items-center justify-center pixel-box group-hover:scale-105 transition-transform"
              style={{ background: "var(--gradient-purple)" }}
            >
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white">CodeLogic</span>
              <span
                className="text-[10px] -mt-1"
                style={{ color: "var(--primary-light)" }}
              >
                Test your coding skills
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm ${
                    isActive
                      ? "text-primary"
                      : "hover:text-white hover:bg-white/5"
                  }`}
                  style={
                    isActive
                      ? {
                          background: "rgba(var(--primary-rgb), 0.2)",
                          color: "var(--primary-light)",
                        }
                      : { color: "var(--muted)" }
                  }
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
              <div
                className="w-20 h-10 animate-pulse rounded-lg"
                style={{ background: "var(--card-bg)" }}
              />
            ) : isAuthenticated && user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all group"
                style={{
                  background:
                    "linear-gradient(to right, rgba(var(--primary-rgb), 0.2), rgba(var(--primary-rgb), 0.1))",
                  border: "1px solid rgba(var(--primary-rgb), 0.3)",
                }}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-lg overflow-hidden"
                  style={{ border: "1px solid rgba(var(--primary-rgb), 0.5)" }}
                >
                  <img
                    src={`/avatars/avatar-${user.avatar || 1}.png`}
                    alt="Avatar"
                    className="w-full h-full object-cover object-top scale-150"
                  />
                </div>
                <div
                  className="w-px h-4"
                  style={{ background: "var(--border-color)" }}
                />
                <div className="flex items-center gap-2 text-sm">
                  <Flame
                    className="w-4 h-4"
                    style={{ color: "var(--streak-color)" }}
                  />
                  <span style={{ color: "var(--streak-color)" }}>
                    {Math.max(user.current_streak || 0, 1)}
                  </span>
                </div>
                <div
                  className="w-px h-4"
                  style={{ background: "var(--border-color)" }}
                />
                <div className="flex items-center gap-2 text-sm">
                  <Zap
                    className="w-4 h-4"
                    style={{ color: "var(--xp-text)" }}
                  />
                  <span style={{ color: "var(--xp-text)" }}>
                    {user.xp || 0}
                  </span>
                </div>
                <div
                  className="w-px h-4"
                  style={{ background: "var(--border-color)" }}
                />
                <span
                  className="text-white font-medium transition-colors"
                  style={{ "--tw-text-opacity": 1 } as React.CSSProperties}
                >
                  {user.display_name || user.username}
                </span>
                <ChevronRight
                  className="w-4 h-4 group-hover:translate-x-1 transition-all"
                  style={{ color: "var(--muted)" }}
                />
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
                  className="px-5 py-2 text-white font-medium rounded-lg transition-all flex items-center gap-2 group hover:opacity-90"
                  style={{ background: "var(--gradient-purple)" }}
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
          <div
            className="md:hidden border-t px-4 py-4 space-y-2"
            style={{
              borderColor: "var(--border-color)",
              background: "var(--background)",
            }}
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-3 rounded-lg transition-all ${
                    isActive ? "" : "hover:text-white hover:bg-white/5"
                  }`}
                  style={
                    isActive
                      ? {
                          background: "rgba(var(--primary-rgb), 0.2)",
                          color: "var(--primary-light)",
                        }
                      : { color: "var(--muted)" }
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-4 h-4 inline mr-2" />
                  {item.label}
                </Link>
              );
            })}
            <div
              className="pt-4 border-t flex gap-3"
              style={{ borderColor: "var(--border-color)" }}
            >
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
      <main className="relative flex-1">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
