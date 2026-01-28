"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PublicRoute } from "@/components/auth/RouteGuards";
import { authAPI } from "@/lib/api";
import { Mail, Loader2, AlertCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authAPI.requestPasswordReset(email);
      setSuccess(true);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <PublicRoute>
        <AuthLayout
          title="Check Your Email"
          subtitle="Password reset link sent"
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/20 mx-auto flex items-center justify-center">
              <Mail className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-gray-300">
              If an account exists with{" "}
              <strong className="text-white">{email}</strong>, you will receive
              a password reset link shortly.
            </p>
            <p className="text-gray-400 text-sm">
              The link will expire in 1 hour.
            </p>
            <Link
              href="/login"
              className="btn-secondary inline-flex items-center gap-2 mt-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </AuthLayout>
      </PublicRoute>
    );
  }

  return (
    <PublicRoute>
      <AuthLayout
        title="Forgot Password"
        subtitle="Enter your email to reset your password"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-300 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </form>
      </AuthLayout>
    </PublicRoute>
  );
}
