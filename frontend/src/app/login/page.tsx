"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PublicRoute } from "@/components/auth/RouteGuards";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { authAPI } from "@/lib/api";
import { AxiosError } from "axios";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowResendVerification(false);
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      const error = err as AxiosError<{ error?: string; code?: string }>;
      const errorData = error.response?.data;

      if (errorData?.code === "EMAIL_NOT_VERIFIED") {
        setError(
          errorData.error || "Please verify your email before logging in.",
        );
        setShowResendVerification(true);
      } else {
        setError(errorData?.error || "Invalid email or password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await authAPI.resendVerification(email);
      setResendMessage("Verification email sent! Please check your inbox.");
      setShowResendVerification(false);
    } catch {
      setResendMessage("Failed to send verification email. Please try again.");
    }
  };

  return (
    <PublicRoute>
      <AuthLayout
        title="Welcome Back"
        subtitle="Log in to continue your coding journey"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{error}</p>
                {showResendVerification && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="text-purple-400 hover:text-purple-300 underline mt-1 text-sm"
                  >
                    Resend verification email
                  </button>
                )}
              </div>
            </div>
          )}

          {resendMessage && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3">
              {resendMessage}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email
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

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 pr-10"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Logging in...
              </>
            ) : (
              "Log In"
            )}
          </button>

          <p className="text-center text-gray-400 text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-purple-400 hover:text-purple-300"
            >
              Sign up
            </Link>
          </p>
        </form>
      </AuthLayout>
    </PublicRoute>
  );
}
