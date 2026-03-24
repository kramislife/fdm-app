"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { AuthFormCard } from "@/components/auth/auth-form-card";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { FormInput } from "@/components/shared/form-fields";
import { formatDate } from "@/lib/utils/format";
import { AUTH_ERROR_CODES, type AuthErrorCode } from "@/lib/auth/errors";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

const AUTH_LABEL_STYLE =
  "text-xs font-bold tracking-wider uppercase text-muted-foreground";

interface LoginFormProps {
  provisionedDate?: string;
  authError?: AuthErrorCode;
}

export function LoginForm({ provisionedDate, authError }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  useEffect(() => {
    if (provisionedDate) {
      const date = formatDate(provisionedDate);
      toast.warning("Account Provisioned", {
        description: `Your account was created by our admin on ${date}. Check your email for login credentials.`,
      });
    }
  }, [provisionedDate]);

  useEffect(() => {
    if (authError === AUTH_ERROR_CODES.INVALID_GOOGLE_EMAIL) {
      toast.error("Google Sign-In Failed", {
        description:
          "Your Google account must provide a valid, verified email address.",
      });
    }
  }, [authError]);

  return (
    <div className="flex flex-col gap-5">
      <AuthFormCard
        title="Welcome back"
        description="Sign in to your community account"
        formAction={formAction}
        isPending={isPending}
        error={state.error}
        errorId={state.errorId}
        submitLabel="Sign In"
        pendingLabel="Signing in…"
      >
        <FormInput
          label="Email address"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@gmail.com"
          className="h-12"
          labelClassName={AUTH_LABEL_STYLE}
        />
        <FormInput
          label="Password"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="h-12"
          labelClassName={AUTH_LABEL_STYLE}
        />
      </AuthFormCard>

      <div className="flex items-center gap-5">
        <div className="flex-1 border-t border-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="flex-1 border-t border-border" />
      </div>

      <GoogleSignInButton />
    </div>
  );
}
