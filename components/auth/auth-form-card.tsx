"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { Logo } from "@/components/ui/logo";

interface AuthFormCardProps {
  title: string;
  description?: string;
  subtitle?: string;
  formAction: (formData: FormData) => void;
  isPending: boolean;
  error: string | null;
  errorId?: number;
  submitLabel: string;
  pendingLabel: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function AuthFormCard({
  title,
  description,
  subtitle = "MEMBER'S PORTAL",
  formAction,
  isPending,
  error,
  errorId,
  submitLabel,
  pendingLabel,
  footer,
  children,
}: AuthFormCardProps) {
  useEffect(() => {
    if (error) {
      toast.error("Action failed", {
        description: error,
      });
    }
    // errorId changes on every new error — guarantees the toast fires even
    // when the same message is returned on consecutive attempts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorId]);

  return (
    <div className="flex flex-col">
      <div className="mb-10 flex flex-col gap-2">
        <Logo
          size="w-48"
          className="mb-5 self-center"
          title="Navigate to Homepage"
        />
        <p className="text-xs font-bold tracking-wide text-primary uppercase">
          {subtitle}
        </p>
        <h2 className="font-serif text-5xl font-extrabold">{title}</h2>
        {description && (
          <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-5">{children}</div>

        <Button type="submit" disabled={isPending} className="h-12">
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loading size="sm" variant="white" />
              {pendingLabel}
            </span>
          ) : (
            submitLabel
          )}
        </Button>
      </form>

      {footer && (
        <div className="mt-3 text-center text-xs text-muted-foreground leading-relaxed italic">
          {footer}
        </div>
      )}
    </div>
  );
}
