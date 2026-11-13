import type { Transition, Variants } from "motion/react";

/* Đồng bộ với --duration, --easing trong app/globals.css. */
export const MOTION_DURATION = 0.2;
export const MOTION_EASING = [0.4, 0, 0.2, 1] as const;

export const REVEAL_OFFSET = 16;
export const STAGGER_DELAY = 0.06;
export const REVEAL_DURATION = MOTION_DURATION * 2.5;

export const baseTransition: Transition = {
  duration: MOTION_DURATION,
  ease: MOTION_EASING,
};

export const revealTransition: Transition = {
  duration: REVEAL_DURATION,
  ease: MOTION_EASING,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: REVEAL_OFFSET },
  visible: { opacity: 1, y: 0, transition: revealTransition },
};

const SLIDE_OFFSET = REVEAL_OFFSET * 3;

export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -SLIDE_OFFSET },
  visible: { opacity: 1, x: 0, transition: revealTransition },
};

export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: SLIDE_OFFSET },
  visible: { opacity: 1, x: 0, transition: revealTransition },
};

export const staggerGroup: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER_DELAY } },
};

export const cascadeGroup: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER_DELAY * 1.5, delayChildren: MOTION_DURATION } },
};

export const cascadeItem: Variants = {
  hidden: { opacity: 0, y: REVEAL_OFFSET, transition: { duration: 0 } },
  visible: { opacity: 1, y: 0, transition: revealTransition },
};

/** Hàng chứa phải overflow-hidden. */
export const pushInGroup: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER_DELAY * 2.5, staggerDirection: -1 } },
};

export const pushInItem: Variants = {
  hidden: (index: number) => ({ opacity: 0, x: `${-(index + 1) * 100}%` }),
  visible: { opacity: 1, x: 0, transition: { duration: REVEAL_DURATION * 1.5, ease: MOTION_EASING } },
};

export const staggerListGroup: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER_DELAY * 2 } },
};

/** Chỉ đổi opacity — dùng cho lớp phủ toàn màn hình (transform sẽ phá position: fixed bên trong). */
export const fade: Variants = {
  closed: { opacity: 0, transition: baseTransition },
  open: { opacity: 1, transition: baseTransition },
};

const MENU_OFFSET = 4;
const MENU_STAGGER = 0.015;
const menuTransition: Transition = { duration: MOTION_DURATION * 0.75, ease: MOTION_EASING };

export const dropdownPanel: Variants = {
  closed: { opacity: 0, y: -MENU_OFFSET, transition: menuTransition },
  open: { opacity: 1, y: 0, transition: { ...menuTransition, staggerChildren: MENU_STAGGER } },
};

export const menuList: Variants = {
  closed: {},
  open: { transition: { staggerChildren: MENU_STAGGER * 1.5 } },
};

export const menuItem: Variants = {
  closed: { opacity: 0, y: MENU_OFFSET, transition: menuTransition },
  open: { opacity: 1, y: 0, transition: menuTransition },
};

export const revealViewport = { once: true, amount: 0.2 } as const;
