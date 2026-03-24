"use client";

import { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { FaHome } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaCheck, FaLock, FaUserCircle } from "react-icons/fa";
import { cn } from "@/lib/utils/utils";
import { FormInput } from "@/components/shared/form-fields";
import { Loading } from "@/components/ui/loading";
import { Logo } from "@/components/ui/logo";
import { completeFirstLogin } from "@/lib/auth/onboarding-actions";

const AUTH_LABEL_STYLE =
  "text-xs font-bold tracking-wider uppercase text-muted-foreground";

interface OnboardingModalProps {
  firstName: string;
  defaultOpen: boolean;
}

type Step = 1 | 2 | 3;

export function OnboardingModal({ firstName, defaultOpen }: OnboardingModalProps) {
  const router = useRouter();

  // Initialized once from prop — React does NOT reinitialize on re-render,
  // so even after the server auto-refresh sets defaultOpen=false the modal stays open.
  const [open, setOpen] = useState(defaultOpen);

  const [step, setStep] = useState<Step>(1);
  const [isExiting, setIsExiting] = useState(false);

  // Step 2 state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  // Step 3 countdown
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    console.log("[OnboardingModal] mount — defaultOpen:", defaultOpen);
    return () => console.log("[OnboardingModal] UNMOUNT");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Password requirements
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const allRequirementsMet = hasMinLength && hasUppercase && hasNumber;
  const passwordsMatch = newPassword === confirmPassword;
  const canSubmit =
    allRequirementsMet && passwordsMatch && confirmPassword.length > 0;

  // Countdown tick — pure state, no side effects
  useEffect(() => {
    if (step !== 3) return;
    if (countdown <= 0) return;
    console.log("[OnboardingModal] countdown tick:", countdown);
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, countdown]);

  // Navigate only after countdown reaches zero
  useEffect(() => {
    if (step !== 3 || countdown > 0) return;
    console.log("[OnboardingModal] countdown done — closing and refreshing");
    setOpen(false);
    router.refresh();
  }, [step, countdown, router]);

  function goToStep(next: Step) {
    setIsExiting(true);
    setTimeout(() => {
      setStep(next);
      setIsExiting(false);
    }, 300);
  }

  function handleSetPassword() {
    startTransition(async () => {
      const result = await completeFirstLogin(newPassword);
      if (!result.success) {
        toast.error("Action failed", {
          description: result.error,
        });
        return;
      }
      // Database is now updated (is_temp_password: false).
      // But we stay on Step 3 because of our local client state!
      goToStep(3);
    });
  }

  function handleCloseAndNavigate(path?: string) {
    setOpen(false);
    if (path) {
      router.push(path);
    } else {
      router.refresh();
    }
  }

  // ── Sub-components ────────────────────────────────────────────────────────

  function RequirementRow({ met, label }: { met: boolean; label: string }) {
    return (
      <div className="flex items-center gap-2 transition-all duration-300">
        <span
          className={cn(
            "shrink-0 flex items-center justify-center w-4 h-4 rounded-full transition-all duration-300",
            met ? "bg-green-500 text-white" : "border border-border",
          )}
        >
          {met && <FaCheck className="w-2.5 h-2.5" />}
        </span>
        <span
          className={cn(
            "text-sm transition-colors duration-300",
            met ? "text-green-600 font-medium" : "text-muted-foreground",
          )}
        >
          {label}
        </span>
      </div>
    );
  }

  function ActionCard({
    onClick,
    icon: Icon,
    title,
    description,
    className,
  }: {
    onClick: () => void;
    icon: any;
    title: string;
    description: string;
    className?: string;
  }) {
    return (
      <div
        onClick={onClick}
        className={cn(
          "group flex items-center gap-3 p-5 rounded-md cursor-pointer",
          "border transition-all duration-200 hover:border-primary/10",
          className,
        )}
      >
        <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
          <Icon size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold hover:text-primary transition-colors">
            {title}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-1">
            {description}
          </p>
        </div>
        <ChevronRight
          size={15}
          className="text-muted-foreground group-hover:text-primary shrink-0 transition-colors"
        />
      </div>
    );
  }

  function StepHeader({
    step,
    title,
    description,
  }: {
    step?: number;
    title: React.ReactNode;
    description: string;
  }) {
    return (
      <div className="text-center">
        {step && (
          <p className="text-xs text-muted-foreground mb-2 mt-10">
            Step {step} of 2
          </p>
        )}
        <h2 className="font-serif text-3xl sm:text-4xl font-black leading-tight">
          {title}
        </h2>

        <p
          className={cn(
            "text-muted-foreground",
            step === 1 ? "text-base mt-5" : "text-sm leading-relaxed",
          )}
        >
          {description}
        </p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="p-0 rounded-xl overflow-hidden gap-0 sm:max-w-lg"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">First Time Login</DialogTitle>
        <DialogDescription className="sr-only">
          Account setup for first-time login
        </DialogDescription>

        {/* Crimson top accent bar */}
        <div className="h-2 w-full bg-primary rounded-t-xl" />

        {/* Card body */}
        <div className="px-5 py-8">
          {/* Animated step content */}
          <div
            key={step}
            className={
              isExiting ? "animate-slide-out-left" : "animate-slide-in-right"
            }
          >
            {/* ── STEP 1: WELCOME ────────────────────────────────────────── */}
            {step === 1 && (
              <div>
                {/* Logo */}
                <div className="flex justify-center">
                  <Logo size="w-40" disableLink={true} />
                </div>

                <StepHeader
                  step={1}
                  title={
                    <>
                      Welcome,{" "}
                      <span className="text-primary italic">{firstName}!</span>
                    </>
                  }
                  description="We’re glad you’re here! This is your space to stay connected with updates, attendance, and our community. Let’s get your account ready — it’s quick and simple."
                />

                {/* CTA */}
                <Button
                  onClick={() => goToStep(2)}
                  className="group w-full mt-5 h-12"
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* ── STEP 2: SET PASSWORD ────────────────────────────────────── */}
            {step === 2 && (
              <div>
                {/* Icon badge */}
                <div className="flex justify-center mb-4 mt-2">
                  <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center">
                    <FaLock size={30} className="text-primary" />
                  </div>
                </div>

                <StepHeader
                  step={2}
                  title="Secure Your Account"
                  description="Create a private password only you know."
                />

                {/* Password Fields */}
                <div className="mt-10 space-y-5">
                  <FormInput
                    label="New Password"
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-12"
                    placeholder="Create a strong password"
                    labelClassName={AUTH_LABEL_STYLE}
                  />

                  <div className="space-y-2">
                    <RequirementRow
                      met={hasMinLength}
                      label="Atleast 8 characters"
                    />
                    <RequirementRow
                      met={hasUppercase}
                      label="Include an uppercase letter (A-Z)"
                    />
                    <RequirementRow
                      met={hasNumber}
                      label="Include a number (0-9)"
                    />
                  </div>

                  <FormInput
                    label="Confirm Password"
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12"
                    placeholder="Repeat your password"
                    labelClassName={AUTH_LABEL_STYLE}
                    error={
                      confirmPassword.length > 0 && !passwordsMatch
                        ? "Passwords do not match"
                        : undefined
                    }
                  />
                </div>

                <Button
                  onClick={handleSetPassword}
                  disabled={!canSubmit || isPending}
                  className="group mt-5 w-full h-12"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <Loading size="sm" variant="white" />
                      Securing account…
                    </span>
                  ) : (
                    "Set Password"
                  )}
                </Button>
              </div>
            )}

            {/* ── STEP 3: SUCCESS ─────────────────────────────────────────── */}
            {step === 3 && (
              <div>
                {/* Success mark */}
                <div className="flex justify-center mb-5 mt-2">
                  <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle2
                      size={60}
                      className="text-green-500"
                      strokeWidth={2}
                    />
                  </div>
                </div>

                <StepHeader
                  title="You're all set!"
                  description="Your account is secured and your QR code is ready."
                />

                {/* Next steps */}
                <div>
                  <div className="flex items-center gap-1 mt-5 mb-3">
                    <div className="h-px flex-1 bg-muted-foreground/20" />
                    <span className="text-[10px] tracking-wider uppercase text-muted-foreground/50 font-semibold">
                      While you're here
                    </span>
                    <div className="h-px flex-1 bg-muted-foreground/20" />
                  </div>

                  <div className="space-y-2">
                    <ActionCard
                      onClick={() => handleCloseAndNavigate("/")}
                      icon={FaHome}
                      title="Explore the Community"
                      description="Start your journey and see what's new today."
                    />
                    <ActionCard
                      onClick={() => handleCloseAndNavigate("/my-profile")}
                      icon={FaUserCircle}
                      title="Complete Your Profile"
                      description="Add your photo, birthday, and contact info."
                    />
                  </div>

                  {/* Countdown */}
                  <div className="flex items-center justify-center gap-2 mt-5">
                    <p className="text-xs font-semibold text-primary">
                      Continuing in {countdown}...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
