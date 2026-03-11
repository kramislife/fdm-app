"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthFormCardProps {
  title: string;
  description?: string;
  formAction: (formData: FormData) => void;
  isPending: boolean;
  error: string | null;
  submitLabel: string;
  pendingLabel: string;
  children: React.ReactNode;
}

export function AuthFormCard({
  title,
  description,
  formAction,
  isPending,
  error,
  submitLabel,
  pendingLabel,
  children,
}: AuthFormCardProps) {
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg lg:text-xl">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-xs md:text-sm">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-3">
          {children}
          <Button
            type="submit"
            disabled={isPending}
            className="cursor-pointer"
          >
            {isPending ? pendingLabel : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
