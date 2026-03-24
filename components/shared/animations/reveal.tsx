"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/utils";

interface RevealProps {
  children?: ReactNode;
  className?: string;
  direction?: "up" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  threshold?: number;
  immediate?: boolean;
}

export function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 700,
  threshold = 0.1,
  immediate = false,
}: RevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (immediate) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Animate only once
        }
      },
      { threshold },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [immediate, threshold]);

  const directions = {
    up: "translate-y-8",
    left: "-translate-x-8",
    right: "translate-x-8",
    none: "",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all ease-out",
        isVisible
          ? "opacity-100 translate-x-0 translate-y-0 scale-100"
          : cn("opacity-0 scale-95", directions[direction]),
        className,
      )}
      style={{
        transitionDelay: `${delay * 1000}ms`,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
