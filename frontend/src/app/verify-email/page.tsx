"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { authAPI } from "@/lib/api";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";

function VerifyEmailContent() {
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

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No verification token provided.");
        return;
      }

      try {
        const response = await authAPI.verifyEmail(token);
        setStatus("success");
        setMessage(response.data.message);
      } catch (err: unknown) {
        setStatus("error");
        const error = err as { response?: { data?: { error?: string } } };
        setMessage(
          error.response?.data?.error ||
            "Verification failed. The link may have expired.",
        );
      }
    };

    verifyEmail();
  }, [token]);

  if (status === "loading") {
    return (
      <AuthLayout title="Verifying Email">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto" />
          <p className="text-gray-300">Verifying your email address...</p>
        </div>
      </AuthLayout>
    );
  }

  if (status === "success") {
    return (
      <AuthLayout title="Email Verified" subtitle="Your account is now active">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-500/20 mx-auto flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-gray-300">{message}</p>
          <Link href="/login" className="btn-primary inline-block">
            Continue to Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Verification Failed"
      subtitle="Unable to verify your email"
    >
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-red-500/20 mx-auto flex items-center justify-center">
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-gray-300">{message}</p>
        <div className="space-y-2">
          <Link href="/login" className="btn-primary inline-block w-full">
            Go to Login
          </Link>
          <p className="text-gray-400 text-sm">
            Need a new verification link?{" "}
            <Link
              href="/register"
              className="text-purple-400 hover:text-purple-300"
            >
              Register again
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
