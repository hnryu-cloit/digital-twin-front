import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

interface AiLoadingModalProps {
  open: boolean;
  title: string;
  steps: string[];
  stepIntervalMs?: number;
}

export const AiLoadingModal: React.FC<AiLoadingModalProps> = ({ open, title, steps, stepIntervalMs = 1750 }) => {
  const stepsKey = useMemo(() => steps.join("__ai_step__"), [steps]);

  const normalizedSteps = useMemo(() => {
    if (steps.length >= 5) return steps;

    const padded = [...steps];
    const fallbackPool = [
      "분석 결과를 정리하고 있습니다…",
      "핵심 포인트를 구조화하고 있습니다…",
      "출력 화면에 반영할 준비를 하고 있습니다…",
      "최종 결과를 검토하고 있습니다…",
      "잠시만 기다려주세요…",
    ];

    let fallbackIndex = 0;
    while (padded.length < 5) {
      padded.push(fallbackPool[fallbackIndex] ?? fallbackPool[fallbackPool.length - 1]);
      fallbackIndex += 1;
    }

    return padded;
  }, [stepsKey]);
  const [activeStep, setActiveStep] = useState(0);
  const [visible, setVisible] = useState(open);
  const openedAtRef = useRef<number | null>(open ? Date.now() : null);
  const closeTimerRef = useRef<number | null>(null);
  const minimumVisibleMs = Math.max(stepIntervalMs * normalizedSteps.length, stepIntervalMs);

  useEffect(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (open) {
      openedAtRef.current = Date.now();
      setVisible(true);
      return;
    }

    if (!visible) return;

    const elapsed = openedAtRef.current ? Date.now() - openedAtRef.current : minimumVisibleMs;
    const remaining = Math.max(minimumVisibleMs - elapsed, 0);

    if (remaining === 0) {
      setVisible(false);
      return;
    }

    closeTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      closeTimerRef.current = null;
    }, remaining);

    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [open, visible, minimumVisibleMs]);

  useEffect(() => {
    if (!visible || normalizedSteps.length <= 1) {
      setActiveStep(0);
      return;
    }

    setActiveStep(0);
    let cancelled = false;
    let timer: number | null = null;

    const advanceStep = (index: number) => {
      if (cancelled) return;
      setActiveStep(index);

      if (index < normalizedSteps.length - 1) {
        timer = window.setTimeout(() => advanceStep(index + 1), stepIntervalMs);
      }
    };

    advanceStep(0);

    return () => {
      cancelled = true;
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [visible, stepsKey, stepIntervalMs]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 p-5 backdrop-blur-[8px]">
      <div className="w-full max-w-[500px] overflow-hidden rounded-2xl bg-background shadow-[0_24px_48px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 pb-5 pt-6">
          <h2 className="m-0 text-[20px] font-bold tracking-tight text-foreground">{title}</h2>
        </div>

        <div className="px-6 py-10 text-center">
          <div className="mx-auto mb-10 h-20 w-20">
            <svg className="h-20 w-20 animate-spin" viewBox="0 0 50 50" aria-hidden="true">
              <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-primary/20"
              />
              <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="90 150"
                strokeDashoffset="0"
                className="text-primary"
              />
            </svg>
          </div>

          <div className="mx-auto max-w-[500px] space-y-3">
            {normalizedSteps.map((step, index) => (
              <p
                key={`${title}-${step}`}
                className={`transition-all duration-500 ${
                  index === activeStep
                    ? "scale-[1.05] text-[18px] font-black text-primary"
                    : "text-[14px] font-medium text-[var(--muted-foreground)]"
                }`}
              >
                {step}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
