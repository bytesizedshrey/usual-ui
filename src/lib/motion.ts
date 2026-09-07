/**
 * Centralized motion tokens for usual-ui.
 * Keep durations/easing consistent instead of tuning each component ad hoc.
 */

// Cubic-bezier approximations of a restrained, non-bouncy spring feel.
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const DURATION = {
  /** Hover/press micro-interactions (buttons, pills, icons). */
  micro: 0.18,
  /** Standard hover/reveal transitions (cards, panels). */
  normal: 0.35,
  /** Larger scroll-driven or entrance animations. */
  large: 0.55,
} as const;

/** Subtle scroll-reveal: fade + small rise. Shared across sections/cards. */
export const REVEAL_HIDDEN = { opacity: 0, y: 18 } as const;
export const REVEAL_VISIBLE = { opacity: 1, y: 0 } as const;
