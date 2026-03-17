"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";

import { signInWithGoogle } from "@/app/(auth)/login/actions";

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    setLoading(true);
    await signInWithGoogle();
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="h-12 w-full cursor-pointer bg-white hover:bg-gray-50"
    >
      {loading ? (
        <Loading size="sm" variant="primary" text="Signing in..." />
      ) : (
        <span className="flex items-center gap-3">
          <FcGoogle />
          Continue with Google
        </span>
      )}
    </Button>
  );
}
