"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthFormCard } from "@/components/auth/auth-form-card";
import { setPasswordAction, type SetPasswordState } from "./actions";

const initialState: SetPasswordState = { error: null };

export default function FirstLoginPage() {
  const [state, formAction, isPending] = useActionState(
    setPasswordAction,
    initialState,
  );

  return (
    <AuthFormCard
      title="Create your Password"
      description="Welcome to the community. Please create a secure password to activate your account."
      formAction={formAction}
      isPending={isPending}
      error={state.error}
      submitLabel="Save password"
      pendingLabel="Saving password…"
      footer={
        <div className="space-y-2">
          <p>
            By saving this, you agree to our{" "}
            <button className="underline hover:text-primary transition-colors cursor-pointer">
              Community Guidelines
            </button>
          </p>
        </div>
      }
    >
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="new_password"
          className="text-xs font-bold tracking-wider uppercase text-muted-foreground"
        >
          New Password
        </Label>
        <Input
          id="new_password"
          name="new_password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="••••••••"
          className="h-12"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="confirm_password"
          className="text-xs font-bold tracking-wider uppercase text-muted-foreground"
        >
          Confirm Password
        </Label>
        <Input
          id="confirm_password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="••••••••"
          className="h-12"
        />
      </div>
    </AuthFormCard>
  );
}
