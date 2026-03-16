"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  X,
  Code2,
  Zap,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
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
      const error = err as {
        response?: { data?: { detail?: string; error?: string } };
      };
      setError(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          "Invalid email or password",
      );
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
      <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <img
            src="/logo/codelogic-logo.svg"
            alt="CodeLogic"
            className="w-12 h-12"
          />
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white tracking-tight">
              CodeLogic
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Test your coding skills
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="pixel-box p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400 text-sm">{message}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 mb-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12 pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                onClick={onClose}
                className="text-sm hover:opacity-80"
                style={{ color: "var(--primary-light)" }}
              >
                Forgot password?
              </Link>
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
            <div
              className="flex-1 h-px"
              style={{ background: "var(--border-color)" }}
            />
            <span className="text-gray-500 text-sm">or</span>
            <div
              className="flex-1 h-px"
              style={{ background: "var(--border-color)" }}
            />
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-400 mb-3">Don&apos;t have an account?</p>
            <Link
              href="/register"
              onClick={onClose}
              className="btn-secondary inline-flex items-center gap-2 px-6 py-2"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
