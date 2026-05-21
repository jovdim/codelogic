"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoginFaceVerification from "./LoginFaceVerification";

/**
 * Renders the post-login face-verification modal whenever the auth state
 * says the current user (a student) hasn't passed face verification this
 * tab session. Cancel and 3-strike-out both call logout() and bounce the
 * user back to the public landing page.
 */
export default function FaceVerificationGate() {
  const router = useRouter();
  const { needsFaceVerification, markFaceVerified, logout } = useAuth();

  const bounceToHome = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <LoginFaceVerification
      open={needsFaceVerification}
      onSuccess={markFaceVerified}
      onAllAttemptsFailed={bounceToHome}
      onCancel={bounceToHome}
    />
  );
}
