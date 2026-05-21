"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/AuthContext";

// face-api evaluates `new TextEncoder()` at module load. That crashes
// Next.js's prerender step (no TextEncoder in the build worker's SSR
// environment), even for /_not-found. Loading client-side only keeps
// the dependency out of every server bundle.
const LoginFaceVerification = dynamic(() => import("./LoginFaceVerification"), {
  ssr: false,
});

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
