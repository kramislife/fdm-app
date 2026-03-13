"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthFormCard } from "@/components/auth/auth-form-card";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <AuthFormCard
      title="Welcome back"
      description="Sign in to your community account."
      formAction={formAction}
      isPending={isPending}
      error={state.error}
      submitLabel="Sign In"
      pendingLabel="Signing in…"
      footer={
        <div className="space-y-2">
          <p>First time logging in? Check your email for your invitation.</p>
        </div>
      }
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
  );
}
