"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Code2,
  Home,
  BookOpen,
  Trophy,
  HelpCircle,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Heart,
  Flame,
  Star,
  Menu,
  X,
  Gamepad2,
  Play,
  Award,
} from "lucide-react";

interface SidebarProps {
  children: React.ReactNode;
}

// Nav items that require authentication
const authNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/play", label: "Play", icon: Play },
  { href: "/certificates", label: "Certificates", icon: Award },
];

// Public nav items
const publicNavItems = [
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/how-to-play", label: "How to Play", icon: HelpCircle },
  { href: "/about", label: "About Us", icon: Users },
];

export default function Sidebar({ children }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-[#1a1a2e] border-r border-[#2d2d44] z-50 transition-all duration-300 flex flex-col
          ${isCollapsed ? "w-20" : "w-64"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="p-4 border-b border-[#2d2d44]">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 flex items-center justify-center pixel-box flex-shrink-0">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold text-white">CodeLogic</span>
            )}
          </Link>
        </div>

        {/* User Stats (if logged in) */}
        {isAuthenticated && user && (
          <div
            className={`p-4 border-b border-[#2d2d44] ${isCollapsed ? "space-y-3" : ""}`}
          >
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-3">
                {/* Avatar - Collapsed */}
                <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-purple-500/50">
                  <img
                    src={`/avatars/avatar-${user.avatar || 1}.png`}
                    alt="Avatar"
                    className="w-full h-full object-cover object-top scale-150"
                  />
                </div>
                <div
                  className="flex items-center gap-1"
                  title={`${user.current_hearts}/${user.max_hearts} Hearts`}
                >
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  <span className="text-white text-xs">
                    {user.current_hearts}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1"
                  title={`${user.current_streak} Day Streak`}
                >
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-white text-xs">
                    {user.current_streak}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1"
                  title={`${user.xp} XP`}
                >
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-white text-xs">{user.xp}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Avatar + Username - Expanded */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-purple-500/50 flex-shrink-0">
                    <img
                      src={`/avatars/avatar-${user.avatar || 1}.png`}
                      alt="Avatar"
                      className="w-full h-full object-cover object-top scale-150"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {user.display_name || user.username}
                    </p>
                    <p className="text-gray-400 text-sm truncate">
                      @{user.username}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    <span className="text-gray-400 text-sm">Hearts</span>
                  </div>
                  <span className="text-white font-medium text-sm">
                    {user.current_hearts}/{user.max_hearts}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-400 text-sm">Streak</span>
                  </div>
                  <span className="text-white font-medium text-sm">
                    {user.current_streak} days
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-400 text-sm">XP</span>
                  </div>
                  <span className="text-white font-medium text-sm">
                    {user.xp}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {/* Authenticated Nav Items */}
          {isAuthenticated && (
            <ul className="space-y-2 mb-4">
              {authNavItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-3 transition-all duration-200 group
                        ${
                          isActive
                            ? "bg-purple-500/20 text-purple-400 border-l-4 border-purple-500"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }
                        ${isCollapsed ? "justify-center px-2" : ""}
                      `}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className={`w-5 h-5 shrink-0 ${isActive ? "text-purple-400" : "group-hover:text-white"}`}
                      />
                      {!isCollapsed && (
                        <span className="font-medium">{item.label}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Divider */}
          {isAuthenticated && (
            <div className="border-t border-[#2d2d44] my-2" />
          )}

          {/* Public Nav Items */}
          <ul className="space-y-2">
            {publicNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-3 transition-all duration-200 group
                      ${
                        isActive
                          ? "bg-purple-500/20 text-purple-400 border-l-4 border-purple-500"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }
                      ${isCollapsed ? "justify-center px-2" : ""}
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 ${isActive ? "text-purple-400" : "group-hover:text-white"}`}
                    />
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-[#2d2d44] space-y-2">
          {isAuthenticated ? (
            <>
              <Link
                href="/settings"
                className={`flex items-center gap-3 px-3 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200
                  ${isCollapsed ? "justify-center px-2" : ""}
                  ${pathname === "/settings" ? "bg-purple-500/20 text-purple-400" : ""}
                `}
                title={isCollapsed ? "Settings" : undefined}
              >
                <Settings className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="font-medium">Settings</span>}
              </Link>
              <button
                onClick={handleLogout}
                className={`flex items-center gap-3 px-3 py-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full
                  ${isCollapsed ? "justify-center px-2" : ""}
                `}
                title={isCollapsed ? "Logout" : undefined}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">Logout</span>}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`flex items-center gap-3 px-3 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200
                  ${isCollapsed ? "justify-center px-2" : ""}
                `}
                title={isCollapsed ? "Login" : undefined}
              >
                <Gamepad2 className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">Login</span>}
              </Link>
            </>
          )}

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center w-full px-3 py-2 text-gray-500 hover:text-white transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="ml-2 text-sm">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-30 bg-[#1a1a2e] border-b border-[#2d2d44] px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link
            href={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-purple-600 flex items-center justify-center pixel-box">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white">CodeLogic</span>
          </Link>
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden border-2 border-purple-500/50">
                <img
                  src={`/avatars/avatar-${user.avatar || 1}.png`}
                  alt="Avatar"
                  className="w-full h-full object-cover object-top scale-150"
                />
              </div>
            </div>
          ) : (
            <Link href="/login" className="text-purple-400 text-sm font-medium">
              Login
            </Link>
          )}
        </header>

        {/* Close button for mobile sidebar */}
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="fixed top-4 right-4 z-50 md:hidden p-2 bg-[#1a1a2e] rounded-full text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
