"use client";

import { useAnimate, useInView, useReducedMotion, type AnimationPlaybackControls } from "motion/react";
import { useCallback, useEffect, useRef, useState, type FocusEvent } from "react";

type StepAutoplayOptions = {
  count: number;
  durationMs: number;
};

export const STEP_PROGRESS_VAR = "--step-progress";

const AUTOPLAY_VIEW_AMOUNT = 0.1;

export function useStepAutoplay<T extends HTMLElement>({ count, durationMs }: StepAutoplayOptions) {
  const [scope, animate] = useAnimate<T>();
  const isInView = useInView(scope, { amount: AUTOPLAY_VIEW_AMOUNT });
  const hasEntered = useInView(scope, { amount: AUTOPLAY_VIEW_AMOUNT, once: true });
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);

  const isAutoplay = !prefersReducedMotion;

  useEffect(() => {
    if (!scope.current || !isAutoplay) return;
    const controls = animate(
      scope.current,
      { [STEP_PROGRESS_VAR]: [0, 1] },
      { duration: durationMs / 1000, ease: "linear" },
    );
    controls.pause();
    controls.then(() => setActive((current) => (current + 1) % count));
    controlsRef.current = controls;
    return () => controls.stop();
  }, [active, animate, count, durationMs, isAutoplay, scope]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (isInView && !isPaused) controls.play();
    else controls.pause();
  }, [active, isInView, isPaused]);

  const select = useCallback((index: number) => setActive(index), []);
  // Chỉ dừng khi focus bằng bàn phím (WCAG 2.2.2); hover/click chuột vẫn chạy tiếp.
  const pauseOnKeyboardFocus = useCallback((event: FocusEvent<HTMLElement>) => {
    if (event.target.matches(":focus-visible")) setIsPaused(true);
  }, []);
  const resume = useCallback(() => setIsPaused(false), []);

  return {
    scope,
    active,
    select,
    isAutoplay,
    hasEntered,
    pauseHandlers: {
      onFocus: pauseOnKeyboardFocus,
      onBlur: resume,
    },
  };
}
