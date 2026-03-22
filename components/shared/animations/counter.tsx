"use client";

import { useEffect, useRef, useState } from "react";

interface CounterProps {
  value: string;
  duration?: number;
  delay?: number;
}

export function Counter({ value, duration = 1500, delay = 0 }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  // Parse the numeric part and keep suffixes (like "+", ",")
  const numericMatch = value.match(/[\d,]+/);
  const numberStr = numericMatch ? numericMatch[0].replace(/,/g, "") : "0";
  const targetNumber = parseInt(numberStr, 10);
  const suffix = value.replace(numericMatch ? numericMatch[0] : "", "");
  const hasComma = value.includes(",");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          startAnimation();
        }
      },
      { threshold: 0.1 },
    );

    const startAnimation = () => {
      let startTimestamp: number | null = null;

      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;

        const totalElapsed = timestamp - startTimestamp;
        const delayedProgress =
          (totalElapsed - delay * 1000) / (duration * (1 - delay / 2));
        const progress = Math.min(Math.max(delayedProgress, 0), 1);

        if (progress > 0) {
          const currentCount = Math.floor(progress * targetNumber);
          setCount(currentCount);
        }

        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          setCount(targetNumber);
        }
      };

      window.requestAnimationFrame(step);
    };

    observer.observe(element);
    return () => observer.disconnect();
  }, [targetNumber, duration, delay]);

  const formatNumber = (num: number) => {
    if (hasComma) {
      return num.toLocaleString();
    }
    return num.toString();
  };

  return (
    <span ref={ref} className="tabular-nums">
      {formatNumber(count)}
      {suffix}
    </span>
  );
}
