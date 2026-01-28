"use client";

import Link from "next/link";
import { Code2, Zap } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-12 h-12 bg-purple-600 flex items-center justify-center pixel-box">
          <Code2 className="w-7 h-7 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-white tracking-tight">
            CodeLogic
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Level up your coding
          </span>
        </div>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md pixel-box p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
          {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
        </div>
        {children}
      </div>

      {/* Footer */}
      <p className="mt-8 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} CodeLogic. All rights reserved.
      </p>
    </div>
  );
}
