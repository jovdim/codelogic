"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { X, Gamepad2, Mail, Lock, ArrowRight } from "lucide-react";

interface LoginOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function LoginOverlay({
  isOpen,
  onClose,
  message = "Please log in to access this content",
}: LoginOverlayProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md pixel-box bg-[#1a1a2e] p-6 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-600 mx-auto mb-4 flex items-center justify-center pixel-box">
            <Gamepad2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            🔒 Login Required
          </h2>
          <p className="text-gray-400">{message}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Quick Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-[#2d2d44] px-4 py-3 pl-10 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-[#2d2d44] px-4 py-3 pl-10 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Login & Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[#2d2d44]" />
          <span className="text-gray-500 text-sm">or</span>
          <div className="flex-1 h-px bg-[#2d2d44]" />
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-gray-400 mb-3">Don&apos;t have an account?</p>
          <Link
            href="/register"
            className="btn-secondary inline-flex items-center gap-2 px-6 py-2"
          >
            Create Account
          </Link>
        </div>

        {/* Benefits */}
        <div className="mt-6 pt-6 border-t border-[#2d2d44]">
          <p className="text-gray-500 text-xs text-center">
            ✨ Free access to all learning resources • 🎮 Track your progress •
            🏆 Compete on leaderboards
          </p>
        </div>
      </div>
    </div>
  );
}
