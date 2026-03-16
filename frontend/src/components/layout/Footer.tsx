"use client";

import Link from "next/link";
import { Code2 } from "lucide-react";
import { FOOTER_LINKS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer
      className="border-t py-12 mt-auto"
      style={{ borderColor: "var(--border-color)" }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img
                src="/logo/codelogic-logo.svg"
                alt="CodeLogic"
                className="w-10 h-10"
              />
              <span className="text-xl font-bold text-white">CodeLogic</span>
            </Link>
            <p className="text-sm max-w-xs" style={{ color: "var(--muted)" }}>
              Learn to code through gamified quizzes. Earn XP, maintain streaks,
              and level up your programming skills.
            </p>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "var(--muted)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Account</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.account.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "var(--muted)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="border-t pt-8 text-center text-sm"
          style={{
            borderColor: "var(--border-color)",
            color: "var(--muted)",
          }}
        >
          <p>
            &copy; {new Date().getFullYear()} CodeLogic. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
