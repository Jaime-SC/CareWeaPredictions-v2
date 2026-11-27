import type { Transition } from "motion/react";

/** Motion tokens for motion/react. CSS mirrors live in app/globals.css (--duration-*, --ease-*). */
export const duration = { fast: 0.15, base: 0.24, slow: 0.42 } as const;

export const ease = {
  outExpo: [0.16, 1, 0.3, 1],
  inOutQuart: [0.76, 0, 0.24, 1],
} as const;

export const spring = {
  /** Press feedback, toggles, chips. */
  snappy: { type: "spring", stiffness: 520, damping: 34, mass: 0.7 },
  /** Cards, sheets, layout shifts. */
  gentle: { type: "spring", stiffness: 260, damping: 30 },
  /** The one celebratory moment (bet confirmed). Never on loops. */
  bouncy: { type: "spring", stiffness: 380, damping: 18 },
} as const satisfies Record<string, Transition>;

export const transition = {
  fast: { duration: duration.fast, ease: ease.outExpo },
  base: { duration: duration.base, ease: ease.outExpo },
  slow: { duration: duration.slow, ease: ease.outExpo },
} as const satisfies Record<string, Transition>;
