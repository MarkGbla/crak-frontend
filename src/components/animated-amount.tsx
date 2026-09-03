"use client";

import { useEffect, useState } from "react";

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

type AnimatedAmountProps = {
  value: number;
  fractionDigits?: 0 | 2;
  duration?: number;
};

export function AnimatedAmount({ value, fractionDigits = 0, duration = 1300 }: AnimatedAmountProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const reducedMotionFrame = window.requestAnimationFrame(() => setCurrent(value));
      return () => window.cancelAnimationFrame(reducedMotionFrame);
    }

    let animationFrame = 0;
    const startedAt = performance.now();

    const update = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCurrent(value * easedProgress);

      if (progress < 1) animationFrame = window.requestAnimationFrame(update);
    };

    animationFrame = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [duration, value]);

  const formatted = (fractionDigits === 2 ? decimalFormatter : integerFormatter).format(current);

  return (
    <span className="inline-block tabular-nums" aria-label={`Le ${fractionDigits === 2 ? decimalFormatter.format(value) : integerFormatter.format(value)}`}>
      <span aria-hidden="true">Le {formatted}</span>
    </span>
  );
}
