"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AuthFormCard } from "@/components/auth/auth-form-card";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { formatDate } from "@/lib/format";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

interface LoginFormProps {
  provisionedDate?: string;
}

export function LoginForm({ provisionedDate }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  useEffect(() => {
    if (provisionedDate) {
      const date = formatDate(provisionedDate);
      toast.warning(
        `Your account was already created by our admin on ${date}. Check your email for your login credentials.`,
      );
    }
  }, [provisionedDate]);

  return (
    <div className="flex flex-col gap-5">
      <AuthFormCard
        title="Welcome back"
        description="Sign in to your community account."
        formAction={formAction}
        isPending={isPending}
        error={state.error}
        errorId={state.errorId}
        submitLabel="Sign In"
        pendingLabel="Signing in…"
      >
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="email"
            className="text-xs font-bold tracking-wider uppercase text-muted-foreground"
          >
            Email address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@gmail.com"
            className="h-12"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="password"
            className="text-xs font-bold tracking-wider uppercase text-muted-foreground"
          >
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="h-12"
          />
        </div>
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
