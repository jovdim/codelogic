"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PublicRoute } from "@/components/auth/RouteGuards";
import { authAPI } from "@/lib/api";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Check,
  X,
  ArrowLeft,
} from "lucide-react";
import { AxiosError } from "axios";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawToken = searchParams.get("token");

  // Clean the token - fix email encoding corruption
  // Email quoted-printable encoding converts "=" to "=3D" and adds "=" for line breaks
  const cleanToken = (token: string | null): string | null => {
    if (!token) return null;
    let cleaned = token;
    // Remove "3D" prefix if token starts with it (from "token=" being encoded as "token=3D")
    if (cleaned.startsWith("3D")) {
      cleaned = cleaned.substring(2);
    }
    // Remove any "=" characters that were added as soft line breaks
    cleaned = cleaned.replace(/=/g, "");
    return cleaned;
  };

  const token = cleanToken(rawToken);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordRequirements = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "Contains a number", test: (p: string) => /\d/.test(p) },
    { label: "Contains a letter", test: (p: string) => /[a-zA-Z]/.test(p) },
  ];

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidating(false);
        return;
      }

      try {
        const response = await authAPI.validateResetToken(token);
        setIsValidToken(response.data.valid);
      } catch {
        setIsValidToken(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!passwordRequirements.every((req) => req.test(newPassword))) {
      setError("Password does not meet requirements.");
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.confirmPasswordReset({
        token: token!,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      });
      setSuccess(true);
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>;
      setError(
        error.response?.data?.error || "An error occurred. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <PublicRoute>
        <AuthLayout title="Reset Password">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        </AuthLayout>
      </PublicRoute>
    );
  }

  if (!token || !isValidToken) {
    return (
      <PublicRoute>
        <AuthLayout
          title="Invalid Link"
          subtitle="This password reset link is invalid or has expired"
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/20 mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-gray-300">
              Please request a new password reset link.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/forgot-password"
                className="btn-primary inline-block"
              >
                Request New Link
              </Link>
              <Link
                href="/login"
                className="text-gray-400 hover:text-gray-300 text-sm"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </AuthLayout>
      </PublicRoute>
    );
  }

  if (success) {
    return (
      <PublicRoute>
        <AuthLayout
          title="Password Reset"
          subtitle="Your password has been changed"
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/20 mx-auto flex items-center justify-center">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-gray-300">
              Your password has been successfully reset. You can now log in with
              your new password.
            </p>
            <Link href="/login" className="btn-primary inline-block">
              Go to Login
            </Link>
          </div>
        </AuthLayout>
      </PublicRoute>
    );
  }

  return (
    <PublicRoute>
      <AuthLayout title="Reset Password" subtitle="Enter your new password">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field pl-12 pr-12"
                placeholder="Enter new password"
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
            {newPassword && (
              <div className="mt-2 space-y-1">
                {passwordRequirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {req.test(newPassword) ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-gray-500" />
                    )}
                    <span
                      className={
                        req.test(newPassword)
                          ? "text-green-400"
                          : "text-gray-500"
                      }
                    >
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pl-12 pr-12"
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showConfirmPassword ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-red-400 text-sm mt-1">
                Passwords do not match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset Password"
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
