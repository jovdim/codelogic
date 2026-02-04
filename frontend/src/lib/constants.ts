import { BookOpen, Trophy, HelpCircle, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/how-to-play", label: "How to Play", icon: HelpCircle },
  { href: "/about", label: "About", icon: Users },
];

export const FOOTER_LINKS = {
  quickLinks: [
    { href: "/how-to-play", label: "How to Play" },
    { href: "/learn", label: "Learn" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/about", label: "About Us" },
  ],
  account: [
    { href: "/login", label: "Login" },
    { href: "/register", label: "Register" },
    { href: "/forgot-password", label: "Reset Password" },
  ],
};

export const PLATFORM_STATS = [
  { label: "Quiz Topics", value: 50, suffix: "+" },
  { label: "Quiz Questions", value: 500, suffix: "+" },
  { label: "Languages", value: 9, suffix: "" },
  { label: "Free Forever", value: 100, suffix: "%" },
];

export const TYPEWRITER_WORDS = [
  "Coding Skills",
  "Python Skills",
  "SQL Skills",
  "React Skills",
  "CSS Mastery",
  "HTML Skills",
];
