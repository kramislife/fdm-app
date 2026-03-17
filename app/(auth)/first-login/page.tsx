"use client";

import { useActionState } from "react";
import { AuthFormCard } from "@/components/auth/auth-form-card";
import { FormInput } from "@/components/shared/form-fields";
import { setPasswordAction, type SetPasswordState } from "./actions";

const initialState: SetPasswordState = { error: null };

const AUTH_LABEL_STYLE =
  "text-xs font-bold tracking-wider uppercase text-muted-foreground";

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
      errorId={state.errorId}
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
      <FormInput
        label="New Password"
        id="new_password"
        name="new_password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        placeholder="••••••••"
        className="h-12"
        labelClassName={AUTH_LABEL_STYLE}
      />
      <FormInput
        label="Confirm Password"
        id="confirm_password"
        name="confirm_password"
        type="password"
        autoComplete="new-password"
        required
        placeholder="••••••••"
        className="h-12"
        labelClassName={AUTH_LABEL_STYLE}
      />
    </AuthFormCard>
  );
}
