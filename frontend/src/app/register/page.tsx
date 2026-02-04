"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PublicRoute } from "@/components/auth/RouteGuards";
import { authAPI } from "@/lib/api";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { AxiosError } from "axios";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState(false);

  // Validation states
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Password requirements
  const passwordRequirements = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "Contains a number", test: (p: string) => /\d/.test(p) },
    { label: "Contains a letter", test: (p: string) => /[a-zA-Z]/.test(p) },
  ];

  // Check username availability with debounce
  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const response = await authAPI.checkUsername(username);
        setUsernameAvailable(response.data.available);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  // Check email availability with debounce
  useEffect(() => {
    if (!email || !email.includes("@")) {
      setEmailAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingEmail(true);
      try {
        const response = await authAPI.checkEmail(email);
        setEmailAvailable(response.data.available);
      } catch {
        setEmailAvailable(null);
      } finally {
        setCheckingEmail(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Client-side validation
    const newErrors: Record<string, string[]> = {};

    if (password !== passwordConfirm) {
      newErrors.password_confirm = ["Passwords do not match"];
    }

    if (!passwordRequirements.every((req) => req.test(password))) {
      newErrors.password = ["Password does not meet requirements"];
    }

    if (usernameAvailable === false) {
      newErrors.username = ["Username is already taken"];
    }

    if (emailAvailable === false) {
      newErrors.email = ["Email is already registered"];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      await register(email, username, password, passwordConfirm);
      setSuccess(true);
    } catch (err) {
      const error = err as AxiosError<Record<string, string[]>>;
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: ["An error occurred. Please try again."] });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <PublicRoute>
        <AuthLayout
          title="Check Your Email"
          subtitle="We sent you a verification link"
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/20 mx-auto flex items-center justify-center">
              <Mail className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-gray-300">
              We&apos;ve sent a verification email to{" "}
              <strong className="text-white">{email}</strong>. Please click the
              link in the email to verify your account.
            </p>
            <p className="text-gray-400 text-sm">
              Did not receive the email? Check your spam folder or{" "}
              <button
                onClick={async () => {
                  try {
                    await authAPI.resendVerification(email);
                    alert("Verification email resent!");
                  } catch {
                    alert("Failed to resend email. Please try again.");
                  }
                }}
                className="underline hover:opacity-80"
                style={{ color: "var(--primary-light)" }}
              >
                resend it
              </button>
            </p>
            <Link href="/login" className="btn-secondary inline-block mt-4">
              Go to Login
            </Link>
          </div>
        </AuthLayout>
      </PublicRoute>
    );
  }

  return (
    <PublicRoute>
      <AuthLayout
        title="Create Account"
        subtitle="Start your coding adventure today"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{errors.general[0]}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`input-field pl-12 pr-12 ${
                  errors.email
                    ? "border-red-500"
                    : emailAvailable === true
                      ? "border-green-500"
                      : ""
                }`}
                placeholder="you@example.com"
                required
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {checkingEmail ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                ) : emailAvailable === true ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : emailAvailable === false ? (
                  <X className="w-5 h-5 text-red-500" />
                ) : null}
              </div>
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email[0]}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Username
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`input-field pl-12 pr-12 ${
                  errors.username
                    ? "border-red-500"
                    : usernameAvailable === true
                      ? "border-green-500"
                      : ""
                }`}
                placeholder="Choose a username"
                minLength={3}
                required
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {checkingUsername ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                ) : usernameAvailable === true ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : usernameAvailable === false ? (
                  <X className="w-5 h-5 text-red-500" />
                ) : null}
              </div>
            </div>
            {errors.username && (
              <p className="text-red-400 text-sm mt-1">{errors.username[0]}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`input-field pl-12 pr-12 ${errors.password ? "border-red-500" : ""}`}
                placeholder="Create a password"
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
            {password && (
              <div className="mt-2 space-y-1">
                {passwordRequirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {req.test(password) ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-gray-500" />
                    )}
                    <span
                      className={
                        req.test(password) ? "text-green-400" : "text-gray-500"
                      }
                    >
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password[0]}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="passwordConfirm"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                id="passwordConfirm"
                type={showPasswordConfirm ? "text" : "password"}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className={`input-field pl-12 pr-12 ${errors.password_confirm ? "border-red-500" : ""}`}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPasswordConfirm ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>
            {passwordConfirm && password !== passwordConfirm && (
              <p className="text-red-400 text-sm mt-1">
                Passwords do not match
              </p>
            )}
            {errors.password_confirm && (
              <p className="text-red-400 text-sm mt-1">
                {errors.password_confirm[0]}
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
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>

          <p className="text-center text-gray-400 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="hover:opacity-80"
              style={{ color: "var(--primary-light)" }}
            >
              Log in
            </Link>
          </p>
        </form>
      </AuthLayout>
    </PublicRoute>
  );
}
