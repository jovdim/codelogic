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
  Clock,
} from "lucide-react";

// Heart regeneration time in minutes (must match backend)
const HEART_REGEN_MINUTES = 2;

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
  const [heartRegenTime, setHeartRegenTime] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const pathname = usePathname();
  const { user, logout, isAuthenticated, refreshUser } = useAuth();

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

  // Heart regeneration timer
  useEffect(() => {
    if (!user || user.current_hearts >= user.max_hearts) {
      setHeartRegenTime(null);
      return;
    }

    let isRefreshing = false;

    const calculateTimeToNextHeart = () => {
      if (!user.last_heart_update)
        return { timeString: null, shouldRefresh: false };

      const lastUpdate = new Date(user.last_heart_update).getTime();
      const now = Date.now();
      const elapsed = now - lastUpdate;
      const regenMs = HEART_REGEN_MINUTES * 60 * 1000;

      // Check if a heart should have regenerated
      const heartsToRegen = Math.floor(elapsed / regenMs);
      if (heartsToRegen > 0) {
        return { timeString: "0:00", shouldRefresh: true };
      }

      const timeToNext = regenMs - (elapsed % regenMs);
      const minutes = Math.floor(timeToNext / 60000);
      const seconds = Math.floor((timeToNext % 60000) / 1000);

      return {
        timeString: `${minutes}:${seconds.toString().padStart(2, "0")}`,
        shouldRefresh: false,
      };
    };

    const updateTimer = async () => {
      const { timeString, shouldRefresh } = calculateTimeToNextHeart();
      setHeartRegenTime(timeString);

      // Refresh user data if a heart should have regenerated (only once)
      if (shouldRefresh && !isRefreshing) {
        isRefreshing = true;
        await refreshUser();
        // Reset after a short delay to allow state to update
        setTimeout(() => {
          isRefreshing = false;
        }, 2000);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [user, refreshUser]);

  const handleLogout = async () => {
    await logout();
    setShowLogoutConfirm(false);
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex">
      {/* Logout Confirmation Popup */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="pixel-box p-6 max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200 shadow-2xl shadow-black/50">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <LogOut className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Log Out?</h3>
              <p className="text-gray-400 text-sm">
                Are you sure you want to log out of your account?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-50 transition-all duration-300 flex flex-col
          ${isCollapsed ? "w-20" : "w-64"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--sidebar-border)",
        }}
      >
        {/* Logo */}
        <div
          className="p-4"
          style={{ borderBottom: "1px solid var(--border-color)" }}
        >
          <Link href="/" className="flex items-center gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center pixel-box shrink-0"
              style={{ background: "var(--primary)" }}
            >
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
            className={`p-4 ${isCollapsed ? "space-y-3" : ""}`}
            style={{ borderBottom: "1px solid var(--border-color)" }}
          >
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-3">
                {/* Avatar - Collapsed */}
                <div
                  className="w-10 h-10 rounded-lg overflow-hidden"
                  style={{ border: "2px solid rgba(var(--primary-rgb), 0.5)" }}
                >
                  <img
                    src={`/avatars/avatar-${user.avatar || 1}.png`}
                    alt="Avatar"
                    className="w-full h-full object-cover object-top scale-150"
                  />
                </div>
                <div
                  className="flex flex-col items-center gap-0.5"
                  title={`${user.current_hearts}/${user.max_hearts} Hearts${heartRegenTime ? ` (next in ${heartRegenTime})` : ""}`}
                >
                  <Heart
                    className="w-4 h-4"
                    style={{
                      color: "var(--heart-color)",
                      fill: "var(--heart-color)",
                    }}
                  />
                  <span className="text-white text-xs">
                    {user.current_hearts}
                  </span>
                  {heartRegenTime && (
                    <span className="text-gray-500 text-[10px]">
                      {heartRegenTime}
                    </span>
                  )}
                </div>
                <div
                  className="flex items-center gap-1"
                  title={`${user.current_streak || 1} Day Streak`}
                >
                  <Flame
                    className="w-4 h-4"
                    style={{ color: "var(--streak-color)" }}
                  />
                  <span className="text-white text-xs">
                    {user.current_streak || 1}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1"
                  title={`${user.xp} XP`}
                >
                  <Star
                    className="w-4 h-4"
                    style={{ color: "var(--xp-text)" }}
                  />
                  <span className="text-white text-xs">{user.xp}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Avatar + Username - Expanded */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-lg overflow-hidden shrink-0"
                    style={{
                      border: "2px solid rgba(var(--primary-rgb), 0.5)",
                    }}
                  >
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
                    <Heart
                      className="w-4 h-4"
                      style={{
                        color: "var(--heart-color)",
                        fill: "var(--heart-color)",
                      }}
                    />
                    <span className="text-sm" style={{ color: "var(--muted)" }}>
                      Hearts
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-medium text-sm">
                      {user.current_hearts}/{user.max_hearts}
                    </span>
                    {heartRegenTime && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{heartRegenTime}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame
                      className="w-4 h-4"
                      style={{ color: "var(--streak-color)" }}
                    />
                    <span className="text-sm" style={{ color: "var(--muted)" }}>
                      Streak
                    </span>
                  </div>
                  <span className="text-white font-medium text-sm">
                    {user.current_streak || 1}{" "}
                    {(user.current_streak || 1) === 1 ? "day" : "days"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star
                      className="w-4 h-4"
                      style={{ color: "var(--xp-text)" }}
                    />
                    <span className="text-sm" style={{ color: "var(--muted)" }}>
                      XP
                    </span>
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
                        ${isCollapsed ? "justify-center px-2" : ""}
                      `}
                      style={
                        isActive
                          ? {
                              background: "rgba(var(--primary-rgb), 0.2)",
                              color: "var(--primary-light)",
                              borderLeft: "4px solid var(--primary)",
                            }
                          : { color: "var(--muted)" }
                      }
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className={`w-5 h-5 shrink-0 ${!isActive ? "group-hover:text-white" : ""}`}
                        style={
                          isActive ? { color: "var(--primary-light)" } : {}
                        }
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
            <div
              className="my-2"
              style={{ borderTop: "1px solid var(--border-color)" }}
            />
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
                      ${isCollapsed ? "justify-center px-2" : ""}
                    `}
                    style={
                      isActive
                        ? {
                            background: "rgba(var(--primary-rgb), 0.2)",
                            color: "var(--primary-light)",
                            borderLeft: "4px solid var(--primary)",
                          }
                        : { color: "var(--muted)" }
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 ${!isActive ? "group-hover:text-white" : ""}`}
                      style={isActive ? { color: "var(--primary-light)" } : {}}
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
        <div
          className="p-4 space-y-2"
          style={{ borderTop: "1px solid var(--border-color)" }}
        >
          {isAuthenticated ? (
            <>
              <Link
                href="/settings"
                className={`flex items-center gap-3 px-3 py-3 hover:text-white hover:bg-white/5 transition-all duration-200
                  ${isCollapsed ? "justify-center px-2" : ""}
                `}
                style={
                  pathname === "/settings"
                    ? {
                        background: "rgba(var(--primary-rgb), 0.2)",
                        color: "var(--primary-light)",
                      }
                    : { color: "var(--muted)" }
                }
                title={isCollapsed ? "Settings" : undefined}
              >
                <Settings className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="font-medium">Settings</span>}
              </Link>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className={`flex items-center gap-3 px-3 py-3 transition-all duration-200 w-full
                  ${isCollapsed ? "justify-center px-2" : ""}
                `}
                style={{ color: "var(--muted)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--danger)";
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--muted)";
                  e.currentTarget.style.background = "transparent";
                }}
                title={isCollapsed ? "Logout" : undefined}
              >
                <LogOut className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="font-medium">Logout</span>}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`flex items-center gap-3 px-3 py-3 hover:text-white hover:bg-white/5 transition-all duration-200
                  ${isCollapsed ? "justify-center px-2" : ""}
                `}
                style={{ color: "var(--muted)" }}
                title={isCollapsed ? "Login" : undefined}
              >
                <Gamepad2 className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="font-medium">Login</span>}
              </Link>
            </>
          )}

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center w-full px-3 py-2 hover:text-white transition-colors"
            style={{ color: "var(--muted)" }}
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
        <header
          className="md:hidden sticky top-0 z-30 px-4 py-3 flex items-center justify-between"
          style={{
            background: "var(--card-bg)",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
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
            <div
              className="w-8 h-8 flex items-center justify-center pixel-box"
              style={{ background: "var(--primary)" }}
            >
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white">CodeLogic</span>
          </Link>
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg overflow-hidden"
                style={{ border: "2px solid rgba(var(--primary-rgb), 0.5)" }}
              >
                <img
                  src={`/avatars/avatar-${user.avatar || 1}.png`}
                  alt="Avatar"
                  className="w-full h-full object-cover object-top scale-150"
                />
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium"
              style={{ color: "var(--primary-light)" }}
            >
              Login
            </Link>
          )}
        </header>

        {/* Close button for mobile sidebar */}
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="fixed top-4 right-4 z-50 md:hidden p-2 rounded-full hover:text-white"
            style={{ background: "var(--card-bg)", color: "var(--muted)" }}
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
